import uuid
import numpy as np
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.knowledge_chunk import KnowledgeChunk, KnowledgeSourceType
from app.models.product import Product
from app.models.merchant_profile import MerchantProfile
from app.models.ai_info import AIInfo
from app.services.embedding_service import get_embedding

def cosine_similarity(a: list[float], b: list[float]) -> float:
    v1, v2 = np.array(a, dtype=float), np.array(b, dtype=float)
    denom = np.linalg.norm(v1) * np.linalg.norm(v2)
    if denom == 0:
        return 0.0
    return float(np.dot(v1, v2) / denom)

async def index_product(db: AsyncSession, merchant_id: uuid.UUID, product: Product) -> KnowledgeChunk:
    content = (
        f"{product.product_name} - Selling Price: ₹{product.selling_price:.2f}, "
        f"Cost Price: ₹{product.cost_price:.2f}, Current Stock: {product.current_stock} units"
    )
    vector = get_embedding(content)
    
    stmt = select(KnowledgeChunk).where(
        KnowledgeChunk.merchant_id == merchant_id,
        KnowledgeChunk.source_id == product.id,
    )
    chunk = (await db.execute(stmt)).scalar_one_or_none()
    if chunk:
        chunk.content = content
        chunk.embedding = vector
    else:
        chunk = KnowledgeChunk(
            merchant_id=merchant_id,
            source_type=KnowledgeSourceType.product,
            source_id=product.id,
            content=content,
            embedding=vector,
        )
        db.add(chunk)
    await db.flush()
    return chunk

async def delete_product_chunk(db: AsyncSession, merchant_id: uuid.UUID, product_id: uuid.UUID) -> None:
    from sqlalchemy import delete
    stmt = delete(KnowledgeChunk).where(
        KnowledgeChunk.merchant_id == merchant_id,
        KnowledgeChunk.source_id == product_id,
    )
    await db.execute(stmt)
    await db.flush()

from app.models.address import Address

async def index_merchant_profile(db: AsyncSession, merchant: MerchantProfile) -> list[KnowledgeChunk]:
    chunks: list[KnowledgeChunk] = []

    # Fetch merchant address if exists
    addr_stmt = select(Address).where(Address.user_id == merchant.user_id).order_by(Address.is_default.desc())
    addr = (await db.execute(addr_stmt)).scalars().first()
    address_str = ""
    if addr:
        parts = [addr.line1, addr.line2, addr.landmark, addr.city, addr.state, addr.pincode]
        address_str = ", ".join(p for p in parts if p)
    
    # 1. Index store basic details (shop_profile)
    profile_text = f"Store Name: {merchant.business_name}, Category: {merchant.business_type}"
    if address_str:
        profile_text += f", Store Address: {address_str}"
    if merchant.business_description:
        profile_text += f", About: {merchant.business_description}"
    if merchant.upi_vpa:
        profile_text += f", Accepted UPI VPA: {merchant.upi_vpa}"
    if merchant.preferred_language:
        profile_text += f", Support Language: {merchant.preferred_language}"
        
    profile_vector = get_embedding(profile_text)
    
    stmt = select(KnowledgeChunk).where(
        KnowledgeChunk.merchant_id == merchant.id,
        KnowledgeChunk.source_type == KnowledgeSourceType.shop_profile,
    )
    profile_chunk = (await db.execute(stmt)).scalar_one_or_none()
    if profile_chunk:
        profile_chunk.content = profile_text
        profile_chunk.embedding = profile_vector
    else:
        profile_chunk = KnowledgeChunk(
            merchant_id=merchant.id,
            source_type=KnowledgeSourceType.shop_profile,
            source_id=merchant.id,
            content=profile_text,
            embedding=profile_vector,
        )
        db.add(profile_chunk)
    chunks.append(profile_chunk)
    
    # 2. Index store rules & FAQ from AIInfo if available
    ai_info = (await db.execute(select(AIInfo).where(AIInfo.merchant_id == merchant.id))).scalar_one_or_none()
    if ai_info:
        faq_text = f"Store Operating Rules & Customer Guidance: {ai_info.help_with}"
        if ai_info.rule:
            faq_text += f" | Store Policies: {ai_info.rule}"
        
        faq_vector = get_embedding(faq_text)
        
        faq_stmt = select(KnowledgeChunk).where(
            KnowledgeChunk.merchant_id == merchant.id,
            KnowledgeChunk.source_type == KnowledgeSourceType.faq,
        )
        faq_chunk = (await db.execute(faq_stmt)).scalar_one_or_none()
        if faq_chunk:
            faq_chunk.content = faq_text
            faq_chunk.embedding = faq_vector
        else:
            faq_chunk = KnowledgeChunk(
                merchant_id=merchant.id,
                source_type=KnowledgeSourceType.faq,
                source_id=ai_info.id,
                content=faq_text,
                embedding=faq_vector,
            )
            db.add(faq_chunk)
        chunks.append(faq_chunk)

    await db.flush()
    return chunks

async def index_merchant_catalog(db: AsyncSession, merchant_id: uuid.UUID) -> int:
    stmt = select(Product).where(Product.merchant_id == merchant_id)
    products = (await db.execute(stmt)).scalars().all()
    for prod in products:
        await index_product(db, merchant_id, prod)
        
    merchant = await db.get(MerchantProfile, merchant_id)
    if merchant:
        await index_merchant_profile(db, merchant)
        
    await db.commit()
    return len(products)

async def search_catalog_chunks(
    db: AsyncSession,
    merchant_id: uuid.UUID,
    query: str,
    limit: int = 20,
) -> list[str]:
    stmt = select(KnowledgeChunk).where(KnowledgeChunk.merchant_id == merchant_id)
    chunks = (await db.execute(stmt)).scalars().all()
    
    if not chunks:
        indexed_count = await index_merchant_catalog(db, merchant_id)
        if indexed_count > 0:
            chunks = (await db.execute(stmt)).scalars().all()
        if not chunks:
            return []

    query_vector = get_embedding(query)
    scored = [(cosine_similarity(query_vector, c.embedding), c) for c in chunks]
    scored.sort(key=lambda x: x[0], reverse=True)
    
    results: list[str] = []
    for score, chunk in scored[:limit]:
        if chunk.source_type == KnowledgeSourceType.product and chunk.source_id:
            prod = await db.get(Product, chunk.source_id)
            if prod:
                results.append(
                    f"- {prod.product_name}: Selling Price ₹{prod.selling_price:.2f} | "
                    f"Cost Price ₹{prod.cost_price:.2f} | "
                    f"Current Stock: {prod.current_stock} units"
                )
                continue
        results.append(chunk.content)
    return results

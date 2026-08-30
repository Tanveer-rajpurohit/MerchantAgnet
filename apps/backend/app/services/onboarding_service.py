import uuid
from fastapi import HTTPException, status
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import UserRole
from app.repositories import profile_repository, expense_repository, product_repository
from app.schemas.onboarding import (
    OnboardingProfileRequest,
    OnboardingExpensesRequest,
    OnboardingProductsRequest,
    OnboardingCompleteRequest,
    OnboardingStepResponse,
    OnboardingExpenseDTO,
    OnboardingExpensesResponse,
    OnboardingProductDTO,
    OnboardingProductsResponse,
)

async def save_onboarding_profile(
    db: AsyncSession,
    redis: Redis,
    user_id: uuid.UUID,
    payload: OnboardingProfileRequest,
) -> OnboardingStepResponse:
    user = await profile_repository.get_user_with_relations(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user.role != UserRole.merchant:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only merchants can access onboarding",
        )

    if payload.owner_name and payload.owner_name.strip():
        user.full_name = payload.owner_name.strip()

    mp = profile_repository.get_or_create_merchant_profile(db, user)
    mp.business_name = payload.business_name.strip()
    mp.business_type = payload.business_type.strip()
    mp.business_description = (
        payload.business_description.strip()
        if payload.business_description
        else None
    )
    mp.preferred_language = payload.preferred_language.strip()

    addr = profile_repository.get_or_create_default_address(db, user)
    addr.city = payload.city.strip()

    await db.flush()

    cache_key = f"profile:{user_id}"
    await redis.delete(cache_key)

    return OnboardingStepResponse(step="profile", status="saved")

async def get_onboarding_expenses(
    db: AsyncSession,
    user_id: uuid.UUID,
) -> OnboardingExpensesResponse:
    user = await profile_repository.get_user_with_relations(db, user_id)
    if not user or user.role != UserRole.merchant or not user.merchant_profile:
        return OnboardingExpensesResponse(expenses=[])

    expenses = await expense_repository.list_by_merchant(db, user.merchant_profile.id)
    return OnboardingExpensesResponse(
        expenses=[
            OnboardingExpenseDTO(
                id=e.id,
                category=e.category,
                amount=e.amount,
                due_on=e.due_on,
                notes=e.notes,
            )
            for e in expenses
        ]
    )

async def save_onboarding_expenses(
    db: AsyncSession,
    redis: Redis,
    user_id: uuid.UUID,
    payload: OnboardingExpensesRequest,
) -> OnboardingStepResponse:
    user = await profile_repository.get_user_with_relations(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user.role != UserRole.merchant:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only merchants can access onboarding",
        )

    mp = profile_repository.get_or_create_merchant_profile(db, user)
    saved_count = await expense_repository.bulk_replace_expenses(
        db=db,
        merchant_id=mp.id,
        expenses=payload.expenses,
    )

    await db.flush()

    cache_key = f"profile:{user_id}"
    await redis.delete(cache_key)

    return OnboardingStepResponse(
        step="expenses",
        status="saved",
        count=saved_count,
    )

async def get_onboarding_products(
    db: AsyncSession,
    user_id: uuid.UUID,
) -> OnboardingProductsResponse:
    user = await profile_repository.get_user_with_relations(db, user_id)
    if not user or user.role != UserRole.merchant or not user.merchant_profile:
        return OnboardingProductsResponse(products=[])

    products = await product_repository.list_by_merchant(db, user.merchant_profile.id, active_only=True)
    return OnboardingProductsResponse(
        products=[
            OnboardingProductDTO(
                id=p.id,
                product_name=p.product_name,
                cost_price=p.cost_price,
                selling_price=p.selling_price,
                current_stock=p.current_stock,
                low_stock_alert=p.low_stock_alert,
            )
            for p in products
        ]
    )

async def save_onboarding_products(
    db: AsyncSession,
    redis: Redis,
    user_id: uuid.UUID,
    payload: OnboardingProductsRequest,
) -> OnboardingStepResponse:
    user = await profile_repository.get_user_with_relations(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user.role != UserRole.merchant:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only merchants can access onboarding",
        )

    mp = profile_repository.get_or_create_merchant_profile(db, user)
    saved_count = await product_repository.bulk_replace_products(
        db=db,
        merchant_id=mp.id,
        products=payload.products,
        skip_inventory=payload.skip_inventory,
    )

    await db.flush()

    cache_key = f"profile:{user_id}"
    await redis.delete(cache_key)

    return OnboardingStepResponse(
        step="products",
        status="saved",
        count=saved_count,
    )

async def complete_onboarding(
    db: AsyncSession,
    redis: Redis,
    user_id: uuid.UUID,
    payload: OnboardingCompleteRequest,
) -> OnboardingStepResponse:
    user = await profile_repository.get_user_with_relations(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user.role != UserRole.merchant:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only merchants can access onboarding",
        )

    mp = profile_repository.get_or_create_merchant_profile(db, user)

    goals_list = [
        g.strip() for g in payload.selected_goals if g.strip() and g != "Other"
    ]
    if payload.other_goal_text and payload.other_goal_text.strip():
        goals_list.append(payload.other_goal_text.strip())

    goals_str = (
        ", ".join(goals_list) if goals_list else "General Store Management"
    )
    rules = (
        payload.additional_details.strip()
        if payload.additional_details
        else None
    )

    await profile_repository.complete_onboarding(
        db=db,
        merchant_profile=mp,
        goals=goals_str,
        rules=rules,
    )

    await db.flush()

    cache_key = f"profile:{user_id}"
    await redis.delete(cache_key)

    return OnboardingStepResponse(
        step="complete",
        status="onboarding_completed",
    )

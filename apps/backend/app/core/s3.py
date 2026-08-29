import asyncio
import uuid
import boto3
from fastapi import UploadFile, HTTPException, status
from app.core.config import settings

ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}
MAX_FILE_SIZE = 5 * 1024 * 1024

def get_s3_client():
    return boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION,
    )

def _upload_file_sync(file_obj, bucket: str, key: str, content_type: str) -> None:
    s3 = get_s3_client()
    s3.upload_fileobj(
        file_obj,
        bucket,
        key,
        ExtraArgs={"ContentType": content_type},
    )

async def upload_file_to_s3(file: UploadFile, user_id: uuid.UUID) -> str:
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type: {file.content_type}. Allowed types: {', '.join(ALLOWED_MIME_TYPES)}",
        )

    ext = file.content_type.split("/")[-1]
    key = f"avatars/{user_id}/{uuid.uuid4()}.{ext}"

    await asyncio.to_thread(
        _upload_file_sync,
        file.file,
        settings.AWS_S3_BUCKET_NAME,
        key,
        file.content_type,
    )

    return f"https://{settings.AWS_S3_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{key}"

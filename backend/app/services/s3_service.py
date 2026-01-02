"""
S3 service for caching personalized chapter markdown.
"""
import logging
import boto3
from botocore.exceptions import ClientError
from typing import Optional

from app.config import settings

logger = logging.getLogger(__name__)

class S3Service:
    """Service to interact with S3-compatible object storage."""

    def __init__(self):
        self.bucket_name = settings.s3_bucket_name

        # Initialize the S3 client
        params = {
            "region_name": settings.s3_region
        }

        if settings.s3_access_key_id and settings.s3_secret_access_key:
            params["aws_access_key_id"] = settings.s3_access_key_id
            params["aws_secret_access_key"] = settings.s3_secret_access_key

        if settings.s3_endpoint_url:
            params["endpoint_url"] = settings.s3_endpoint_url

        self.client = boto3.client("s3", **params)

    def upload_content(self, key: str, content: str) -> bool:
        """
        Uploads markdown content to S3.
        """
        try:
            self.client.put_object(
                Bucket=self.bucket_name,
                Key=key,
                Body=content.encode("utf-8"),
                ContentType="text/markdown"
            )
            logger.info(f"Successfully uploaded {key} to {self.bucket_name}")
            return True
        except ClientError as e:
            logger.error(f"Error uploading to S3: {e}")
            return False

    def download_content(self, key: str) -> Optional[str]:
        """
        Downloads markdown content from S3.
        """
        try:
            response = self.client.get_object(
                Bucket=self.bucket_name,
                Key=key
            )
            return response["Body"].read().decode("utf-8")
        except ClientError as e:
            if e.response["Error"]["Code"] != "NoSuchKey":
                logger.error(f"Error downloading from S3: {e}")
            return None

    def health_check(self) -> bool:
        """
        Verifies connection to S3 by listing buckets or head bucket.
        """
        try:
            # We don't list all buckets as it might require extra permissions
            # Just try to head the configured bucket
            self.client.head_bucket(Bucket=self.bucket_name)
            return True
        except Exception as e:
            logger.error(f"S3 health check failed: {e}")
            return False

# Service instance
s3_service = S3Service()

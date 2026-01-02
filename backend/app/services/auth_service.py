"""
Auth service for session verification with Better Auth.
"""
import logging
import httpx
from fastapi import Request, HTTPException
from typing import Optional, Dict, Any

from app.config import settings

logger = logging.getLogger(__name__)

class AuthService:
    """Service to interact with the Better Auth sidecar."""

    def __init__(self):
        self.base_url = settings.better_auth_url
        self.auth_endpoint = "/auth/session"

    async def get_session(self, request: Request) -> Optional[Dict[str, Any]]:
        """
        Verifies the current session with the Better Auth sidecar.

        Attempts to extract the session token from cookies or the Authorization header.
        """
        # 1. Try to get token from cookies
        session_token = request.cookies.get("better-auth.session_token")

        # 2. Try to get token from Authorization header if not in cookies
        auth_header = request.headers.get("Authorization")
        if not session_token and auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]

        if not session_token:
            return None

        try:
            async with httpx.AsyncClient() as client:
                # Forward cookies if present
                cookies = {"better-auth.session_token": session_token}

                response = await client.get(
                    f"{self.base_url}{self.auth_endpoint}",
                    cookies=cookies,
                    timeout=5.0
                )

            if response.status_code == 200:
                session_data = response.json()
                return session_data

            if response.status_code != 401:
                logger.warning(f"Unexpected response from Better Auth sidecar: {response.status_code}")

            return None

        except Exception as e:
            logger.error(f"Error connecting to Better Auth sidecar: {e}")
            return None

async def get_current_user(request: Request) -> Dict[str, Any]:
    """
    FastAPI dependency to get the current authenticated user.

    Raises 401 Unauthorized if no valid session is found.
    """
    auth_service = AuthService()
    session = await auth_service.get_session(request)

    if not session or "user" not in session:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized: No valid session found"
        )

    return session["user"]

# Service instance
auth_service = AuthService()

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
import hashlib
import json
import logging

from app.services.auth_service import get_current_user
from app.services.neon_service import neon_service

logger = logging.getLogger(__name__)

router = APIRouter()

class SoftwareExperience(BaseModel):
    python: str = "none"
    cpp: str = "none"
    ros2: str = "none"
    typescript: str = "none"

class UserProfileCreate(BaseModel):
    software_experience: SoftwareExperience
    robotics_experience: str = "none"
    hardware_access: List[str] = Field(default_factory=list)
    learning_goals: List[str] = Field(default_factory=list)

def compute_profile_hash(profile_dict: Dict) -> str:
    """Computes a stable MD5 hash for the profile data."""
    # Ensure keys are sorted for stability
    profile_json = json.dumps(profile_dict, sort_keys=True)
    return hashlib.md5(profile_json.encode()).hexdigest()

@router.post("/profile")
async def create_or_update_profile(
    profile_data: UserProfileCreate,
    current_user: Dict = Depends(get_current_user)
):
    """
    Creates or updates the user's background profile.
    """
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID not found in session")

    profile_dict = profile_data.model_dump()
    profile_hash = compute_profile_hash(profile_dict)

    try:
        query = """
        INSERT INTO user_profiles (
            user_id, software_experience, robotics_experience,
            hardware_access, learning_goals, profile_hash, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id)
        DO UPDATE SET
            software_experience = EXCLUDED.software_experience,
            robotics_experience = EXCLUDED.robotics_experience,
            hardware_access = EXCLUDED.hardware_access,
            learning_goals = EXCLUDED.learning_goals,
            profile_hash = EXCLUDED.profile_hash,
            updated_at = CURRENT_TIMESTAMP
        RETURNING user_id;
        """

        await neon_service.execute(
            query,
            user_id,
            json.dumps(profile_dict["software_experience"]),
            profile_dict["robotics_experience"],
            json.dumps(profile_dict["hardware_access"]),
            json.dumps(profile_dict["learning_goals"]),
            profile_hash
        )

        return {"status": "success", "profile_hash": profile_hash}

    except Exception as e:
        logger.error(f"Failed to save user profile: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while saving profile")

@router.get("/profile")
async def get_profile(current_user: Dict = Depends(get_current_user)):
    """
    Retrieves the current user's profile.
    """
    user_id = current_user.get("id")

    query = "SELECT * FROM user_profiles WHERE user_id = $1"
    profile = await neon_service.fetch_one(query, user_id)

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    return profile

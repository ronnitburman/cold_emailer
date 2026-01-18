from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# User schemas
class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    picture: Optional[str] = None


class UserCreate(UserBase):
    google_id: Optional[str] = None
    apple_id: Optional[str] = None


class UserResponse(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    created_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class UserPublic(BaseModel):
    """Public user info (safe to expose to frontend)"""
    id: int
    email: str
    name: Optional[str] = None
    picture: Optional[str] = None
    
    class Config:
        from_attributes = True


# Auth schemas
class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserPublic


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class OAuthCallbackRequest(BaseModel):
    code: str
    state: str


class OAuthURLResponse(BaseModel):
    authorization_url: str
    state: str


class AuthStatusResponse(BaseModel):
    is_authenticated: bool
    user: Optional[UserPublic] = None


class LogoutResponse(BaseModel):
    message: str
    success: bool

from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, List, Any
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


# Google Sheets schemas
class GoogleSheetCreate(BaseModel):
    """Request to add a new Google Sheet"""
    name: str
    sheet_url: str
    worksheet_name: Optional[str] = "Sheet1"
    column_mapping: Optional[Dict[str, str]] = None


class GoogleSheetUpdate(BaseModel):
    """Request to update a Google Sheet"""
    name: Optional[str] = None
    worksheet_name: Optional[str] = None
    column_mapping: Optional[Dict[str, str]] = None
    is_active: Optional[bool] = None


class GoogleSheetResponse(BaseModel):
    """Response for a Google Sheet"""
    id: int
    name: str
    sheet_id: str
    sheet_url: str
    worksheet_name: str
    is_active: bool
    last_synced: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class GoogleSheetValidateRequest(BaseModel):
    """Request to validate a Google Sheet URL"""
    sheet_url: str


class GoogleSheetValidateResponse(BaseModel):
    """Response from validating a Google Sheet"""
    success: bool
    title: Optional[str] = None
    worksheets: Optional[List[str]] = None
    sheet_id: Optional[str] = None
    error: Optional[str] = None


class CampaignResponse(BaseModel):
    """Campaign data response"""
    id: int
    name: str
    status: str
    sent: str
    openRate: str
    replyRate: str
    source: Optional[str] = None  # 'sheet' or 'manual'
    sheet_name: Optional[str] = None


class CampaignsListResponse(BaseModel):
    """Response for list of campaigns"""
    campaigns: List[CampaignResponse]
    source: str  # 'sheets', 'manual', or 'mock'
    sheets_connected: int

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import get_db
from models import User, UserSession, OAuthState
from schemas import (
    TokenResponse, RefreshTokenRequest, OAuthCallbackRequest,
    OAuthURLResponse, AuthStatusResponse, LogoutResponse, UserPublic
)
from auth.jwt import create_access_token, create_refresh_token, verify_token, get_current_user
from auth.oauth import google_oauth, apple_oauth
from auth.utils import generate_state, hash_token
from config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


# Helper functions
def create_tokens_for_user(user: User, db: Session, device_info: str = None, ip_address: str = None) -> TokenResponse:
    """Create access and refresh tokens for a user"""
    access_token = create_access_token({"sub": user.id, "email": user.email})
    refresh_token = create_refresh_token({"sub": user.id})
    
    # Store the session
    session = UserSession(
        user_id=user.id,
        refresh_token_hash=hash_token(refresh_token),
        device_info=device_info,
        ip_address=ip_address,
        expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    db.add(session)
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserPublic.model_validate(user)
    )


def get_or_create_user(
    db: Session,
    email: str,
    name: Optional[str] = None,
    picture: Optional[str] = None,
    google_id: Optional[str] = None,
    apple_id: Optional[str] = None
) -> User:
    """Get existing user or create new one"""
    user = None
    
    # Try to find by provider ID first
    if google_id:
        user = db.query(User).filter(User.google_id == google_id).first()
    elif apple_id:
        user = db.query(User).filter(User.apple_id == apple_id).first()
    
    # If not found by provider ID, try by email
    if not user:
        user = db.query(User).filter(User.email == email).first()
    
    if user:
        # Update provider ID if not set
        if google_id and not user.google_id:
            user.google_id = google_id
        if apple_id and not user.apple_id:
            user.apple_id = apple_id
        # Update profile info
        if name and not user.name:
            user.name = name
        if picture:
            user.picture = picture
        user.is_verified = True
        db.commit()
        return user
    
    # Create new user
    user = User(
        email=email,
        name=name,
        picture=picture,
        google_id=google_id,
        apple_id=apple_id,
        is_verified=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user


# OAuth Initialization Endpoints
@router.get("/google/init", response_model=OAuthURLResponse)
async def google_auth_init(db: Session = Depends(get_db)):
    """Initialize Google OAuth flow"""
    state = generate_state()
    
    # Store state for CSRF protection
    oauth_state = OAuthState(
        state=state,
        provider="google",
        expires_at=datetime.utcnow() + timedelta(minutes=10)
    )
    db.add(oauth_state)
    db.commit()
    
    authorization_url = google_oauth.get_authorization_url(state)
    
    return OAuthURLResponse(
        authorization_url=authorization_url,
        state=state
    )


@router.get("/apple/init", response_model=OAuthURLResponse)
async def apple_auth_init(db: Session = Depends(get_db)):
    """Initialize Apple Sign In flow"""
    state = generate_state()
    
    # Store state for CSRF protection
    oauth_state = OAuthState(
        state=state,
        provider="apple",
        expires_at=datetime.utcnow() + timedelta(minutes=10)
    )
    db.add(oauth_state)
    db.commit()
    
    authorization_url = apple_oauth.get_authorization_url(state)
    
    return OAuthURLResponse(
        authorization_url=authorization_url,
        state=state
    )


# OAuth Callback Endpoints
@router.post("/google/callback", response_model=TokenResponse)
async def google_auth_callback(
    request: OAuthCallbackRequest,
    req: Request,
    db: Session = Depends(get_db)
):
    """Handle Google OAuth callback"""
    # Verify state
    oauth_state = db.query(OAuthState).filter(
        OAuthState.state == request.state,
        OAuthState.provider == "google",
        OAuthState.is_used == False,
        OAuthState.expires_at > datetime.utcnow()
    ).first()
    
    if not oauth_state:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired state"
        )
    
    # Mark state as used
    oauth_state.is_used = True
    db.commit()
    
    try:
        # Exchange code for tokens
        tokens = await google_oauth.exchange_code_for_tokens(request.code)
        
        # Get user info
        user_info = await google_oauth.get_user_info(tokens["access_token"])
        
        # Get or create user
        user = get_or_create_user(
            db=db,
            email=user_info["email"],
            name=user_info.get("name"),
            picture=user_info.get("picture"),
            google_id=user_info["sub"]
        )
        
        # Create tokens
        device_info = req.headers.get("User-Agent")
        ip_address = req.client.host if req.client else None
        
        return create_tokens_for_user(user, db, device_info, ip_address)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to authenticate with Google: {str(e)}"
        )


@router.post("/apple/callback", response_model=TokenResponse)
async def apple_auth_callback(
    request: OAuthCallbackRequest,
    req: Request,
    db: Session = Depends(get_db)
):
    """Handle Apple Sign In callback"""
    # Verify state
    oauth_state = db.query(OAuthState).filter(
        OAuthState.state == request.state,
        OAuthState.provider == "apple",
        OAuthState.is_used == False,
        OAuthState.expires_at > datetime.utcnow()
    ).first()
    
    if not oauth_state:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired state"
        )
    
    # Mark state as used
    oauth_state.is_used = True
    db.commit()
    
    try:
        # Exchange code for tokens
        tokens = await apple_oauth.exchange_code_for_tokens(request.code)
        
        # Verify and decode ID token
        id_token_data = await apple_oauth.verify_id_token(tokens["id_token"])
        
        # Get or create user
        user = get_or_create_user(
            db=db,
            email=id_token_data["email"],
            name=id_token_data.get("name"),  # Apple only provides name on first sign-in
            apple_id=id_token_data["sub"]
        )
        
        # Create tokens
        device_info = req.headers.get("User-Agent")
        ip_address = req.client.host if req.client else None
        
        return create_tokens_for_user(user, db, device_info, ip_address)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to authenticate with Apple: {str(e)}"
        )


# Token Management
@router.post("/refresh", response_model=TokenResponse)
async def refresh_access_token(
    request: RefreshTokenRequest,
    req: Request,
    db: Session = Depends(get_db)
):
    """Refresh access token using refresh token"""
    try:
        # Verify refresh token
        payload = verify_token(request.refresh_token, "refresh")
        user_id = payload.get("sub")
        
        # Find the session
        refresh_token_hash = hash_token(request.refresh_token)
        session = db.query(UserSession).filter(
            UserSession.user_id == user_id,
            UserSession.refresh_token_hash == refresh_token_hash,
            UserSession.is_revoked == False,
            UserSession.expires_at > datetime.utcnow()
        ).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token"
            )
        
        # Get user
        user = db.query(User).filter(User.id == user_id).first()
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )
        
        # Revoke old session
        session.is_revoked = True
        db.commit()
        
        # Create new tokens
        device_info = req.headers.get("User-Agent")
        ip_address = req.client.host if req.client else None
        
        return create_tokens_for_user(user, db, device_info, ip_address)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )


# User Session Endpoints
@router.get("/me", response_model=UserPublic)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current authenticated user info"""
    return UserPublic.model_validate(current_user)


@router.get("/status", response_model=AuthStatusResponse)
async def get_auth_status(
    current_user: Optional[User] = Depends(get_current_user)
):
    """Check authentication status"""
    if current_user:
        return AuthStatusResponse(
            is_authenticated=True,
            user=UserPublic.model_validate(current_user)
        )
    return AuthStatusResponse(is_authenticated=False)


@router.post("/logout", response_model=LogoutResponse)
async def logout(
    request: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """Logout and revoke refresh token"""
    try:
        refresh_token_hash = hash_token(request.refresh_token)
        session = db.query(UserSession).filter(
            UserSession.refresh_token_hash == refresh_token_hash
        ).first()
        
        if session:
            session.is_revoked = True
            db.commit()
        
        return LogoutResponse(message="Successfully logged out", success=True)
        
    except Exception as e:
        return LogoutResponse(message="Logout completed", success=True)


@router.post("/logout-all", response_model=LogoutResponse)
async def logout_all_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Logout from all sessions"""
    db.query(UserSession).filter(
        UserSession.user_id == current_user.id,
        UserSession.is_revoked == False
    ).update({"is_revoked": True})
    db.commit()
    
    return LogoutResponse(message="Successfully logged out from all sessions", success=True)

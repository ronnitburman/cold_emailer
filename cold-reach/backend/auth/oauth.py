import secrets
import httpx
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import jwt as pyjwt

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import settings


class GoogleOAuth:
    """Handle Google OAuth 2.0 authentication"""
    
    GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
    GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
    GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"
    
    def __init__(self):
        self.client_id = settings.GOOGLE_CLIENT_ID
        self.client_secret = settings.GOOGLE_CLIENT_SECRET
        self.redirect_uri = settings.GOOGLE_REDIRECT_URI
    
    def get_authorization_url(self, state: str) -> str:
        """Generate the Google OAuth authorization URL"""
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "response_type": "code",
            "scope": "openid email profile",
            "state": state,
            "access_type": "offline",
            "prompt": "consent"
        }
        query_string = "&".join(f"{k}={v}" for k, v in params.items())
        return f"{self.GOOGLE_AUTH_URL}?{query_string}"
    
    async def exchange_code_for_tokens(self, code: str) -> Dict[str, Any]:
        """Exchange authorization code for access and refresh tokens"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.GOOGLE_TOKEN_URL,
                data={
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "code": code,
                    "grant_type": "authorization_code",
                    "redirect_uri": self.redirect_uri
                }
            )
            response.raise_for_status()
            return response.json()
    
    async def get_user_info(self, access_token: str) -> Dict[str, Any]:
        """Get user information from Google"""
        async with httpx.AsyncClient() as client:
            print("inside get_user_info GoogleOAuth")
            response = await client.get(
                self.GOOGLE_USERINFO_URL,
                headers={"Authorization": f"Bearer {access_token}"}
            )
            response.raise_for_status()
            return response.json()


class AppleOAuth:
    """Handle Apple Sign In authentication"""
    
    APPLE_AUTH_URL = "https://appleid.apple.com/auth/authorize"
    APPLE_TOKEN_URL = "https://appleid.apple.com/auth/token"
    APPLE_KEYS_URL = "https://appleid.apple.com/auth/keys"
    
    def __init__(self):
        self.client_id = settings.APPLE_CLIENT_ID
        self.team_id = settings.APPLE_TEAM_ID
        self.key_id = settings.APPLE_KEY_ID
        self.private_key = settings.APPLE_PRIVATE_KEY
        self.redirect_uri = settings.APPLE_REDIRECT_URI
    
    def _generate_client_secret(self) -> str:
        """Generate the client secret JWT for Apple Sign In"""
        now = datetime.utcnow()
        
        headers = {
            "alg": "ES256",
            "kid": self.key_id
        }
        
        payload = {
            "iss": self.team_id,
            "iat": now,
            "exp": now + timedelta(days=180),
            "aud": "https://appleid.apple.com",
            "sub": self.client_id
        }
        
        return pyjwt.encode(payload, self.private_key, algorithm="ES256", headers=headers)
    
    def get_authorization_url(self, state: str) -> str:
        """Generate the Apple Sign In authorization URL"""
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "response_type": "code",
            "scope": "name email",
            "state": state,
            "response_mode": "form_post"
        }
        query_string = "&".join(f"{k}={v}" for k, v in params.items())
        return f"{self.APPLE_AUTH_URL}?{query_string}"
    
    async def exchange_code_for_tokens(self, code: str) -> Dict[str, Any]:
        """Exchange authorization code for tokens"""
        client_secret = self._generate_client_secret()
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.APPLE_TOKEN_URL,
                data={
                    "client_id": self.client_id,
                    "client_secret": client_secret,
                    "code": code,
                    "grant_type": "authorization_code",
                    "redirect_uri": self.redirect_uri
                }
            )
            response.raise_for_status()
            return response.json()
    
    async def verify_id_token(self, id_token: str) -> Dict[str, Any]:
        """Verify and decode the Apple ID token"""
        # Get Apple's public keys
        async with httpx.AsyncClient() as client:
            response = await client.get(self.APPLE_KEYS_URL)
            response.raise_for_status()
            apple_keys = response.json()
        
        # Decode the token header to get the key ID
        unverified_header = pyjwt.get_unverified_header(id_token)
        
        # Find the matching key
        key = None
        for k in apple_keys["keys"]:
            if k["kid"] == unverified_header["kid"]:
                key = k
                break
        
        if key is None:
            raise ValueError("Unable to find matching Apple public key")
        
        # Verify and decode the token
        from jwt import PyJWKClient
        jwk_client = PyJWKClient(self.APPLE_KEYS_URL)
        signing_key = jwk_client.get_signing_key_from_jwt(id_token)
        
        decoded = pyjwt.decode(
            id_token,
            signing_key.key,
            algorithms=["RS256"],
            audience=self.client_id,
            issuer="https://appleid.apple.com"
        )
        
        return decoded


# Create singleton instances
google_oauth = GoogleOAuth()
apple_oauth = AppleOAuth()

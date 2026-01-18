import hashlib
import secrets


def hash_token(token: str) -> str:
    """Create a SHA-256 hash of a token for secure storage"""
    return hashlib.sha256(token.encode()).hexdigest()


def verify_token_hash(token: str, token_hash: str) -> bool:
    """Verify a token against its hash"""
    return hash_token(token) == token_hash


def generate_state() -> str:
    """Generate a secure random state for OAuth CSRF protection"""
    return secrets.token_urlsafe(32)

# Authentication Setup Guide

This guide will help you set up Google and Apple Sign-In for ColdReach.

## Prerequisites

- Python 3.12+ with the virtual environment activated
- Node.js 18+
- Google Cloud Console account
- Apple Developer account (for Apple Sign-In)

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
source ../cold_email_venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your credentials (see instructions below).

### 3. Generate JWT Secret

Generate a secure secret key:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Add this to your `.env` as `JWT_SECRET_KEY`.

---

## Google OAuth Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the **Google+ API** and **Google Identity API**

### 2. Create OAuth Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Select **Web application**
4. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback/google` (development)
   - `https://yourdomain.com/auth/callback/google` (production)
5. Copy the **Client ID** and **Client Secret**

### 3. Configure Consent Screen

1. Go to **OAuth consent screen**
2. Configure the app name, user support email, and scopes
3. Add scopes: `openid`, `email`, `profile`

### 4. Add to Environment

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback/google
```

---

## Apple Sign-In Setup

### 1. Create App ID

1. Go to [Apple Developer Account](https://developer.apple.com/account)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Create a new **App ID** with Sign In with Apple capability

### 2. Create Service ID

1. Create a new **Services ID**
2. Enable **Sign In with Apple**
3. Configure the domain and redirect URLs:
   - Domain: `localhost` or your production domain
   - Return URL: `http://localhost:3000/auth/callback/apple`

### 3. Create Private Key

1. Create a new **Key** with Sign In with Apple enabled
2. Download the `.p8` file
3. Note the **Key ID**

### 4. Add to Environment

```env
APPLE_CLIENT_ID=your-service-id
APPLE_TEAM_ID=your-team-id
APPLE_KEY_ID=your-key-id
APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
APPLE_REDIRECT_URI=http://localhost:3000/auth/callback/apple
```

> **Note:** For the private key, replace newlines with `\n` characters.

---

## Running the Application

### Start the Backend

```bash
cd backend
source ../cold_email_venv/bin/activate
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.

### Start the Frontend

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`.

---

## Testing the Authentication

1. Open `http://localhost:3000`
2. Click **Sign In** or **Get Started**
3. Choose Google or Apple sign-in
4. Complete the OAuth flow
5. You'll be redirected to the dashboard

---

## Security Best Practices

1. **Never commit `.env` files** - They contain sensitive credentials
2. **Use HTTPS in production** - OAuth requires secure connections
3. **Rotate JWT secrets periodically** - Update `JWT_SECRET_KEY` regularly
4. **Monitor sessions** - Use the logout-all feature when needed
5. **Validate state parameters** - CSRF protection is built-in

---

## Database Schema

The authentication system creates these tables:

- **users**: User accounts with OAuth provider IDs
- **user_sessions**: Active sessions for token management
- **oauth_states**: CSRF protection for OAuth flows

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/google/init` | GET | Start Google OAuth |
| `/api/auth/apple/init` | GET | Start Apple OAuth |
| `/api/auth/google/callback` | POST | Complete Google OAuth |
| `/api/auth/apple/callback` | POST | Complete Apple OAuth |
| `/api/auth/refresh` | POST | Refresh access token |
| `/api/auth/me` | GET | Get current user |
| `/api/auth/logout` | POST | Logout current session |
| `/api/auth/logout-all` | POST | Logout all sessions |

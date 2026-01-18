# ColdReach

ColdReach is a modern cold email campaign manager with a Next.js frontend and Python FastAPI backend. Features Google and Apple Sign-In authentication, real-time analytics, and an intuitive campaign management interface.

![ColdReach](https://img.shields.io/badge/Next.js-16-black) ![FastAPI](https://img.shields.io/badge/FastAPI-0.128-green) ![Python](https://img.shields.io/badge/Python-3.12-blue)

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Authentication Setup](#authentication-setup)
- [User Guide](#user-guide)
- [API Documentation](#api-documentation)
- [Tech Stack](#tech-stack)

---

## Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.12 or higher)
- **Google Cloud Console account** (for Google Sign-In)
- **Apple Developer account** (optional, for Apple Sign-In)

---

## Project Structure

```
cold-reach/
├── src/                    # Frontend Next.js application
│   ├── app/                # App Router pages
│   │   ├── page.js         # Landing page
│   │   ├── auth/           # OAuth callback pages
│   │   └── (platform)/     # Protected dashboard pages
│   ├── components/         # Reusable UI components
│   ├── context/            # React context providers
│   └── lib/                # Utility functions & API
├── backend/                # Python FastAPI backend
│   ├── main.py             # FastAPI app entry point
│   ├── models.py           # SQLAlchemy database models
│   ├── schemas.py          # Pydantic request/response models
│   ├── database.py         # Database configuration
│   ├── config.py           # Environment configuration
│   ├── auth/               # Authentication module
│   │   ├── jwt.py          # JWT token handling
│   │   ├── oauth.py        # Google & Apple OAuth
│   │   └── utils.py        # Utility functions
│   └── routes/             # API route handlers
├── docs/                   # Documentation
└── public/                 # Static assets
```

---

## Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd cold-reach

# Install frontend dependencies
npm install
```

### 2. Backend Setup

```bash
# Create and activate virtual environment
python3 -m venv cold_email_venv
source cold_email_venv/bin/activate  # On Windows: cold_email_venv\Scripts\activate

# Install Python dependencies
pip install -r backend/requirements.txt

# Copy environment template
cp backend/.env.example backend/.env

# Edit backend/.env with your credentials (see Authentication Setup)
```

### 3. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
source ../cold_email_venv/bin/activate
uvicorn main:app --reload
```
The API runs at `http://localhost:8000`

**Terminal 2 - Frontend:**
```bash
npm run dev
```
The app runs at `http://localhost:3000`

---

## Authentication Setup

ColdReach uses OAuth 2.0 for secure authentication. You need to configure at least one provider.

### Google Sign-In (Recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Select **Web application**
6. Add Authorized redirect URI: `http://localhost:3000/auth/callback/google`
7. Copy Client ID and Client Secret to `backend/.env`:

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback/google
```

### Apple Sign-In (Optional)

1. Go to [Apple Developer Account](https://developer.apple.com/account)
2. Create an App ID with Sign In with Apple capability
3. Create a Services ID and configure redirect URL
4. Create a Key for Sign In with Apple
5. Add credentials to `backend/.env`:

```env
APPLE_CLIENT_ID=your-service-id
APPLE_TEAM_ID=your-team-id
APPLE_KEY_ID=your-key-id
APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
```

### JWT Secret

Generate a secure secret key:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Add to `backend/.env`:
```env
JWT_SECRET_KEY=your-generated-secret
```

> 📖 For detailed setup instructions, see [docs/AUTH_SETUP.md](docs/AUTH_SETUP.md)

---

## User Guide

### Navigation Overview

| Page | URL | Description |
|------|-----|-------------|
| Landing Page | `/` | Public homepage with product info |
| Dashboard | `/dashboard` | Main analytics dashboard (requires auth) |
| Campaigns | `/campaigns` | Campaign management |
| New Campaign | `/campaigns/new` | Create new campaign wizard |

### Getting Started as a New User

#### Step 1: Sign Up / Sign In

1. Visit the landing page at `http://localhost:3000`
2. Click **"Sign In"** or **"Get Started"** in the navigation
3. Choose your preferred sign-in method:
   - **Continue with Google** - Uses your Google account
   - **Continue with Apple** - Uses your Apple ID
4. Complete the OAuth flow
5. You'll be automatically redirected to the Dashboard

#### Step 2: Explore the Dashboard

Once signed in, you'll see:

- **Stats Overview** - Key metrics at a glance
  - Emails Sent
  - Total Contacts
  - Open Rate
  - Reply Rate

- **Recent Activity** - Real-time feed of email interactions
  - Opens
  - Replies
  - Clicks

- **Campaign Performance** - Quick view of active campaigns

#### Step 3: Manage Your Account

Click your profile avatar in the top-right to access:

| Option | Description |
|--------|-------------|
| Profile | View and edit your profile information |
| Settings | Configure application preferences |
| Sign Out | Log out of current session |
| Sign Out All Devices | Revoke all active sessions (security feature) |

### Working with Campaigns

#### View All Campaigns

1. Click **"Campaigns"** in the sidebar
2. View campaign list with:
   - Campaign name and status
   - Emails sent count
   - Open and reply rates

#### Create a New Campaign

1. Click **"New Campaign"** or the **"+"** button
2. Complete the 3-step wizard:
   - **Step 1:** Campaign details (name, description)
   - **Step 2:** Select recipients
   - **Step 3:** Compose email content
3. Review and launch

### Authentication Features

#### Session Management

ColdReach provides robust session security:

- **Access Tokens** - Short-lived (30 minutes), automatically refreshed
- **Refresh Tokens** - Long-lived (7 days), securely stored
- **Session Tracking** - View and manage active sessions

#### Sign Out Options

- **Sign Out** - Ends current session only
- **Sign Out All Devices** - Revokes all sessions (use if account compromised)

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Esc` | Close modal dialogs |

---

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/auth/google/init` | Start Google OAuth flow |
| `GET` | `/api/auth/apple/init` | Start Apple OAuth flow |
| `POST` | `/api/auth/google/callback` | Complete Google OAuth |
| `POST` | `/api/auth/apple/callback` | Complete Apple OAuth |
| `POST` | `/api/auth/refresh` | Refresh access token |
| `GET` | `/api/auth/me` | Get current user info |
| `POST` | `/api/auth/logout` | Logout current session |
| `POST` | `/api/auth/logout-all` | Logout all sessions |

### Data Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/stats` | Get dashboard statistics |
| `GET` | `/api/activities` | Get recent activities |
| `GET` | `/api/campaigns` | Get all campaigns |

### Interactive Documentation

Visit `http://localhost:8000/docs` for Swagger UI with:
- Full API reference
- Request/response examples
- Try-it-out functionality

---

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **Lucide React** - Icon library
- **CSS Modules** - Scoped styling

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - Database ORM
- **SQLite** - Database (development)
- **Python-Jose** - JWT handling
- **Pydantic** - Data validation

### Authentication
- **OAuth 2.0** - Google & Apple Sign-In
- **JWT** - Access & refresh tokens
- **CSRF Protection** - State parameter validation

---

## Troubleshooting

### Common Issues

**Backend won't start:**
```bash
# Ensure virtual environment is activated
source cold_email_venv/bin/activate

# Check all dependencies are installed
pip install -r backend/requirements.txt
```

**OAuth errors:**
- Verify redirect URIs match exactly in provider console
- Check `.env` file has correct credentials
- Ensure backend is running on port 8000

**"Unauthorized" after sign-in:**
- Clear browser localStorage
- Try signing in again
- Check browser console for errors

**Database issues:**
```bash
# Delete and recreate database
rm backend/coldreach.db
# Restart backend - tables will be recreated
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

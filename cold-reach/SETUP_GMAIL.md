# Gmail Integration Setup Guide

To enable real email sending via your Gmail account, you need to configure an App Password and set environment variables.

## 1. Safety First 🔒
**Do NOT use your main Google password.**
You must create an **App Password**. This is a special 16-character password used only for this application.

## 2. Generate App Password
1.  Go to your [Google Account Security Settings](https://myaccount.google.com/security).
2.  Enable **2-Step Verification** if you haven't already.
3.  Search for **"App passwords"** in the top search bar (or look under 2-Step Verification).
4.  Create a new App Password:
    *   **App name**: "Cold Reach"
5.  Copy the 16-character password generated (e.g., `abcd efgh ijkl mnop`).

## 3. Set Environment Variables
You need to provide your Gmail address and this App Password to the backend.

### Option A: Run in Terminal (Temporary)
Stop the current backend server (`Ctrl+C`) and restart it with the variables:

```bash
export GMAIL_USER="your.email@gmail.com"
export GMAIL_PASSWORD="your-app-password"

uvicorn openapi_server.main:app --reload --port 8000
```
*(Windows PowerShell: `$env:GMAIL_USER="..."`)*

### Option B: `.env` File (Recommended)
You can likely use a `.env` file if you install `python-dotenv`, but for now, the explicit export is easiest.

## 4. How It Works (Under the Hood)
I modified `api-core/src/openapi_server/impl/default_api_impl.py` to include:

1.  **Imports**: `smtplib` (SMTP client), `ssl` (Security), `email.message` (Email format).
2.  **Environment Check**: It checks `os.getenv("GMAIL_USER")`.
    *   ❌ If missing: It prints "Mock Sending..." to the console (Safe mode).
    *   ✅ If found: It proceeds to connect.
3.  **Connection**:
    *   Connects to `smtp.gmail.com` on port `587`.
    *   Upgrades connection to secure TLS (`server.starttls()`).
    *   Logs in with your credentials.
4.  **Sending Loop**:
    *   Iterates through each recipient ID.
    *   Finds the client's email in the database.
    *   Constructs a proper email message.
    *   Sends user `server.send_message()`.
    *   Updates the client's status to `emailed`.

## 5. Troubleshooting
-   **"SMTPAuthenticationError"**: Check your email and 16-char App Password.
-   **"ConnectionRefused"**: Firewall might be blocking port 587.

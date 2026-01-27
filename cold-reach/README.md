# Cold Reach: Intelligent Cold Email Platform

Cold Reach is an AI-powered email outreach platform designed to streamline your cold email campaigns. It allows you to manage clients, import data from Excel/Google Sheets, and automate follow-up tasks.

## Features

### 🚀 Core Functionality
-   **Client Management**: Add, edit, and delete clients. Search and filter by status.
-   **Email Campaigns**: Compose and send emails to multiple clients using templates.
-   **Task Management**: Automated task generation for follow-ups and responses.

### ✨ New Functionality
-   **Bulk Operations**: Select multiple clients to delete them in bulk.
-   **Smart Import**:
    -   **Duplicate Detection**: Automatically detects existing emails during Excel upload. Warns you and allows adding only unique entries.
    -   **Auto-Tasks**: Importing new clients automatically generates a "Send initial email" task for them.
-   **Persistence**: Data persists across session refreshes (in-memory simulation).

## Quick Start

### Prerequisites
-   Node.js & npm
-   Python 3.12+
-   `uv` or `pip`

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository_url>
    cd cold-reach
    ```

2.  **Setup Backend**
    ```bash
    cd api-core/src
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    uvicorn openapi_server.main:app --reload --port 8000
    ```

3.  **Setup Frontend**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

4.  **Access the App**
    -   Frontend: `http://localhost:3000`
    -   Backend API: `http://localhost:8000/docs`

## User Guide

### 1. Dashboard Overview
Upon logging in, you are greeted with the **Overview** tab.
-   **Stats**: View total clients, emails sent, and response rates.
-   **Quick Actions**: Navigate to manage clients or tasks.

### 2. Managing Clients
-   **Add Clients**: Use the "Upload Excel" button.
    -   *Note*: If you upload a file with overlapping emails, a warning modal will help you avoid duplicates.
-   **Delete Clients**: Select one or more clients using the checkboxes. A red "Delete" button will appear.
-   **Search**: Use the search bar to find clients by name or company.

### 3. Creating & Sending Emails
1.  Select clients from the list.
2.  Click "Compose Email".
3.  Choose a template or write your own.
4.  Attach files if needed and click "Send".

### 4. Managing Tasks
The **Tasks** tab tracks your to-dos.
-   New tasks are created automatically when you import clients.
-   Tasks are categorized by priority (High, Medium, Low) and type (Follow-up, Respond, Review).
-   Mark tasks as completed by clicking the circle icon.

## Architecture

The project follows a modern decoupled architecture:
-   **Frontend**: Next.js (React) with Tailwind CSS and Lucide Icons.
-   **Backend**: Python FastAPI generated from OpenAPI 3.0 specification.
-   **Communication**: REST API.

For detailed production scaling strategies, see [SCALING_STRATEGY.md](SCALING_STRATEGY.md).

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict

from database import engine, Base
from routes import auth_router
import models  # Import models to register them with Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="ColdReach API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "ColdReach API is running"}

@app.get("/api/stats")
def get_stats():
    return [
        {"title": "Onjo Email", "value": "5,620", "change": "-12.5%", "trend": "up", "iconName": "users"},
        {"title": "Ronnit Email", "value": "7,620", "change": "+12.5%", "trend": "up", "iconName": "roy"},
        {"title": "Emails Sent", "value": "4,620", "change": "+12.5%", "trend": "up", "iconName": "mail"},
        {"title": "Total Contacts", "value": "2,841", "change": "+8.2%", "trend": "up", "iconName": "users"},
        {"title": "Open Rate", "value": "72.4%", "change": "+3.1%", "trend": "up", "iconName": "chart"},
        {"title": "Reply Rate", "value": "12.8%", "change": "-0.4%", "trend": "down", "iconName": "reply"},
    ]

@app.get("/api/activities")
def get_activities():
    return [
        {
            "id": 1,
            "type": "reply",
            "user": "Sarah Chen",
            "action": "replied to your email",
            "campaign": "Q1 Product Launch",
            "time": "2 minutes ago",
            "color": "var(--accent-green)",
            "bg": "var(--accent-green-bg)"
        },
        {
            "id": 2,
            "type": "open",
            "user": "Mike Johnson",
            "action": "opened your email",
            "campaign": "Enterprise Outreach",
            "time": "5 minutes ago",
            "color": "#8b5cf6",
            "bg": "rgba(139, 92, 246, 0.1)"
        },
        # More mock data can be added here
    ]

@app.get("/api/campaigns")
def get_campaigns():
    return [
        {
            "id": 1,
            "name": "Q1 Product Launch",
            "status": "Active",
            "sent": "1,250",
            "openRate": "71.2%",
            "replyRate": "11.6%"
        },
        {
            "id": 2,
            "name": "Enterprise Outreach",
            "status": "Active",
            "sent": "850",
            "openRate": "72.0%",
            "replyRate": "11.5%"
        },
         {
            "id": 3,
            "name": "Partnership Follow-up",
            "status": "Paused",
            "sent": "420",
            "openRate": "68.8%",
            "replyRate": "12.4%"
        },
    ]

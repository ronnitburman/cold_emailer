from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Dict, Optional
import json

from database import engine, Base, get_db
from routes import auth_router, sheets_router
from models import GoogleSheet, User
from auth.jwt import get_current_user_optional
from services.google_sheets import google_sheets_service
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
app.include_router(sheets_router, prefix="/api")

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

# Mock campaigns data (for demo purposes)
MOCK_CAMPAIGNS = [
    {
        "id": 1,
        "name": "Q1 Product Launch",
        "status": "Active",
        "sent": "1,250",
        "openRate": "71.2%",
        "replyRate": "11.6%",
        "source": "demo"
    },
    {
        "id": 2,
        "name": "Enterprise Outreach",
        "status": "Active",
        "sent": "850",
        "openRate": "72.0%",
        "replyRate": "11.5%",
        "source": "demo"
    },
    {
        "id": 3,
        "name": "Partnership Follow-up",
        "status": "Paused",
        "sent": "420",
        "openRate": "68.8%",
        "replyRate": "12.4%",
        "source": "demo"
    },
]

@app.get("/api/campaigns/demo")
def get_demo_campaigns():
    """Get demo campaign data for preview purposes"""
    return {
        "campaigns": MOCK_CAMPAIGNS,
        "source": "demo",
        "sheets_connected": 0
    }

@app.get("/api/campaigns")
def get_campaigns(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Get campaigns from connected Google Sheets.
    Returns empty list if no sheets connected (frontend shows empty state).
    """
    # If no authenticated user, return empty (they should use /demo endpoint)
    if not current_user:
        return {
            "campaigns": [],
            "source": "none",
            "sheets_connected": 0
        }
    
    # Get user's active Google Sheets
    sheets = db.query(GoogleSheet).filter(
        GoogleSheet.user_id == current_user.id,
        GoogleSheet.is_active == True
    ).all()
    
    # If no sheets connected, return empty list
    if not sheets:
        return {
            "campaigns": [],
            "source": "none",
            "sheets_connected": 0
        }
    
    # Fetch campaigns from all connected sheets (skip test sheets)
    all_campaigns = []
    campaign_id = 1
    real_sheets_count = 0
    
    for sheet in sheets:
        # Skip test sheets - they're for development only
        if sheet.sheet_id.startswith("test_"):
            continue
            
        real_sheets_count += 1
        
        try:
            column_mapping = json.loads(sheet.column_mapping) if sheet.column_mapping else None
            
            campaigns = google_sheets_service.get_campaigns_from_sheet(
                sheet.sheet_id,
                sheet.worksheet_name,
                column_mapping
            )
            
            for campaign in campaigns:
                campaign["id"] = campaign_id
                campaign["source"] = "sheet"
                campaign["sheet_name"] = sheet.name
                all_campaigns.append(campaign)
                campaign_id += 1
                
        except Exception as e:
            # Log error but continue with other sheets
            import logging
            logging.warning(f"Could not fetch from sheet {sheet.name}: {e}")
            continue
    
    return {
        "campaigns": all_campaigns,
        "source": "sheets" if all_campaigns else "none",
        "sheets_connected": real_sheets_count
    }

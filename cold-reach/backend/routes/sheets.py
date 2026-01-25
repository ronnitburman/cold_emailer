from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional
import json

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import get_db
from models import User, GoogleSheet
from schemas import (
    GoogleSheetCreate, GoogleSheetUpdate, GoogleSheetResponse,
    GoogleSheetValidateRequest, GoogleSheetValidateResponse,
    CampaignResponse, CampaignsListResponse
)
from auth.jwt import get_current_user
from services.google_sheets import google_sheets_service

router = APIRouter(prefix="/sheets", tags=["Google Sheets"])


# =====================================================
# DEV/TEST ENDPOINT - Add sheet without Google validation
# =====================================================
@router.post("/test-add")
async def add_test_sheet(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    DEV ONLY: Add a test sheet without Google API validation.
    This creates a mock sheet entry for testing the campaigns flow.
    """
    # Create a test sheet record
    sheet = GoogleSheet(
        user_id=current_user.id,
        name="Test Campaign Sheet",
        sheet_id="test_sheet_123",
        sheet_url="https://docs.google.com/spreadsheets/d/test_sheet_123/edit",
        worksheet_name="Sheet1",
        column_mapping=None,
        is_active=True
    )
    
    db.add(sheet)
    db.commit()
    db.refresh(sheet)
    
    return {
        "message": "Test sheet added successfully",
        "sheet": {
            "id": sheet.id,
            "name": sheet.name,
            "sheet_id": sheet.sheet_id
        }
    }


@router.post("/validate", response_model=GoogleSheetValidateResponse)
async def validate_sheet(
    request: GoogleSheetValidateRequest,
    current_user: User = Depends(get_current_user)
):
    """Validate a Google Sheet URL and check access"""
    sheet_id = google_sheets_service.extract_sheet_id(request.sheet_url)
    
    if not sheet_id:
        return GoogleSheetValidateResponse(
            success=False,
            error="Invalid Google Sheets URL. Please provide a valid URL."
        )
    
    result = google_sheets_service.validate_sheet_access(sheet_id)
    
    if result["success"]:
        return GoogleSheetValidateResponse(
            success=True,
            title=result["title"],
            worksheets=result["worksheets"],
            sheet_id=sheet_id
        )
    else:
        return GoogleSheetValidateResponse(
            success=False,
            error=result["error"]
        )


@router.post("", response_model=GoogleSheetResponse)
async def add_sheet(
    request: GoogleSheetCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a new Google Sheet for campaign data"""
    # Extract sheet ID from URL
    sheet_id = google_sheets_service.extract_sheet_id(request.sheet_url)
    
    if not sheet_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Google Sheets URL"
        )
    
    # Validate access
    validation = google_sheets_service.validate_sheet_access(sheet_id)
    if not validation["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=validation["error"]
        )
    
    # Check if sheet already exists for this user
    existing = db.query(GoogleSheet).filter(
        GoogleSheet.user_id == current_user.id,
        GoogleSheet.sheet_id == sheet_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This sheet is already connected"
        )
    
    # Create new sheet record
    column_mapping_json = json.dumps(request.column_mapping) if request.column_mapping else None
    
    sheet = GoogleSheet(
        user_id=current_user.id,
        name=request.name,
        sheet_id=sheet_id,
        sheet_url=request.sheet_url,
        worksheet_name=request.worksheet_name or "Sheet1",
        column_mapping=column_mapping_json
    )
    
    db.add(sheet)
    db.commit()
    db.refresh(sheet)
    
    return sheet


@router.get("", response_model=List[GoogleSheetResponse])
async def list_sheets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all connected Google Sheets for the current user"""
    print(f"Current User for list all sheets: {current_user}")
    sheets = db.query(GoogleSheet).filter(
        GoogleSheet.user_id == current_user.id
    ).order_by(GoogleSheet.created_at.desc()).all()
    
    return sheets


@router.get("/{sheet_db_id}", response_model=GoogleSheetResponse)
async def get_sheet(
    sheet_db_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific connected Google Sheet"""
    sheet = db.query(GoogleSheet).filter(
        GoogleSheet.id == sheet_db_id,
        GoogleSheet.user_id == current_user.id
    ).first()
    
    if not sheet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sheet not found"
        )
    
    return sheet


@router.put("/{sheet_db_id}", response_model=GoogleSheetResponse)
async def update_sheet(
    sheet_db_id: int,
    request: GoogleSheetUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a connected Google Sheet"""
    sheet = db.query(GoogleSheet).filter(
        GoogleSheet.id == sheet_db_id,
        GoogleSheet.user_id == current_user.id
    ).first()
    
    if not sheet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sheet not found"
        )
    
    if request.name is not None:
        sheet.name = request.name
    if request.worksheet_name is not None:
        sheet.worksheet_name = request.worksheet_name
    if request.column_mapping is not None:
        sheet.column_mapping = json.dumps(request.column_mapping)
    if request.is_active is not None:
        sheet.is_active = request.is_active
    
    db.commit()
    db.refresh(sheet)
    
    return sheet


@router.delete("/{sheet_db_id}")
async def delete_sheet(
    sheet_db_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a connected Google Sheet"""
    sheet = db.query(GoogleSheet).filter(
        GoogleSheet.id == sheet_db_id,
        GoogleSheet.user_id == current_user.id
    ).first()
    
    if not sheet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sheet not found"
        )
    
    db.delete(sheet)
    db.commit()
    
    return {"message": "Sheet deleted successfully"}


@router.get("/{sheet_db_id}/campaigns", response_model=List[CampaignResponse])
async def get_campaigns_from_sheet(
    sheet_db_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get campaigns from a specific Google Sheet"""
    sheet = db.query(GoogleSheet).filter(
        GoogleSheet.id == sheet_db_id,
        GoogleSheet.user_id == current_user.id
    ).first()
    
    if not sheet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sheet not found"
        )
    
    try:
        # Parse column mapping if exists
        column_mapping = json.loads(sheet.column_mapping) if sheet.column_mapping else None
        
        # Fetch campaigns from sheet
        campaigns = google_sheets_service.get_campaigns_from_sheet(
            sheet.sheet_id,
            sheet.worksheet_name,
            column_mapping
        )
        
        # Update last synced time
        sheet.last_synced = datetime.utcnow()
        db.commit()
        
        # Add source info
        return [
            CampaignResponse(
                **campaign,
                source="sheet",
                sheet_name=sheet.name
            )
            for campaign in campaigns
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching data from sheet: {str(e)}"
        )


@router.post("/{sheet_db_id}/sync")
async def sync_sheet(
    sheet_db_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Manually trigger a sync for a Google Sheet"""
    sheet = db.query(GoogleSheet).filter(
        GoogleSheet.id == sheet_db_id,
        GoogleSheet.user_id == current_user.id
    ).first()
    
    if not sheet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sheet not found"
        )
    
    try:
        # Parse column mapping if exists
        column_mapping = json.loads(sheet.column_mapping) if sheet.column_mapping else None
        
        # Fetch campaigns to verify access and get count
        campaigns = google_sheets_service.get_campaigns_from_sheet(
            sheet.sheet_id,
            sheet.worksheet_name,
            column_mapping
        )
        
        # Update last synced time
        sheet.last_synced = datetime.utcnow()
        db.commit()
        
        return {
            "success": True,
            "message": f"Successfully synced {len(campaigns)} campaigns",
            "campaigns_count": len(campaigns),
            "last_synced": sheet.last_synced
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error syncing sheet: {str(e)}"
        )

import re
import json
from typing import List, Dict, Any, Optional
from datetime import datetime
import gspread
from google.oauth2.service_account import Credentials

import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import settings


class GoogleSheetsService:
    """Service for interacting with Google Sheets API"""
    
    SCOPES = [
        'https://www.googleapis.com/auth/spreadsheets.readonly',
        'https://www.googleapis.com/auth/drive.readonly'
    ]
    
    def __init__(self):
        self.client = None
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize the Google Sheets client with service account credentials"""
        try:
            credentials_path = settings.GOOGLE_SHEETS_CREDENTIALS_PATH
            if credentials_path and os.path.exists(credentials_path):
                credentials = Credentials.from_service_account_file(
                    credentials_path,
                    scopes=self.SCOPES
                )
                self.client = gspread.authorize(credentials)
            elif settings.GOOGLE_SHEETS_CREDENTIALS_JSON:
                # Parse credentials from JSON string (for production/env vars)
                credentials_info = json.loads(settings.GOOGLE_SHEETS_CREDENTIALS_JSON)
                credentials = Credentials.from_service_account_info(
                    credentials_info,
                    scopes=self.SCOPES
                )
                self.client = gspread.authorize(credentials)
        except Exception as e:
            print(f"Warning: Could not initialize Google Sheets client: {e}")
            self.client = None
    
    @staticmethod
    def extract_sheet_id(url: str) -> Optional[str]:
        """Extract the Google Sheet ID from a URL"""
        # Pattern for Google Sheets URLs
        patterns = [
            r'/spreadsheets/d/([a-zA-Z0-9-_]+)',  # Standard URL
            r'/d/([a-zA-Z0-9-_]+)',  # Short URL
            r'^([a-zA-Z0-9-_]+)$'  # Direct ID
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        
        return None
    
    def get_spreadsheet(self, sheet_id: str):
        """Get a spreadsheet by ID"""
        if not self.client:
            raise ValueError("Google Sheets client not initialized. Check credentials.")
        
        return self.client.open_by_key(sheet_id)
    
    def get_worksheet(self, sheet_id: str, worksheet_name: str = "Sheet1"):
        """Get a specific worksheet from a spreadsheet"""
        spreadsheet = self.get_spreadsheet(sheet_id)
        
        try:
            return spreadsheet.worksheet(worksheet_name)
        except gspread.WorksheetNotFound:
            # Fall back to first sheet
            return spreadsheet.sheet1
    
    def get_all_worksheets(self, sheet_id: str) -> List[str]:
        """Get all worksheet names from a spreadsheet"""
        spreadsheet = self.get_spreadsheet(sheet_id)
        return [ws.title for ws in spreadsheet.worksheets()]
    
    def get_sheet_metadata(self, sheet_id: str) -> Dict[str, Any]:
        """Get metadata about a spreadsheet"""
        spreadsheet = self.get_spreadsheet(sheet_id)
        return {
            "title": spreadsheet.title,
            "id": spreadsheet.id,
            "url": spreadsheet.url,
            "worksheets": [ws.title for ws in spreadsheet.worksheets()]
        }
    
    def get_rows(
        self, 
        sheet_id: str, 
        worksheet_name: str = "Sheet1",
        has_header: bool = True
    ) -> List[Dict[str, Any]]:
        """Get all rows from a worksheet as a list of dictionaries"""
        worksheet = self.get_worksheet(sheet_id, worksheet_name)
        
        if has_header:
            # Get all records (uses first row as headers)
            return worksheet.get_all_records()
        else:
            # Get all values as list of lists
            values = worksheet.get_all_values()
            return [{"row_" + str(i): v for i, v in enumerate(row)} for row in values]
    
    def get_campaigns_from_sheet(
        self,
        sheet_id: str,
        worksheet_name: str = "Sheet1",
        column_mapping: Optional[Dict[str, str]] = None
    ) -> List[Dict[str, Any]]:
        """
        Get campaign data from a Google Sheet.
        
        Args:
            sheet_id: The Google Sheet ID
            worksheet_name: Name of the worksheet to read
            column_mapping: Optional mapping of sheet columns to campaign fields
                           e.g., {"Campaign Name": "name", "Status": "status"}
        
        Returns:
            List of campaign dictionaries
        """
        rows = self.get_rows(sheet_id, worksheet_name)
        
        if not rows:
            return []
        
        # Default column mapping if not provided
        default_mapping = {
            "name": ["name", "campaign name", "campaign", "title"],
            "status": ["status", "state"],
            "sent": ["sent", "emails sent", "total sent"],
            "openRate": ["open rate", "openrate", "open_rate", "opens"],
            "replyRate": ["reply rate", "replyrate", "reply_rate", "replies"]
        }
        
        campaigns = []
        for idx, row in enumerate(rows):
            campaign = {"id": idx + 1}
            
            if column_mapping:
                # Use provided mapping
                for sheet_col, campaign_field in column_mapping.items():
                    if sheet_col in row:
                        campaign[campaign_field] = row[sheet_col]
            else:
                # Auto-detect columns using default mapping
                row_lower = {k.lower().strip(): v for k, v in row.items()}
                
                for field, possible_names in default_mapping.items():
                    for name in possible_names:
                        if name in row_lower:
                            campaign[field] = row_lower[name]
                            break
            
            # Only add if we have at least a name
            if campaign.get("name"):
                # Set defaults for missing fields
                campaign.setdefault("status", "Active")
                campaign.setdefault("sent", "0")
                campaign.setdefault("openRate", "0%")
                campaign.setdefault("replyRate", "0%")
                campaigns.append(campaign)
        
        return campaigns
    
    def validate_sheet_access(self, sheet_id: str) -> Dict[str, Any]:
        """
        Validate that we can access a Google Sheet.
        
        Returns:
            Dict with success status and sheet info or error message
        """
        try:
            metadata = self.get_sheet_metadata(sheet_id)
            return {
                "success": True,
                "title": metadata["title"],
                "worksheets": metadata["worksheets"],
                "url": metadata["url"]
            }
        except gspread.SpreadsheetNotFound:
            return {
                "success": False,
                "error": "Spreadsheet not found. Make sure the URL is correct and the sheet is shared with the service account."
            }
        except gspread.exceptions.APIError as e:
            return {
                "success": False,
                "error": f"API Error: {str(e)}"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Error accessing sheet: {str(e)}"
            }


# Singleton instance
google_sheets_service = GoogleSheetsService()

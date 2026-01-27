# coding: utf-8

import uuid
import os
import io
from typing import ClassVar, Dict, List, Tuple, Optional
from datetime import datetime

import pandas as pd
from fastapi import UploadFile, HTTPException

from openapi_server.apis.default_api_base import BaseDefaultApi
from openapi_server.models.client import Client
from openapi_server.models.client_create import ClientCreate
from openapi_server.models.client_status import ClientStatus
from openapi_server.models.email_request import EmailRequest
from openapi_server.models.import_clients_excel200_response import ImportClientsExcel200Response
from openapi_server.models.import_clients_google_sheet_request import ImportClientsGoogleSheetRequest
from openapi_server.models.send_email200_response import SendEmail200Response
from openapi_server.models.task import Task
from openapi_server.models.email_log import EmailLog
from openapi_server.models.template import Template
from openapi_server.models.email_attachment import EmailAttachment
from database import SessionLocal, ClientModel, TaskModel, EmailLogModel, TemplateModel, AttachmentModel


class DefaultApiImpl(BaseDefaultApi):
    
    def __init__(self):
        self.db = SessionLocal()

    async def create_client(
        self,
        client_create: ClientCreate,
    ) -> Client:
        """Manually create a single client."""
        db_client = ClientModel(
            id=str(uuid.uuid4()),
            name=client_create.name,
            email=client_create.email,
            company=client_create.company,
            status=client_create.status if client_create.status else "not_contacted",
            last_contact=client_create.last_contact.isoformat() if client_create.last_contact else None
        )
        self.db.add(db_client)
        
        # Auto-create task
        db_task = TaskModel(
            id=str(uuid.uuid4()),
            type="follow_up",
            client_name=db_client.name,
            client_email=db_client.email,
            company=db_client.company if db_client.company else "",
            description=f"Send initial email to {db_client.name}",
            due_date=datetime.now().strftime("%Y-%m-%d"),
            priority="high",
            completed=False
        )
        self.db.add(db_task)
        self.db.commit()
        
        return Client(
            id=db_client.id,
            name=db_client.name,
            email=db_client.email,
            company=db_client.company,
            status=db_client.status,
            lastContact=db_client.last_contact
        )

    async def get_tasks(self) -> List[Task]:
        """Retrieve a list of tasks."""
        db_tasks = self.db.query(TaskModel).all()
        return [
            Task(
                id=t.id,
                type=t.type,
                clientName=t.client_name,
                clientEmail=t.client_email,
                company=t.company,
                description=t.description,
                dueDate=datetime.strptime(t.due_date, "%Y-%m-%d").date() if t.due_date else None,
                priority=t.priority,
                completed=t.completed
            )
            for t in db_tasks
        ]

    async def delete_client(
        self,
        client_id: str,
    ) -> None:
        """Delete a specific client by ID."""
        self.db.query(ClientModel).filter(ClientModel.id == client_id).delete()
        self.db.commit()

    async def get_clients(
        self,
        search: str,
    ) -> List[Client]:
        """Retrieve a list of clients with optional filtering."""
        query = self.db.query(ClientModel)
        
        if search:
            search_lower = f"%{search.lower()}%"
            # Basic SQLAlchemy filter simulation for SQLite
            # Actually, let's keep it simple. filter logic in python or use ilike
            # For sqlite, ilike matches case insensitive
            pass  # Doing manual filtering for simplicity if needed, but db based is better
            
        all_clients = query.all()
        
        filtered = []
        for c in all_clients:
            if search:
                s = search.lower()
                if (s not in (c.name or "").lower() and 
                    s not in (c.email or "").lower() and 
                    s not in (c.company or "").lower()):
                    continue
            
            filtered.append(Client(
                id=c.id,
                name=c.name,
                email=c.email,
                company=c.company,
                status=c.status,
                lastContact=c.last_contact
            ))
            
        return filtered

    async def import_clients_excel(
        self,
        file: UploadFile,
        skip_duplicates: bool = False,
    ) -> ImportClientsExcel200Response:
        """Upload an Excel file to bulk import clients."""
        try:
            contents = await file.read()
            df = pd.read_excel(io.BytesIO(contents))
            
            # Normalize column names
            df.columns = [c.lower().strip() for c in df.columns]
            
            required_columns = ["name", "email"]
            missing_cols = [c for c in required_columns if c not in df.columns]
            
            if missing_cols:
                raise HTTPException(status_code=422, detail=f"Missing columns: {missing_cols}")    

            # Check for duplicates using DB
            existing_emails_query = self.db.query(ClientModel.email).all()
            existing_emails = {r[0].lower() for r in existing_emails_query if r[0]}
            
            upload_emails = set(df['email'].astype(str).str.lower())
            duplicates = existing_emails.intersection(upload_emails)
            
            if duplicates and not skip_duplicates:
                raise HTTPException(
                    status_code=409,
                    detail={
                        "message": "Duplicate clients found",
                        "existing_emails": list(duplicates),
                        "count": len(duplicates)
                    }
                )

            imported_clients = []
            for _, row in df.iterrows():
                try:
                    email = str(row.get("email")).lower()
                    if pd.isna(row.get("email")) or "@" not in email:
                        continue
                    
                    if email in existing_emails:
                        continue
                        
                    db_client = ClientModel(
                        id=str(uuid.uuid4()),
                        name=str(row.get("name", "Unknown")),
                        email=str(row.get("email")),
                        company=str(row.get("company")) if pd.notna(row.get("company")) else None,
                        status="not_contacted"
                    )
                    self.db.add(db_client)
                    
                    new_client_obj = Client(
                        id=db_client.id,
                        name=db_client.name,
                        email=db_client.email,
                        company=db_client.company,
                        status=db_client.status
                    )
                    imported_clients.append(new_client_obj)

                    # Auto-create task
                    db_task = TaskModel(
                        id=str(uuid.uuid4()),
                        type="follow_up",
                        client_name=db_client.name,
                        client_email=db_client.email,
                        company=db_client.company if db_client.company else "",
                        description=f"Send initial email to {db_client.name}",
                        due_date=datetime.now().strftime("%Y-%m-%d"),
                        priority="high",
                        completed=False
                    )
                    self.db.add(db_task)
                    
                except Exception as e:
                    print(f"Skipping row: {e}")
                    continue
            
            self.db.commit()

            return ImportClientsExcel200Response(
                count=len(imported_clients),
                clients=imported_clients
            )
            
        except HTTPException:
            raise
        except Exception as e:
            print(f"Error: {e}")
            raise HTTPException(status_code=422, detail=f"Import failed: {str(e)}")

    async def import_clients_google_sheet(
        self,
        import_clients_google_sheet_request: ImportClientsGoogleSheetRequest,
    ) -> ImportClientsExcel200Response:
        # Mock implementation for Google Sheet remains simple or could use DB
        # For brevity, leaving as mock but creating real DB entry
        mock_client = ClientModel(
            id=str(uuid.uuid4()),
            name="Sheet User",
            email="sheet@example.com",
            company="Sheet Company",
            status="not_contacted"
        )
        self.db.add(mock_client)
        self.db.commit()
        
        return ImportClientsExcel200Response(count=1, clients=[Client(id=mock_client.id, name=mock_client.name, email=mock_client.email)])

    async def get_attachments(self) -> List[EmailAttachment]:
        """Retrieve a list of uploaded attachments."""
        from openapi_server.models.email_attachment import EmailAttachment
        db_attachments = self.db.query(AttachmentModel).order_by(AttachmentModel.created_at.desc()).all()
        return [
            EmailAttachment(
                id=a.id,
                name=a.filename,
                size=a.size
            )
            for a in db_attachments
        ]

    async def upload_attachment(self, file: UploadFile) -> EmailAttachment:
        """Upload a new file."""
        from openapi_server.models.email_attachment import EmailAttachment
        
        # Ensure uploads directory exists
        upload_dir = os.path.join(os.getcwd(), "uploads")
        os.makedirs(upload_dir, exist_ok=True)
        
        file_id = str(uuid.uuid4())
        filename = file.filename
        file_path = os.path.join(upload_dir, f"{file_id}_{filename}")
        
        # Save file
        with open(file_path, "wb") as buffer:
            contents = await file.read()
            buffer.write(contents)
            file_size_bytes = len(contents)
            
        # Format size string
        if file_size_bytes < 1024:
            size_str = f"{file_size_bytes} B"
        elif file_size_bytes < 1024 * 1024:
            size_str = f"{file_size_bytes / 1024:.1f} KB"
        else:
            size_str = f"{file_size_bytes / (1024 * 1024):.1f} MB"
            
        # Create DB record
        db_attachment = AttachmentModel(
            id=file_id,
            filename=filename,
            file_path=file_path,
            size=size_str
        )
        self.db.add(db_attachment)
        self.db.commit()
        
        return EmailAttachment(
            id=db_attachment.id,
            name=db_attachment.filename,
            size=db_attachment.size
        )

    async def send_email(
        self,
        email_request: EmailRequest,
    ) -> SendEmail200Response:
        """Send an email to a list of clients."""
        import os
        import smtplib
        import ssl
        from email.message import EmailMessage
        import certifi

        gmail_user = os.getenv("GMAIL_USER")
        gmail_password = os.getenv("GMAIL_PASSWORD")

        sent_count = 0
        
        # Collect attachments if any
        attachment_files = []
        if email_request.attachment_ids:
            for att_id in email_request.attachment_ids:
                att = self.db.query(AttachmentModel).filter(AttachmentModel.id == att_id).first()
                if att and os.path.exists(att.file_path):
                    attachment_files.append(att)

        # If no credentials, mock send but update DB
        if not gmail_user or not gmail_password:
             print("Mock sending...")
             for cid in email_request.recipient_ids:
                 client = self.db.query(ClientModel).filter(ClientModel.id == cid).first()
                 if client:
                     client.status = "emailed"
                     client.last_contact = datetime.now().isoformat()
             self.db.commit()
             # Log mock
             log = EmailLogModel(
                 id=str(uuid.uuid4()),
                 timestamp=datetime.now(),
                 recipient_count=len(email_request.recipient_ids),
                 subject=email_request.subject,
                 body=email_request.body,
                 status="sent_mock",
                 recipients=",".join(email_request.recipient_ids)
             )
             self.db.add(log)
             self.db.commit()
             return SendEmail200Response(success=True, sent_count=len(email_request.recipient_ids))

        try:
            context = ssl.create_default_context(cafile=certifi.where())
        except:
            context = ssl._create_unverified_context()

        try:
            with smtplib.SMTP("smtp.gmail.com", 587) as server:
                server.starttls(context=context)
                server.login(gmail_user, gmail_password)
                
                for cid in email_request.recipient_ids:
                    # Find client
                    client = self.db.query(ClientModel).filter(ClientModel.id == cid).first()
                    if not client or not client.email:
                        continue
                    
                    # Template Interpolation
                    subject_final = email_request.subject.format(
                        name=client.name,
                        company=client.company or "",
                        email=client.email
                    )
                    
                    body_final = email_request.body.replace("{name}", client.name)\
                                                 .replace("{company}", client.company or "")\
                                                 .replace("{email}", client.email)
                    
                    subject_final = email_request.subject.replace("{name}", client.name)\
                                                   .replace("{company}", client.company or "")\
                                                   .replace("{email}", client.email)

                    msg = EmailMessage()
                    msg.set_content(body_final)
                    msg["Subject"] = subject_final
                    msg["From"] = gmail_user
                    msg["To"] = client.email
                    
                    # Attach files
                    for att in attachment_files:
                        import mimetypes
                        ctype, encoding = mimetypes.guess_type(att.file_path)
                        if ctype is None or encoding is not None:
                            # No guess could be made, or the file is encoded (compressed), so
                            # use a generic bag-of-bits type.
                            ctype = 'application/octet-stream'
                        maintype, subtype = ctype.split('/', 1)
                        
                        with open(att.file_path, 'rb') as f:
                            file_data = f.read()
                            msg.add_attachment(file_data,
                                               maintype=maintype,
                                               subtype=subtype,
                                               filename=att.filename)

                    try:
                        server.send_message(msg)
                        client.status = "emailed"
                        client.last_contact = datetime.now().isoformat()
                        sent_count += 1
                    except Exception as e:
                        print(f"Failed to send to {client.email}: {e}")
                
            self.db.commit()

        except Exception as e:
            print(f"SMTP Error: {e}")
            raise HTTPException(status_code=500, detail=str(e))

        # Log entry
        log_entry = EmailLogModel(
            id=str(uuid.uuid4()),
            timestamp=datetime.now(),
            recipient_count=sent_count,
            subject=email_request.subject,
            body=email_request.body,
            status="sent" if sent_count > 0 else "failed",
            recipients=",".join(email_request.recipient_ids)
        )
        self.db.add(log_entry)
        self.db.commit()

        return SendEmail200Response(
            success=True,
            sent_count=sent_count
        )

    async def get_templates(self) -> List[Template]:
        """Retrieve a list of templates."""
        from openapi_server.models.template import Template
        db_templates = self.db.query(TemplateModel).all()
        return [
            Template(
                id=t.id,
                name=t.name,
                subject=t.subject,
                body=t.body
            )
            for t in db_templates
        ]

    async def create_template(self, template: Template) -> Template:
        """Create a new email template."""
        from openapi_server.models.template import Template
        db_template = TemplateModel(
            id=str(uuid.uuid4()),
            name=template.name,
            subject=template.subject,
            body=template.body
        )
        self.db.add(db_template)
        self.db.commit()
        
        return Template(
            id=db_template.id,
            name=db_template.name,
            subject=db_template.subject,
            body=db_template.body
        )

    async def update_template(self, template_id: str, template: Template) -> Template:
        """Update an existing template."""
        from openapi_server.models.template import Template
        db_template = self.db.query(TemplateModel).filter(TemplateModel.id == template_id).first()
        if not db_template:
            raise HTTPException(status_code=404, detail="Template not found")
        
        db_template.name = template.name
        db_template.subject = template.subject
        db_template.body = template.body
        self.db.commit()
        
        return Template(
            id=db_template.id,
            name=db_template.name,
            subject=db_template.subject,
            body=db_template.body
        )

    async def delete_template(self, template_id: str) -> None:
        """Delete a specific template."""
        self.db.query(TemplateModel).filter(TemplateModel.id == template_id).delete()
        self.db.commit()

    async def get_email_history(self) -> List[EmailLog]:
        """Retrieve a log of sent emails."""
        logs = self.db.query(EmailLogModel).order_by(EmailLogModel.timestamp.desc()).all()
        return [
            EmailLog(
                id=l.id,
                timestamp=l.timestamp,
                recipient_count=l.recipient_count,
                subject=l.subject,
                body=l.body,
                status=l.status,
                recipients=l.recipients.split(",") if l.recipients else []
            )
            for l in logs
        ]

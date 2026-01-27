from sqlalchemy import create_engine, Column, String, Integer, DateTime, Boolean, Date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime

SQLALCHEMY_DATABASE_URL = "sqlite:///./cold_reach.db"
# check_same_thread=False is needed for SQLite with FastAPI
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class ClientModel(Base):
    __tablename__ = "clients"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, index=True)
    company = Column(String, nullable=True)
    status = Column(String, default="not_contacted")
    last_contact = Column(String, nullable=True) # Storing as ISO strings

class TaskModel(Base):
    __tablename__ = "tasks"
    
    id = Column(String, primary_key=True, index=True)
    type = Column(String)
    client_name = Column(String)
    client_email = Column(String)
    company = Column(String, nullable=True)
    description = Column(String)
    due_date = Column(String) # Storing as ISO date string
    priority = Column(String)
    completed = Column(Boolean, default=False)

class EmailLogModel(Base):
    __tablename__ = "email_logs"
    
    id = Column(String, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    recipient_count = Column(Integer)
    subject = Column(String)
    body = Column(String)
    status = Column(String)
    recipients = Column(String) # Storing list as comma-separated string for simple SQLite

class TemplateModel(Base):
    __tablename__ = "templates"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    subject = Column(String)
    body = Column(String)

class AttachmentModel(Base):
    __tablename__ = "attachments"
    
    id = Column(String, primary_key=True, index=True)
    filename = Column(String)
    file_path = Column(String)
    size = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

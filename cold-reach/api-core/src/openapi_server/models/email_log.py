# coding: utf-8

from __future__ import annotations
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

class EmailLog(BaseModel):
    """
    EmailLog - a model defined in OpenAPI
    """
    id: Optional[str] = Field(alias="id", default=None)
    timestamp: Optional[datetime] = Field(alias="timestamp", default=None)
    recipient_count: Optional[int] = Field(alias="recipient_count", default=None)
    subject: Optional[str] = Field(alias="subject", default=None)
    body: Optional[str] = Field(alias="body", default=None)
    status: Optional[str] = Field(alias="status", default=None)
    recipients: Optional[List[str]] = Field(alias="recipients", default=None)

    class Config:
        allow_population_by_field_name = True

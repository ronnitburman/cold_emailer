# coding: utf-8

from typing import Dict, List  # noqa: F401
import importlib
import pkgutil

from openapi_server.apis.default_api_base import BaseDefaultApi
import openapi_server.impl

from fastapi import (  # noqa: F401
    APIRouter,
    Body,
    Cookie,
    Depends,
    Form,
    Header,
    Path,
    Query,
    Response,
    Security,
    status,
    UploadFile,
    File,
)

from openapi_server.models.extra_models import TokenModel  # noqa: F401
from openapi_server.models.client import Client
from openapi_server.models.client_create import ClientCreate
from openapi_server.models.email_request import EmailRequest
from openapi_server.models.import_clients_excel200_response import ImportClientsExcel200Response
from openapi_server.models.import_clients_google_sheet_request import ImportClientsGoogleSheetRequest
from openapi_server.models.send_email200_response import SendEmail200Response
from openapi_server.models.task import Task
from openapi_server.models.email_log import EmailLog
from openapi_server.models.template import Template
from openapi_server.models.email_attachment import EmailAttachment


router = APIRouter()

ns_pkg = openapi_server.impl
for _, name, _ in pkgutil.iter_modules(ns_pkg.__path__, ns_pkg.__name__ + "."):
    importlib.import_module(name)


@router.post(
    "/clients",
    responses={
        201: {"model": Client, "description": "Client created"},
    },
    tags=["default"],
    summary="Create client",
    response_model_by_alias=True,
)
async def create_client(
    client_create: ClientCreate = Body(description=""),
) -> Client:
    """Manually create a single client."""
    return await BaseDefaultApi.subclasses[0]().create_client(client_create)


@router.delete(
    "/clients/{client_id}",
    responses={
        204: {"description": "Client deleted successfully"},
    },
    tags=["default"],
    summary="Delete client",
    response_model_by_alias=True,
)
async def delete_client(
    client_id: str = Path(..., description=""),
) -> None:
    """Delete a specific client by ID."""
    return await BaseDefaultApi.subclasses[0]().delete_client(client_id)


@router.get(
    "/clients",
    responses={
        200: {"model": List[Client], "description": "Successful response"},
    },
    tags=["default"],
    summary="List clients",
    response_model_by_alias=True,
)
async def get_clients(
    search: str = Query(None, description="Search term for name, email, or company", alias="search"),
) -> List[Client]:
    """Retrieve a list of clients with optional filtering."""
    return await BaseDefaultApi.subclasses[0]().get_clients(search)


@router.post(
    "/clients/import/excel",
    responses={
        200: {"model": ImportClientsExcel200Response, "description": "Clients imported successfully"},
    },
    tags=["default"],
    summary="Import clients from Excel",
    response_model_by_alias=True,
)
async def import_clients_excel(
    file: UploadFile = File(..., description="Excel file (.xlsx, .xls)"),
    skip_duplicates: bool = Query(False, description="If true, skip existing clients instead of erroring"),
) -> ImportClientsExcel200Response:
    """Upload an Excel file to bulk import clients."""
    return await BaseDefaultApi.subclasses[0]().import_clients_excel(file, skip_duplicates)


@router.post(
    "/clients/import/google-sheet",
    responses={
        200: {"model": ImportClientsExcel200Response, "description": "Clients imported successfully"},
    },
    tags=["default"],
    summary="Import clients from Google Sheet",
    response_model_by_alias=True,
)
async def import_clients_google_sheet(
    import_clients_google_sheet_request: ImportClientsGoogleSheetRequest = Body(description=""),
) -> ImportClientsExcel200Response:
    """Import clients from a public or shared Google Sheet URL."""
    return await BaseDefaultApi.subclasses[0]().import_clients_google_sheet(import_clients_google_sheet_request)


@router.post(
    "/email/send",
    responses={
        200: {"model": SendEmail200Response, "description": "Emails accepted for delivery"},
    },
    tags=["default"],
    summary="Send email",
    response_model_by_alias=True,
)
async def send_email(
    email_request: EmailRequest = Body(description=""),
) -> SendEmail200Response:
    """Send an email to a list of clients."""
    return await BaseDefaultApi.subclasses[0]().send_email(email_request)


@router.get(
    "/attachments",
    responses={
        200: {"model": List[EmailAttachment], "description": "Successful response"},
    },
    tags=["default"],
    summary="List attachments",
    response_model_by_alias=True,
)
async def get_attachments() -> List[EmailAttachment]:
    """Retrieve a list of uploaded attachments."""
    return await BaseDefaultApi.subclasses[0]().get_attachments()


@router.post(
    "/attachments",
    responses={
        201: {"model": EmailAttachment, "description": "Attachment uploaded"},
    },
    tags=["default"],
    summary="Upload attachment",
    response_model_by_alias=True,
)
async def upload_attachment(
    file: UploadFile = File(..., description=""),
) -> EmailAttachment:
    """Upload a new file."""
    return await BaseDefaultApi.subclasses[0]().upload_attachment(file)


@router.get(
    "/templates",
    responses={
        200: {"model": List[Template], "description": "Successful response"},
    },
    tags=["default"],
    summary="List templates",
    response_model_by_alias=True,
)
async def get_templates() -> List[Template]:
    """Retrieve a list of templates."""
    return await BaseDefaultApi.subclasses[0]().get_templates()


@router.post(
    "/templates",
    responses={
        201: {"model": Template, "description": "Template created"},
    },
    tags=["default"],
    summary="Create template",
    response_model_by_alias=True,
)
async def create_template(
    template: Template = Body(None, description=""),
) -> Template:
    """Create a new email template."""
    return await BaseDefaultApi.subclasses[0]().create_template(template)


@router.delete(
    "/templates/{template_id}",
    responses={
        204: {"description": "Template deleted successfully"},
    },
    tags=["default"],
    summary="Delete template",
    response_model_by_alias=True,
)
async def delete_template(
    template_id: str = Path(..., description=""),
) -> None:
    """Delete a specific template."""
    return await BaseDefaultApi.subclasses[0]().delete_template(template_id)


@router.put(
    "/templates/{template_id}",
    responses={
        200: {"model": Template, "description": "Template updated"},
    },
    tags=["default"],
    summary="Update template",
    response_model_by_alias=True,
)
async def update_template(
    template_id: str = Path(..., description=""),
    template: Template = Body(None, description=""),
) -> Template:
    """Update an existing template."""
    return await BaseDefaultApi.subclasses[0]().update_template(template_id, template)


@router.get(
    "/tasks",
    responses={
        200: {"model": List[Task], "description": "Successful response"},
    },
    tags=["default"],
    summary="List tasks",
    response_model_by_alias=True,
)
async def get_tasks() -> List[Task]:
    """Retrieve a list of tasks."""
    return await BaseDefaultApi.subclasses[0]().get_tasks()


@router.get(
    "/email/history",
    responses={
        200: {"model": List[EmailLog], "description": "Successful response"},
    },
    tags=["default"],
    summary="Get email history",
    response_model_by_alias=True,
)
async def get_email_history() -> List[EmailLog]:
    """Retrieve a log of sent emails."""
    return await BaseDefaultApi.subclasses[0]().get_email_history()

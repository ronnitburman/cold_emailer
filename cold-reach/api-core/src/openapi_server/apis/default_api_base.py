# coding: utf-8

from typing import ClassVar, Dict, List, Tuple  # noqa: F401

from openapi_server.models.client import Client
from openapi_server.models.client_create import ClientCreate
from openapi_server.models.email_request import EmailRequest
from openapi_server.models.import_clients_excel200_response import ImportClientsExcel200Response
from openapi_server.models.import_clients_google_sheet_request import ImportClientsGoogleSheetRequest
from openapi_server.models.send_email200_response import SendEmail200Response


class BaseDefaultApi:
    subclasses: ClassVar[Tuple] = ()

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        BaseDefaultApi.subclasses = BaseDefaultApi.subclasses + (cls,)
    async def create_client(
        self,
        client_create: ClientCreate,
    ) -> Client:
        """Manually create a single client."""
        ...


    async def delete_client(
        self,
        client_id: str,
    ) -> None:
        """Delete a specific client by ID."""
        ...


    async def get_clients(
        self,
        search: str,
    ) -> List[Client]:
        """Retrieve a list of clients with optional filtering."""
        ...


    async def import_clients_excel(
        self,
        file: str,
    ) -> ImportClientsExcel200Response:
        """Upload an Excel file to bulk import clients."""
        ...


    async def import_clients_google_sheet(
        self,
        import_clients_google_sheet_request: ImportClientsGoogleSheetRequest,
    ) -> ImportClientsExcel200Response:
        """Import clients from a public or shared Google Sheet URL."""
        ...


    async def send_email(
        self,
        email_request: EmailRequest,
    ) -> SendEmail200Response:
        """Send an email to a list of clients."""
        ...

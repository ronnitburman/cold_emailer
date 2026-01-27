# coding: utf-8

from fastapi.testclient import TestClient


from openapi_server.models.client import Client  # noqa: F401
from openapi_server.models.client_create import ClientCreate  # noqa: F401
from openapi_server.models.email_request import EmailRequest  # noqa: F401
from openapi_server.models.import_clients_excel200_response import ImportClientsExcel200Response  # noqa: F401
from openapi_server.models.import_clients_google_sheet_request import ImportClientsGoogleSheetRequest  # noqa: F401
from openapi_server.models.send_email200_response import SendEmail200Response  # noqa: F401


def test_create_client(client: TestClient):
    """Test case for create_client

    Create client
    """
    client_create = {"name":"Sarah Johnson","company":"TechCorp Inc","email":"sarah.j@techcorp.com","last_contact":"2000-01-23T04:56:07.000+00:00"}

    headers = {
    }
    response = client.request(
        "POST",
        "/clients",
        headers=headers,
        json=client_create,
    )

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_delete_client(client: TestClient):
    """Test case for delete_client

    Delete client
    """

    headers = {
    }
    response = client.request(
        "DELETE",
        "/clients/{client_id}".format(client_id='client_id_example'),
        headers=headers,
    )

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_get_clients(client: TestClient):
    """Test case for get_clients

    List clients
    """
    params = [("search", 'search_example')]
    headers = {
    }
    response = client.request(
        "GET",
        "/clients",
        headers=headers,
        params=params,
    )

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_import_clients_excel(client: TestClient):
    """Test case for import_clients_excel

    Import clients from Excel
    """

    headers = {
    }
    data = {
        "file": '/path/to/file'
    }
    response = client.request(
        "POST",
        "/clients/import/excel",
        headers=headers,
        data=data,
    )

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_import_clients_google_sheet(client: TestClient):
    """Test case for import_clients_google_sheet

    Import clients from Google Sheet
    """
    import_clients_google_sheet_request = openapi_server.ImportClientsGoogleSheetRequest()

    headers = {
    }
    response = client.request(
        "POST",
        "/clients/import/google-sheet",
        headers=headers,
        json=import_clients_google_sheet_request,
    )

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_send_email(client: TestClient):
    """Test case for send_email

    Send email
    """
    email_request = {"attachments":[{"size":"size","name":"name","id":"id"},{"size":"size","name":"name","id":"id"}],"subject":"subject","recipient_ids":["recipient_ids","recipient_ids"],"template_id":"template_id","body":"body"}

    headers = {
    }
    response = client.request(
        "POST",
        "/email/send",
        headers=headers,
        json=email_request,
    )

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200

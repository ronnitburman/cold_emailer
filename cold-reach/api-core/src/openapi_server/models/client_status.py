# coding: utf-8

from enum import Enum

class ClientStatus(str, Enum):
    NOT_CONTACTED = "not_contacted"
    EMAILED = "emailed"
    REPLIED = "replied"
    FOLLOW_UP = "follow_up"
    CLOSED = "closed"

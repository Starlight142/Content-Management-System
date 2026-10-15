*** Settings ***
Library         RequestsLibrary
Resource        variables.resource
Resource        auth_keywords.resource

*** Keywords ***
Check System Health
    [Documentation]    Verifies backend server health and MongoDB connection.
    Ensure API Session
    ${response}=       GET On Session    cms_session    /api/health    expected_status=200
    Should Be Equal As Strings           ${response.json()}[status]    healthy
    Should Be Equal As Strings           ${response.json()}[database][status]    connected
    RETURN             ${response.json()}

Get All Users As Admin
    [Documentation]    Admin fetches list of all system users.
    [Arguments]        ${token}
    Ensure API Session
    ${headers}=        Create Auth Header    ${token}
    ${response}=       GET On Session        cms_session    /api/users    headers=${headers}    expected_status=200
    RETURN             ${response.json()}

Get Global CMS Contents
    [Documentation]    Admin fetches global content list across all teams.
    [Arguments]        ${token}
    Ensure API Session
    ${headers}=        Create Auth Header    ${token}
    ${response}=       GET On Session        cms_session    /api/contents    headers=${headers}    expected_status=200
    RETURN             ${response.json()}

Get System Audit Logs
    [Documentation]    Admin fetches system operational and security audit logs.
    [Arguments]        ${token}
    Ensure API Session
    ${headers}=        Create Auth Header    ${token}
    ${response}=       GET On Session        cms_session    /api/logs    headers=${headers}    expected_status=200
    RETURN             ${response.json()}


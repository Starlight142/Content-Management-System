*** Settings ***
Library         RequestsLibrary
Resource        variables.resource

*** Keywords ***
Ensure API Session
    [Documentation]    Creates a reusable HTTP session for backend requests if not already created.
    Create Session    cms_session    ${BASE_URL}    disable_warnings=1

Login User And Get Token
    [Documentation]    Authenticates via /api/auth/login and returns JWT access token.
    [Arguments]        ${email}    ${password}
    Ensure API Session
    ${payload}=        Create Dictionary    email=${email}    password=${password}
    ${headers}=        Create Dictionary    Content-Type=application/json
    ${response}=       POST On Session      cms_session    /api/auth/login    json=${payload}    headers=${headers}    expected_status=200
    ${token}=          Set Variable         ${response.json()}[token]
    ${user}=           Set Variable         ${response.json()}[user]
    RETURN             ${token}             ${user}

Attempt Login Expect Failure
    [Documentation]    Attempts login with invalid credentials and asserts unauthorized status.
    [Arguments]        ${email}    ${password}    ${expected_status}=401
    Ensure API Session
    ${payload}=        Create Dictionary    email=${email}    password=${password}
    ${headers}=        Create Dictionary    Content-Type=application/json
    ${response}=       POST On Session      cms_session    /api/auth/login    json=${payload}    headers=${headers}    expected_status=${expected_status}
    RETURN             ${response}

Create Auth Header
    [Documentation]    Formats Authorization Bearer Header with given token.
    [Arguments]        ${token}
    ${headers}=        Create Dictionary    Authorization=Bearer ${token}    Content-Type=application/json
    RETURN             ${headers}

*** Settings ***
Documentation     Automated Acceptance Tests for Authentication & System Health (UC-01)
Resource          ../resources/variables.resource
Resource          ../resources/auth_keywords.resource
Resource          ../resources/admin_keywords.resource

*** Test Cases ***
TC_AUTH_01: Verify System Health And Database Connection
    [Documentation]    Verifies that backend server and MongoDB database are healthy.
    [Tags]             smoke    health
    ${health}=         Check System Health
    Should Be Equal As Strings    ${health}[services][api]        online
    Should Be Equal As Strings    ${health}[services][database]   connected

TC_AUTH_02: Successful Login As Administrator
    [Documentation]    Authenticates as ADMIN and validates JWT token with role claims.
    [Tags]             auth    admin
    ${token}    ${user}=    Login User And Get Token    ${ADMIN_EMAIL}    ${DEFAULT_PASSWORD}
    Should Not Be Empty     ${token}
    Should Be Equal As Strings    ${user}[role]    ADMIN
    Should Be Equal As Strings    ${user}[email]   ${ADMIN_EMAIL}

TC_AUTH_03: Successful Login As Production Manager
    [Documentation]    Authenticates as MANAGER and validates JWT token with role claims.
    [Tags]             auth    manager
    ${token}    ${user}=    Login User And Get Token    ${MANAGER_EMAIL}    ${DEFAULT_PASSWORD}
    Should Not Be Empty     ${token}
    Should Be Equal As Strings    ${user}[role]    MANAGER
    Should Be Equal As Strings    ${user}[email]   ${MANAGER_EMAIL}

TC_AUTH_04: Successful Login As Production Member
    [Documentation]    Authenticates as MEMBER and validates JWT token with role claims.
    [Tags]             auth    member
    ${token}    ${user}=    Login User And Get Token    ${MEMBER_EMAIL}    ${DEFAULT_PASSWORD}
    Should Not Be Empty     ${token}
    Should Be Equal As Strings    ${user}[role]    MEMBER
    Should Be Equal As Strings    ${user}[email]   ${MEMBER_EMAIL}

TC_AUTH_05: Reject Login With Incorrect Password
    [Documentation]    Negative Test: Attempts login with invalid credentials and asserts 401 Unauthorized.
    [Tags]             auth    negative
    ${response}=       Attempt Login Expect Failure    ${MANAGER_EMAIL}    wrongpassword_999    expected_status=401
    Should Contain     ${response.json()}[message]     Invalid credentials

TC_AUTH_06: Verify Protected Route With Bearer JWT
    [Documentation]    Tests access to /api/auth/me using Bearer token authorization.
    [Tags]             auth    jwt
    ${token}    ${user}=    Login User And Get Token    ${MEMBER_EMAIL}    ${DEFAULT_PASSWORD}
    ${headers}=        Create Auth Header    ${token}
    ${response}=       GET On Session    cms_session    /api/auth/me    headers=${headers}    expected_status=200
    Should Contain     ${response.json()}[message]    protected route


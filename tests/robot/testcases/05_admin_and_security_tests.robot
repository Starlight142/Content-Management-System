*** Settings ***
Documentation     Automated Acceptance Tests for Admin Governance & Security Guards (UC-10, UC-11, UC-12, Security)
Library           Collections
Resource          ../resources/variables.resource
Resource          ../resources/auth_keywords.resource
Resource          ../resources/admin_keywords.resource
Resource          ../resources/team_keywords.resource

*** Test Cases ***
TC_ADMIN_01: Admin Retrieves Complete Users Roster
    [Documentation]    Admin accesses /api/users to supervise all user accounts and roles.
    [Tags]             admin    users
    ${token}    ${user}=    Login User And Get Token    ${ADMIN_EMAIL}    ${DEFAULT_PASSWORD}
    ${users}=          Get All Users As Admin    ${token}
    ${count}=          Get Length                ${users}
    Should Be True     ${count} >= 3

TC_ADMIN_02: Admin Retrieves Global Content List Across Teams
    [Documentation]    Admin inspects global content pipeline without team scoping limits.
    [Tags]             admin    cms
    ${token}    ${user}=    Login User And Get Token    ${ADMIN_EMAIL}    ${DEFAULT_PASSWORD}
    ${contents}=       Get Global CMS Contents    ${token}
    ${count}=          Get Length                 ${contents}
    Should Be True     ${count} >= 1

TC_ADMIN_03: Admin Retrieves System Audit Logs
    [Documentation]    Admin inspects security and operational audit logs via /api/logs.
    [Tags]             admin    logs
    ${token}    ${user}=    Login User And Get Token    ${ADMIN_EMAIL}    ${DEFAULT_PASSWORD}
    ${logs}=           Get System Audit Logs    ${token}
    ${count}=          Get Length               ${logs}
    Should Be True     ${count} >= 1

TC_ADMIN_04: Reject Member Access To Admin Users Management Endpoint
    [Documentation]    Security RBAC Guard: Asserts 403 Forbidden when MEMBER tries to access /api/users.
    [Tags]             security    rbac
    ${token}    ${user}=    Login User And Get Token    ${MEMBER_EMAIL}    ${DEFAULT_PASSWORD}
    Ensure API Session
    ${headers}=        Create Auth Header    ${token}
    ${response}=       GET On Session        cms_session    /api/users    headers=${headers}    expected_status=403
    Should Contain     ${response.json()}[message]    permission

TC_ADMIN_05: Enforce Cross-Team Isolation Security Guard
    [Documentation]    Security Isolation: Asserts 403 Forbidden when Team B Member attempts to access Team A dashboard.
    [Tags]             security    isolation
    # Get Team A ID as Manager
    ${mgr_token}    ${mgr_user}=    Login User And Get Token    ${MANAGER_EMAIL}    ${DEFAULT_PASSWORD}
    ${team_a}=         Get User Team Info    ${mgr_token}

    # Outsider from Team B tries to access Team A's dashboard
    ${outsider_token}    ${outsider_user}=    Login User And Get Token    ${OUTSIDER_EMAIL}    ${DEFAULT_PASSWORD}
    Ensure API Session
    ${headers}=        Create Auth Header    ${outsider_token}
    ${response}=       GET On Session        cms_session    /api/teams/${team_a}[_id]/dashboard    headers=${headers}    expected_status=403
    Should Contain     ${response.json()}[message]    ไม่มีสิทธิ์เข้าถึงข้อมูลของทีมอื่น

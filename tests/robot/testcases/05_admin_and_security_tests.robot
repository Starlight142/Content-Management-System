*** Settings ***
Documentation     Automated Acceptance Tests for Admin Governance, Global CMS & Audit Logs (UC-12, UC-13, UC-14 / TS_012, TS_013, TS_014)
Library           Collections
Resource          ../resources/variables.resource
Resource          ../resources/auth_keywords.resource
Resource          ../resources/admin_keywords.resource
Resource          ../resources/team_keywords.resource

*** Variables ***
${TEMP_TEAM_ID}    ${EMPTY}

*** Test Cases ***
TC_AUTO_023: [UC-12 / TS_012 Valid] Admin Retrieves Users Roster And Creates New Team Structure
    [Documentation]    ตรวจสอบผู้ดูแลระบบเรียกดูรายชื่อผู้ใช้งานทั้งหมดและสร้างโครงสร้างทีมใหม่สำเร็จ (HTTP 200 & 201)
    [Tags]             UC-12    TS_012    valid    admin    users    teams
    ${token}    ${user}=    Login User And Get Token    ${ADMIN_EMAIL}    ${DEFAULT_PASSWORD}
    ${users}=          Get All Users As Admin    ${token}
    ${count}=          Get Length                ${users}
    Should Be True     ${count} >= 6

    Ensure API Session
    ${headers}=        Create Auth Header    ${token}
    ${team_payload}=   Create Dictionary     name=Studio C Automated    code=TEAM-C    description=Temporary team for automated testing
    ${team_resp}=      POST On Session       cms_session    /api/teams    json=${team_payload}    headers=${headers}    expected_status=201
    Should Be Equal As Strings               ${team_resp.json()}[team][code]    TEAM-C
    Set Suite Variable                       ${TEMP_TEAM_ID}                    ${team_resp.json()}[team][_id]

    # Cleanup temporary team immediately
    DELETE On Session    cms_session    /api/teams/${TEMP_TEAM_ID}    headers=${headers}    expected_status=200

TC_AUTO_024: [UC-12 / TS_012 Invalid] Reject Duplicate Team Code And Block Member From Admin Users API
    [Documentation]    ตรวจสอบการป้องกันรหัสทีมซ้ำ (TEAM-A) และการบล็อกสมาชิกทั่วไปไม่ให้เข้าถึง API จัดการผู้ใช้ของแอดมิน (HTTP 400 & 403)
    [Tags]             UC-12    TS_012    invalid    admin    security    rbac
    ${admin_token}    ${admin}=    Login User And Get Token    ${ADMIN_EMAIL}    ${DEFAULT_PASSWORD}
    Ensure API Session
    ${admin_headers}=  Create Auth Header    ${admin_token}
    ${dup_team}=       Create Dictionary     name=Duplicate Studio A    code=${TEAM_CODE_A}
    ${dup_resp}=       POST On Session       cms_session    /api/teams    json=${dup_team}    headers=${admin_headers}    expected_status=400
    Dictionary Should Contain Key            ${dup_resp.json()}    message

    ${mem_token}    ${mem}=    Login User And Get Token    ${MEMBER_EMAIL}    ${DEFAULT_PASSWORD}
    ${mem_headers}=    Create Auth Header    ${mem_token}
    ${rbac_resp}=      GET On Session        cms_session    /api/users    headers=${mem_headers}    expected_status=403
    Should Contain     ${rbac_resp.json()}[message]    permission

TC_AUTO_025: [UC-13 / TS_013 Valid] Admin Supervises Global Contents And Tasks Across All Teams
    [Documentation]    ตรวจสอบผู้ดูแลระบบกำกับดูแลชิ้นงานและงานย่อยทั้งหมดจากทุกทีมในมุมมองส่วนกลาง (HTTP 200)
    [Tags]             UC-13    TS_013    valid    admin    cms
    ${token}    ${user}=    Login User And Get Token    ${ADMIN_EMAIL}    ${DEFAULT_PASSWORD}
    ${contents}=       Get Global CMS Contents    ${token}
    ${c_count}=        Get Length                 ${contents}
    Should Be True     ${c_count} >= 6

    Ensure API Session
    ${headers}=        Create Auth Header    ${token}
    ${tasks_resp}=     GET On Session        cms_session    /api/tasks    headers=${headers}    expected_status=200
    ${t_count}=        Get Length            ${tasks_resp.json()}
    Should Be True     ${t_count} >= 10

TC_AUTO_026: [UC-13 / TS_013 Invalid] Reject Global Task Or Content Creation With Empty Title
    [Documentation]    ตรวจสอบการป้องกันผู้ดูแลระบบสร้างชิ้นงานหรืองานย่อยโดยเว้นว่างชื่อรายการ (HTTP 400 Bad Request)
    [Tags]             UC-13    TS_013    invalid    admin    cms
    ${token}    ${user}=    Login User And Get Token    ${ADMIN_EMAIL}    ${DEFAULT_PASSWORD}
    Ensure API Session
    ${headers}=        Create Auth Header    ${token}
    ${empty_task}=     Create Dictionary     title=${EMPTY}    taskType=Editing
    ${response}=       POST On Session       cms_session    /api/tasks    json=${empty_task}    headers=${headers}    expected_status=400
    Dictionary Should Contain Key            ${response.json()}    message

TC_AUTO_027: [UC-14 / TS_014 Valid] Admin Verifies System Health Status And Retrieves Audit Logs
    [Documentation]    ตรวจสอบสถานะความพร้อมของเซิร์ฟเวอร์และฐานข้อมูล (/api/health) และการดึงข้อมูล Audit Logs สำเร็จ (HTTP 200)
    [Tags]             UC-14    TS_014    valid    admin    health    logs
    ${health}=         Check System Health
    Should Be Equal As Strings    ${health}[services][api]         online
    Should Be Equal As Strings    ${health}[services][database]    connected

    ${token}    ${user}=    Login User And Get Token    ${ADMIN_EMAIL}    ${DEFAULT_PASSWORD}
    ${logs}=           Get System Audit Logs    ${token}
    ${count}=          Get Length               ${logs}
    Should Be True     ${count} >= 1

TC_AUTO_028: [UC-14 / TS_014 Invalid] Block Unauthenticated Or Unauthorized Access To System Audit Logs
    [Documentation]    ตรวจสอบการบล็อกผู้ใช้ที่ไม่ได้แนบ Token (HTTP 403), Token ไม่ถูกต้อง (HTTP 401) หรือใช้สิทธิ์ MEMBER (HTTP 403) ไม่ให้เข้าถึง Audit Logs
    [Tags]             UC-14    TS_014    invalid    security    logs
    Ensure API Session
    ${no_auth_resp}=   GET On Session    cms_session    /api/logs    expected_status=403
    Dictionary Should Contain Key        ${no_auth_resp.json()}    message

    ${bad_headers}=    Create Auth Header    invalid_jwt_token_value
    ${bad_jwt_resp}=   GET On Session    cms_session    /api/logs    headers=${bad_headers}    expected_status=401
    Dictionary Should Contain Key        ${bad_jwt_resp.json()}    message

    ${mem_token}    ${mem}=    Login User And Get Token    ${MEMBER_EMAIL}    ${DEFAULT_PASSWORD}
    ${mem_headers}=    Create Auth Header    ${mem_token}
    ${forbidden_resp}=    GET On Session    cms_session    /api/logs    headers=${mem_headers}    expected_status=403
    Should Contain     ${forbidden_resp.json()}[message]    permission


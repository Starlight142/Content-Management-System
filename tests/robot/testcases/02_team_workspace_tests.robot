*** Settings ***
Documentation     Automated Acceptance Tests for Team Workspace, Progress Tracking & Positions (UC-04, UC-07, UC-08 / TS_004, TS_007, TS_008)
Library           Collections
Resource          ../resources/variables.resource
Resource          ../resources/auth_keywords.resource
Resource          ../resources/team_keywords.resource

*** Test Cases ***
TC_AUTO_007: [UC-04 / TS_004 Valid] Successfully Join Team Workspace With Valid Invite Code
    [Documentation]    ตรวจสอบการเข้าร่วมทีมด้วยรหัสทีมที่ถูกต้อง (TEAM-A) และการดึงข้อมูลสังกัดทีมสำเร็จ (HTTP 200)
    [Tags]             UC-04    TS_004    valid    team    join
    ${token}    ${user}=    Login User And Get Token    ${MEMBER_EMAIL}    ${DEFAULT_PASSWORD}
    ${result}=         Join Team With Code    ${token}    ${TEAM_CODE_A}
    Should Be Equal As Strings    ${result}[team][code]    ${TEAM_CODE_A}
    ${team}=           Get User Team Info    ${token}
    Should Be Equal As Strings    ${team}[code]    ${TEAM_CODE_A}

TC_AUTO_008: [UC-04 / TS_004 Invalid] Reject Joining Team With Non-Existent Invite Code
    [Documentation]    ตรวจสอบการปฏิเสธเมื่อกรอกรหัสเข้าร่วมทีมที่ไม่มีอยู่ในระบบ (HTTP 400 Bad Request)
    [Tags]             UC-04    TS_004    invalid    team    join
    ${token}    ${user}=    Login User And Get Token    ${MEMBER_EMAIL}    ${DEFAULT_PASSWORD}
    ${result}=         Join Team Expect Failure    ${token}    WRONG-999    expected_status=400
    Should Contain     ${result}[message]    ไม่พบทีม

TC_AUTO_013: [UC-07 / TS_007 Valid] Track Team Dashboard Progress And Real-Time Activity Feed
    [Documentation]    ตรวจสอบการดึงข้อมูลความคืบหน้าภาพรวมของทีม (Dashboard) และฟีดกิจกรรมแบบเรียลไทม์ (HTTP 200)
    [Tags]             UC-07    TS_007    valid    team    dashboard    activity
    ${token}    ${user}=    Login User And Get Token    ${MEMBER_EMAIL}    ${DEFAULT_PASSWORD}
    ${team}=           Get User Team Info    ${token}
    ${dash_resp}=      Get Team Dashboard    ${token}    ${team}[_id]
    Dictionary Should Contain Key    ${dash_resp.json()}           team
    Dictionary Should Contain Key    ${dash_resp.json()}           stats
    Dictionary Should Contain Key    ${dash_resp.json()}           members
    Dictionary Should Contain Key    ${dash_resp.json()}[stats]    teamTasksCount

    ${act_resp}=       Get Team Activity Feed    ${token}    ${team}[_id]
    ${count}=          Get Length    ${act_resp.json()}
    Should Be True     ${count} >= 1

TC_AUTO_014: [UC-07 / TS_007 Invalid] Enforce Cross-Team Isolation Guard For Outsider Member
    [Documentation]    ตรวจสอบการกั้นสิทธิ์ข้อมูลข้ามทีม เมื่อสมาชิก TEAM-B พยายามเรียกดูแดชบอร์ดของ TEAM-A (HTTP 403 Forbidden)
    [Tags]             UC-07    TS_007    invalid    security    isolation
    ${mgr_token}    ${mgr_user}=          Login User And Get Token    ${MANAGER_EMAIL}     ${DEFAULT_PASSWORD}
    ${team_a}=                            Get User Team Info          ${mgr_token}
    ${outsider_token}    ${outsider}=     Login User And Get Token    ${OUTSIDER_EMAIL}    ${DEFAULT_PASSWORD}
    Ensure API Session
    ${headers}=        Create Auth Header    ${outsider_token}
    ${response}=       GET On Session        cms_session    /api/teams/${team_a}[_id]/dashboard    headers=${headers}    expected_status=403
    Should Contain     ${response.json()}[message]    ไม่มีสิทธิ์เข้าถึงข้อมูลของทีมอื่น

TC_AUTO_015: [UC-08 / TS_008 Valid] Manager Inspects Team Roster And Updates Member Position
    [Documentation]    ตรวจสอบสิทธิ์ผู้จัดการทีมในการดูรายชื่อสมาชิกในทีมและกำหนดตำแหน่งงาน (Position) สำเร็จ (HTTP 200)
    [Tags]             UC-08    TS_008    valid    team    position
    ${mgr_token}    ${mgr_user}=    Login User And Get Token    ${MANAGER_EMAIL}    ${DEFAULT_PASSWORD}
    ${mem_token}    ${mem_user}=    Login User And Get Token    ${MEMBER_EMAIL}     ${DEFAULT_PASSWORD}
    ${team}=           Get User Team Info    ${mgr_token}
    Ensure API Session
    ${headers}=        Create Auth Header    ${mgr_token}
    ${members_resp}=   GET On Session        cms_session    /api/teams/${team}[_id]/members    headers=${headers}    expected_status=200
    ${m_count}=        Get Length            ${members_resp.json()}
    Should Be True     ${m_count} >= 3

    ${pos_payload}=    Create Dictionary     position=Video Editor
    ${pos_resp}=       PATCH On Session      cms_session    /api/users/${mem_user}[id]/position    json=${pos_payload}    headers=${headers}    expected_status=200
    Should Be Equal As Strings               ${pos_resp.json()}[user][position]    Video Editor

TC_AUTO_016: [UC-08 / TS_008 Invalid] Block General Member From Updating Team Positions
    [Documentation]    ตรวจสอบการบล็อกสมาชิกทั่วไป (MEMBER) ไม่ให้แก้ไขตำแหน่งงานของสมาชิกในทีม (HTTP 403 Forbidden)
    [Tags]             UC-08    TS_008    invalid    security    position
    ${mem_token}    ${mem_user}=    Login User And Get Token    ${MEMBER_EMAIL}    ${DEFAULT_PASSWORD}
    Ensure API Session
    ${headers}=        Create Auth Header    ${mem_token}
    ${pos_payload}=    Create Dictionary     position=Production Manager
    ${response}=       PATCH On Session      cms_session    /api/users/${mem_user}[id]/position    json=${pos_payload}    headers=${headers}    expected_status=403
    Dictionary Should Contain Key            ${response.json()}    message

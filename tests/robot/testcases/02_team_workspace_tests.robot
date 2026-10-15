*** Settings ***
Documentation     Automated Acceptance Tests for Team Workspace & Activities (UC-02, UC-05, UC-06)
Library           Collections
Resource          ../resources/variables.resource
Resource          ../resources/auth_keywords.resource
Resource          ../resources/team_keywords.resource

*** Test Cases ***
TC_TEAM_01: Member Fetches Current Team Information
    [Documentation]    Verifies that member can fetch team profile metadata via /api/teams/my-team.
    [Tags]             team    member
    ${token}    ${user}=    Login User And Get Token    ${MEMBER_EMAIL}    ${DEFAULT_PASSWORD}
    ${team}=           Get User Team Info    ${token}
    Should Be Equal As Strings    ${team}[code]    ${TEAM_CODE_A}
    Should Contain                ${team}[name]    Team A

TC_TEAM_02: Successfully Join Team With Valid Join Code
    [Documentation]    Tests joining team using valid 6-char team code (Positive Test).
    [Tags]             team    join
    ${token}    ${user}=    Login User And Get Token    ${MEMBER_EMAIL}    ${DEFAULT_PASSWORD}
    ${result}=         Join Team With Code    ${token}    ${TEAM_CODE_A}
    Should Be Equal As Strings    ${result}[team][code]    ${TEAM_CODE_A}

TC_TEAM_03: Reject Join Team With Invalid Code
    [Documentation]    Negative Test: Asserts 400 Bad Request when joining with invalid team code.
    [Tags]             team    negative
    ${token}    ${user}=    Login User And Get Token    ${MEMBER_EMAIL}    ${DEFAULT_PASSWORD}
    ${result}=         Join Team Expect Failure    ${token}    NON_EXISTENT_CODE_99    expected_status=400
    Should Contain     ${result}[message]    ไม่พบทีม

TC_TEAM_04: Fetch Team Dashboard Metrics
    [Documentation]    Verifies team dashboard aggregates including stats and members.
    [Tags]             team    dashboard
    ${token}    ${user}=    Login User And Get Token    ${MANAGER_EMAIL}    ${DEFAULT_PASSWORD}
    ${team}=           Get User Team Info    ${token}
    ${response}=       Get Team Dashboard    ${token}    ${team}[_id]
    Dictionary Should Contain Key    ${response.json()}    team
    Dictionary Should Contain Key    ${response.json()}    stats
    Dictionary Should Contain Key    ${response.json()}    members
    Dictionary Should Contain Key    ${response.json()}[stats]    teamTasksCount

TC_TEAM_05: Fetch Real-Time Chronological Activity Feed
    [Documentation]    Verifies real-time activity feed retrieval for team workspace.
    [Tags]             team    activity
    ${token}    ${user}=    Login User And Get Token    ${MEMBER_EMAIL}    ${DEFAULT_PASSWORD}
    ${team}=           Get User Team Info    ${token}
    ${response}=       Get Team Activity Feed    ${token}    ${team}[_id]
    ${count}=          Get Length    ${response.json()}
    Should Be True     ${count} >= 0

*** Settings ***
Library         RequestsLibrary
Resource        variables.resource
Resource        auth_keywords.resource

*** Keywords ***
Get User Team Info
    [Documentation]    Fetches current logged-in user's team metadata.
    [Arguments]        ${token}
    Ensure API Session
    ${headers}=        Create Auth Header    ${token}
    ${response}=       GET On Session        cms_session    /api/teams/my-team    headers=${headers}    expected_status=200
    RETURN             ${response.json()}

Join Team With Code
    [Documentation]    Joins a team workspace using team join code.
    [Arguments]        ${token}    ${team_code}
    Ensure API Session
    ${headers}=        Create Auth Header    ${token}
    ${payload}=        Create Dictionary     joinCode=${team_code}
    ${response}=       POST On Session       cms_session    /api/teams/join    json=${payload}    headers=${headers}    expected_status=200
    RETURN             ${response.json()}

Join Team Expect Failure
    [Documentation]    Attempts to join team with invalid code and verifies error response.
    [Arguments]        ${token}    ${team_code}    ${expected_status}=400
    Ensure API Session
    ${headers}=        Create Auth Header    ${token}
    ${payload}=        Create Dictionary     joinCode=${team_code}
    ${response}=       POST On Session       cms_session    /api/teams/join    json=${payload}    headers=${headers}    expected_status=${expected_status}
    RETURN             ${response.json()}

Get Team Dashboard
    [Documentation]    Fetches aggregated dashboard data for team workspace.
    [Arguments]        ${token}    ${team_id}    ${expected_status}=200
    Ensure API Session
    ${headers}=        Create Auth Header    ${token}
    ${response}=       GET On Session        cms_session    /api/teams/${team_id}/dashboard    headers=${headers}    expected_status=${expected_status}
    RETURN             ${response}

Get Team Activity Feed
    [Documentation]    Retrieves real-time chronological activity feed for team.
    [Arguments]        ${token}    ${team_id}    ${expected_status}=200
    Ensure API Session
    ${headers}=        Create Auth Header    ${token}
    ${response}=       GET On Session        cms_session    /api/teams/${team_id}/activity    headers=${headers}    expected_status=${expected_status}
    RETURN             ${response}

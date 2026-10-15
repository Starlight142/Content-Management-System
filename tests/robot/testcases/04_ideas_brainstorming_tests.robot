*** Settings ***
Documentation     Automated Acceptance Tests for Ideas & Brainstorming (UC-04)
Library           Collections
Resource          ../resources/variables.resource
Resource          ../resources/auth_keywords.resource

*** Variables ***
${NEW_IDEA_ID}    ${EMPTY}

*** Test Cases ***
TC_IDEA_01: Member Proposes New Content Idea
    [Documentation]    Member pitches a new content idea in DRAFT status.
    [Tags]             ideas    member
    ${token}    ${user}=    Login User And Get Token    ${MEMBER_EMAIL}    ${DEFAULT_PASSWORD}
    ${headers}=        Create Auth Header    ${token}
    ${payload}=        Create Dictionary     title=Future of AI Video Tools 2026    description=Exploring revolutionary generative AI for creators    category=Technology
    ${response}=       POST On Session       cms_session    /api/ideas    json=${payload}    headers=${headers}    expected_status=201
    Should Be Equal As Strings               ${response.json()}[idea][status]    DRAFT
    Should Be Equal As Strings               ${response.json()}[idea][title]     Future of AI Video Tools 2026
    Set Suite Variable                       ${NEW_IDEA_ID}                      ${response.json()}[idea][_id]

TC_IDEA_02: Fetch All Ideas On Idea Board
    [Documentation]    Verifies any team member can list and explore shared ideas.
    [Tags]             ideas    list
    ${token}    ${user}=    Login User And Get Token    ${MANAGER_EMAIL}    ${DEFAULT_PASSWORD}
    ${headers}=        Create Auth Header    ${token}
    ${response}=       GET On Session        cms_session    /api/ideas    headers=${headers}    expected_status=200
    ${count}=          Get Length            ${response.json()}
    Should Be True                           ${count} >= 1

TC_IDEA_03: Manager Approves Content Idea
    [Documentation]    Manager evaluates idea and updates status to APPROVED for production conversion.
    [Tags]             ideas    manager    approval
    ${token}    ${user}=    Login User And Get Token    ${MANAGER_EMAIL}    ${DEFAULT_PASSWORD}
    ${headers}=        Create Auth Header    ${token}
    ${payload}=        Create Dictionary     status=APPROVED
    ${response}=       PATCH On Session      cms_session    /api/ideas/${NEW_IDEA_ID}/status    json=${payload}    headers=${headers}    expected_status=200
    Should Be Equal As Strings               ${response.json()}[idea][status]    APPROVED


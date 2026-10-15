*** Settings ***
Documentation     Automated E2E Production Lifecycle & Workflow Tests (UC-03, UC-07, UC-08, UC-09)
Library           Collections
Resource          ../resources/variables.resource
Resource          ../resources/auth_keywords.resource
Resource          ../resources/workflow_keywords.resource

*** Variables ***
${TEST_CONTENT_ID}       ${EMPTY}
${TEST_TASK_ID}          ${EMPTY}
${MEMBER_USER_ID}        ${EMPTY}

*** Test Cases ***
TC_WORKFLOW_01: Manager Creates Content Pipeline And Transitions To Production
    [Documentation]    Manager creates content in PLANNING status, moves to PRODUCTION, and assigns a TODO task.
    [Tags]             workflow    manager    creation
    ${mgr_token}    ${mgr_user}=    Login User And Get Token    ${MANAGER_EMAIL}    ${DEFAULT_PASSWORD}
    ${mem_token}    ${mem_user}=    Login User And Get Token    ${MEMBER_EMAIL}    ${DEFAULT_PASSWORD}
    Set Suite Variable    ${MEMBER_USER_ID}    ${mem_user}[id]

    ${content}=        Create Content Project    ${mgr_token}    title=Robot Automated Showcase EP01    platform=YouTube
    Should Be Equal As Strings    ${content}[status]    PLANNING
    Set Suite Variable    ${TEST_CONTENT_ID}    ${content}[_id]

    # Advance Content from PLANNING to IN_PROGRESS
    ${updated_content}=    Update Content Status    ${mgr_token}    ${content}[_id]    status=IN_PROGRESS
    Should Be Equal As Strings    ${updated_content}[content][status]    IN_PROGRESS

    ${task}=           Create Production Task    ${mgr_token}    title=Editing Video EP01    content_id=${content}[_id]    assigned_to=${mem_user}[id]    task_type=Editing
    Should Be Equal As Strings    ${task}[status]    TODO
    Set Suite Variable    ${TEST_TASK_ID}    ${task}[_id]

TC_WORKFLOW_02: Member Starts Task Moving To IN_PROGRESS
    [Documentation]    Member picks up assigned task and sets status to IN_PROGRESS.
    [Tags]             workflow    member    progress
    ${mem_token}    ${mem_user}=    Login User And Get Token    ${MEMBER_EMAIL}    ${DEFAULT_PASSWORD}
    ${task}=           Update Task Status    ${mem_token}    ${TEST_TASK_ID}    status=IN_PROGRESS
    Should Be Equal As Strings    ${task}[status]    IN_PROGRESS

TC_WORKFLOW_03: Member Submits Work Deliverable URL Moving Task And Content To REVIEW
    [Documentation]    Member finishes editing and attaches deliverable URL, submitting for review.
    [Tags]             workflow    member    submission
    ${mem_token}    ${mem_user}=    Login User And Get Token    ${MEMBER_EMAIL}    ${DEFAULT_PASSWORD}
    ${task}=           Submit Task Deliverable    ${mem_token}    ${TEST_TASK_ID}    submission_url=https://drive.google.com/robot-cut-v1    notes=First rough cut completed
    Should Be Equal As Strings    ${task}[status]    REVIEW
    Should Be Equal As Strings    ${task}[submissionUrl]    https://drive.google.com/robot-cut-v1

TC_WORKFLOW_04: Manager Reviews And Requests Revision With Notes
    [Documentation]    Manager inspects submission and sends back revision notes.
    [Tags]             workflow    manager    revision
    ${mgr_token}    ${mgr_user}=    Login User And Get Token    ${MANAGER_EMAIL}    ${DEFAULT_PASSWORD}
    ${result}=         Submit Content Review Decision    ${mgr_token}    ${TEST_CONTENT_ID}    decision=REVISION    notes=Please lower background music by 20%
    Should Be Equal As Strings    ${result}[content][status]    REVISION

TC_WORKFLOW_05: Member Submits Revision Reply With Notes And New URL
    [Documentation]    Member addresses feedback, explains changes in reply notes and resubmits.
    [Tags]             workflow    member    revision_reply
    ${mem_token}    ${mem_user}=    Login User And Get Token    ${MEMBER_EMAIL}    ${DEFAULT_PASSWORD}
    ${extra}=          Create Dictionary    replyNotes=Adjusted audio levels as requested    submissionUrl=https://drive.google.com/robot-cut-v2
    ${task}=           Update Task Status    ${mem_token}    ${TEST_TASK_ID}    status=REVIEW    extra_fields=${extra}
    Should Be Equal As Strings    ${task}[status]    REVIEW
    Should Be Equal As Strings    ${task}[replyNotes]    Adjusted audio levels as requested

TC_WORKFLOW_06: Manager Direct 1-Tap Approval Synchronizes Tasks To DONE
    [Documentation]    Manager approves the content, which automatically transitions tasks to DONE (100%).
    [Tags]             workflow    manager    approval
    ${mgr_token}    ${mgr_user}=    Login User And Get Token    ${MANAGER_EMAIL}    ${DEFAULT_PASSWORD}
    ${result}=         Submit Content Review Decision    ${mgr_token}    ${TEST_CONTENT_ID}    decision=APPROVED    notes=Approved for immediate release
    Should Be Equal As Strings    ${result}[content][status]    APPROVED

TC_WORKFLOW_07: Manager Publishes Approved Content
    [Documentation]    Manager publishes approved content with official broadcast URL.
    [Tags]             workflow    manager    publishing
    ${mgr_token}    ${mgr_user}=    Login User And Get Token    ${MANAGER_EMAIL}    ${DEFAULT_PASSWORD}
    ${result}=         Update Content Status    ${mgr_token}    ${TEST_CONTENT_ID}    status=PUBLISHED
    Should Be Equal As Strings    ${result}[content][status]    PUBLISHED

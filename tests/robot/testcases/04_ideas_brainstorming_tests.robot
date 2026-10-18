*** Settings ***
Documentation     Automated Acceptance Tests for Ideas & Brainstorming (UC-06 / TS_006)
Library           Collections
Resource          ../resources/variables.resource
Resource          ../resources/auth_keywords.resource
Suite Teardown    Cleanup Idea Test Artifacts

*** Variables ***
${NEW_IDEA_ID}    ${EMPTY}

*** Keywords ***
Cleanup Idea Test Artifacts
    [Documentation]    Removes temporary idea created during test execution.
    IF    $NEW_IDEA_ID != ""
        ${mgr_token}    ${mgr_user}=    Login User And Get Token    ${MANAGER_EMAIL}    ${DEFAULT_PASSWORD}
        ${headers}=     Create Auth Header    ${mgr_token}
        Run Keyword And Ignore Error    DELETE On Session    cms_session    /api/ideas/${NEW_IDEA_ID}    headers=${headers}
    END

*** Test Cases ***
TC_AUTO_011: [UC-06 / TS_006 Valid] Member Proposes Content Idea And Manager Approves On Idea Board
    [Documentation]    ตรวจสอบการเสนอแนวคิดคอนเทนต์ใหม่ แสดงบนบอร์ดระดมไอเดีย และผู้จัดการกดอนุมัติไอเดียสำเร็จ (HTTP 201 & 200)
    [Tags]             UC-06    TS_006    valid    ideas
    ${mem_token}    ${mem_user}=    Login User And Get Token    ${MEMBER_EMAIL}    ${DEFAULT_PASSWORD}
    ${mem_headers}=    Create Auth Header    ${mem_token}
    ${payload}=        Create Dictionary     title=Future of AI Video Tools 2026    description=Exploring revolutionary generative AI for creators    category=Technology
    ${create_resp}=    POST On Session       cms_session    /api/ideas    json=${payload}    headers=${mem_headers}    expected_status=201
    Should Be Equal As Strings               ${create_resp.json()}[idea][status]    DRAFT
    Should Be Equal As Strings               ${create_resp.json()}[idea][title]     Future of AI Video Tools 2026
    Set Suite Variable                       ${NEW_IDEA_ID}                         ${create_resp.json()}[idea][_id]

    ${mgr_token}    ${mgr_user}=    Login User And Get Token    ${MANAGER_EMAIL}    ${DEFAULT_PASSWORD}
    ${mgr_headers}=    Create Auth Header    ${mgr_token}
    ${list_resp}=      GET On Session        cms_session    /api/ideas    headers=${mgr_headers}    expected_status=200
    ${count}=          Get Length            ${list_resp.json()}
    Should Be True                           ${count} >= 1

    ${app_payload}=    Create Dictionary     status=APPROVED
    ${app_resp}=       PATCH On Session      cms_session    /api/ideas/${NEW_IDEA_ID}/status    json=${app_payload}    headers=${mgr_headers}    expected_status=200
    Should Be Equal As Strings               ${app_resp.json()}[idea][status]    APPROVED

TC_AUTO_012: [UC-06 / TS_006 Invalid] Reject Idea Proposal When Title Is Empty
    [Documentation]    ตรวจสอบการปฏิเสธเมื่อเสนอแนวคิดคอนเทนต์โดยไม่ระบุหัวข้อไอเดีย (HTTP 400 Bad Request)
    [Tags]             UC-06    TS_006    invalid    ideas
    ${mem_token}    ${mem_user}=    Login User And Get Token    ${MEMBER_EMAIL}    ${DEFAULT_PASSWORD}
    ${headers}=        Create Auth Header    ${mem_token}
    ${payload}=        Create Dictionary     title=${EMPTY}    description=Missing title test    category=General
    ${response}=       POST On Session       cms_session    /api/ideas    json=${payload}    headers=${headers}    expected_status=400
    Dictionary Should Contain Key            ${response.json()}    message

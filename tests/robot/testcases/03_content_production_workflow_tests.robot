*** Settings ***
Documentation     Automated E2E Production Lifecycle & Workflow Tests (UC-05, UC-09, UC-10, UC-11 / TS_005, TS_009, TS_010, TS_011)
Library           Collections
Resource          ../resources/variables.resource
Resource          ../resources/auth_keywords.resource
Resource          ../resources/workflow_keywords.resource
Suite Teardown    Cleanup Workflow Test Artifacts

*** Variables ***
${TEST_CONTENT_ID}       ${EMPTY}
${TEST_TASK_ID}          ${EMPTY}
${MEMBER_USER_ID}        ${EMPTY}

*** Keywords ***
Cleanup Workflow Test Artifacts
    [Documentation]    Deletes temporary content and task created during workflow suite execution.
    ${mgr_token}    ${mgr_user}=    Login User And Get Token    ${MANAGER_EMAIL}    ${DEFAULT_PASSWORD}
    ${headers}=     Create Auth Header    ${mgr_token}
    IF    $TEST_TASK_ID != ""
        Run Keyword And Ignore Error    DELETE On Session    cms_session    /api/tasks/${TEST_TASK_ID}    headers=${headers}
    END
    IF    $TEST_CONTENT_ID != ""
        Run Keyword And Ignore Error    DELETE On Session    cms_session    /api/contents/${TEST_CONTENT_ID}    headers=${headers}
    END

*** Test Cases ***
TC_AUTO_017: [UC-09 / TS_009 Valid] Manager Creates Content Pipeline And Assigns Sub-Task To Member
    [Documentation]    ตรวจสอบผู้จัดการสร้างชิ้นงานใหม่ ปรับสถานะเป็น IN_PROGRESS และมอบหมายงานย่อยให้สมาชิกสำเร็จ (HTTP 201)
    [Tags]             UC-09    TS_009    valid    workflow    creation
    ${mgr_token}    ${mgr_user}=    Login User And Get Token    ${MANAGER_EMAIL}    ${DEFAULT_PASSWORD}
    ${mem_token}    ${mem_user}=    Login User And Get Token    ${MEMBER_EMAIL}     ${DEFAULT_PASSWORD}
    Set Suite Variable    ${MEMBER_USER_ID}    ${mem_user}[id]

    ${content}=        Create Content Project    ${mgr_token}    title=Robot Automated Showcase EP01    platform=YouTube
    Should Be Equal As Strings    ${content}[status]    PLANNING
    Set Suite Variable    ${TEST_CONTENT_ID}    ${content}[_id]

    ${updated_content}=    Update Content Status    ${mgr_token}    ${content}[_id]    status=IN_PROGRESS
    Should Be Equal As Strings    ${updated_content}[content][status]    IN_PROGRESS

    ${task}=           Create Production Task    ${mgr_token}    title=Editing Video EP01    content_id=${content}[_id]    assigned_to=${mem_user}[id]    task_type=Editing
    Should Be Equal As Strings    ${task}[status]    TODO
    Set Suite Variable    ${TEST_TASK_ID}    ${task}[_id]

TC_AUTO_018: [UC-09 / TS_009 Invalid] Reject Content Creation When Title Is Empty
    [Documentation]    ตรวจสอบการแจ้งเตือนและปฏิเสธเมื่อผู้จัดการสร้างชิ้นงานโดยไม่ระบุชื่อชิ้นงาน (HTTP 400 Bad Request)
    [Tags]             UC-09    TS_009    invalid    workflow    creation
    ${mgr_token}    ${mgr_user}=    Login User And Get Token    ${MANAGER_EMAIL}    ${DEFAULT_PASSWORD}
    Ensure API Session
    ${headers}=        Create Auth Header    ${mgr_token}
    ${payload}=        Create Dictionary     title=${EMPTY}    platform=YouTube
    ${response}=       POST On Session       cms_session    /api/contents    json=${payload}    headers=${headers}    expected_status=400
    Dictionary Should Contain Key            ${response.json()}    message

TC_AUTO_010: [UC-05 / TS_005 Invalid] Reject Task Submission Without Deliverable URL
    [Documentation]    ตรวจสอบการปฏิเสธเมื่อสมาชิกเปลี่ยนสถานะงานเป็นส่งมอบ (REVIEW) โดยไม่แนบลิงก์ผลงาน (HTTP 400 Bad Request)
    [Tags]             UC-05    TS_005    invalid    workflow    submission
    ${mem_token}    ${mem_user}=    Login User And Get Token    ${MEMBER_EMAIL}    ${DEFAULT_PASSWORD}
    ${task}=           Update Task Status    ${mem_token}    ${TEST_TASK_ID}    status=IN_PROGRESS
    Should Be Equal As Strings    ${task}[status]    IN_PROGRESS

    Ensure API Session
    ${headers}=        Create Auth Header    ${mem_token}
    ${payload}=        Create Dictionary     status=REVIEW    submissionUrl=${EMPTY}
    ${response}=       PATCH On Session      cms_session    /api/tasks/${TEST_TASK_ID}/status    json=${payload}    headers=${headers}    expected_status=400
    Dictionary Should Contain Key            ${response.json()}    message

TC_AUTO_009: [UC-05 / TS_005 Valid] Member Starts Task And Submits Deliverable URL Moving To REVIEW
    [Documentation]    ตรวจสอบการส่งมอบงานย่อยพร้อมแนบลิงก์ผลงาน เปลี่ยนสถานะงานและคอนเทนต์เป็น REVIEW สำเร็จ (HTTP 200)
    [Tags]             UC-05    TS_005    valid    workflow    submission
    ${mem_token}    ${mem_user}=    Login User And Get Token    ${MEMBER_EMAIL}    ${DEFAULT_PASSWORD}
    ${task}=           Submit Task Deliverable    ${mem_token}    ${TEST_TASK_ID}    submission_url=https://drive.google.com/robot-cut-v1    notes=First rough cut completed
    Should Be Equal As Strings    ${task}[status]           REVIEW
    Should Be Equal As Strings    ${task}[submissionUrl]    https://drive.google.com/robot-cut-v1

TC_AUTO_020: [UC-10 / TS_010 Invalid] Reject Revision Decision Without Revision Notes
    [Documentation]    ตรวจสอบการบังคับระบุเหตุผลเมื่อผู้จัดการกดส่งกลับแก้ไข (REVISION) โดยเว้นหมายเหตุว่าง (HTTP 400 Bad Request)
    [Tags]             UC-10    TS_010    invalid    workflow    review
    ${mgr_token}    ${mgr_user}=    Login User And Get Token    ${MANAGER_EMAIL}    ${DEFAULT_PASSWORD}
    Ensure API Session
    ${headers}=        Create Auth Header    ${mgr_token}
    ${payload}=        Create Dictionary     decision=REVISION    notes=${EMPTY}
    ${response}=       POST On Session       cms_session    /api/contents/${TEST_CONTENT_ID}/review    json=${payload}    headers=${headers}    expected_status=400
    Dictionary Should Contain Key            ${response.json()}    message

TC_AUTO_019: [UC-10 / TS_010 Valid] Manager Requests Revision, Member Resubmits, And Manager Approves 1-Tap
    [Documentation]    ตรวจสอบวงจรตรวจรับงาน สั่งแก้ไขพร้อมหมายเหตุ ส่งงานรอบแก้พร้อมข้อความตอบกลับ และอนุมัติงาน (APPROVED) สำเร็จ (HTTP 200)
    [Tags]             UC-10    TS_010    valid    workflow    review    approval
    ${mgr_token}    ${mgr_user}=    Login User And Get Token    ${MANAGER_EMAIL}    ${DEFAULT_PASSWORD}
    ${rev_result}=     Submit Content Review Decision    ${mgr_token}    ${TEST_CONTENT_ID}    decision=REVISION    notes=Please lower background music by 20%
    Should Be Equal As Strings    ${rev_result}[content][status]    REVISION

    ${mem_token}    ${mem_user}=    Login User And Get Token    ${MEMBER_EMAIL}    ${DEFAULT_PASSWORD}
    ${extra}=          Create Dictionary    replyNotes=Adjusted audio levels as requested    submissionUrl=https://drive.google.com/robot-cut-v2
    ${task}=           Update Task Status    ${mem_token}    ${TEST_TASK_ID}    status=REVIEW    extra_fields=${extra}
    Should Be Equal As Strings    ${task}[status]        REVIEW
    Should Be Equal As Strings    ${task}[replyNotes]    Adjusted audio levels as requested

    ${app_result}=     Submit Content Review Decision    ${mgr_token}    ${TEST_CONTENT_ID}    decision=APPROVED    notes=Approved for immediate release
    Should Be Equal As Strings    ${app_result}[content][status]    APPROVED

TC_AUTO_022: [UC-11 / TS_011 Invalid] Block Unauthorized Or Unapproved Content Publishing
    [Documentation]    ตรวจสอบการบล็อกไม่ให้สมาชิกทั่วไป (MEMBER) หรือชิ้นงานที่ยังไม่ผ่านการอนุมัติเปลี่ยนสถานะเป็น PUBLISHED (HTTP 403 Forbidden)
    [Tags]             UC-11    TS_011    invalid    workflow    publishing
    ${mem_token}    ${mem_user}=    Login User And Get Token    ${MEMBER_EMAIL}    ${DEFAULT_PASSWORD}
    Ensure API Session
    ${headers}=        Create Auth Header    ${mem_token}
    ${payload}=        Create Dictionary     status=PUBLISHED
    ${response}=       PATCH On Session      cms_session    /api/contents/${TEST_CONTENT_ID}/status    json=${payload}    headers=${headers}    expected_status=403
    Dictionary Should Contain Key            ${response.json()}    message

TC_AUTO_021: [UC-11 / TS_011 Valid] Manager Publishes Approved Content To Public Channel
    [Documentation]    ตรวจสอบผู้จัดการเปลี่ยนสถานะชิ้นงานที่ผ่านการอนุมัติแล้วเป็นเผยแพร่ (PUBLISHED) สำเร็จ (HTTP 200)
    [Tags]             UC-11    TS_011    valid    workflow    publishing
    ${mgr_token}    ${mgr_user}=    Login User And Get Token    ${MANAGER_EMAIL}    ${DEFAULT_PASSWORD}
    ${result}=         Update Content Status    ${mgr_token}    ${TEST_CONTENT_ID}    status=PUBLISHED
    Should Be Equal As Strings    ${result}[content][status]    PUBLISHED

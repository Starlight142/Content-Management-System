*** Settings ***
Documentation     Automated Acceptance Tests for Authentication & Personal Profile (UC-01, UC-02, UC-03 / TS_001 - TS_003)
Library           Collections
Resource          ../resources/variables.resource
Resource          ../resources/auth_keywords.resource
Resource          ../resources/admin_keywords.resource

*** Variables ***
${CREATED_USER_ID}    ${EMPTY}

*** Test Cases ***
TC_AUTO_001: [UC-01 / TS_001 Valid] Register New User With Position And Team Code
    [Documentation]    ตรวจสอบการลงทะเบียนผู้ใช้ใหม่พร้อมระบุตำแหน่งงานและรหัสเข้าร่วมทีม TEAM-A สำเร็จ (HTTP 201)
    [Tags]             UC-01    TS_001    valid    auth    register
    Ensure API Session
    ${unique_int}=     Evaluate    random.randint(10000, 99999)    random
    ${payload}=        Create Dictionary
    ...                firstName=สมชาย
    ...                lastName=ทดสอบระบบ
    ...                position=Video Editor
    ...                teamCode=${TEAM_CODE_A}
    ...                email=robot_${unique_int}@studio.com
    ...                password=${DEFAULT_PASSWORD}
    ${response}=       POST On Session    cms_session    /api/auth/register    json=${payload}    expected_status=201
    Should Contain     ${response.json()}[message]    registered
    Should Be Equal As Strings    ${response.json()}[user][role]        MEMBER
    Should Be Equal As Strings    ${response.json()}[user][position]    Other
    Should Be Equal As Strings    ${response.json()}[user][teamCode]    ${TEAM_CODE_A}
    Set Suite Variable            ${CREATED_USER_ID}                    ${response.json()}[user][id]

    # Cleanup temporary registered user immediately via Admin API
    ${admin_token}    ${admin_user}=    Login User And Get Token    ${ADMIN_EMAIL}    ${DEFAULT_PASSWORD}
    ${headers}=       Create Auth Header    ${admin_token}
    DELETE On Session    cms_session    /api/users/${CREATED_USER_ID}    headers=${headers}    expected_status=200

TC_AUTO_002: [UC-01 / TS_001 Invalid] Reject Registration With Missing Fields Or Duplicate Email
    [Documentation]    ตรวจสอบการปฏิเสธการลงทะเบียนเมื่อใช้อีเมลซ้ำกับบัญชีที่มีอยู่ในระบบหรือข้อมูลไม่ครบถ้วน (HTTP 400)
    [Tags]             UC-01    TS_001    invalid    auth    register
    Ensure API Session
    ${dup_payload}=    Create Dictionary
    ...                firstName=สมชาย
    ...                lastName=ซ้ำระบบ
    ...                email=${MEMBER_EMAIL}
    ...                password=${DEFAULT_PASSWORD}
    ${response}=       POST On Session    cms_session    /api/auth/register    json=${dup_payload}    expected_status=400
    Dictionary Should Contain Key    ${response.json()}    message

TC_AUTO_003: [UC-02 / TS_002 Valid] Successful Login Across All 3 Roles (Admin, Manager, Member)
    [Documentation]    ตรวจสอบการยืนยันตัวตนเข้าสู่ระบบสำเร็จครบทั้ง 3 บทบาทหลักและได้รับ JWT Token ตรงตามสิทธิ์ (HTTP 200)
    [Tags]             UC-02    TS_002    valid    auth    login
    ${admin_token}    ${admin_user}=      Login User And Get Token    ${ADMIN_EMAIL}      ${DEFAULT_PASSWORD}
    Should Not Be Empty                   ${admin_token}
    Should Be Equal As Strings            ${admin_user}[role]         ADMIN

    ${mgr_token}      ${mgr_user}=        Login User And Get Token    ${MANAGER_EMAIL}    ${DEFAULT_PASSWORD}
    Should Not Be Empty                   ${mgr_token}
    Should Be Equal As Strings            ${mgr_user}[role]           MANAGER

    ${mem_token}      ${mem_user}=        Login User And Get Token    ${MEMBER_EMAIL}     ${DEFAULT_PASSWORD}
    Should Not Be Empty                   ${mem_token}
    Should Be Equal As Strings            ${mem_user}[role]           MEMBER

TC_AUTO_004: [UC-02 / TS_002 Invalid] Reject Login With Incorrect Password
    [Documentation]    ตรวจสอบการปฏิเสธการเข้าสู่ระบบเมื่อระบุรหัสผ่านไม่ถูกต้อง (HTTP 401 Unauthorized)
    [Tags]             UC-02    TS_002    invalid    auth    login
    ${response}=       Attempt Login Expect Failure    ${MANAGER_EMAIL}    000000_wrong    expected_status=401
    Should Contain     ${response.json()}[message]     Invalid credentials

TC_AUTO_005: [UC-03 / TS_003 Valid] Verify And Update Personal Profile Information
    [Documentation]    ตรวจสอบการเรียกดูโปรไฟล์ผ่าน Bearer JWT และการแก้ไขชื่อโปรไฟล์สำเร็จ (HTTP 200)
    [Tags]             UC-03    TS_003    valid    profile
    ${token}    ${user}=    Login User And Get Token    ${MANAGER_EMAIL}    ${DEFAULT_PASSWORD}
    ${headers}=        Create Auth Header    ${token}
    ${me_resp}=        GET On Session        cms_session    /api/auth/me    headers=${headers}    expected_status=200
    Should Contain     ${me_resp.json()}[message]    protected route

    ${upd_payload}=    Create Dictionary     firstName=สมศรี (หัวหน้าทีม)    lastName=จัดการทีม
    ${upd_resp}=       PATCH On Session      cms_session    /api/users/profile    json=${upd_payload}    headers=${headers}    expected_status=200
    Should Be Equal As Strings               ${upd_resp.json()}[user][firstName]    สมศรี (หัวหน้าทีม)

    # Restore original firstName
    ${restore_payload}=    Create Dictionary    firstName=สมศรี    lastName=จัดการทีม
    PATCH On Session       cms_session    /api/users/profile    json=${restore_payload}    headers=${headers}    expected_status=200

TC_AUTO_006: [UC-03 / TS_003 Invalid] Reject Profile Update With Empty First Name
    [Documentation]    ตรวจสอบการปฏิเสธเมื่อพยายามบันทึกชื่อโปรไฟล์เป็นค่าว่าง (HTTP 400 Bad Request)
    [Tags]             UC-03    TS_003    invalid    profile
    ${token}    ${user}=    Login User And Get Token    ${MANAGER_EMAIL}    ${DEFAULT_PASSWORD}
    ${headers}=        Create Auth Header    ${token}
    ${empty_payload}=  Create Dictionary     firstName=${EMPTY}
    ${response}=       PATCH On Session      cms_session    /api/users/profile    json=${empty_payload}    headers=${headers}    expected_status=400
    Dictionary Should Contain Key            ${response.json()}    message

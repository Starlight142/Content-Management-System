*** Settings ***
Library         RequestsLibrary
Resource        variables.resource
Resource        auth_keywords.resource

*** Keywords ***
Create Content Project
    [Documentation]    Creates a new Content Pipeline record.
    [Arguments]        ${token}    ${title}    ${platform}=YouTube    ${targetAudience}=General Tech
    Ensure API Session
    ${headers}=        Create Auth Header    ${token}
    ${payload}=        Create Dictionary     title=${title}    platform=${platform}    targetAudience=${targetAudience}
    ${response}=       POST On Session       cms_session    /api/contents    json=${payload}    headers=${headers}    expected_status=201
    RETURN             ${response.json()}[content]

Create Production Task
    [Documentation]    Assigns a new Task to a Member under a Content project.
    [Arguments]        ${token}    ${title}    ${content_id}    ${assigned_to}    ${task_type}=Editing
    Ensure API Session
    ${headers}=        Create Auth Header    ${token}
    ${payload}=        Create Dictionary     title=${title}    contentId=${content_id}    assignedTo=${assigned_to}    taskType=${task_type}
    ${response}=       POST On Session       cms_session    /api/tasks    json=${payload}    headers=${headers}    expected_status=201
    RETURN             ${response.json()}[task]

Update Task Status
    [Documentation]    Updates task status and progress attributes.
    [Arguments]        ${token}    ${task_id}    ${status}    ${extra_fields}=${EMPTY}
    Ensure API Session
    ${headers}=        Create Auth Header    ${token}
    ${payload}=        Create Dictionary     status=${status}
    IF    $extra_fields != ""
        FOR    ${key}    IN    @{extra_fields.keys()}
            Set To Dictionary    ${payload}    ${key}=${extra_fields}[${key}]
        END
    END
    ${response}=       PATCH On Session      cms_session    /api/tasks/${task_id}/status    json=${payload}    headers=${headers}    expected_status=200
    RETURN             ${response.json()}[task]

Submit Task Deliverable
    [Documentation]    Member submits work deliverable URL to move task to REVIEW.
    [Arguments]        ${token}    ${task_id}    ${submission_url}    ${notes}=First Cut Submission
    Ensure API Session
    ${headers}=        Create Auth Header    ${token}
    ${payload}=        Create Dictionary     status=REVIEW    submissionUrl=${submission_url}    notes=${notes}
    ${response}=       PATCH On Session      cms_session    /api/tasks/${task_id}/status    json=${payload}    headers=${headers}    expected_status=200
    RETURN             ${response.json()}[task]

Submit Content Review Decision
    [Documentation]    Manager reviews content to either REVISION or APPROVED.
    [Arguments]        ${token}    ${content_id}    ${decision}    ${notes}=Review note
    Ensure API Session
    ${headers}=        Create Auth Header    ${token}
    ${payload}=        Create Dictionary     decision=${decision}    notes=${notes}
    ${response}=       POST On Session       cms_session    /api/contents/${content_id}/review    json=${payload}    headers=${headers}    expected_status=200
    RETURN             ${response.json()}

Update Content Status
    [Documentation]    Directly updates content status along permitted transitions.
    [Arguments]        ${token}    ${content_id}    ${status}
    Ensure API Session
    ${headers}=        Create Auth Header    ${token}
    ${payload}=        Create Dictionary     status=${status}
    ${response}=       PATCH On Session      cms_session    /api/contents/${content_id}/status    json=${payload}    headers=${headers}    expected_status=200
    RETURN             ${response.json()}

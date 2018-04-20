// ----------------------------------------
//          Action Types
// ----------------------------------------
const INVALID_FILE_TYPE_DROPPED = 'INVALID_FILE_TYPE_DROPPED'
const DUPLICATE_FILE_DROPPED = 'DUPLICATE_FILE_DROPPED'
const DROPZONE_FILE_REMOVED = 'DROPZONE_FILE_REMOVED'

const CASE_CREATED_SUCCESS = 'CASE_CREATED_SUCCESS'
const ATTACHMENT_UPLOAD_SUCCEEDED = 'ATTACHMENT_UPLOAD_SUCCEEDED'
const ATTACHMENT_UPLOAD_FAILED = 'ATTACHMENT_UPLOAD_FAILED'
const INCIDENT_DETAILS_UPDATE_SUCCEEDED = 'INCIDENT_DETAILS_UPDATE_SUCCEEDED'
const INCIDENT_DETAILS_UPDATE_FAILED = 'INCIDENT_DETAILS_UPDATE_FAILED'
const INCIDENT_LOCATION_AUTOSUGGEST_VALUE_UPDATED = 'INCIDENT_LOCATION_AUTOSUGGEST_VALUE_UPDATED'
const GET_RECENT_ACTIVITY_SUCCEEDED = 'GET_RECENT_ACTIVITY_SUCCEEDED'

const CIVILIAN_DIALOG_OPENED = 'CIVILIAN_DIALOG_OPENED'
const CIVILIAN_CREATION_SUCCEEDED = 'CIVILIAN_CREATION_SUCCEEDED'
const CIVILIAN_CREATION_FAILED = 'CIVILIAN_CREATION_FAILED'
const CIVILIAN_ADDRESS_AUTOSUGGEST_UPDATED = 'CIVILIAN_ADDRESS_AUTOSUGGEST_UPDATED'

const DOWNLOAD_FAILED = "DOWNLOAD_FAILED"

// ----------------------------------------
//          Attachment Errors
// ----------------------------------------
const FILE_TYPE_INVALID = 'File type invalid'
const DUPLICATE_FILE_NAME = 'Duplicate file name'
const UPLOAD_CANCELED = "Upload canceled."

// ----------------------------------------
//          Attachment Removal
// ----------------------------------------

const REMOVE_ATTACHMENT_SUCCESS = 'REMOVE_ATTACHMENT_SUCCESS'
const REMOVE_ATTACHMENT_FAILED = 'REMOVE_ATTACHMENT_FAILED'


// ----------------------------------------
//          Attachment Removal
// ----------------------------------------

const SNACKBAR_ERROR = 'SNACKBAR_ERROR';

// ----------------------------------------
//          Redux Forms
// ----------------------------------------

const CIVILIAN_FORM_NAME = 'Civilian form'

// ----------------------------------------
//          Auth0 Scopes / Permissions
// ----------------------------------------


const EXPORT_AUDIT_LOG = "export:audit_log"
const OPENID = "openid"
const PROFILE = "profile"

// ----------------------------------------
//          Officers
// ----------------------------------------

const SEARCH_OFFICERS_SUCCESS = 'SEARCH_OFFICERS_SUCCESS';
const SEARCH_OFFICERS_INITIATED = 'SEARCH_OFFICERS_INITIATED';
const SEARCH_OFFICERS_FAILED = 'SEARCH_OFFICERS_FAILED';
const SEARCH_OFFICERS_CLEARED = 'SEARCH_OFFICERS_CLEARED';
const ADD_OFFICER_TO_CASE_SUCCEEDED = "ADD_OFFICER_TO_CASE_SUCCEEDED";
const ADD_OFFICER_TO_CASE_FAILED = "ADD_OFFICER_TO_CASE_FAILED";

// ----------------------------------------
//          Other
// ----------------------------------------

const TIMEZONE = 'America/Chicago'

module.exports = {
    INVALID_FILE_TYPE_DROPPED,
    DUPLICATE_FILE_DROPPED,
    DROPZONE_FILE_REMOVED,
    CASE_CREATED_SUCCESS,
    CIVILIAN_DIALOG_OPENED,
    CIVILIAN_CREATION_SUCCEEDED,
    CIVILIAN_CREATION_FAILED,
    CIVILIAN_ADDRESS_AUTOSUGGEST_UPDATED,
    DOWNLOAD_FAILED,
    ATTACHMENT_UPLOAD_SUCCEEDED,
    ATTACHMENT_UPLOAD_FAILED,
    INCIDENT_DETAILS_UPDATE_SUCCEEDED,
    INCIDENT_DETAILS_UPDATE_FAILED,
    INCIDENT_LOCATION_AUTOSUGGEST_VALUE_UPDATED,
    GET_RECENT_ACTIVITY_SUCCEEDED,
    FILE_TYPE_INVALID,
    DUPLICATE_FILE_NAME,
    UPLOAD_CANCELED,
    REMOVE_ATTACHMENT_FAILED,
    REMOVE_ATTACHMENT_SUCCESS,
    SNACKBAR_ERROR,
    CIVILIAN_FORM_NAME,
    EXPORT_AUDIT_LOG,
    SEARCH_OFFICERS_SUCCESS,
    SEARCH_OFFICERS_INITIATED,
    SEARCH_OFFICERS_FAILED,
    SEARCH_OFFICERS_CLEARED,
    ADD_OFFICER_TO_CASE_SUCCEEDED,
    ADD_OFFICER_TO_CASE_FAILED,
    OPENID,
    PROFILE,
    TIMEZONE
}
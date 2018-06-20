const LOCAL_DEV_PORT = 3000;
const PORT = 1234;
// ----------------------------------------
//          Action Types
// ----------------------------------------
const INVALID_FILE_TYPE_DROPPED = "INVALID_FILE_TYPE_DROPPED";
const DUPLICATE_FILE_DROPPED = "DUPLICATE_FILE_DROPPED";
const DROPZONE_FILE_REMOVED = "DROPZONE_FILE_REMOVED";

const CASE_CREATED_SUCCESS = "CASE_CREATED_SUCCESS";
const ATTACHMENT_UPLOAD_SUCCEEDED = "ATTACHMENT_UPLOAD_SUCCEEDED";
const ATTACHMENT_UPLOAD_FAILED = "ATTACHMENT_UPLOAD_FAILED";
const INCIDENT_DETAILS_UPDATE_SUCCEEDED = "INCIDENT_DETAILS_UPDATE_SUCCEEDED";
const INCIDENT_DETAILS_UPDATE_FAILED = "INCIDENT_DETAILS_UPDATE_FAILED";
const INCIDENT_LOCATION_AUTOSUGGEST_VALUE_UPDATED =
  "INCIDENT_LOCATION_AUTOSUGGEST_VALUE_UPDATED";
const GET_RECENT_ACTIVITY_SUCCEEDED = "GET_RECENT_ACTIVITY_SUCCEEDED";

const ADD_CASE_NOTE_FAILED = "ADD_CASE_NOTE_FAILED";
const ADD_CASE_NOTE_SUCCEEDED = "ADD_CASE_NOTE_SUCCEEDED";
const EDIT_CASE_NOTE_FAILED = "EDIT_CASE_NOTE_FAILED";
const EDIT_CASE_NOTE_SUCCEEDED = "EDIT_CASE_NOTE_SUCCEEDED";
const REMOVE_CASE_NOTE_SUCCEEDED = "REMOVE_CASE_NOTE_SUCCEEDED";
const REMOVE_CASE_NOTE_FAILED = "REMOVE_CASE_NOTE_FAILED";
const CASE_NOTE_DIALOG_OPENED = "CASE_NOTE_DIALOG_OPENED";
const CASE_NOTE_DIALOG_CLOSED = "CASE_NOTE_DIALOG_CLOSED";
const REMOVE_CASE_NOTE_DIALOG_OPENED = "REMOVE_CASE_NOTE_DIALOG_OPENED";
const REMOVE_CASE_NOTE_DIALOG_CLOSED = "REMOVE_CASE_NOTE_DIALOG_CLOSED";
const CIVILIAN_DIALOG_OPENED = "CIVILIAN_DIALOG_OPENED";
const CIVILIAN_CREATION_SUCCEEDED = "CIVILIAN_CREATION_SUCCEEDED";
const CIVILIAN_CREATION_FAILED = "CIVILIAN_CREATION_FAILED";
const CIVILIAN_ADDRESS_AUTOSUGGEST_UPDATED =
  "CIVILIAN_ADDRESS_AUTOSUGGEST_UPDATED";

const CREATE_CASE_DIALOG_OPENED = "CREATE_CASE_DIALOG_OPENED";
const CREATE_CASE_DIALOG_CLOSED = "CREATE_CASE_DIALOG_CLOSED";
const CASE_STATUS_UPDATE_DIALOG_OPENED = "CASE_STATUS_UPDATE_DIALOG_OPENED";
const CASE_STATUS_UPDATE_DIALOG_CLOSED = "CASE_STATUS_UPDATE_DIALOG_CLOSED";
const REMOVE_PERSON_DIALOG_OPENED = "REMOVE_PERSON_DIALOG_OPENED";
const REMOVE_PERSON_DIALOG_CLOSED = "REMOVE_PERSON_DIALOG_CLOSED";
const REMOVE_PERSON_FAILED = "REMOVE_PERSON_FAILED";
const REMOVE_PERSON_SUCCEEDED = "REMOVE_PERSON_SUCCEEDED";

const DOWNLOAD_FAILED = "DOWNLOAD_FAILED";

const GET_ALLEGATIONS_SUCCEEDED = "GET_ALLEGATIONS_SUCCEEDED";
const GET_ALLEGATIONS_FAILED = "GET_ALLEGATIONS_FAILED";
const ADD_OFFICER_ALLEGATION_SUCCEEDED = "ADD_OFFICER_ALLEGATION_SUCCEEDED";

// ----------------------------------------
//          Attachment Errors
// ----------------------------------------
const FILE_TYPE_INVALID = "File type invalid";
const DUPLICATE_FILE_NAME = "Duplicate file name";
const UPLOAD_CANCELED = "Upload canceled.";

// ----------------------------------------
//          Attachment Removal
// ----------------------------------------

const REMOVE_ATTACHMENT_SUCCESS = "REMOVE_ATTACHMENT_SUCCESS";
const REMOVE_ATTACHMENT_FAILED = "REMOVE_ATTACHMENT_FAILED";

// ----------------------------------------
//          Snackbar Actions
// ----------------------------------------

const SNACKBAR_ERROR = "SNACKBAR_ERROR";
const SNACKBAR_SUCCESS = "SNACKBAR_SUCCESS";

// ----------------------------------------
//          Redux Forms
// ----------------------------------------

const CIVILIAN_FORM_NAME = "Civilian form";
const ALLEGATION_SEARCH_FORM_NAME = "AllegationSearchForm";

// ----------------------------------------
//          Auth0 Scopes / Permissions
// ----------------------------------------

const EXPORT_AUDIT_LOG = "export:audit_log";
const OPENID = "openid";
const PROFILE = "profile";

// ----------------------------------------
//          Shared Search
// ----------------------------------------

const SEARCH_INITIATED = "SEARCH_INITIATED";
const SEARCH_SUCCESS = "SEARCH_SUCCESS";
const SEARCH_FAILED = "SEARCH_FAILED";
const SEARCH_CLEARED = "SEARCH_CLEARED";

// ----------------------------------------
//          Officers
// ----------------------------------------

const ADD_OFFICER_TO_CASE_SUCCEEDED = "ADD_OFFICER_TO_CASE_SUCCEEDED";
const ADD_OFFICER_TO_CASE_FAILED = "ADD_OFFICER_TO_CASE_FAILED";
const OFFICER_SELECTED = "OFFICER_SELECTED";
const CASE_OFFICER_SELECTED = "CASE_OFFICER_SELECTED";
const UNKNOWN_OFFICER_SELECTED = "UNKNOWN_OFFICER_SELECTED";
const CLEAR_SELECTED_OFFICER = "CLEAR_SELECTED_OFFICER";
const EDIT_CASE_OFFICER_SUCCEEDED = "EDIT_CASE_OFFICER_SUCCEEDED";
const EDIT_CASE_OFFICER_FAILED = "EDIT_CASE_OFFICER_FAILED";

// ----------------------------------------
//          Case History Actions
// ----------------------------------------

const GET_CASE_HISTORY_SUCCESS = "GET_CASE_HISTORY_SUCCESS";

// ----------------------------------------
//          Case Status Actions
// ----------------------------------------

const UPDATE_CASE_STATUS_SUCCESS = "UPDATE_CASE_STATUS_SUCCESS";

// ----------------------------------------
//          Other
// ----------------------------------------

const TIMEZONE = "America/Chicago";

// ----------------------------------------
//          Action data (Data access) actions
// ----------------------------------------
const CASE_VIEWED = "CASE_VIEWED";

// ----------------------------------------
//          Audit data change actions
// ----------------------------------------
const DATA_UPDATED = "updated";
const DATA_CREATED = "created";
const DATA_DELETED = "deleted";

// ----------------------------------------
//          Role on Case Options
// ----------------------------------------
const ACCUSED = "Accused";
const WITNESS = "Witness";
const COMPLAINANT = "Complainant";

// ----------------------------------------
//          Case Status Map
// ----------------------------------------
const CASE_STATUS = {
  INITIAL: "Initial",
  ACTIVE: "Active",
  READY_FOR_REVIEW: "Ready for Review",
  FORWARDED_TO_AGENCY: "Forwarded to Agency",
  CLOSED: "Closed"
};

const CASE_STATUS_MAP = {
  [CASE_STATUS.INITIAL]: 0,
  [CASE_STATUS.ACTIVE]: 1,
  [CASE_STATUS.READY_FOR_REVIEW]: 2,
  [CASE_STATUS.FORWARDED_TO_AGENCY]: 3,
  [CASE_STATUS.CLOSED]: 4
};

// ----------------------------------------
//          User
// ----------------------------------------

const USER_ROLES = {
  DEPUTY_POLICE_MONITOR: "Deputy-Police-Monitor",
  COMPLAINT_INTAKE_SPECIALIST: "Complaint-Intake-Specialist"
}

module.exports = {
  LOCAL_DEV_PORT,
  PORT,
  INVALID_FILE_TYPE_DROPPED,
  DUPLICATE_FILE_DROPPED,
  DROPZONE_FILE_REMOVED,
  CASE_CREATED_SUCCESS,
  ADD_CASE_NOTE_FAILED,
  ADD_CASE_NOTE_SUCCEEDED,
  EDIT_CASE_NOTE_FAILED,
  EDIT_CASE_NOTE_SUCCEEDED,
  REMOVE_CASE_NOTE_SUCCEEDED,
  REMOVE_CASE_NOTE_FAILED,
  CASE_NOTE_DIALOG_OPENED,
  CASE_NOTE_DIALOG_CLOSED,
  REMOVE_CASE_NOTE_DIALOG_OPENED,
  REMOVE_CASE_NOTE_DIALOG_CLOSED,
  CREATE_CASE_DIALOG_OPENED,
  CREATE_CASE_DIALOG_CLOSED,
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
  SNACKBAR_SUCCESS,
  CIVILIAN_FORM_NAME,
  ALLEGATION_SEARCH_FORM_NAME,
  EXPORT_AUDIT_LOG,
  SEARCH_SUCCESS,
  SEARCH_INITIATED,
  SEARCH_FAILED,
  SEARCH_CLEARED,
  ADD_OFFICER_TO_CASE_SUCCEEDED,
  ADD_OFFICER_TO_CASE_FAILED,
  OFFICER_SELECTED,
  CASE_OFFICER_SELECTED,
  UNKNOWN_OFFICER_SELECTED,
  CLEAR_SELECTED_OFFICER,
  EDIT_CASE_OFFICER_SUCCEEDED,
  EDIT_CASE_OFFICER_FAILED,
  GET_CASE_HISTORY_SUCCESS,
  UPDATE_CASE_STATUS_SUCCESS,
  CASE_STATUS_UPDATE_DIALOG_OPENED,
  CASE_STATUS_UPDATE_DIALOG_CLOSED,
  OPENID,
  PROFILE,
  TIMEZONE,
  CASE_VIEWED,
  DATA_UPDATED,
  DATA_CREATED,
  DATA_DELETED,
  REMOVE_PERSON_DIALOG_OPENED,
  REMOVE_PERSON_DIALOG_CLOSED,
  REMOVE_PERSON_FAILED,
  REMOVE_PERSON_SUCCEEDED,
  GET_ALLEGATIONS_SUCCEEDED,
  GET_ALLEGATIONS_FAILED,
  ADD_OFFICER_ALLEGATION_SUCCEEDED,
  ACCUSED,
  WITNESS,
  COMPLAINANT,
  USER_ROLES,
  CASE_STATUS,
  CASE_STATUS_MAP
};

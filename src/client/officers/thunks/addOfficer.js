import { push } from "connected-react-router";
import {
  addOfficerToCaseFailure,
  addOfficerToCaseSuccess
} from "../../actionCreators/officersActionCreators";
import { snackbarSuccess } from "../../actionCreators/snackBarActionCreators";
import axios from "axios";

const addOfficer = (caseId, officerId, values) => async dispatch => {
  const payload = { officerId, ...values };

  try {
    const response = await axios.post(
      `api/cases/${caseId}/cases-officers`,
      JSON.stringify(payload)
    );
    dispatch(addOfficerToCaseSuccess(response.data));
    dispatch(snackbarSuccess(`Officer was successfully added`));
    dispatch(push(`/cases/${caseId}`));
  } catch (e) {
    dispatch(addOfficerToCaseFailure());
  }
};
export default addOfficer;

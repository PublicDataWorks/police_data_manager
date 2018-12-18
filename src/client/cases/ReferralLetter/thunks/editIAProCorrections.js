import { push } from "connected-react-router";
import config from "../../../config/config";
import axios from "axios/index";
import {
  snackbarError,
  snackbarSuccess
} from "../../../actionCreators/snackBarActionCreators";

const editIAProCorrections = (
  caseId,
  iaProCorrectionValues,
  successRedirectRoute
) => async dispatch => {
  try {
    const hostname = config[process.env.NODE_ENV].hostname;
    await axios.put(
      `${hostname}/api/cases/${caseId}/referral-letter/iapro-corrections`,
        iaProCorrectionValues
    );
    dispatch(snackbarSuccess("IAPro corrections were successfully updated"));
    return dispatch(push(successRedirectRoute));
  } catch (error) {
    if (
      error.response &&
      error.response.data.message === "Invalid case status"
    ) {
      return dispatch(push(`/cases/${caseId}`));
    }
    dispatch(
      snackbarError(
        "Something went wrong and the IAPro corrections were not updated. Please try again."
      )
    );
  }
};

export default editIAProCorrections;

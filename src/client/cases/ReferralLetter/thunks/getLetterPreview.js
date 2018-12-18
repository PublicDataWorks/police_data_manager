import { push } from "connected-react-router";
import axios from "axios/index";
import { getLetterPreviewSuccess } from "../../../actionCreators/letterActionCreators";
import config from "../../../config/config";
import { snackbarError } from "../../../actionCreators/snackBarActionCreators";
import { getCaseDetailsSuccess } from "../../../actionCreators/casesActionCreators";

const getLetterPreview = caseId => async dispatch => {
  try {
    const hostname = config[process.env.NODE_ENV].hostname;
    const response = await axios.get(
      `${hostname}/api/cases/${caseId}/referral-letter/preview`
    );
    dispatch(getCaseDetailsSuccess(response.data.caseDetails));
    return dispatch(
      getLetterPreviewSuccess(
        response.data.letterHtml,
        response.data.addresses,
        response.data.letterType,
        response.data.lastEdited,
        response.data.finalFilename,
        response.data.draftFilename
      )
    );
  } catch (error) {
    if (
      error.response &&
      error.response.data.message === "Invalid case status"
    ) {
      return dispatch(push(`/cases/${caseId}`));
    }
    dispatch(
      snackbarError(
        "Something went wrong and the letter preview was not loaded. Please try again."
      )
    );
  }
};

export default getLetterPreview;

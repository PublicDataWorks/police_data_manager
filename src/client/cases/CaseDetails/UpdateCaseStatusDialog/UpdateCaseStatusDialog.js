import React from "react";
import {
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  Typography
} from "@material-ui/core";
import {
  PrimaryButton,
  SecondaryButton
} from "../../../shared/components/StyledButtons";
import { connect } from "react-redux";
import setCaseStatus from "../../thunks/setCaseStatus";
import { closeCaseStatusUpdateDialog } from "../../../actionCreators/casesActionCreators";
import { CASE_STATUS } from "../../../../sharedUtilities/constants";
import history from "../../../history";

const STATUS_DESCRIPTION = {
  [CASE_STATUS.READY_FOR_REVIEW]:
    "This status signifies, to the Deputy Police Monitor, that all available information has been entered.",
  [CASE_STATUS.FORWARDED_TO_AGENCY]:
    "This status signifies that the case has been sent to the investigation agency.",
  [CASE_STATUS.CLOSED]:
    "This status signifies that an outcome has been reached and this case is available for public records."
  // [CASE_STATUS.CLOSED]: "Marking this case as closed will signify that an outcome has been reached and this case is available for public records. "
};

const UpdateCaseStatusDialog = ({ dispatch, open, caseId, nextStatus }) => {
  return (
    <Dialog open={open}>
      <DialogTitle>Update Case Status</DialogTitle>
      <DialogContent>
        <Typography
          style={{
            marginBottom: "24px"
          }}
        >
          This action will mark the case as <strong>{nextStatus}</strong>.&nbsp;{
            STATUS_DESCRIPTION[nextStatus]
          }
        </Typography>
        <Typography>
          Are you sure you want to mark this case as{" "}
          <strong>{nextStatus}</strong>?
        </Typography>
      </DialogContent>
      <DialogActions>
        <SecondaryButton
          data-test="closeDialog"
          onClick={() => {
            dispatch(closeCaseStatusUpdateDialog());
          }}
        >
          Cancel
        </SecondaryButton>
        <PrimaryButton
          data-test="updateCaseStatus"
          onClick={() => {
            dispatch(setCaseStatus(caseId, nextStatus));
            if (nextStatus === CASE_STATUS.LETTER_IN_PROGRESS) {
              history.push(`/cases/${caseId}/letter/review`);
            }
          }}
        >{`Mark as ${nextStatus}`}</PrimaryButton>
      </DialogActions>
    </Dialog>
  );
};

const mapStateToProps = state => ({
  open: state.ui.updateCaseStatusDialog.open,
  nextStatus: state.ui.updateCaseStatusDialog.nextStatus,
  caseId: state.currentCase.details.id
});

export default connect(mapStateToProps)(UpdateCaseStatusDialog);

import React, { Component } from "react";
import { Card, CardContent, Typography } from "@material-ui/core";
import NavBar from "../../../shared/components/NavBar/NavBar";
import { connect } from "react-redux";
import LinkButton from "../../../shared/components/LinkButton";
import LetterProgressStepper from "../LetterProgressStepper";
import { SecondaryButton } from "../../../shared/components/StyledButtons";
import { LETTER_PROGRESS } from "../../../../sharedUtilities/constants";
import getLetterPreview from "../thunks/getLetterPreview";
import { Field, reduxForm } from "redux-form";
import RichTextEditor from "../../../shared/components/RichTextEditor/RichTextEditor";
import { openCancelEditLetterConfirmationDialog } from "../../../actionCreators/letterActionCreators";
import CancelEditLetterConfirmationDialog from "./CancelEditLetterConfirmationDialog";
import editReferralLetterContent from "../thunks/editReferralLetterContent";

const RichTextEditorComponent = props => {
  return (
    <RichTextEditor
      initialValue={props.input.value}
      onChange={newValue => props.input.onChange(newValue)}
    />
  );
};

export class EditLetter extends Component {
  constructor(props) {
    super(props);
    this.state = { caseId: this.props.match.params.id };
  }

  componentDidMount() {
    this.props.dispatch(getLetterPreview(this.state.caseId));
  }

  letterPreviewNotYetLoaded = () => {
    return this.props.letterHtml === "";
  };

  saveAndGoBackToPreview = () => {
    return this.props.handleSubmit(
      this.submitForm(`/cases/${this.state.caseId}/letter/letter-preview`)
    );
  };

  pageChangeCallback = redirectUrl => {
    return this.props.handleSubmit(this.submitForm(redirectUrl));
  };

  submitForm = redirectUrl => (values, dispatch) => {
    dispatch(editReferralLetterContent(this.state.caseId, values, redirectUrl));
  };

  render() {
    if (this.letterPreviewNotYetLoaded()) {
      return null;
    }

    return (
      <div>
        <NavBar>
          <Typography data-test="pageTitle" variant="title" color="inherit">
            {`Case #${this.state.caseId}   : Letter Generation`}
          </Typography>
        </NavBar>

        <LinkButton
          data-test="save-and-return-to-case-link"
          style={{ margin: "2% 0% 2% 4%" }}
        >
          Back to Case
        </LinkButton>

        <div style={{ margin: "0% 5% 3%", width: "60%" }}>
          <LetterProgressStepper
            currentLetterStatus={LETTER_PROGRESS.PREVIEW}
            pageChangeCallback={this.pageChangeCallback}
            caseId={this.state.caseId}
          />
          <div style={{ margin: "0 0 32px 0" }}>
            <Typography
              style={{
                marginBottom: "24px"
              }}
              variant="title"
            >
              Edit Letter
            </Typography>
            <CancelEditLetterConfirmationDialog caseId={this.state.caseId} />
            <Card
              style={{
                marginBottom: "24px",
                backgroundColor: "white"
              }}
            >
              <CardContent>
                <form>
                  <Field
                    name="editedLetterHtml"
                    data-test="editLetterHtml"
                    component={RichTextEditorComponent}
                    fullWidth
                    multiline
                    style={{ marginBottom: "16px" }}
                  />
                </form>
              </CardContent>
            </Card>

            <div style={{ display: "flex" }}>
              <span style={{ flex: 1 }}>
                <SecondaryButton
                  data-test="cancel-button"
                  onClick={() => {
                    this.props.dispatch(
                      openCancelEditLetterConfirmationDialog()
                    );
                  }}
                >
                  Cancel
                </SecondaryButton>
              </span>
              <span style={{ flex: 1, textAlign: "right" }}>
                <SecondaryButton
                  data-test="save-button"
                  onClick={this.saveAndGoBackToPreview()}
                >
                  Save
                </SecondaryButton>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  initialValues: { editedLetterHtml: state.referralLetter.letterHtml }
});

export default connect(mapStateToProps)(
  reduxForm({ form: "editLetterHtmlForm", enableReinitialize: true })(
    EditLetter
  )
);

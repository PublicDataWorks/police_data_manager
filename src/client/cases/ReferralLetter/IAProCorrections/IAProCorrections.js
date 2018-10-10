import React, { Component, Fragment } from "react";
import getReferralLetter from "../thunks/getReferralLetter";
import { LETTER_PROGRESS } from "../../../../sharedUtilities/constants";
import NavBar from "../../../shared/components/NavBar/NavBar";
import { Card, CardContent, Typography } from "@material-ui/core";
import LetterProgressStepper from "../LetterProgressStepper";
import LinkButton from "../../../shared/components/LinkButton";
import { Field, FieldArray, reduxForm } from "redux-form";
import { connect } from "react-redux";
import { TextField } from "redux-form-material-ui";

import _ from "lodash";
import shortid from "shortid";

class IAProCorrections extends Component {
  constructor(props) {
    super(props);
    this.state = { caseId: this.props.match.params.id };
  }

  componentDidMount() {
    this.props.dispatch(getReferralLetter(this.state.caseId));
  }

  saveAndReturnToCase = () => {};

  referralLetterNotYetLoaded = () => {
    return (
      _.isEmpty(this.props.letterDetails) ||
      `${this.props.letterDetails.caseId}` !== this.state.caseId
    );
  };

  renderIAProCorrectionsFields = fields => {
    return fields.map((iaProCorrectionsField, index) => {
      const iaproCorrectionInstance = fields.get(index);
      const uniqueKey =
        iaproCorrectionInstance.id || iaproCorrectionInstance.tempId;
      return (
        <Card
          key={uniqueKey}
          style={{
            marginBottom: "24px",
            backgroundColor: "white"
          }}
        >
          <CardContent style={{ backgroundColor: "white" }}>
            <div data-test="iapro-correction">
              <Field
                style={{ width: "80%" }}
                name={`${iaProCorrectionsField}.details`}
                component={TextField}
                label="Correction Description"
                data-test={`${iaProCorrectionsField}-details`}
                fullWidth
                multiline
                rowsMax={10}
              />
            </div>
          </CardContent>
        </Card>
      );
    });
  };

  addNewIAProCorrection = fields => () => {
    const newIAProCorrection = { tempId: shortid.generate() };
    fields.push(newIAProCorrection);
  };

  renderIAProCorrections = ({ fields }) => {
    return (
      <Fragment>
        {this.renderIAProCorrectionsFields(fields)}
        <LinkButton
          onClick={this.addNewIAProCorrection(fields)}
          data-test="addIAProCorrectionButton"
        >
          + Add A Note
        </LinkButton>
      </Fragment>
    );
  };

  render() {
    if (this.referralLetterNotYetLoaded()) {
      return null;
    }

    return (
      <div>
        <NavBar>
          <Typography data-test="pageTitle" variant="title" color="inherit">
            {`Case #${this.state.caseId}   : Letter Generation`}
          </Typography>
        </NavBar>

        <form>
          <LinkButton
            data-test="save-and-return-to-case-link"
            onClick={this.saveAndReturnToCase()}
            style={{ margin: "2% 0% 2% 4%" }}
          >
            Save and Return to Case
          </LinkButton>

          <div style={{ margin: "0% 5% 3%", width: "60%" }}>
            <LetterProgressStepper
              currentLetterStatus={LETTER_PROGRESS.IAPRO_CORRECTIONS}
            />
            <div style={{ margin: "0 0 32px 0" }}>
              <Typography variant="title">IAPro Corrections</Typography>
            </div>
            <FieldArray
              name="iaProCorrections"
              component={this.renderIAProCorrections}
            />
          </div>
        </form>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  letterDetails: state.referralLetter.letterDetails,
  initialValues: {
    iaProCorrections:
      state.referralLetter.letterDetails.referralLetterIAProCorrections
  }
});

export default connect(mapStateToProps)(
  reduxForm({ form: "IAProCorrections", enableReinitialize: true })(
    IAProCorrections
  )
);

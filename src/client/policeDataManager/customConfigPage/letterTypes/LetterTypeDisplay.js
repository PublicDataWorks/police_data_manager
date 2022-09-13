import React from "react";
import { connect } from "react-redux";
import {
  Divider,
  ExpansionPanel,
  ExpansionPanelSummary,
  Checkbox
} from "@material-ui/core";
import ExpansionPanelIconButton from "../../shared/components/ExpansionPanelIconButton";
import StyledInfoDisplay from "../../shared/components/StyledInfoDisplay";
import StyledExpansionPanelDetails from "../../shared/components/StyledExpansionPanelDetails";
import LetterTypeInfoDisplay from "../letterTypes/LetterTypeInfoDisplay";

const LetterTypeDisplay = ({ letterType }) => {
  return (
    <div>
      <div
        style={{
          display: "flex",
          width: "100%",
          paddingRight: 0
        }}
      >
        <ExpansionPanel
          data-testid="letterTypesPanel"
          elevation={0}
          style={{ backgroundColor: "white", width: "100%" }}
        >
          <ExpansionPanelSummary style={{ padding: "0px 24px" }}>
            <div
              style={{
                display: "flex",
                width: "100%",
                paddingRight: 0,
                marginBottom: 4
              }}
            >
              <ExpansionPanelIconButton />
              <div
                style={{
                  display: "flex",
                  width: "100%"
                }}
              >
                <StyledInfoDisplay>
                  <LetterTypeInfoDisplay
                    displayLabel="Type"
                    value={letterType.type}
                    testLabel="letter-type"
                  />
                </StyledInfoDisplay>
                <StyledInfoDisplay>
                  <LetterTypeInfoDisplay
                    displayLabel="Requires Approval"
                    value={letterType.requiresApproval}
                    testLabel="requires-approval"
                  />
                </StyledInfoDisplay>
                <StyledInfoDisplay>
                  <LetterTypeInfoDisplay
                    displayLabel="Is Editable"
                    value={letterType.hasEditPage}
                    testLabel="is-editable"
                  />
                </StyledInfoDisplay>
                <StyledInfoDisplay>
                  <LetterTypeInfoDisplay
                    displayLabel="Default Sender"
                    value={letterType.defaultSender.name}
                    testLabel="default-sender"
                  />
                </StyledInfoDisplay>
                <StyledInfoDisplay>
                  <LetterTypeInfoDisplay
                    displayLabel="Required Status"
                    value={letterType.requiredStatus.name}
                    testLabel="required-status"
                  />
                </StyledInfoDisplay>
              </div>
            </div>
          </ExpansionPanelSummary>
          <StyledExpansionPanelDetails>
            <div
              style={{
                width: "100%",
                marginBottom: 4
              }}
            >
              <StyledInfoDisplay>
                <LetterTypeInfoDisplay
                  displayLabel="Template"
                  value={letterType.template}
                  testLabel="template"
                />
              </StyledInfoDisplay>
              <br />
              {letterType.hasEditPage ? (
                <StyledInfoDisplay>
                  <LetterTypeInfoDisplay
                    displayLabel="Body Template"
                    value={letterType.editableTemplate}
                    testLabel="body-template"
                  />
                </StyledInfoDisplay>
              ) : (
                ""
              )}
            </div>
          </StyledExpansionPanelDetails>
        </ExpansionPanel>
      </div>
      <Divider />
    </div>
  );
};

export default connect(state => ({
  permissions: state?.users?.current?.userInfo?.permissions
}))(LetterTypeDisplay);

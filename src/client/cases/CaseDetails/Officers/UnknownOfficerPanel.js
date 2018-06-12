import { Divider, ExpansionPanel, ExpansionPanelSummary } from "@material-ui/core";
import React from "react";
import OfficerInfoDisplay from "./OfficerInfoDisplay";
import StyledExpansionPanelDetails from "../ComplainantWitnesses/StyledExpansionPanelDetails";

const UnknownOfficerPanel = ({ caseOfficer, children }) => {
  return (
    <div>
      <ExpansionPanel
        data-test="unknownOfficerPanel"
        elevation={0}
        style={{ backgroundColor: "white" }}
      >
        <ExpansionPanelSummary style={{ padding: "0px 24px" }}>
          <div style={{ display: "flex", width: "100%", paddingRight: 0 }}>
            <OfficerInfoDisplay
              displayLabel="Officer"
              value={caseOfficer.fullName}
              testLabel="officerName"
            />
            {children}
          </div>
        </ExpansionPanelSummary>
        <StyledExpansionPanelDetails>
          <OfficerInfoDisplay
            displayLabel="Notes"
            value={caseOfficer.notes}
            testLabel="notes"
          />
        </StyledExpansionPanelDetails>
      </ExpansionPanel>
      <Divider />
    </div>
  );
};

export default UnknownOfficerPanel;

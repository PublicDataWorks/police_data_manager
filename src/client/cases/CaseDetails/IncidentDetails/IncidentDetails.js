import React from "react";
import BaseCaseDetailsCard from "../BaseCaseDetailsCard";
import CivilianInfoDisplay from "../ComplainantWitnesses/CivilianInfoDisplay";
import formatDate, {
  computeTimeZone,
  format12HourTime
} from "../../../utilities/formatDate";
import LinkButton from "../../../shared/components/LinkButton";
import IncidentDetailsDialog from "./IncidentDetailsDialog";
import AddressInfoDisplay from "../../../shared/components/AddressInfoDisplay";
import { initialize, reset } from "redux-form";
import { CardContent } from "@material-ui/core";

class IncidentDetails extends React.Component {
  state = {
    dialogOpen: false
  };

  formatTimeForDisplay = (date, time) => {
    if (!time) return time;
    return format12HourTime(time) + " " + computeTimeZone(date, time);
  };

  handleDialogOpen = () => {
    const formValues = {
      firstContactDate: this.props.firstContactDate,
      incidentDate: this.props.incidentDate,
      incidentTime: this.props.incidentTime,
      incidentLocation: this.props.incidentLocation,
      district: this.props.district,
      classificationId: this.props.classificationId,
      intakeSource: this.props.intakeSource
    };

    this.props.dispatch(initialize("IncidentDetails", formValues));
    this.setState({ dialogOpen: true });
  };

  handleDialogClose = () => {
    this.props.dispatch(reset("IncidentDetails"));
    this.setState({ dialogOpen: false });
  };

  render() {
    const {
      firstContactDate,
      incidentDate,
      incidentTime,
      caseId,
      incidentLocation,
      district,
      classification,
      intakeSource
    } = this.props;
    const classificationInitialism = classification
      ? classification.initialism
      : "";

    return (
      <BaseCaseDetailsCard title="Incident Details">
        <CardContent style={{ padding: "24px" }}>
          <div
            style={{
              display: "flex",
              width: "100%",
              paddingRight: 0,
              marginBottom: "26px"
            }}
          >
            <CivilianInfoDisplay
              displayLabel="First Contacted IPM"
              value={formatDate(firstContactDate)}
              testLabel="firstContactDate"
            />
            <CivilianInfoDisplay
              displayLabel="Incident Date"
              value={formatDate(incidentDate)}
              testLabel="incidentDate"
            />
            <CivilianInfoDisplay
              displayLabel="Incident Time"
              value={this.formatTimeForDisplay(incidentDate, incidentTime)}
              testLabel="incidentTime"
            />
            <div>
              <LinkButton
                data-test="editIncidentDetailsButton"
                onClick={this.handleDialogOpen}
              >
                Edit
              </LinkButton>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              width: "100%",
              paddingRight: 0,
              marginBottom: "26px"
            }}
          >
            <AddressInfoDisplay
              testLabel="incidentLocation"
              displayLabel="Incident Location"
              address={incidentLocation}
              useLineBreaks={true}
              style={{ flex: 1 }}
            />
            <CivilianInfoDisplay
              displayLabel="District"
              value={district}
              testLabel="incidentDistrict"
            />
            <CivilianInfoDisplay
              displayLabel="Classification"
              value={classificationInitialism}
              testLabel="classification"
            />
            <div style={{ width: "69.5px" }} />
          </div>
          <div style={{ display: "flex", width: "100%" }}>
            <CivilianInfoDisplay
              displayLabel="Intake Source"
              value={intakeSource}
              testLabel="intakeSource"
            />
          </div>
        </CardContent>
        <IncidentDetailsDialog
          dialogOpen={this.state.dialogOpen}
          handleDialogClose={this.handleDialogClose}
          caseId={caseId}
        />
      </BaseCaseDetailsCard>
    );
  }
}

export default IncidentDetails;

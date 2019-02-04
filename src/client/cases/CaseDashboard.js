import React, { Component } from "react";
import CasesTable from "./CasesTable/CasesTable";
import CreateCaseButton from "./CreateCaseButton";
import NavBar from "../shared/components/NavBar/NavBar";
import { Typography } from "@material-ui/core";
import { connect } from "react-redux";
import getCases from "./thunks/getCases";
import { resetWorkingCasesLoaded } from "../actionCreators/casesActionCreators";

class CaseDashboard extends Component {
  componentWillUnmount() {
    this.props.resetWorkingCasesLoaded();
  }

  componentDidMount() {
    this.props.getCases();
  }

  render() {
    return (
      <div>
        <NavBar>
          <Typography data-test="pageTitle" variant="title" color="inherit">
            View All Cases
          </Typography>
        </NavBar>
        <CreateCaseButton />
        <CasesTable archived={false} />
      </div>
    );
  }
}

const mapDispatchToProps = {
  getCases,
  resetWorkingCasesLoaded
};

export default connect(
  null,
  mapDispatchToProps
)(CaseDashboard);

import React, { Component } from "react";
import NavBar from "../shared/components/NavBar/NavBar";
import { Typography } from "@material-ui/core";
import { connect } from "react-redux";
import { closeSnackbar } from "../actionCreators/snackBarActionCreators";
import ExportAllCases from "./ExportAllCases";

class JobDashboard extends Component {
  componentDidMount() {
    this.props.dispatch(closeSnackbar());
  }

  render() {
    return (
      <div>
        <NavBar>
          <Typography data-test="pageTitle" variant="title" color="inherit">
            Manage Export Jobs
          </Typography>
        </NavBar>
        <ExportAllCases />
      </div>
    );
  }
}

export default connect()(JobDashboard);

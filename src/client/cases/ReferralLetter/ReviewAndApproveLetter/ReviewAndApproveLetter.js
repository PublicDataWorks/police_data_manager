import React, { Component } from "react";
import { Card, CardContent, Typography } from "@material-ui/core";
import NavBar from "../../../shared/components/NavBar/NavBar";
import LinkButton from "../../../shared/components/LinkButton";
import getLetterPreview from "../thunks/getLetterPreview";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Document, Page } from "react-pdf";
import downloadPdf from "../thunks/downloadPdf";
import { withStyles } from "@material-ui/core/styles";
import { startLetterDownload } from "../../../actionCreators/letterActionCreators";
import CircularProgress from "@material-ui/core/CircularProgress/CircularProgress";
import { dateTimeFromString } from "../../../utilities/formatDate";
import { pdfjs } from "react-pdf";
import { PrimaryButton } from "../../../shared/components/StyledButtons";
import { openCaseStatusUpdateDialog } from "../../../actionCreators/casesActionCreators";
import UpdateCaseStatusDialog from "../../CaseDetails/UpdateCaseStatusDialog/UpdateCaseStatusDialog";
import approveReferralLetter from "../thunks/approveReferralLetter";
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.js";

const styles = theme => ({
  pageStyling: {
    borderBottom: `${theme.palette.secondary.main} 1px dotted`,
    "&:last-child": { borderBottom: "none" }
  }
});
class ReviewAndApproveLetter extends Component {
  constructor(props) {
    super(props);
    this.state = { caseId: this.props.match.params.id, numPages: null };
  }

  componentDidMount() {
    this.props.getLetterPreview(this.state.caseId);
    this.props.startLetterDownload();
    this.props.downloadPdf(this.state.caseId);
  }

  letterPreviewNotYetLoaded = () => {
    return this.props.editHistory === "";
  };

  getTimestamp() {
    let message;
    if (this.props.editHistory && this.props.editHistory.lastEdited) {
      const generatedDate = dateTimeFromString(
        this.props.editHistory.lastEdited
      );
      message = `This letter was last edited on ${generatedDate}`;
    } else {
      const now = dateTimeFromString(new Date());
      message = `This letter was generated on ${now}`;
    }
    return <i>{message}</i>;
  }

  onDocumentLoadSuccess = ({ numPages }) => {
    this.setState({
      numPages
    });
  };

  openUpdateCaseDialog = () => {
    this.props.openCaseStatusUpdateDialog();
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
          to={`/cases/${this.state.caseId}`}
          component={Link}
          style={{ margin: "2% 0% 2% 4%" }}
        >
          Back to Case
        </LinkButton>
        <div style={{ margin: "0% 5% 3%", maxWidth: "54rem" }}>
          <Typography
            style={{
              marginBottom: "24px"
            }}
            variant="title"
          >
            Review and Approve Letter
          </Typography>
          <Typography
            data-test="edit-history"
            variant="body1"
            style={{ marginBottom: "24px" }}
          >
            {this.getTimestamp()}
          </Typography>
          <Card
            style={{
              marginBottom: "24px",
              backgroundColor: "white",
              overflow: "auto",
              overflowX: "hidden",
              width: "54rem",
              maxHeight: "55rem"
            }}
          >
            <CardContent>
              <Document
                file={this.props.letterPdf}
                onLoadSuccess={this.onDocumentLoadSuccess}
                noData=""
              >
                {Array.from(new Array(this.state.numPages), (el, index) => (
                  <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    scale={1.3}
                    className={this.props.classes.pageStyling}
                  />
                ))}
              </Document>
              <div style={{ textAlign: "center", marginTop: "8px" }}>
                <CircularProgress
                  data-test={"download-letter-progress"}
                  size={25}
                  style={{
                    display: this.props.downloadInProgress ? "" : "none"
                  }}
                />
              </div>
            </CardContent>
          </Card>
          <div style={{ textAlign: "right" }}>
            <PrimaryButton
              onClick={this.openUpdateCaseDialog}
              data-test="approve-letter-button"
            >
              Approve Letter
            </PrimaryButton>
          </div>
          <UpdateCaseStatusDialog
            alternativeAction={this.props.approveReferralLetter}
            doNotCallUpdateStatusCallback={true}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  editHistory: state.referralLetter.editHistory,
  letterPdf: state.referralLetter.letterPdf,
  downloadInProgress: state.ui.letterDownload.downloadInProgress
});

const mapDispatchToProps = {
  getLetterPreview,
  downloadPdf: downloadPdf,
  startLetterDownload,
  openCaseStatusUpdateDialog,
  approveReferralLetter
};

export default withStyles(styles, { withTheme: true })(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(ReviewAndApproveLetter)
);

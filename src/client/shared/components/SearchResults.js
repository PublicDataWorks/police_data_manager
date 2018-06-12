import React, { Component } from "react";
import {
  Paper,
  Table,
  TableBody,
  Typography,
  LinearProgress
} from "@material-ui/core";
import { searchCleared } from "../../actionCreators/searchActionCreators";

export class SearchResults extends Component {
  componentWillUnmount() {
    this.props.dispatch(searchCleared());
  }

  render() {
    return (
      <div>
        <Typography variant="title">Search Results</Typography>
        <Paper elevation={0}>
          {this.renderSearchResultsMessage()}
          {this.renderSearchResults()}
          {this.renderSpinner()}
        </Paper>
      </div>
    );
  }

  renderSpinner = () => {
    if (!this.props.spinnerVisible) {
      return null;
    }
    return (
      <div style={{ textAlign: "center" }}>
        <LinearProgress
          data-test="spinner"
          style={{ marginTop: "24px", marginBottom: "32px" }}
          size={300}
        />
      </div>
    );
  };

  renderSearchResultsMessage = () => {
    if (this.props.spinnerVisible) {
      return null;
    }
    let message = "";
    if (!this.props.searchResults || this.props.searchResults.length === 0) {
      message = "No results found";
    } else if (this.props.searchResults.length === 1) {
      message = `1 result found`;
    } else {
      message = `${this.props.searchResults.length} results found`;
    }

    return (
      <Typography
        variant="body1"
        data-test={"searchResultsMessage"}
        style={{ marginBottom: "16px" }}
      >
        {message}
      </Typography>
    );
  };

  renderSearchResults = () => {
    if (!this.props.searchResults || this.props.searchResults.length === 0) {
      return null;
    }
    return (
      <Table style={{ marginBottom: "32px" }}>
        {this.props.tableHeaderComponent}
        <TableBody>{this.generateResultsRows()}</TableBody>
      </Table>
    );
  };

  generateResultsRows() {
    const { searchResults, searchResultsIds } = this.props;

    return searchResults.map(searchResult =>
      this.props.render(searchResult, searchResultsIds)
    );
  }
}

export default SearchResults;

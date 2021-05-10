import React, { Component } from "react";
import { push } from 'connected-react-router';
import { Field, reduxForm } from "redux-form";
import { SEARCH_CASES_FORM_NAME } from "../../../../sharedUtilities/constants";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import styles from "../../../common/globalStyling/styles";
import { renderTextField } from "../sharedFormComponents/renderFunctions";
import axios from "axios";
import { searchSuccess } from "../../actionCreators/searchActionCreators";

class SearchCasesForm extends Component {
  submit = async ({ queryString }, dispatch) => {
    if (!queryString || queryString.length < 3) return;
    const response = await axios.get(`api/cases/search`, {
      params: { queryString }
    });
    await dispatch(searchSuccess(response.data));
    dispatch(push(`/search?queryString=${queryString}`));
  };

  submitWithKey = event => {
    event.preventDefault();
    this.props.handleSubmit(this.submit)();
  };

  render() {
    return (
      <form onSubmit={this.submitWithKey} style={{ ...styles.searchBar }}>
        <IconButton
          color="inherit"
          data-testid="searchButton"
          onClick={this.props.handleSubmit(this.submit)}
        >
          <SearchIcon color="inherit" />
        </IconButton>
        <Field
          name="queryString"
          component={renderTextField}
          inputProps={{
            "data-testid": "searchField"
          }}
          fullWidth
          placeholder="Search by complainant names, accused officers, tags"
          InputProps={{
            disableUnderline: true,
            style: {
              color: "#fff",
              fontFamily: [
                "IBM Plex Sans Medium",
                "IBM Plex Sans",
                "Arial",
                "sans-serif"
              ].join(","),
              fontWeight: "300",
              fontSize: "16px"
            }
          }}
        />
      </form>
    );
  }
}

const searchCasesForm = reduxForm({
  form: SEARCH_CASES_FORM_NAME
})(SearchCasesForm);

export default searchCasesForm;

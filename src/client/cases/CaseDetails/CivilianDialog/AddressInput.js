import React, { Component } from "react";
import { TextField } from "redux-form-material-ui";
import AddressAutoSuggest from "./AddressAutoSuggest";
import { Field } from "redux-form";
import { connect } from "react-redux";
import colors from "../../../globalStyling/colors";
import AddressSuggestionEngine from "./SuggestionEngines/addressSuggestionEngine";

class AddressInput extends Component {
  //TODO  IS there a good way to do dependency injection in react/redux?
  // It's generally poor form to have a default service instance.
  // Would it be a bad idea to have a set of services defined in some corner of Redux
  // that would be set differently based on the environment?
  constructor(props) {
    super(props);
    this.suggestionEngine =
      props.suggestionEngine || new AddressSuggestionEngine();
    this.state = { validAddress: false };
  }

  renderValidMessage = () => {
    if (
      !this.props.featureToggles ||
      !this.props.featureToggles.addressIntersections ||
      !this.props.addressMessageVisible
    ) {
      return null;
    }

    let message, color;
    if (this.props.addressValid) {
      color = colors.green;
      message = "This is a valid address.";
    } else {
      color = colors.red;
      message = "This is not a valid address.";
    }
    return (
      <div
        style={{
          fontSize: "0.75rem",
          textAlign: "left",
          marginTop: "8px",
          color: color
        }}
      >
        {message}
      </div>
    );
  };

  render() {
    return (
      <div>
        <Field
          name="autoSuggestValue"
          component={AddressAutoSuggest}
          props={{
            label: this.props.addressLabel,
            suggestionEngine: this.suggestionEngine,
            defaultText: this.props.formattedAddress,
            "data-test": "addressSuggestionField",
            fieldName: this.props.fieldName,
            formName: this.props.formName
          }}
        />
        {this.renderValidMessage()}
        <Field
          type={"hidden"}
          name={`${this.props.fieldName}.streetAddress`}
          component={TextField}
          inputProps={{
            "data-test": "streetAddressInput"
          }}
        />
        <Field
          type={"hidden"}
          name={`${this.props.fieldName}.intersection`}
          component={TextField}
          inputProps={{
            "data-test": "streetAddressInput"
          }}
        />
        <Field
          type={"hidden"}
          name={`${this.props.fieldName}.city`}
          component={TextField}
          inputProps={{
            "data-test": "cityInput"
          }}
        />
        <Field
          type={"hidden"}
          name={`${this.props.fieldName}.state`}
          component={TextField}
          inputProps={{
            "data-test": "stateInput"
          }}
        />
        <Field
          type={"hidden"}
          name={`${this.props.fieldName}.zipCode`}
          component={TextField}
          inputProps={{
            "data-test": "zipCodeInput"
          }}
        />
        <Field
          type={"hidden"}
          name={`${this.props.fieldName}.country`}
          component={TextField}
          inputProps={{
            "data-test": "countryInput"
          }}
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  addressValid: state.ui.addressInput.addressValid,
  addressMessageVisible: state.ui.addressInput.addressMessageVisible
});

export default connect(mapStateToProps)(AddressInput);

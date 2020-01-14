const e2e = require("./e2eUtilities.js");

const civilianDialogCommands = {
  dialogIsOpen: function() {
    return this.waitForElementVisible("@dialogTitle", e2e.rerenderWait);
  },
  setGenderIdentity: function(genderId) {
    return this.waitForElementPresent("@genderDropdown", e2e.rerenderWait)
      .click("@genderDropdown")
      .waitForElementPresent("@menu", e2e.rerenderWait)
      .click({ selector: "@toSelect", index: genderId + 1 })
      .waitForElementNotPresent("@menu", e2e.rerenderWait);
  },
  setRaceEthnicity: function(raceEthnicityId) {
    return this.waitForElementPresent(
      "@raceEthnicityDropdown",
      e2e.rerenderWait
    )
      .click("@raceEthnicityDropdown")
      .waitForElementPresent("@menu", e2e.rerenderWait)
      .click({ selector: "@toSelect", index: raceEthnicityId + 1 })
      .waitForElementNotPresent("@menu", e2e.rerenderWait);
  },
  setTitle: function(titleId) {
    return this.waitForElementPresent("@titleDropdown", e2e.rerenderWait)
      .click("@titleDropdown")
      .waitForElementPresent("@menu", e2e.rerenderWait)
      .click({ selector: "@toSelect", index: titleId + 1 })
      .waitForElementNotPresent("@menu", e2e.rerenderWait);
  },
  toggleIsAnonymous: function() {
    return this.click("@isAnonymous");
  },
  typeInAddress: function(addressInput) {
    return this.setValue("@addressSuggestionField", [addressInput]);
  },
  setAddressSuggestionFieldToEmpty: function() {
    this.click("@addressSuggestionField").api.keys(
      Array(50)
        .fill(this.api.Keys.BACK_SPACE)
        .concat(Array(50).fill(this.api.Keys.DELETE))
    );
    return this;
  },
  thereAreSuggestions: function() {
    this.waitForElementPresent(
      '[data-test="suggestion-container"] > ul',
      e2e.rerenderWait
    ).api.pause(e2e.dataLoadWait);
    return this;
  },
  arrowDown: function() {
    return this.setValue("@addressSuggestionField", [this.api.Keys.ARROW_DOWN]);
  },
  addressSuggestionFieldPopulated: function() {
    return this.getValue("@addressSuggestionField", result => {
      this.assert.ok(result.value.length > 4);
    });
  },
  addressFieldsAreEmpty: function() {
    this.expect.element("@streetAddressInput").value.to.equal("");
    this.expect.element("@cityInput").value.to.equal("");
    this.expect.element("@stateInput").value.to.equal("");
    this.expect.element("@zipCodeInput").value.to.equal("");
    this.expect.element("@countryInput").value.to.equal("");
    return this;
  },
  selectSuggestion: function() {
    this.setValue("@addressSuggestionField", [this.api.Keys.ENTER]).api.pause(
      e2e.pause
    );
    return this;
  },
  addressFieldsAreNotEmpty: function() {
    this.expect.element("@streetAddressInput").value.to.not.equal("");
    this.expect.element("@cityInput").value.to.not.equal("");
    this.expect.element("@stateInput").value.to.not.equal("");
    this.expect.element("@zipCodeInput").value.to.not.equal("");
    this.expect.element("@countryInput").value.to.not.equal("");
    return this;
  },
  submitCivilianDialog: function() {
    return this.click("@submitEditCivilianButton");
  }
};

module.exports = {
  commands: [civilianDialogCommands],
  elements: {
    dialogTitle: {
      selector: "[data-test='editDialogTitle']"
    },
    genderDropdown: {
      selector: '[data-test="genderInput"]+div>button'
    },
    raceEthnicityDropdown: {
      selector: '[data-test="raceEthnicityInput"]+div>button'
    },
    titleDropdown: {
      selector: '[data-test="titleInput"]+div>button'
    },
    titleMenu: {
      selector: "[id='civilianTitleId']"
    },
    isAnonymous: {
      selector: "[data-test='isAnonymous']"
    },
    addressSuggestionField: {
      selector: '[data-test="addressSuggestionField"] > input'
    },
    suggestionContainer: {
      selector: '[data-test="suggestion-container"] > ul'
    },
    streetAddressInput: {
      selector: '[data-test="streetAddressInput"]'
    },
    cityInput: {
      selector: '[data-test="cityInput"]'
    },
    stateInput: {
      selector: '[data-test="stateInput"]'
    },
    zipCodeInput: {
      selector: '[data-test="zipCodeInput"]'
    },
    countryInput: {
      selector: '[data-test="countryInput"]'
    },
    submitEditCivilianButton: {
      selector: 'button[data-test="submitEditCivilian"]'
    },
    menuOption: {
      selector: "[role='option']:last-child"
    },
    menu: {
      selector: ".MuiAutocomplete-popper"
    },
    toSelect: {
      selector: "li"
    }
  }
};

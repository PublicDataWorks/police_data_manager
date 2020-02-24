import React, { Component } from "react";
import { mount, render } from "enzyme";
import CaseDashboard from "./CaseDashboard";
import NavBar from "../shared/components/NavBar/NavBar";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import createConfiguredStore from "../../createConfiguredStore";
import { openSnackbar } from "../actionCreators/snackBarActionCreators";
import { mockLocalStorage } from "../../../mockLocalStorage";
import { getWorkingCasesSuccess } from "../actionCreators/casesActionCreators";
import Case from "../testUtilities/case";
import getWorkingCases from "./thunks/getWorkingCases";
import { containsText } from "../../testHelpers";
import { DESCENDING, SORT_CASES_BY } from "../../../sharedUtilities/constants";
import { getFeaturesSuccess } from "../actionCreators/featureTogglesActionCreators";

jest.mock("./thunks/getWorkingCases", () => () => ({
  type: "MOCK_GET_CASES_THUNK"
}));

jest.mock("../../common/components/Visualization/Visualization", () => 'Visualization');

describe("CaseDashboard", () => {
  let caseDashboardWrapper, store, dispatchSpy, cases;

  beforeEach(() => {
    mockLocalStorage();

    const newCase = new Case.Builder().defaultCase().build();
    const newCase2 = new Case.Builder()
      .defaultCase()
      .withId(1)
      .build();
    cases = [newCase, newCase2];

    store = createConfiguredStore();
    store.dispatch(getWorkingCasesSuccess(cases));
    store.dispatch(openSnackbar());

    dispatchSpy = jest.spyOn(store, "dispatch");

    caseDashboardWrapper = mount(
      <Provider store={store}>
        <Router>
          <CaseDashboard isTest={true}/>
        </Router>
      </Provider>
    );
  });

  test("should display no cases message", () => {
    store.dispatch(getWorkingCasesSuccess([]));
    caseDashboardWrapper.update();

    expect(
      containsText(
        caseDashboardWrapper,
        '[data-testid="searchResultsMessage"]',
        "There are no cases to view"
      )
    );
  });

  test("should display navbar with title", () => {
    const navBar = caseDashboardWrapper.find(NavBar);
    expect(navBar.contains("View All Cases")).toEqual(true);
  });

  test("should load all cases when mounted", () => {
    expect(dispatchSpy).toHaveBeenCalledWith(
      getWorkingCases(SORT_CASES_BY.CASE_REFERENCE, DESCENDING)
    );
  });

  test("should close snackbar when mounted", () => {
    expect(store.getState()).toHaveProperty("ui.snackbar.open", false);
  });

  describe("Data Visualization Feature Toggle", () => {
    test("displays data visualizations when toggled on", () => {
      store.dispatch(
        getFeaturesSuccess({
          dataVisualizationFeature: true
        })
      ); 
      caseDashboardWrapper.update();
      expect(
        caseDashboardWrapper.find('[data-testid="dataVisualization"]').exists()
      ).toBeTrue();
    });

    test("does not display data visualizations when toggled off", () => {
      store.dispatch(
        getFeaturesSuccess({
          dataVisualizationFeature: false
        })
      );
      caseDashboardWrapper.update();
      expect(
        caseDashboardWrapper.find('[data-testid="dataVisualization"]').exists()
      ).toBeFalse();
    });
  });
});

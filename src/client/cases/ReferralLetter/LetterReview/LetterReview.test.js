import createConfiguredStore from "../../../createConfiguredStore";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import { getCaseDetailsSuccess } from "../../../actionCreators/casesActionCreators";
import { CASE_STATUS } from "../../../../sharedUtilities/constants";
import { push } from "connected-react-router";
import LetterReview from "./LetterReview";
import { mount } from "enzyme";
import React from "react";
import invalidCaseStatusRedirect from "../../thunks/invalidCaseStatusRedirect";
import getReferralLetterEditStatus from "../thunks/getReferralLetterEditStatus";
import getCaseDetails from "../../thunks/getCaseDetails";

jest.mock("../../thunks/getCaseDetails", () => caseId => ({
  type: "GetCaseDetails",
  caseId
}));
jest.mock("../thunks/getReferralLetterEditStatus", () => caseId => ({
  type: "GetReferralLetterEditStatus",
  caseId
}));
jest.mock("../../thunks/invalidCaseStatusRedirect", () => caseId => ({
  type: "InvalidCaseRedirect",
  caseId
}));

describe("LetterReview", () => {
  let caseId, dispatchSpy, store, wrapper;
  beforeEach(() => {
    caseId = "88";
    store = createConfiguredStore();
    dispatchSpy = jest.spyOn(store, "dispatch");
    wrapper = mount(
      <Provider store={store}>
        <Router>
          <LetterReview match={{ params: { id: caseId } }} />
        </Router>
      </Provider>
    );
  });

  test("loads referral letter data on mount", () => {
    expect(dispatchSpy).toHaveBeenCalledWith(getCaseDetails(caseId.toString()));
  });

  test("loads letter type on mount so message can be displayed", () => {
    expect(dispatchSpy).toHaveBeenCalledWith(
      getReferralLetterEditStatus(caseId.toString())
    );
  });

  test("redirects to case detail page if case is prior to letter generation status", () => {
    store.dispatch(
      getCaseDetailsSuccess({
        id: caseId,
        status: CASE_STATUS.ACTIVE
      })
    );
    wrapper.update();
    expect(dispatchSpy).toHaveBeenCalledWith(invalidCaseStatusRedirect(caseId));
  });

  test("redirects to case detail page if case is archived", () => {
    store.dispatch(
      getCaseDetailsSuccess({
        id: caseId,
        status: CASE_STATUS.LETTER_IN_PROGRESS,
        isArchived: true
      })
    );
    wrapper.update();
    expect(dispatchSpy).toHaveBeenCalledWith(invalidCaseStatusRedirect(caseId));
  });

  test("does not redirect if case is in letter in progress status", () => {
    store.dispatch(
      getCaseDetailsSuccess({
        id: caseId,
        status: CASE_STATUS.LETTER_IN_PROGRESS,
        complainantCivilians: [],
        complainantOfficers: [],
        witnessCivilians: [],
        witnessOfficers: [],
        accusedOfficers: [],
        caseDistrict: {
          id: "Bear",
          name: "Salmon"
        }
      })
    );
    wrapper.update();
    expect(dispatchSpy).not.toHaveBeenCalledWith(
      invalidCaseStatusRedirect(caseId)
    );
  });

  test("does not redirect if case is in ready for review status", () => {
    store.dispatch(
      getCaseDetailsSuccess({
        id: caseId,
        status: CASE_STATUS.READY_FOR_REVIEW,
        complainantCivilians: [],
        complainantOfficers: [],
        witnessCivilians: [],
        witnessOfficers: [],
        accusedOfficers: [],
        caseDistrict: {
          id: "Bear",
          name: "Salmon"
        }
      })
    );
    wrapper.update();
    expect(dispatchSpy).not.toHaveBeenCalledWith(
      invalidCaseStatusRedirect(caseId)
    );
  });

  test("does not redirect if case is in forwarded to agency status", () => {
    store.dispatch(
      getCaseDetailsSuccess({
        id: caseId,
        status: CASE_STATUS.FORWARDED_TO_AGENCY,
        complainantCivilians: [],
        complainantOfficers: [],
        witnessCivilians: [],
        witnessOfficers: [],
        accusedOfficers: [],
        caseDistrict: {
          id: "Bear",
          name: "Salmon"
        }
      })
    );
    wrapper.update();
    expect(dispatchSpy).not.toHaveBeenCalledWith(
      invalidCaseStatusRedirect(caseId)
    );
  });

  test("does not redirect if case is in closed status", () => {
    store.dispatch(
      getCaseDetailsSuccess({
        id: caseId,
        status: CASE_STATUS.CLOSED,
        complainantCivilians: [],
        complainantOfficers: [],
        witnessCivilians: [],
        witnessOfficers: [],
        accusedOfficers: [],
        caseDistrict: {
          id: "Bear",
          name: "Salmon"
        }
      })
    );
    wrapper.update();
    expect(dispatchSpy).not.toHaveBeenCalledWith(
      invalidCaseStatusRedirect(caseId)
    );
  });

  describe("Redirects when click Stepper Buttons", function() {
    beforeEach(function() {
      store.dispatch(
        getCaseDetailsSuccess({
          id: caseId,
          status: CASE_STATUS.READY_FOR_REVIEW,
          complainantCivilians: [],
          complainantOfficers: [],
          witnessCivilians: [],
          witnessOfficers: [],
          accusedOfficers: [],
          caseDistrict: {
            id: "Bear",
            name: "Salmon"
          }
        })
      );
      wrapper.update();
    });
    test("it redirects to review letter when click review case details stepper button", () => {
      const reviewCaseDetailsButton = wrapper
        .find('[data-test="step-button-Review Case Details"]')
        .first();
      reviewCaseDetailsButton.simulate("click");
      expect(dispatchSpy).toHaveBeenCalledWith(
        push(`/cases/${caseId}/letter/review`)
      );
    });

    test("it redirects to officer history when click officer history stepper button", () => {
      const reviewCaseDetailsButton = wrapper
        .find('[data-test="step-button-Officer Complaint Histories"]')
        .first();
      reviewCaseDetailsButton.simulate("click");
      expect(dispatchSpy).toHaveBeenCalledWith(
        push(`/cases/${caseId}/letter/officer-history`)
      );
    });

    test("it redirects to iapro corrections when click iapro corrections stepper button", () => {
      const reviewCaseDetailsButton = wrapper
        .find('[data-test="step-button-IAPro Corrections"]')
        .first();
      reviewCaseDetailsButton.simulate("click");
      expect(dispatchSpy).toHaveBeenCalledWith(
        push(`/cases/${caseId}/letter/iapro-corrections`)
      );
    });

    test("it redirects to recommended actions when click recommended actions stepper button", () => {
      const reviewCaseDetailsButton = wrapper
        .find('[data-test="step-button-Recommended Actions"]')
        .first();
      reviewCaseDetailsButton.simulate("click");
      expect(dispatchSpy).toHaveBeenCalledWith(
        push(`/cases/${caseId}/letter/recommended-actions`)
      );
    });

    test("it redirects to preview when click preview stepper button", () => {
      const reviewCaseDetailsButton = wrapper
        .find('[data-test="step-button-Preview"]')
        .first();
      reviewCaseDetailsButton.simulate("click");
      expect(dispatchSpy).toHaveBeenCalledWith(
        push(`/cases/${caseId}/letter/letter-preview`)
      );
    });
  });
});

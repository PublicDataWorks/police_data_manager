import {
  GET_REFERRAL_LETTER_SUCCESS,
  EDIT_REFERRAL_LETTER_SUCCESS
} from "../../../sharedUtilities/constants";
import referralLetterReducer from "./referralLetterReducer";
import {
  getReferralLetterSuccess,
  editReferralLetterSuccess,
  editIAProCorrectionsSuccess
} from "../../actionCreators/letterActionCreators";

describe("referralLetterReducer", () => {
  describe("initial state", () => {
    test("returns initial state", () => {
      const newState = referralLetterReducer(undefined, {});
      expect(newState).toEqual({ letterDetails: {} });
    });
  });

  describe("GET_REFERRAL_LETTER_SUCCESS", () => {
    test("sets the letter details in state", () => {
      const letterDetails = { id: 6, referralLetterOfficers: [] };
      const newState = referralLetterReducer(
        undefined,
        getReferralLetterSuccess(letterDetails)
      );
      expect(newState).toEqual({ letterDetails });
    });
  });

  describe("EDIT_REFERRAL_LETTER_SUCCESS", () => {
    test("sets the letter details in state", () => {
      const letterDetails = { id: 6, referralLetterOfficers: [] };
      const newState = referralLetterReducer(
        undefined,
        editReferralLetterSuccess(letterDetails)
      );
      expect(newState).toEqual({ letterDetails });
    });
  });

  describe("EDIT_IAPRO_CORRECTIONS_SUCCESS", function() {
    test("sets the iapro corrections details in state", () => {
      const letterDetails = {
        id: 12,
        referralLetterIAProCorrections: [{ id: 4, details: "some details" }]
      };
      const newState = referralLetterReducer(
        undefined,
        editIAProCorrectionsSuccess(letterDetails)
      );
      expect(newState).toEqual({ letterDetails });
    });
  });
});

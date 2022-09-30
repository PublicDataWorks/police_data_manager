import React from "react";
import { render, screen } from "@testing-library/react";
import nock from "nock";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import createConfiguredStore from "../../../createConfiguredStore";
import SharedSnackbarContainer from "../../shared/components/SharedSnackbarContainer";
import {
  CASE_STATUSES_RETRIEVED,
  CLEAR_LETTER_TYPE_TO_EDIT,
  GET_SIGNERS,
  SET_LETTER_TYPE_TO_EDIT
} from "../../../../sharedUtilities/constants";
import LetterTypePage from "./LetterTypePage";

describe("LetterTypePage", () => {
  describe("Edit Letter Type", () => {
    let dispatchSpy;
    beforeEach(() => {
      const store = createConfiguredStore();
      dispatchSpy = jest.spyOn(store, "dispatch");
      store.dispatch({
        type: GET_SIGNERS,
        payload: [
          { name: "Billy", nickname: "bill@billy.bil" },
          { name: "ABC Pest and Lawn", nickname: "abcpestandlawn@gmail.com" }
        ]
      });

      store.dispatch({
        type: CASE_STATUSES_RETRIEVED,
        payload: [{ name: "Active" }, { name: "Closed" }]
      });

      store.dispatch({
        type: SET_LETTER_TYPE_TO_EDIT,
        payload: {
          id: 1,
          type: "REFERRAL",
          template: "<section>Hello World</section>",
          hasEditPage: true,
          requiresApproval: true,
          defaultSender: {
            name: "Billy",
            nickname: "bill@billy.bil"
          },
          requiredStatus: "Active"
        }
      });

      render(
        <Provider store={store}>
          <Router>
            <LetterTypePage />
            <SharedSnackbarContainer />
          </Router>
        </Provider>
      );
    });

    test("should display existing data on dialog inputs", () => {
      expect(screen.getByTestId("letter-type-input").value).toEqual("REFERRAL");
      expect(
        screen.getByTestId("requires-approval-checkbox").checked
      ).toBeTrue();
      expect(screen.getByTestId("edit-page-checkbox").checked).toBeTrue();
      expect(screen.getByTestId("default-sender-dropdown").value).toEqual(
        "Billy"
      );
      expect(screen.getByTestId("required-status-dropdown").value).toEqual(
        "Active"
      );
    });

    test("should close dialog when cancel is clicked", () => {
      userEvent.click(screen.getByText("Cancel"));
      expect(dispatchSpy).toHaveBeenCalledWith({
        type: CLEAR_LETTER_TYPE_TO_EDIT
      });
    });

    test("should call edit letter type endpoint when save is clicked", async () => {
      const editCall = nock("http://localhost")
        .put("/api/letter-types/1")
        .reply(200, {
          id: 1,
          type: "NEW TYPE",
          template: "<section>Hello World</section>",
          hasEditPage: false,
          requiresApproval: false,
          defaultSender: "abcpestandlawn@gmail.com",
          requiredStatus: "Closed"
        });

      userEvent.click(screen.getByTestId("letter-type-input"));
      userEvent.clear(screen.getByTestId("letter-type-input"));
      userEvent.type(screen.getByTestId("letter-type-input"), "NEW TYPE");

      userEvent.click(screen.getByTestId("requires-approval-checkbox"));
      userEvent.click(screen.getByTestId("edit-page-checkbox"));

      userEvent.click(screen.getByTestId("default-sender-dropdown"));
      userEvent.click(screen.getByText("ABC Pest and Lawn"));

      userEvent.click(screen.getByTestId("required-status-dropdown"));
      userEvent.click(screen.getByText("Closed"));

      userEvent.click(screen.getByText("Save"));

      expect(await screen.findByText("Successfully edited letter type"))
        .toBeInTheDocument;
      expect(editCall.isDone()).toBeTrue();
    });
  });
});
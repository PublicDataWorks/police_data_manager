import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { pactWith } from "jest-pact";
import { like } from "@pact-foundation/pact/src/dsl/matchers";
import createConfiguredStore from "../../client/createConfiguredStore";
import InmateDetails from "../../client/policeDataManager/inmates/InmateDetails";
import SharedSnackbarContainer from "../../client/policeDataManager/shared/components/SharedSnackbarContainer";
import { COMPLAINANT } from "../../sharedUtilities/constants";

pactWith(
  {
    consumer: "complaint-manager.client",
    provider: "complaint-manager.server",
    logLevel: "ERROR",
    timeout: 500000
  },
  provider => {
    beforeAll(async () => {
      axios.defaults.baseURL = provider.mockService.baseUrl;
    });

    describe("Inmate Details Page", () => {
      beforeEach(async () => {
        await provider.addInteraction({
          state: "Case exists",
          uponReceiving: "get case",
          withRequest: {
            method: "GET",
            path: "/api/cases/1"
          },
          willRespondWith: {
            status: 200,
            headers: {
              "Content-Type": "application/json; charset=utf-8"
            },
            body: like({
              id: 1,
              caseReference: "PiC2023-0001"
            })
          }
        });

        render(
          <Provider store={createConfiguredStore()}>
            <Router>
              <InmateDetails
                match={{ params: { id: "1", roleOnCase: COMPLAINANT } }}
              />
              <SharedSnackbarContainer />
            </Router>
          </Provider>
        );
      });

      test("should post to cases/1/inmates when form is filled in", async () => {
        const NOTES = "These are notes!!";
        const FIRSTNAME = "Patrick";
        await provider.addInteraction({
          state: "Case exists",
          uponReceiving: "manually add inmate",
          withRequest: {
            method: "POST",
            path: "/api/cases/1/inmates",
            headers: {
              "Content-type": "application/json"
            },
            body: {
              notes: NOTES,
              roleOnCase: COMPLAINANT,
              firstName: FIRSTNAME
            }
          },
          willRespondWith: {
            status: 200,
            headers: {
              "Content-Type": "application/json; charset=utf-8"
            },
            body: like({
              id: 1,
              notes: NOTES,
              firstName: FIRSTNAME
            })
          }
        });

        userEvent.type(screen.getByTestId("notesField"), NOTES);
        userEvent.type(screen.getByTestId("firstNameField"), FIRSTNAME);
        userEvent.click(screen.getByTestId("inmate-submit-button"));
        expect(
          await screen.findByText(
            "Successfully added Person in Custody to case"
          )
        );
      });
    });
  }
);

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import axios from "axios";
import { pactWith } from "jest-pact";
import { like, eachLike } from "@pact-foundation/pact/src/dsl/matchers";
import createConfiguredStore from "../../client/createConfiguredStore";
import SharedSnackbarContainer from "../../client/policeDataManager/shared/components/SharedSnackbarContainer";
import userEvent from "@testing-library/user-event";
import AdminPortal from "../../client/policeDataManager/admin/AdminPortal";
import { USER_PERMISSIONS, FAKE_USERS } from "../../sharedUtilities/constants";
import moment from "moment";

jest.mock("../../client/policeDataManager/shared/components/FileUpload");

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

    describe("Admin Portal", () => {
      beforeEach(async () => {
        await provider.addInteraction({
          state: "case statuses exist",
          uponReceiving: "get case statuses",
          withRequest: {
            method: "GET",
            path: "/api/case-statuses"
          },
          willRespondWith: {
            status: 200,
            headers: {
              "Content-Type": "application/json; charset=utf-8"
            },
            body: eachLike({
              id: 1,
              name: "Initial",
              orderKey: 0
            })
          }
        });

        await provider.addInteraction({
          state: "letter types have been added to the database",
          uponReceiving: "get letter types",
          withRequest: {
            method: "GET",
            path: "/api/letter-types"
          },
          willRespondWith: {
            status: 200,
            headers: {
              "Content-Type": "application/json; charset=utf-8"
            },
            body: eachLike({
              id: 1,
              type: "REFERRAL",
              template: "TEMPLATE",
              hasEditPage: null,
              requiresApproval: null,
              requiredStatus: "Initial",
              defaultSender: {
                name: "Billy"
              }
            })
          }
        });

        await provider.addInteraction({
          state: "signers have been added to the database",
          uponReceiving: "get signers",
          withRequest: {
            method: "GET",
            path: "/api/signers"
          },
          willRespondWith: {
            status: 200,
            headers: {
              "Content-Type": "application/json; charset=utf-8"
            },
            body: eachLike({
              id: 1,
              name: "John A Simms",
              title: "Independent Police Monitor",
              nickname: "jsimms@oipm.gov",
              phone: "888-576-9922",
              links: [
                {
                  rel: "signature",
                  href: "/api/signers/1/signature"
                },
                {
                  rel: "delete",
                  href: "/api/signers/1",
                  method: "delete"
                }
              ]
            })
          }
        });

        await provider.addInteraction({
          state: "signers have been added to the database",
          uponReceiving: "get signature",
          withRequest: {
            method: "GET",
            path: "/api/signers/1/signature"
          },
          willRespondWith: {
            status: 200,
            headers: {
              "Content-Type": "image/png"
            },
            body: like(Buffer.from("bytes", "base64").toString("base64"))
          }
        });

        let store = createConfiguredStore();
        store.dispatch({
          type: "AUTH_SUCCESS",
          userInfo: { permissions: [USER_PERMISSIONS.ADMIN_ACCESS] }
        });

        render(
          <Provider store={store}>
            <Router>
              <AdminPortal />
              <SharedSnackbarContainer />
            </Router>
          </Provider>
        );
      });

      describe("Signatures", () => {
        test("should show signatures saved in the database", async () => {
          await Promise.all([
            screen.findByText("John A Simms"),
            screen.findByText("888-576-9922"),
            screen.findByText("Independent Police Monitor")
          ]);

          await screen.findByAltText("The signature of John A Simms");
        });

        test("on click of add signature save button, should add new signer and signature", async () => {
          moment.prototype.utc = jest
            .fn()
            .mockReturnValue(moment("2011-10-10T10:20:20Z"));
          await provider.addInteraction({
            state: "signer to be added doesn't exist in the database",
            uponReceiving: "post signer",
            withRequest: {
              method: "POST",
              path: "/api/signers",
              headers: {
                "Content-Type": "application/json"
              },
              body: {
                name: "Candy",
                title: "Chief Executive Police Punisher",
                nickname: FAKE_USERS[0].email,
                phone: "777-777-7777",
                signatureFile: "Candy-1318242020000.png"
              }
            },
            willRespondWith: {
              status: 200,
              headers: {
                "Content-Type": "application/json; charset=utf-8"
              },
              body: like({
                id: 1,
                name: "John A Simms",
                title: "Independent Police Monitor",
                nickname: "jsimms@oipm.gov",
                phone: "888-576-9922",
                links: eachLike({
                  rel: "signature",
                  href: "/api/signers/1/signature"
                })
              })
            }
          });

          await provider.addInteraction({
            state: "users exist in the store",
            uponReceiving: "get users",
            withRequest: {
              method: "GET",
              path: "/api/users"
            },
            willRespondWith: {
              status: 200,
              headers: {
                "Content-Type": "application/json; charset=utf-8"
              },
              body: eachLike({
                email: "anna.banana@gmail.com",
                name: "Anna Banana"
              })
            }
          });

          userEvent.click(await screen.findByText("+ Add Signature"));
          const saveButton = await screen.findByText("Save");

          userEvent.click(screen.getByPlaceholderText("Select a user"));
          userEvent.click(await screen.findByText(FAKE_USERS[0].email));
          userEvent.type(screen.getByPlaceholderText("Name"), "Candy");
          userEvent.type(
            screen.getByPlaceholderText("Phone number"),
            "777-777-7777"
          );
          userEvent.type(
            screen.getByPlaceholderText("Role/title"),
            "Chief Executive Police Punisher"
          );

          userEvent.click(saveButton);
          expect(await screen.findByText("File was successfully uploaded"))
            .toBeInTheDocument;
          expect(await screen.findByText("Signer successfully added"))
            .toBeInTheDocument;
        });

        test("on click of edit signature save button, should edit signer and signature", async () => {
          moment.prototype.utc = jest
            .fn()
            .mockReturnValue(moment("2011-10-10T10:20:20Z"));
          await provider.addInteraction({
            state: "signers have been added to the database",
            uponReceiving: "put signer",
            withRequest: {
              method: "PUT",
              path: "/api/signers/1",
              headers: {
                "Content-Type": "application/json"
              },
              body: {
                name: "Candy",
                title: "Chief Executive Police Punisher",
                nickname: "jsimms@oipm.gov",
                phone: "777-777-7777",
                signatureFile: "Candy-1318242020000.png"
              }
            },
            willRespondWith: {
              status: 200,
              headers: {
                "Content-Type": "application/json; charset=utf-8"
              },
              body: like({
                id: 1,
                name: "Candy",
                title: "Chief Executive Police Punisher",
                nickname: "jsimms@oipm.gov",
                phone: "777-777-7777",
                links: eachLike({
                  rel: "signature",
                  href: "/api/signers/1/signature"
                })
              })
            }
          });

          const editButtons = await screen.findAllByText("Edit");
          userEvent.click(editButtons[0]);
          const saveButton = await screen.findByText("Save");

          fireEvent.change(screen.getByPlaceholderText("Name"), {
            target: { value: "Candy" }
          });
          fireEvent.change(screen.getByPlaceholderText("Phone number"), {
            target: { value: "777-777-7777" }
          });
          fireEvent.change(screen.getByPlaceholderText("Role/title"), {
            target: { value: "Chief Executive Police Punisher" }
          });

          userEvent.click(saveButton);
          expect(await screen.findByText("File was successfully uploaded"))
            .toBeInTheDocument;
          expect(await screen.findByText("Signer successfully updated"))
            .toBeInTheDocument;
          expect(await screen.findByText("+ Add Signature"));
        });

        test("on click of remove signature button, should remove signer and signature", async () => {
          moment.prototype.utc = jest
            .fn()
            .mockReturnValue(moment("2011-10-10T10:20:20Z"));
          await provider.addInteraction({
            state: "signers have been added to the database",
            uponReceiving: "delete signature",
            withRequest: {
              method: "DELETE",
              path: "/api/signers/1"
            },
            willRespondWith: {
              status: 204
            }
          });

          const removeButtons = await screen.findAllByText("Remove");
          userEvent.click(removeButtons[0]);
          const saveButton = await screen.findByText("Delete");

          userEvent.click(saveButton);
          expect(await screen.findByText("Signer successfully deleted"))
            .toBeInTheDocument;
        });

        describe("letter types", () => {
          test("should show letter types saved in the database", async () => {
            await Promise.all([
              screen.findByText("REFERRAL"),
              screen.findByText("Billy"),
              screen.findByText("Initial")
            ]);
            userEvent.click(await screen.findByText("REFERRAL"));
            await Promise.all([screen.findByText("Template")]);
          });
        });
      });
    });
  }
);

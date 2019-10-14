import configureInterceptors from "../../../axiosInterceptors/interceptors";
import getAccessToken from "../../../auth/getAccessToken";
import editClassifications from "./editClassifications";
import { snackbarSuccess } from "../../../actionCreators/snackBarActionCreators";
import nock from "nock";

jest.mock("../../../auth/getAccessToken");

describe("editClassifications", () => {
  let dispatch, caseId, requestBody;
  beforeEach(() => {
    caseId = 5;
    dispatch = jest.fn();
    configureInterceptors({ dispatch });
    requestBody = {
      id: 42,
      "Use of Force": true
    };
  });

  test("dispatches snackbar success on success", async () => {
    getAccessToken.mockImplementation(() => "TEST_TOKEN");

    nock("http://localhost", {
      reqheaders: {
        "Content-Type": "application/json",
        Authorization: `Bearer TEST_TOKEN`
      }
    })
      .put(`/api/cases/${caseId}/referral-letter/classifications`, requestBody)
      .reply(200, {});

    await editClassifications(caseId, requestBody)(dispatch);

    expect(dispatch).toHaveBeenCalledWith(
      snackbarSuccess("Classifications were successfully updated")
    );
  });
});

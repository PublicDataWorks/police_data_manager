import configureInterceptors from "../../axiosInterceptors/interceptors";
import getAccessToken from "../../auth/getAccessToken";
import nock from "nock";
import getHeardAboutSourceDropdownValues from "./getHeardAboutSourceDropdownValues";
import { getHeardAboutSourcesSuccess } from "../../actionCreators/heardAboutSourceActionCreators";

jest.mock("../../auth/getAccessToken");

describe("getIntakeSourceDropdownValues", () => {
  const dispatch = jest.fn();
  configureInterceptors({ dispatch });
  const hostname = "http://localhost";
  const apiRoute = "/api/heard-about-sources";

  beforeEach(async () => {
    getAccessToken.mockImplementation(() => "token");
  });

  test("it fetches heard about sources and dispatches them", async () => {
    const responseBody = [[1, "Facebook"], [2, "Friend"], [3, "NOIPM Website"]];

    nock(hostname)
      .get(apiRoute)
      .reply(200, responseBody);

    await getHeardAboutSourceDropdownValues()(dispatch);
    expect(dispatch).toHaveBeenCalledWith(
      getHeardAboutSourcesSuccess(responseBody)
    );
  });
});

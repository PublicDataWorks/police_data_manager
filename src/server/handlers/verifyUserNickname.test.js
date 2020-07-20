import * as httpMocks from "node-mocks-http";
import verifyUserNickname from "./verifyUserNickname";
import { USER_PERMISSIONS } from "../../sharedUtilities/constants";
import mockFflipObject from "../testHelpers/mockFflipObject";

describe("verifyUserNickname", () => {
  let response, next;
  beforeEach(() => {
    response = httpMocks.createResponse();
    next = jest.fn();
  });

  test("should throw error if nickname is missing from user info in the request", async () => {
    const request = httpMocks.createRequest({
      headers: {
        authorization: "Bearer VALID_TOKEN_FORMAT"
      },
      user: {
        scope: "scope"
      }
    });

    await verifyUserNickname(request, response, next);
    expect(next).toHaveBeenCalledWith(new Error("User nickname missing"));
  });

  test("should attach nickname to request when it has been parsed into the user object from the token", async () => {
    const request = httpMocks.createRequest({
      headers: {
        authorization: "Bearer VALID_TOKEN_FORMAT"
      },
      user: {
        "https://noipm-ci.herokuapp.com/nickname": "mrsmith",
        iss: "https://noipm.auth0.com/",
        scope: "scope"
      }
    });

    await verifyUserNickname(request, response, next);
    expect(request.nickname).toEqual("mrsmith");
  });

  test("should throw error if scope is missing from user info in the request", async () => {
    const request = httpMocks.createRequest({
      headers: {
        authorization: "Bearer VALID_TOKEN_FORMAT"
      },
      user: {
        "https://noipm-ci.herokuapp.com/nickname": "mrsmith",
        iss: "https://noipm.auth0.com/"
      }
    });

    await verifyUserNickname(request, response, next);
    expect(next).toHaveBeenCalledWith(new Error("User scope missing"));
  });

  test("should attach permissions to request when it has been parsed", async () => {
    const request = httpMocks.createRequest({
      headers: {
        authorization: "Bearer VALID_TOKEN_FORMAT"
      },
      user: {
        "https://noipm-ci.herokuapp.com/nickname": "suzie",
        iss: "https://noipm.auth0.com/",
        scope: `${USER_PERMISSIONS.UPDATE_ALL_CASE_STATUSES} ${USER_PERMISSIONS.EXPORT_AUDIT_LOG}`
      }
    });
    await verifyUserNickname(request, response, next);
    expect(
      request.permissions.includes(USER_PERMISSIONS.UPDATE_ALL_CASE_STATUSES)
    ).toBeTruthy();
    expect(
      request.permissions.includes(USER_PERMISSIONS.EXPORT_AUDIT_LOG)
    ).toBeTruthy();
  });

  test("should update nickname permission when grant type is 'client-credentials' when feature flag enabled", async () => {
    const request = httpMocks.createRequest({
      headers: {
        authorization: "Bearer VALID_TOKEN_FORMAT"
      },
      user: {
        gty: "client-credentials"
      }
    });
    request.fflip = mockFflipObject({ nonUserAuthenticationFeature: true });

    await verifyUserNickname(request, response, next);

    expect(request.nickname).toEqual("noipm.infrastructure@gmail.com");
    expect(
      request.permissions.includes(USER_PERMISSIONS.UPDATE_ALL_CASE_STATUSES)
    ).toBeTruthy();
    expect(
      request.permissions.includes(USER_PERMISSIONS.EXPORT_AUDIT_LOG)
    ).toBeTruthy();
  });

  test("should not update nickname permission when grant type is 'client-credentials' when feature flag disabled", async () => {
    const request = httpMocks.createRequest({
      headers: {
        authorization: "Bearer VALID_TOKEN_FORMAT"
      },
      user: {
        gty: "client-credentials"
      }
    });
    request.fflip = mockFflipObject({ nonUserAuthenticationFeature: false });

    await verifyUserNickname(request, response, next);

    expect(next).toHaveBeenCalledWith(new Error("User nickname missing"));
  });
});

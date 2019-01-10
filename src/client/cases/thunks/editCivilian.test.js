//TODO can we extract token management, failure dispatch, etc into something common?
import nock from "nock";
import editCivilian from "./editCivilian";
import Civilian from "../../testUtilities/civilian";
import {
  closeEditDialog,
  editCivilianFailed,
  editCivilianSuccess
} from "../../actionCreators/casesActionCreators";
import configureInterceptors from "../../axiosInterceptors/interceptors";
import getAccessToken from "../../auth/getAccessToken";
import RaceEthnicity from "../../testUtilities/raceEthnicity";
import {
  startSubmit,
  stopSubmit,
} from "redux-form";
import { CIVILIAN_FORM_NAME } from "../../../sharedUtilities/constants";

jest.mock("../../auth/getAccessToken", () => jest.fn(() => "TEST_TOKEN"));
jest.mock("../../actionCreators/casesActionCreators", () => ({
  editCivilianSuccess: jest.fn(() => ({ type: "MOCK_EDIT_SUCCESS" })),
  closeEditDialog: jest.fn(() => ({ type: "MOCK_CLOSE" })),
  editCivilianFailed: jest.fn(() => ({ type: "MOCK_EDIT_FAILED" }))
}));

describe("edit civilian thunk", () => {
  const dispatch = jest.fn();
  const responseBody = {};
  let civilian = new Civilian.Builder()
    .defaultCivilian()
    .withCreatedAt("some time")
    .build();
  let responseCivilians;

  beforeEach(() => {
    configureInterceptors({ dispatch });
    dispatch.mockClear();
    const raceEthnicity = new RaceEthnicity.Builder()
      .defaultRaceEthnicity()
      .build();
    civilian = { ...civilian, raceEthnicityId: raceEthnicity.id };
    responseCivilians = [civilian];
  });

  test("should dispatch error action if we get an unrecognized response", async () => {
    nock("http://localhost", {})
      .put(`/api/civilian/${civilian.id}`, civilian)
      .reply(500, responseBody);

    await editCivilian(civilian)(dispatch);

    expect(dispatch).toHaveBeenCalledWith(startSubmit(CIVILIAN_FORM_NAME));
    expect(dispatch).toHaveBeenCalledWith(editCivilianFailed());
    expect(dispatch).toHaveBeenCalledWith(stopSubmit(CIVILIAN_FORM_NAME));
  });

  test("should dispatch success when civilian edit was successful", async () => {
    nock("http://localhost", {
      "Content-Type": "application/json",
      Authorization: `Bearer TEST_TOKEN`
    })
      .put(`/api/civilian/${civilian.id}`, civilian)
      .reply(200, responseCivilians);

    await editCivilian(civilian)(dispatch);

    expect(dispatch).toHaveBeenCalledWith(startSubmit(CIVILIAN_FORM_NAME));
    expect(editCivilianSuccess).toHaveBeenCalledWith(responseCivilians);
    expect(dispatch).toHaveBeenCalledWith(editCivilianSuccess());
    expect(dispatch).toHaveBeenCalledWith(closeEditDialog());
    expect(dispatch).toHaveBeenCalledWith(stopSubmit(CIVILIAN_FORM_NAME));
  });
});

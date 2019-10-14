import { cleanupDatabase } from "../../../../testHelpers/requestTestHelpers";
import httpMocks from "node-mocks-http";
import Case from "../../../../../client/testUtilities/case";
import models from "../../../../models";
import { CASE_STATUS } from "../../../../../sharedUtilities/constants";
import editClassifications from "./editClassifications";

describe("editClassifications", () => {
  let response, request, next, existingCase;

  afterEach(async () => {
    await cleanupDatabase();
  });

  beforeEach(async () => {
    response = httpMocks.createResponse();
    next = jest.fn();

    const caseAttributes = new Case.Builder().defaultCase().withId(undefined);
    existingCase = await models.cases.create(caseAttributes, {
      auditUser: "test"
    });
    await existingCase.update(
      { status: CASE_STATUS.ACTIVE },
      { auditUser: "test" }
    );

    const classifications = [1, 2, null, null];
    const requestBody = {
      classifications: classifications
    };
    request = httpMocks.createRequest({
      method: "PUT",
      headers: {
        authorization: "Bearer token"
      },
      params: { caseId: existingCase.id },
      body: requestBody,
      nickname: "nickname"
    });
    await existingCase.update(
      { status: CASE_STATUS.LETTER_IN_PROGRESS },
      { auditUser: "test" }
    );
  });

  test("saves new classifications", async () => {
    await editClassifications(request, response, next);
    expect(response.statusCode).toEqual(200);
    const caseClassification = await models.case_classification.findAll();
    expect(caseClassification).toIncludeSameMembers([
      expect.objectContaining({
        caseId: existingCase.id,
        newClassificationId: 1
      }),
      expect.objectContaining({
        caseId: existingCase.id,
        newClassificationId: 2
      })
    ]);
  });

  test("clears table when new classifications are updated", async () => {
    await editClassifications(request, response, next);

    const newClassifications = [null, null, 3, 4];
    const requestBody = {
      classifications: newClassifications
    };
    const newRequest = httpMocks.createRequest({
      method: "PUT",
      headers: {
        authorization: "Bearer token"
      },
      params: { caseId: existingCase.id },
      body: requestBody,
      nickname: "nickname"
    });
    await editClassifications(newRequest, response, next);
    expect(response.statusCode).toEqual(200);

    const caseClassification = await models.case_classification.findAll();
    expect(caseClassification).toIncludeSameMembers([
      expect.objectContaining({
        caseId: existingCase.id,
        newClassificationId: 3
      }),
      expect.objectContaining({
        caseId: existingCase.id,
        newClassificationId: 4
      })
    ]);
  });
});

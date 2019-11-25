import { cleanupDatabase } from "../../../testHelpers/requestTestHelpers";
import { createTestCaseWithoutCivilian } from "../../../testHelpers/modelMothers";
import Attachment from "../../../../client/complaintManager/testUtilities/attachment";
import models from "../../../complaintManager/models/index";
import deleteAttachment from "./deleteAttachment";
import { AUDIT_SUBJECT } from "../../../../sharedUtilities/constants";
import auditDataAccess from "../../audits/auditDataAccess";
import { expectedCaseAuditDetails } from "../../../testHelpers/expectedAuditDetails";

const httpMocks = require("node-mocks-http");
const AWS = require("aws-sdk");

jest.mock("aws-sdk");

jest.mock("../../audits/auditDataAccess");

describe("deleteAttachment", function() {
  afterEach(async () => {
    await cleanupDatabase();
  });

  AWS.S3.mockImplementation(() => ({
    deleteObject: () => ({
      promise: jest.fn()
    }),
    config: {
      loadFromPath: jest.fn(),
      update: jest.fn()
    }
  }));

  describe("auditing", () => {
    test("should audit data access when attachment deleted", async () => {
      const existingCase = await createTestCaseWithoutCivilian();

      const attachmentAttributes = new Attachment.Builder()
        .defaultAttachment()
        .withCaseId(existingCase.id)
        .withId(undefined);

      const attachment = await models.attachment.create(attachmentAttributes, {
        auditUser: "tuser"
      });

      const request = httpMocks.createRequest({
        method: "DELETE",
        headers: {
          authorization: "Bearer SOME_MOCK_TOKEN"
        },
        params: {
          caseId: attachment.caseId,
          fileName: attachment.fileName
        },
        nickname: "TEST_USER_NICKNAME"
      });

      const response = httpMocks.createResponse();
      const next = jest.fn();

      await deleteAttachment(request, response, next);

      expect(auditDataAccess).toHaveBeenCalledWith(
        request.nickname,
        existingCase.id,
        AUDIT_SUBJECT.CASE_DETAILS,
        expectedCaseAuditDetails,
        expect.anything()
      );
    });
  });
});

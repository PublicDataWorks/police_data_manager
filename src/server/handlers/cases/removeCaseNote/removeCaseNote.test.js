import * as httpMocks from "node-mocks-http";
import Case from "../../../../client/complaintManager/testUtilities/case";
import models from "../../../complaintManager/models";
import CaseNote from "../../../../client/complaintManager/testUtilities/caseNote";
import removeCaseNote from "./removeCaseNote";
import { cleanupDatabase } from "../../../testHelpers/requestTestHelpers";
import {
  AUDIT_SUBJECT,
  CASE_STATUS,
  MANAGER_TYPE
} from "../../../../sharedUtilities/constants";
import auditDataAccess from "../../audits/auditDataAccess";
import { expectedCaseAuditDetails } from "../../../testHelpers/expectedAuditDetails";
import Notification from "../../../../client/complaintManager/testUtilities/notification";
import { caseNoteOperationsPermitted } from "../helpers/caseNoteOperationsPermitted";
import Boom from "boom";
import { BAD_REQUEST_ERRORS } from "../../../../sharedUtilities/errorMessageConstants";

jest.mock("../../audits/auditDataAccess");
jest.mock("../helpers/caseNoteOperationsPermitted");

describe("RemoveCaseNote unit", () => {
  let createdCase, createdCaseNote, request;

  afterEach(async () => {
    await cleanupDatabase();
  });

  beforeEach(async () => {
    const caseToCreate = new Case.Builder()
      .defaultCase()
      .withId(undefined)
      .withStatus(CASE_STATUS.INITIAL)
      .withComplainantCivilians([])
      .withAttachments([])
      .withAccusedOfficers([])
      .withIncidentLocation(undefined)
      .build();

    createdCase = await models.cases.create(caseToCreate, {
      auditUser: "someone"
    });

    const caseNoteToCreate = new CaseNote.Builder()
      .defaultCaseNote()
      .withCaseId(createdCase.id)
      .build();

    createdCaseNote = await models.case_note.create(caseNoteToCreate, {
      auditUser: "someone"
    });

    request = httpMocks.createRequest({
      method: "DELETE",
      headers: {
        authorization: "Bearer SOME_MOCK_TOKEN"
      },
      params: {
        caseId: createdCase.id,
        caseNoteId: createdCaseNote.id
      },
      nickname: "TEST_USER_NICKNAME"
    });

    caseNoteOperationsPermitted.mockReturnValue(true);
  });

  describe("only remove case notes when operations are permitted", () => {
    test("should return bad request response with not allowed message", async () => {
      const next = jest.fn();
      const response = httpMocks.createResponse();

      caseNoteOperationsPermitted.mockReturnValue(false);

      await removeCaseNote(request, response, next);

      expect(caseNoteOperationsPermitted).toHaveBeenCalledWith(
        request.nickname,
        createdCaseNote.id
      );
      expect(next).toHaveBeenCalledWith(
        Boom.badData(BAD_REQUEST_ERRORS.ACTION_NOT_ALLOWED)
      );
    });
  });

  test("should update case status and case notes in the db after case note removed", async () => {
    const response = httpMocks.createResponse();
    await removeCaseNote(request, response, jest.fn());

    const updatedCase = await models.cases.findOne({
      where: { id: createdCase.id }
    });

    expect(updatedCase).toEqual(
      expect.objectContaining({
        status: CASE_STATUS.ACTIVE
      })
    );

    const updatedCaseNotes = await models.case_note.findAll({
      where: { caseId: createdCase.id }
    });
    expect(updatedCaseNotes).toEqual([]);
  });

  test("should delete case note notifications when case note is removed", async () => {
    const response = httpMocks.createResponse();

    const notificationAttributes = new Notification.Builder()
      .defaultNotification()
      .withCaseNoteId(createdCaseNote.id);

    const notification = await models.notification.create(
      notificationAttributes,
      { auditUser: "someone" }
    );

    await removeCaseNote(request, response, jest.fn());
    const deletedNotification = await models.notification.findOne({
      where: { caseNoteId: createdCaseNote.id },
      paranoid: false
    });

    expect(deletedNotification).toEqual(
      expect.objectContaining({
        caseNoteId: notification.caseNoteId
      })
    );

    expect(deletedNotification).not.toEqual(
      expect.objectContaining({ deletedAt: null })
    );
  });

  describe("auditing", () => {
    test("should audit case notes access when case note removed", async () => {
      const response = httpMocks.createResponse();
      await removeCaseNote(request, response, jest.fn());

      expect(auditDataAccess).toHaveBeenCalledWith(
        request.nickname,
        createdCase.id,
        MANAGER_TYPE.COMPLAINT,
        AUDIT_SUBJECT.CASE_NOTES,
        {
          caseNote: {
            attributes: Object.keys(models.case_note.rawAttributes),
            model: models.case_note.name
          }
        },
        expect.anything()
      );
    });

    test("should audit case details access when case note removed", async () => {
      const response = httpMocks.createResponse();
      await removeCaseNote(request, response, jest.fn());

      expect(auditDataAccess).toHaveBeenCalledWith(
        request.nickname,
        createdCase.id,
        MANAGER_TYPE.COMPLAINT,
        AUDIT_SUBJECT.CASE_DETAILS,
        expectedCaseAuditDetails,
        expect.anything()
      );
    });
  });
});

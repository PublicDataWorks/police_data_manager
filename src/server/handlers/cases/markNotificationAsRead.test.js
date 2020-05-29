import Case from "../../../client/complaintManager/testUtilities/case";
import CaseNote from "../../../client/complaintManager/testUtilities/caseNote";
import Notification from "../../../client/complaintManager/testUtilities/notification";
import markNotificationAsRead from "./markNotificationAsRead";
import { cleanupDatabase } from "../../testHelpers/requestTestHelpers";
const models = require("../../complaintManager/models/index");
const httpMocks = require("node-mocks-http");

describe("mark notification as read", () => {
  let request, response, next, currentCaseNote, currentNotif, currentCase;

  beforeEach(async () => {
    const caseAttributes = new Case.Builder().defaultCase();

    currentCase = await models.cases.create(caseAttributes, {
      auditUser: "tuser"
    });

    const caseNoteAttributes = new CaseNote.Builder()
      .defaultCaseNote()
      .withCaseId(currentCase.id);

    currentCaseNote = await models.case_note.create(caseNoteAttributes, {
      auditUser: "tuser"
    });

    const notificationAttributes = new Notification.Builder()
      .defaultNotification()
      .withCaseNoteId(currentCaseNote.id);

    currentNotif = await models.notification.create(notificationAttributes, {
      auditUser: "tuser"
    });

    request = httpMocks.createRequest({
      method: "GET",
      headers: {
        authorization: "Bearer SOME_MOCK_TOKEN"
      },
      params: {
        notificationId: currentNotif.id
      },
      nickname: "tuser"
    });

    response = httpMocks.createResponse();
    next = jest.fn();
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  test("should mark notification as read", async () => {
    await markNotificationAsRead(request, response, next);

    const notification = await models.notification.findOne({
      where: { id: currentNotif.id }
    });

    expect(notification.get("hasBeenRead")).toEqual(true);
  });
});

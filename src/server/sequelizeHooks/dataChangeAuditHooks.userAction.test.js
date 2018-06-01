import Case from "../../client/testUtilities/case";
import UserAction from "../../client/testUtilities/userAction";
import models from "../models";
import { DATA_CREATED } from "../../sharedUtilities/constants";

describe("dataChangeAuditHooks for userAction", () => {
  afterEach(async () => {
    await models.cases.truncate({ cascade: true, auditUser: true });
    await models.data_change_audit.truncate();
  });

  test("creates audit on userAction creation", async () => {
    const caseAttributes = new Case.Builder()
      .defaultCase()
      .withId(undefined)
      .withIncidentLocation(undefined);
    const existingCase = await models.cases.create(caseAttributes, {
      auditUser: "someone"
    });
    const userActionAttributes = new UserAction.Builder()
      .defaultUserAction()
      .withId(undefined)
      .withCaseId(existingCase.id);
    const userAction = await models.user_action.create(userActionAttributes, {
      auditUser: "someone"
    });

    const audit = await models.data_change_audit.find({
      where: { modelName: "user_action", action: DATA_CREATED }
    });

    expect(audit.caseId).toEqual(existingCase.id);
    expect(audit.modelId).toEqual(userAction.id);
    expect(audit.user).toEqual("someone");
  });
});

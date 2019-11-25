import Case from "../../client/complaintManager/testUtilities/case";
import models from "../complaintManager/models";
import ReferralLetterCaseClassification from "../../client/complaintManager/testUtilities/ReferralLetterCaseClassification";
import { cleanupDatabase } from "../testHelpers/requestTestHelpers";
import { AUDIT_ACTION } from "../../sharedUtilities/constants";

describe("dataChangeAuditHooks creates referral letter case classification", () => {
  let existingCase, classification, caseClassification;

  beforeEach(async () => {
    const caseAttributes = new Case.Builder().defaultCase().withId(undefined);
    existingCase = await models.cases.create(caseAttributes, {
      auditUser: "someone"
    });

    classification = await models.classification.create(
      {
        id: 1,
        name: "Weird",
        message: "Jacob is immature"
      },
      { auditUser: "Wanchenlearn" }
    );

    const caseClassificationAttributes = new ReferralLetterCaseClassification.Builder()
      .defaultReferralLetterCaseClassification()
      .withCaseId(existingCase.id)
      .withClassificationId(classification.id);
    caseClassification = await models.case_classification.create(
      caseClassificationAttributes,
      {
        auditUser: "test"
      }
    );
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  test("creates an audit for creating a case classification", async () => {
    const audit = await models.audit.findOne({
      where: { auditAction: AUDIT_ACTION.DATA_CREATED },
      include: [
        {
          as: "dataChangeAudit",
          model: models.data_change_audit,
          where: {
            modelName: "case_classification"
          }
        }
      ]
    });

    expect(audit.caseId).toEqual(existingCase.id);
    expect(audit.dataChangeAudit.modelId).toEqual(caseClassification.id);
    expect(audit.dataChangeAudit.modelDescription).toEqual([
      { "Classification Name": classification.name },
      { Message: classification.message }
    ]);
    expect(audit.dataChangeAudit.changes.classification).toEqual({
      new: classification.name
    });
    expect(audit.dataChangeAudit.snapshot.classification).toEqual(
      classification.name
    );
    expect(audit.dataChangeAudit.snapshot.classificationId).toEqual(
      classification.id
    );
    expect(audit.user).toEqual("test");
  });
});

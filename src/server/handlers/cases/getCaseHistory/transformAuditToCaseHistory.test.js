import {
  CASE_STATUS,
  AUDIT_ACTION,
  CIVILIAN_INITIATED,
  RANK_INITIATED,
  ADDRESSABLE_TYPE
} from "../../../../sharedUtilities/constants";
import DataChangeAudit from "../../../../client/testUtilities/dataChangeAudit";
import transformAuditToCaseHistory from "./transformAuditToCaseHistory";

describe("transformAuditToCaseHistory", () => {
  test("it returns case history for given audits", () => {
    const dataChangeAudit = new DataChangeAudit.Builder()
      .defaultDataChangeAudit()
      .withModelName("Case Officer")
      .withModelDescription("Jasmine Rodda")
      .withModelId(5)
      .withCaseId(5)
      .withAction(AUDIT_ACTION.DATA_UPDATED)
      .withChanges({
        firstName: { previous: "Emily", new: "Jasmine" }
      })
      .withUser("bob")
      .withCreatedAt(new Date("2018-06-12"));

    const caseHistories = transformAuditToCaseHistory([dataChangeAudit]);

    expect(caseHistories).toEqual([
      expect.objectContaining({
        user: dataChangeAudit.user,
        action: "Case Officer Updated",
        details: {
          "First Name": { previous: "Emily", new: "Jasmine" }
        },
        modelDescription: "Jasmine Rodda",
        timestamp: dataChangeAudit.createdAt,
        id: expect.anything()
      })
    ]);
  });

  test("it transforms multiple entries in the changes field", () => {
    const auditChanges = {
      complaintType: { previous: CIVILIAN_INITIATED, new: RANK_INITIATED },
      status: { previous: CASE_STATUS.INITIAL, new: CASE_STATUS.ACTIVE }
    };
    const audit = new DataChangeAudit.Builder()
      .defaultDataChangeAudit()
      .withChanges(auditChanges);
    const caseHistories = transformAuditToCaseHistory([audit], []);

    const expectedDetails = {
      "Complaint Type": { previous: CIVILIAN_INITIATED, new: RANK_INITIATED },
      Status: { previous: CASE_STATUS.INITIAL, new: CASE_STATUS.ACTIVE }
    };
    expect(caseHistories[0].details).toEqual(expectedDetails);
  });

  test("it transforms null values or blank string in changes field to single space for readability", () => {
    const auditChanges = {
      complaintType: { previous: null, new: RANK_INITIATED },
      status: { previous: CASE_STATUS.INITIAL, new: null },
      other: { previous: "", new: "something" }
    };
    const audit = new DataChangeAudit.Builder()
      .defaultDataChangeAudit()
      .withChanges(auditChanges);
    const caseHistories = transformAuditToCaseHistory([audit], []);

    const expectedDetails = {
      "Complaint Type": { previous: " ", new: RANK_INITIATED },
      Status: { previous: CASE_STATUS.INITIAL, new: " " },
      Other: { previous: " ", new: "something" }
    };
    expect(caseHistories[0].details).toEqual(expectedDetails);
  });

  test("it transforms true and false values to true or false strings", () => {
    const auditChanges = {
      includeRetaliationConcerns: { new: true, previous: false }
    };
    const audit = new DataChangeAudit.Builder()
      .defaultDataChangeAudit()
      .withChanges(auditChanges);
    const caseHistories = transformAuditToCaseHistory([audit]);

    const expectedDetails = {
      "Include Retaliation Concerns": { previous: "false", new: "true" }
    };

    expect(caseHistories[0].details).toEqual(expectedDetails);
  });

  test("filters out updates to *Id and ^id$ fields but not *id", () => {
    const auditChanges = {
      incident: { previous: null, new: "something" },
      id: { previous: null, new: 6 },
      incidentLocationId: { previous: null, new: 5 }
    };
    const audit = new DataChangeAudit.Builder()
      .defaultDataChangeAudit()
      .withChanges(auditChanges);
    const caseHistories = transformAuditToCaseHistory([audit], []);

    const expectedDetails = {
      Incident: { previous: " ", new: "something" }
    };
    expect(caseHistories[0].details).toEqual(expectedDetails);
  });

  test("filters out updates to lat, lng, and placeId", () => {
    const auditChanges = {
      lat: { previous: 90, new: 100 },
      lng: { previous: 40, new: 45 },
      placeId: { previous: "IEOIELKJSF", new: "OIERU2348" },
      latch: { previous: "door", new: "window" },
      slngs: { previous: "something", new: "something else" }
    };
    const audit = new DataChangeAudit.Builder()
      .defaultDataChangeAudit()
      .withChanges(auditChanges);
    const caseHistories = transformAuditToCaseHistory([audit], []);

    const expectedDetails = {
      Latch: { previous: "door", new: "window" },
      Slngs: { previous: "something", new: "something else" }
    };
    expect(caseHistories[0].details).toEqual(expectedDetails);
  });

  test("filters out addressable type", () => {
    const auditChanges = {
      id: { previous: null, new: 6 },
      city: { previous: null, new: "Chicago" },
      addressableType: { previous: null, new: ADDRESSABLE_TYPE.CASES }
    };
    const audit = new DataChangeAudit.Builder()
      .defaultDataChangeAudit()
      .withChanges(auditChanges);
    const caseHistories = transformAuditToCaseHistory([audit]);

    const expectedDetails = {
      City: { previous: " ", new: "Chicago" }
    };
    expect(caseHistories[0].details).toEqual(expectedDetails);
  });

  test("filters out update audits that are empty after filtering *Id fields", () => {
    const auditChanges = {
      someReferenceId: { previous: 4, new: 5 }
    };
    const audit = new DataChangeAudit.Builder()
      .defaultDataChangeAudit()
      .withAction(AUDIT_ACTION.DATA_UPDATED)
      .withChanges(auditChanges);
    const caseHistories = transformAuditToCaseHistory([audit], []);

    expect(caseHistories).toHaveLength(0);
  });

  test("does not filter out create audits that are empty after filtering *Id fields", () => {
    const auditChanges = {
      incidentLocationId: { previous: null, new: 5 }
    };
    const audit = new DataChangeAudit.Builder()
      .defaultDataChangeAudit()
      .withAction(AUDIT_ACTION.DATA_CREATED)
      .withChanges(auditChanges);
    const caseHistories = transformAuditToCaseHistory([audit], []);

    expect(caseHistories).toHaveLength(1);
    expect(caseHistories[0].details).toEqual({});
  });

  test("does not filter out delete audits that are empty after filtering *Id fields", () => {
    const auditChanges = {
      incidentLocationId: { previous: 5, new: null }
    };
    const audit = new DataChangeAudit.Builder()
      .defaultDataChangeAudit()
      .withAction(AUDIT_ACTION.DATA_DELETED)
      .withChanges(auditChanges);
    const caseHistories = transformAuditToCaseHistory([audit], []);

    expect(caseHistories).toHaveLength(1);
    expect(caseHistories[0].details).toEqual({});
  });

  test("strips html tags from results", () => {
    const auditChanges = {
      note: {
        previous: "<p>something <b>nested</b></p> <div>more</div>",
        new:
          "<b>bold stuff</b> <em>italic stuff</em> This uses the < symbol that shouldn't be deleted. >"
      }
    };
    const audit = new DataChangeAudit.Builder()
      .defaultDataChangeAudit()
      .withAction(AUDIT_ACTION.DATA_UPDATED)
      .withChanges(auditChanges);
    const caseHistories = transformAuditToCaseHistory([audit], []);

    const expectedDetails = {
      Note: {
        previous: "something nested more",
        new:
          "bold stuff italic stuff This uses the < symbol that shouldn't be deleted. >"
      }
    };
    expect(caseHistories).toHaveLength(1);
    expect(caseHistories[0].details).toEqual(expectedDetails);
  });
});

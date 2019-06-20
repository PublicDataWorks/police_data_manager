import {
  AUDIT_ACTION,
  AUDIT_SUBJECT,
  AUDIT_TYPE,
  JOB_OPERATION,
  TIMEZONE
} from "../../../sharedUtilities/constants";
import { cleanupDatabase } from "../../../server/testHelpers/requestTestHelpers";
import parse from "csv-parse/lib/sync";
import timekeeper from "timekeeper";
import moment from "moment-timezone";
import ActionAudit from "../../../client/testUtilities/ActionAudit";
import models from "../../../server/models/index";
import { createTestCaseWithoutCivilian } from "../../../server/testHelpers/modelMothers";
import uploadFileToS3 from "../fileUpload/uploadFileToS3";
import exportAuditLog from "./exportAuditLog";

jest.mock("../fileUpload/uploadFileToS3", () => jest.fn());

describe("exportAuditLog", () => {
  const nickname = "nickName";
  const awsResult = "awsResult";
  const jobDone = jest.fn();
  let job, jobWithDateRange;

  let records = [];

  beforeEach(async () => {
    records = [];
    uploadFileToS3.mockImplementation(
      (jobId, dataToUpload, filename, fileType) => {
        records = parse(dataToUpload, { columns: true });
        return awsResult;
      }
    );
    job = { data: { user: nickname, features: { newAuditFeature: true } } };
    jobWithDateRange = {
      data: {
        user: nickname,
        features: {
          newAuditFeature: true
        },
        dateRange: {
          exportStartDate: "2018-01-01",
          exportEndDate: "2018-12-31"
        }
      }
    };
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  test("should upload audit log csv and return s3 url to done with correct filename", async () => {
    await exportAuditLog(job, jobDone);

    expect(uploadFileToS3).toHaveBeenCalledWith(
      job.id,
      expect.stringContaining(
        "Audit Type,User,Case Database ID,Action,Audit Subject,Subject Database ID,Changes,Audit Details,Timestamp\n"
      ),
      JOB_OPERATION.AUDIT_LOG_EXPORT.filename,
      JOB_OPERATION.AUDIT_LOG_EXPORT.key
    );
    expect(jobDone).toHaveBeenCalledWith(null, awsResult);
  });

  test("should upload audit log csv and return s3 url to done with filename with ranged dates", async () => {
    await exportAuditLog(jobWithDateRange, jobDone);

    const startDateString = moment(
      jobWithDateRange.data.dateRange.exportStartDate
    ).format("YYYY-MM-DD");
    const endDateString = moment(
      jobWithDateRange.data.dateRange.exportEndDate
    ).format("YYYY-MM-DD");

    expect(uploadFileToS3).toHaveBeenCalledWith(
      job.id,
      expect.stringContaining(
        "Audit Type,User,Case Database ID,Action,Audit Subject,Subject Database ID,Changes,Audit Details,Timestamp\n"
      ),
      `${
        JOB_OPERATION.AUDIT_LOG_EXPORT.filename
      }_${startDateString}_to_${endDateString}`,
      JOB_OPERATION.AUDIT_LOG_EXPORT.key
    );
    expect(jobDone).toHaveBeenCalledWith(null, awsResult);
  });

  describe("newAuditFeature enabled", () => {
    test("it includes authentication audit type", async () => {
      const timeOfLogin = new Date("2018-07-01 19:00:22 CDT");
      timekeeper.freeze(timeOfLogin);
      await models.audit.create({
        auditAction: AUDIT_ACTION.LOGGED_IN,
        user: "someuser"
      });

      await exportAuditLog(job, jobDone);

      expect(records.length).toEqual(1);
      const record = records[0];
      expect(record["Audit Type"]).toEqual(AUDIT_TYPE.AUTHENTICATION);
      expect(record["User"]).toEqual("someuser");
      expect(record["Case Database ID"]).toEqual("");
      expect(record["Action"]).toEqual(AUDIT_ACTION.LOGGED_IN);
      expect(record["Audit Subject"]).toEqual("");
      expect(record["Subject Database ID"]).toEqual("");
      expect(record["Changes"]).toEqual("");
      expect(record["Audit Details"]).toEqual("");
      expect(record["Timestamp"]).toEqual(
        moment(timeOfLogin)
          .tz(TIMEZONE)
          .format("MM/DD/YYYY HH:mm:ss z")
      );
      timekeeper.reset();
    });

    test("handle date ranges in local timezone", async () => {
      const timezoneJob = {
        data: {
          user: nickname,
          features: {
            newAuditFeature: true
          },
          dateRange: {
            exportStartDate: "2000-01-01",
            exportEndDate: "2000-02-03"
          }
        }
      };

      await models.audit.create({
        auditAction: AUDIT_ACTION.LOGGED_IN,
        user: "dough",
        createdAt: moment.tz("1999-12-31 23:59:59", TIMEZONE)
      });
      await models.audit.create({
        auditAction: AUDIT_ACTION.LOGGED_IN,
        user: "basil",
        createdAt: moment.tz("2000-01-01 00:00:00", TIMEZONE)
      });
      await models.audit.create({
        auditAction: AUDIT_ACTION.LOGGED_IN,
        user: "mom",
        createdAt: moment.tz("2000-02-03 23:59:00", TIMEZONE)
      });
      await models.audit.create({
        auditAction: AUDIT_ACTION.LOGGED_IN,
        user: "bruce",
        createdAt: moment.tz("2000-02-04 00:00:00", TIMEZONE)
      });

      await exportAuditLog(timezoneJob, jobDone);

      expect(records.length).toEqual(2);

      expect(records).toEqual([
        expect.objectContaining({ User: "mom" }),
        expect.objectContaining({ User: "basil" })
      ]);
    });
  });

  describe("newAuditFeature disabled", () => {
    beforeEach(() => {
      job = { data: { user: nickname } };
      jobWithDateRange = {
        data: {
          user: nickname,
          dateRange: {
            exportStartDate: "2018-01-01",
            exportEndDate: "2018-12-31"
          }
        }
      };
    });

    test("it includes export audit type", async () => {
      const timeOfExport = new Date("2018-07-01 19:00:22 CDT");
      timekeeper.freeze(timeOfExport);
      await models.action_audit.create({
        auditType: AUDIT_TYPE.EXPORT,
        action: AUDIT_ACTION.EXPORTED,
        subject: AUDIT_SUBJECT.AUDIT_LOG,
        caseId: null,
        user: "someuser"
      });

      await exportAuditLog(job, jobDone);

      expect(records.length).toEqual(1);
      const record = records[0];
      expect(record["Audit Type"]).toEqual(AUDIT_TYPE.EXPORT);
      expect(record["User"]).toEqual("someuser");
      expect(record["Case Database ID"]).toEqual("");
      expect(record["Action"]).toEqual(AUDIT_ACTION.EXPORTED);
      expect(record["Audit Subject"]).toEqual(AUDIT_SUBJECT.AUDIT_LOG);
      expect(record["Subject Database ID"]).toEqual("");
      expect(record["Changes"]).toEqual("");
      expect(record["Audit Details"]).toEqual("");
      expect(record["Timestamp"]).toEqual(
        moment(timeOfExport)
          .tz(TIMEZONE)
          .format("MM/DD/YYYY HH:mm:ss z")
      );
      timekeeper.reset();
    });

    test("includes login action audits", async () => {
      const actionAuditAttributes = new ActionAudit.Builder()
        .defaultActionAudit()
        .withAuditType(AUDIT_TYPE.AUTHENTICATION)
        .withAction(AUDIT_ACTION.LOGGED_IN)
        .withCaseId(undefined)
        .withId(undefined)
        .withSubject(undefined)
        .withCreatedAt(new Date("2018-06-01 19:00:22 CDT"));
      await models.action_audit.create(actionAuditAttributes);

      const timeOfExport = new Date("2018-07-01 19:00:22 CDT");
      timekeeper.freeze(timeOfExport);

      await exportAuditLog(job, jobDone);

      expect(records.length).toEqual(1);

      const loginRecord = records[0];
      expect(loginRecord["Audit Type"]).toEqual(AUDIT_TYPE.AUTHENTICATION);
      expect(loginRecord["User"]).toEqual(actionAuditAttributes.user);
      expect(loginRecord["Case Database ID"]).toEqual("");
      expect(loginRecord["Action"]).toEqual(AUDIT_ACTION.LOGGED_IN);
      expect(loginRecord["Audit Subject"]).toEqual("");
      expect(loginRecord["Subject Database ID"]).toEqual("");
      expect(loginRecord["Changes"]).toEqual("");
      expect(loginRecord["Audit Details"]).toEqual("");
      expect(loginRecord["Timestamp"]).toEqual(
        moment(actionAuditAttributes.createdAt)
          .tz(TIMEZONE)
          .format("MM/DD/YYYY HH:mm:ss z")
      );
    });

    test("includes data change audit export", async () => {
      const timeOfExport = new Date("2018-07-01 19:00:22 CDT");
      timekeeper.freeze(timeOfExport);

      const createdCase = await createTestCaseWithoutCivilian("nickname");

      await models.legacy_data_change_audit.findOne({
        where: { caseId: createdCase.id }
      });

      await exportAuditLog(job, jobDone);

      expect(records.length).toEqual(1);

      const dataChangeRecord = records[0];
      expect(dataChangeRecord["Audit Type"]).toEqual(AUDIT_TYPE.DATA_CHANGE);
      expect(dataChangeRecord["User"]).toEqual("nickname");
      expect(dataChangeRecord["Case Database ID"]).toEqual(`${createdCase.id}`);
      expect(dataChangeRecord["Action"]).toEqual("Created");
      expect(dataChangeRecord["Audit Subject"]).toEqual("Case");
      expect(dataChangeRecord["Subject Database ID"]).toEqual(
        `${createdCase.id}`
      );
      expect(dataChangeRecord["Changes"]).toEqual("");
      expect(dataChangeRecord["Timestamp"]).toEqual(
        moment(timeOfExport)
          .tz(TIMEZONE)
          .format("MM/DD/YYYY HH:mm:ss z")
      );
      timekeeper.reset();
    });

    test("includes data change audit changes and snapshot transformation", async () => {
      await models.legacy_data_change_audit.create({
        auditType: AUDIT_TYPE.DATA_CHANGE,
        user: "smith",
        action: AUDIT_ACTION.DATA_UPDATED,
        snapshot: {
          id: 5,
          name: "bob"
        },
        caseId: 1,
        modelName: "Case",
        changes: { name: { previous: "greg II", new: "bob" } },
        modelId: 20
      });

      await exportAuditLog(job, jobDone);

      expect(records.length).toEqual(1);

      const dataChangeRecord = records[0];
      expect(dataChangeRecord["Audit Type"]).toEqual(AUDIT_TYPE.DATA_CHANGE);
      expect(dataChangeRecord["User"]).toEqual("smith");
      expect(dataChangeRecord["Action"]).toEqual(AUDIT_ACTION.DATA_UPDATED);
      expect(dataChangeRecord["Changes"]).toEqual(
        "Name changed from 'greg II' to 'bob'"
      );
      expect(dataChangeRecord["Audit Details"]).toEqual(
        `Case Id: 5\nName: bob`
      );
    });

    test("handle date ranges in local timezone", async () => {
      const timezoneJob = {
        data: {
          user: nickname,
          dateRange: {
            exportStartDate: "2000-01-01",
            exportEndDate: "2000-02-03"
          }
        }
      };

      await models.action_audit.create({
        auditType: AUDIT_TYPE.EXPORT,
        action: AUDIT_ACTION.EXPORTED,
        subject: AUDIT_SUBJECT.AUDIT_LOG,
        caseId: null,
        user: "fish",
        createdAt: moment.tz("1999-12-31 23:59:59", TIMEZONE)
      });
      await models.action_audit.create({
        auditType: AUDIT_TYPE.EXPORT,
        action: AUDIT_ACTION.EXPORTED,
        subject: AUDIT_SUBJECT.AUDIT_LOG,
        caseId: null,
        user: "basil",
        createdAt: moment.tz("2000-01-01 00:00:00", TIMEZONE)
      });
      await models.action_audit.create({
        auditType: AUDIT_TYPE.EXPORT,
        action: AUDIT_ACTION.EXPORTED,
        subject: AUDIT_SUBJECT.AUDIT_LOG,
        caseId: null,
        user: "riley",
        createdAt: moment.tz("2000-02-03 23:59:00", TIMEZONE)
      });
      await models.action_audit.create({
        auditType: AUDIT_TYPE.EXPORT,
        action: AUDIT_ACTION.EXPORTED,
        subject: AUDIT_SUBJECT.AUDIT_LOG,
        caseId: null,
        user: "bruce",
        createdAt: moment.tz("2000-02-04 00:00:00", TIMEZONE)
      });

      await exportAuditLog(timezoneJob, jobDone);

      expect(records.length).toEqual(2);

      expect(records).toEqual([
        expect.objectContaining({ User: "riley" }),
        expect.objectContaining({ User: "basil" })
      ]);
    });
  });
});

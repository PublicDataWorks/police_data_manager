import app from "../../server/server";
import { Verifier } from "@pact-foundation/pact";
import path from "path";
import { cleanupDatabase } from "../../server/testHelpers/requestTestHelpers";
import models from "../../server/policeDataManager/models";
import Case from "../../sharedTestHelpers/case";
import Officer from "../../sharedTestHelpers/Officer";
import CaseOfficer from "../../sharedTestHelpers/caseOfficer";
import { ACCUSED, CASE_STATUS, COMPLAINANT } from "../../sharedUtilities/constants";
import IntakeSource from "../../server/testHelpers/intakeSource";
import ReferralLetterCaseClassification from "../../sharedTestHelpers/ReferralLetterCaseClassification";
import ReferralLetter from "../../server/testHelpers/ReferralLetter";
import LetterOfficer from "../../server/testHelpers/LetterOfficer";
import { updateCaseStatus } from "../../server/handlers/data/queries/queryHelperFunctions";
import { random } from "lodash";
import Civilian from "../../sharedTestHelpers/civilian";

jest.mock(
  "../../server/handlers/cases/referralLetters/sharedLetterUtilities/uploadLetterToS3",
  () => jest.fn()
);

const AWS = require("aws-sdk");
jest.mock("aws-sdk");

let s3 = AWS.S3.mockImplementation(() => ({
  config: {
    loadFromPath: jest.fn(),
    update: jest.fn()
  },
  getObject: jest.fn((opts, callback) =>
    callback(undefined, {
      ContentType: "image/bytes",
      Body: {
        toString: () => "bytesbytesbytes"
      }
    })
  )
}));

const setupCase = async () => {
  try {
    models.cases.destroy({ where: {}, truncate: true, auditUser: "user" });

    const intakeSource = await models.intake_source.create(
      new IntakeSource.Builder().defaultIntakeSource().withId(random(5, 99999)),
      { auditUser: "user" }
    );

    const c = await models.cases.create(
      new Case.Builder()
        .defaultCase()
        .withId(1)
        .withComplaintType("Civilian Within NOPD Initiated")
        .withIntakeSourceId(intakeSource.id),
      {
        auditUser: "user"
      }
    );

    const officer = await models.officer.create(
      new Officer.Builder().defaultOfficer(),
      { auditUser: "user" }
    );

    const caseOfficer = await models.case_officer.create(
      new CaseOfficer.Builder()
        .defaultCaseOfficer()
        .withOfficerId(officer.id)
        .withCaseId(c.id)
        .withRoleOnCase(COMPLAINANT),
      { auditUser: "user" }
    );

    return c;
  } catch (e) {
    console.log(e);
  }
};

const setupLetter = async letterCase => {
  try {
    await updateCaseStatus(letterCase, CASE_STATUS.READY_FOR_REVIEW);

    const letter = await models.referral_letter.create(
      new ReferralLetter.Builder()
        .defaultReferralLetter()
        .withCaseId(letterCase.id)
        .withRecipient("King of all police")
        .withRecipientAddress("100 Main Street, North Pole")
        .withSender("The aggrieved party"),
      { auditUser: "user" }
    );
    return letter;
  } catch (e) {
    console.log(e);
  }
};

const addCivilianComplainantToCase = async theCase => {
  return await models.civilian.create(
    new Civilian.Builder()
    .defaultCivilian()
    .withCaseId(theCase.id)
    .withRoleOnCase(COMPLAINANT)
    .build(),
    {auditUser: "user"}
    );
}

const addOfficerHistoryToReferralLetter = async letter => {
  const officer = await models.officer.create(
    new Officer.Builder().defaultOfficer().withId(78291).withOfficerNumber(27),
    { auditUser: "user" }
  );

  const caseOfficer = await models.case_officer.create(
    new CaseOfficer.Builder()
      .defaultCaseOfficer()
      .withOfficerId(officer.id)
      .withCaseId(letter.caseId)
      .withRoleOnCase(ACCUSED)
      .withId(64),
    { auditUser: "user" }
  );
  
  const officerHistory = await models.officer_history_option.create(
    {name: "yes"},
    {auditUser: "user"}
  );

  const letterOfficer = await models.letter_officer.create(
    new LetterOfficer.Builder()
    .defaultLetterOfficer()
    .withCaseOfficerId(caseOfficer.id)
    .withOfficerHistoryOptionId(officerHistory.id),
    {auditUser: "user"}
  );
  return letterOfficer;
}
const addClassificationsToCase = async theCase => {
    const classification = await models.classification.create(
     {id: 1, name: "spongebob", message: "i'm ready"},
     {auditUser: "user"}
    );

    await models.case_classification.create(
      new ReferralLetterCaseClassification.Builder()
      .defaultReferralLetterCaseClassification()
      .withCaseId(theCase.id)
      .withClassificationId(1),
      {auditUser: "user"}
    );
}

describe("Pact Verification", () => {
  let server;
  beforeAll(() => {
    server = app.listen(8989);
  });

  afterAll(async () => {
    await cleanupDatabase();
    await models.sequelize.close();
    await server.close();
  });

  test("validates the expectations of get case details", async () => {
    const opts = {
      logLevel: "INFO",
      providerBaseUrl: "http://localhost:8989",
      provider: "complaint-manager.server",
      providerVersion: "1.0.0",
      pactUrls: [
        path.resolve(
          __dirname,
          "../../../pact/pacts/complaint-manager.client-complaint-manager.server.json"
        )
      ],
      stateHandlers: {
        "Case exists": async () => {
          await cleanupDatabase();
          await setupCase();
        },
        "letter is ready for review": async () => {
          await cleanupDatabase();
          const letterCase = await setupCase();
          await setupLetter(letterCase);
        },
        "letter is ready for review: officer history added": async () => {
          await cleanupDatabase();
          const letterCase = await setupCase();
          const letter = await setupLetter(letterCase);
          await addOfficerHistoryToReferralLetter(letter);
        },
        "letter is ready for review: officer history added: classifications added": async () => {
          await cleanupDatabase();
          const letterCase = await setupCase();
          const letter = await setupLetter(letterCase);
          try {
            await addOfficerHistoryToReferralLetter(letter);
            await addClassificationsToCase(letterCase);
          } catch(e) {
            console.log(e);
            throw e;
          }
        },
        "letter is ready for review: with civilian complainant": async () => {
          await cleanupDatabase();
          const letterCase = await setupCase();
          await setupLetter(letterCase);
          await addCivilianComplainantToCase(letterCase);
        }
      }

    };

    const output = await new Verifier(opts).verifyProvider();
    console.log(output);
  });
});

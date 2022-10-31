import generateLetterPdfBuffer, {
  generateLetterPdfHtml,
  getLetterData
} from "./generateLetterPdfBuffer";
import fs from "fs";
import LetterType from "../../../../sharedTestHelpers/letterType";
import { retrieveSignatureImageBySigner } from "./retrieveSignatureImage";
import timekeeper from "timekeeper";
import models from "../../../policeDataManager/models";
import { cleanupDatabase } from "../../../testHelpers/requestTestHelpers";
import Officer from "../../../../sharedTestHelpers/Officer";
import CaseOfficer from "../../../../sharedTestHelpers/caseOfficer";
import Case from "../../../../sharedTestHelpers/case";
import Signer from "../../../../sharedTestHelpers/signer";
import ReferralLetter from "../../../testHelpers/ReferralLetter";
import LetterImage from "../../../../sharedTestHelpers/LetterImage";
import LetterTypeLetterImage from "../../../../sharedTestHelpers/LetterTypeLetterImage";
import {
  COMPLAINANT,
  RANK_INITIATED
} from "../../../../sharedUtilities/constants";
import { up } from "../../../seeders/202206130000-seed-letter-fields";
import { seedStandardCaseStatuses } from "../../../testHelpers/testSeeding";
import moment from "moment";
const SENDER_NAME = "Bobby!";

const AWS = require("aws-sdk");
jest.mock("aws-sdk");

jest.mock("html-pdf", () => ({
  create: (html, pdfOptions) => ({
    toBuffer: callback => {
      callback(null, html);
    }
  })
}));

jest.mock("fs", () => {
  const realFs = jest.requireActual("fs");
  return {
    ...realFs,
    readFileSync: (file, format) => {
      if (format === "base64") {
        return "<<base64 encoded image>>";
      } else {
        return realFs.readFileSync(file, format);
      }
    }
  };
});

describe("generateLetterPdfBuffer", () => {
  let timeOfDownload,
    existingCase,
    referralLetter,
    officer,
    findByPkSpy,
    statuses;

  afterEach(async () => {
    await cleanupDatabase();
    findByPkSpy.mockClear();
    timekeeper.reset();
  });

  afterAll(async () => {
    await models.sequelize.close();
  });

  let referralLetterTemplate;
  let letterBodyTemplate;

  beforeEach(async () => {
    await cleanupDatabase();
    findByPkSpy = jest.spyOn(models.cases, "findByPk");
    await cleanupDatabase();
    const signer = new Signer.Builder()
      .defaultSigner()
      .withName(SENDER_NAME)
      .build();
    await models.sequelize.transaction(async transaction => {
      await models.signers.create(signer, { auditUser: "user", transaction });
    });

    statuses = await seedStandardCaseStatuses();

    referralLetterTemplate = fs.readFileSync(
      `${process.env.REACT_APP_INSTANCE_FILES_DIR}/referralLetterPdf.tpl`
    );

    letterBodyTemplate = fs.readFileSync(
      `${process.env.REACT_APP_INSTANCE_FILES_DIR}/letterBody.tpl`
    );
    await models.letter_types.create(
      new LetterType.Builder()
        .defaultLetterType()
        .withEditableTemplate(letterBodyTemplate.toString())
        .withType("REFERRAL")
        .withDefaultSender(signer)
        .withRequiredStatus(statuses[0])
        .withTemplate(referralLetterTemplate.toString())
        .build(),
      { auditUser: "test" }
    );

    await models.letter_types.create(
      new LetterType.Builder()
        .defaultLetterType()
        .withId(9999)
        .withType("COMPLAINANT")
        .withDefaultSender(signer)
        .withRequiredStatus(statuses[0])
        .withTemplate("<div></div>")
        .build(),
      { auditUser: "test" }
    );

    const image1 = await models.letterImage.create(
      new LetterImage.Builder().defaultLetterImage().build(),
      { auditUser: "user" }
    );

    const image2 = await models.letterImage.create(
      new LetterImage.Builder()
        .defaultLetterImage()
        .withId(2)
        .withImage("smallIcon.png")
        .build(),
      { auditUser: "user" }
    );

    await models.letterTypeLetterImage.create(
      new LetterTypeLetterImage.Builder()
        .defaultLetterTypeLetterImage()
        .withImageId(image1.id)
        .build(),
      { auditUser: "user" }
    );

    await models.letterTypeLetterImage.create(
      new LetterTypeLetterImage.Builder()
        .defaultLetterTypeLetterImage()
        .withId(2)
        .withImageId(image2.id)
        .withMaxWidth("60px")
        .withName("smallIcon")
        .build(),
      { auditUser: "user" }
    );

    await up(models);

    timeOfDownload = new Date("2018-07-01 12:00:22 CDT");
    timekeeper.freeze(timeOfDownload);

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

    const officerAttributes = new Officer.Builder()
      .defaultOfficer()
      .withId(undefined);

    officer = await models.officer.create(officerAttributes, {
      auditUser: "user"
    });

    const complainantOfficer = new CaseOfficer.Builder()
      .defaultCaseOfficer()
      .withId(undefined)
      .withOfficerId(officer.id)
      .withCreatedAt(new Date("2018-09-22"))
      .withRoleOnCase(COMPLAINANT);

    const caseAttributes = new Case.Builder()
      .defaultCase()
      .withId(12070)
      .withFirstContactDate("2017-12-25")
      .withIncidentDate("2016-01-01")
      .withComplaintType(RANK_INITIATED)
      .withComplainantOfficers([complainantOfficer])
      .withStatus(statuses[0]);
    existingCase = await models.cases.create(caseAttributes, {
      include: [
        {
          model: models.case_officer,
          as: "complainantOfficers",
          auditUser: "someone"
        }
      ],
      auditUser: "someone"
    });

    await existingCase.update(
      {
        statusId: statuses.find(status => status.name === "Letter in Progress")
          .id
      },
      { auditUser: "test" }
    );
  });

  describe("getLetterData", () => {
    test("should sort accused officers by createdAt date", async () => {
      const ID = 12070;

      await models.officer.create(
        new Officer.Builder()
          .defaultOfficer()
          .withId(100)
          .withOfficerNumber(100),
        { auditUser: "user" }
      );

      const officer1 = await models.case_officer.create(
        new CaseOfficer.Builder()
          .defaultCaseOfficer()
          .withCaseId(ID)
          .withId(undefined)
          .withOfficerId(100)
          .withCreatedAt(moment().subtract(3, "days")),
        { auditUser: "user" }
      );

      await models.officer.create(
        new Officer.Builder().defaultOfficer().withId(50).withOfficerNumber(50),
        { auditUser: "user" }
      );

      const officer2 = await models.case_officer.create(
        new CaseOfficer.Builder()
          .defaultCaseOfficer()
          .withCaseId(ID)
          .withId(undefined)
          .withOfficerId(50)
          .withCreatedAt(moment().subtract(2, "days")),
        { auditUser: "user" }
      );

      await models.officer.create(
        new Officer.Builder().defaultOfficer().withId(2).withOfficerNumber(2),
        { auditUser: "user" }
      );

      const officer3 = await models.case_officer.create(
        new CaseOfficer.Builder()
          .defaultCaseOfficer()
          .withCaseId(ID)
          .withId(undefined)
          .withOfficerId(2)
          .withCreatedAt(moment().subtract(1, "days")),
        { auditUser: "user" }
      );

      const TYPE = await models.letter_types.findOne({
        where: { type: "REFERRAL" },
        include: ["fields"]
      });

      const result = await getLetterData(
        ID,
        TYPE.fields.filter(field => field.isForBody)
      );

      expect(result.data.accusedOfficers).toEqual([
        expect.objectContaining({ id: officer1.id }),
        expect.objectContaining({ id: officer2.id }),
        expect.objectContaining({ id: officer3.id })
      ]);
    });
  });

  test("generates letter pdf html correctly", async () => {
    const letterBody = "<p> Letter Body </p>";
    const pdfData = {
      referralLetter: {
        recipient: "Recipient Title and Name",
        recipientAddress: "Recipient Address",
        sender: "Sender Address\n Sender Address Second Line",
        transcribedBy: "Transcriber"
      },
      caseReference: "CC-2011-0099"
    };

    const letterPdfHtml = await generateLetterPdfHtml(
      letterBody,
      pdfData,
      false,
      {
        getSignature: async args => {
          return await retrieveSignatureImageBySigner(args.sender);
        },
        type: "REFERRAL"
      },
      referralLetterTemplate.toString()
    );
    expect(letterPdfHtml).toMatchSnapshot();
  });

  describe("sender is 'sender address'", () => {
    beforeEach(async () => {
      const referralLetterAttributes = new ReferralLetter.Builder()
        .defaultReferralLetter()
        .withId(undefined)
        .withCaseId(existingCase.id)
        .withRecipient("recipient title and name")
        .withRecipientAddress("recipient address")
        .withSender("sender address")
        .withTranscribedBy("transcriber")
        .withIncludeRetaliationConcerns(true);

      referralLetter = await models.referral_letter.create(
        referralLetterAttributes,
        {
          auditUser: "test"
        }
      );
    });

    test("should update case reference prefix to AC when primary complainant is anonymized", async () => {
      await models.case_officer.update(
        {
          isAnonymous: true
        },
        {
          where: {
            officerId: officer.id
          },
          auditUser: "test user"
        }
      );
      await models.sequelize.transaction(async transaction => {
        const pdfResultsAndAuditDetails = await generateLetterPdfBuffer(
          existingCase.id,
          true,
          transaction,
          {
            getSignature: async args => {
              return await retrieveSignatureImageBySigner(args.sender);
            },
            type: "REFERRAL"
          }
        );

        expect(pdfResultsAndAuditDetails.pdfBuffer).toMatchSnapshot();
      });
    });

    test("pdf create gets called with expected letter html when letter is generated", async () => {
      await models.sequelize.transaction(async transaction => {
        const pdfResultsAndAuditDetails = await generateLetterPdfBuffer(
          existingCase.id,
          true,
          transaction,
          {
            getSignature: async args => {
              return await retrieveSignatureImageBySigner(args.sender);
            },
            type: "REFERRAL"
          }
        );
        expect(pdfResultsAndAuditDetails.pdfBuffer).toMatchSnapshot();
      });
    });

    test("pdf create gets called with expected letter html when letter is edited", async () => {
      await referralLetter.update(
        { editedLetterHtml: "Custom Letter HTML" },
        { auditUser: "someone" }
      );

      await models.sequelize.transaction(async transaction => {
        const pdfResultsAndAuditDetails = await generateLetterPdfBuffer(
          existingCase.id,
          true,
          transaction,
          {
            getSignature: async args => {
              return await retrieveSignatureImageBySigner(args.sender);
            },
            type: "REFERRAL"
          }
        );
        expect(pdfResultsAndAuditDetails.pdfBuffer).toMatchSnapshot();
      });
    });

    test("signature is not included when sender is not official sender even if includeSignature is true", async () => {
      await referralLetter.update(
        { editedLetterHtml: "Custom Letter HTML" },
        { auditUser: "someone" }
      );
      await models.sequelize.transaction(async transaction => {
        const pdfResultsAndAuditDetails = await generateLetterPdfBuffer(
          existingCase.id,
          true,
          transaction,
          {
            getSignature: async args => {
              return await retrieveSignatureImageBySigner(args.sender);
            },
            type: "REFERRAL"
          }
        );
        expect(pdfResultsAndAuditDetails.pdfBuffer).toMatchSnapshot();
      });
    });

    test("unedited letter generates pdf from case data", async () => {
      await models.sequelize.transaction(async transaction => {
        await generateLetterPdfBuffer(existingCase.id, false, transaction, {
          getSignature: async args => {
            return await retrieveSignatureImageBySigner(args.sender);
          },
          type: "REFERRAL"
        });
        expect(findByPkSpy).toHaveBeenCalledTimes(2);
      });
    });

    test("edited letter generates pdf from saved data", async () => {
      await referralLetter.update(
        {
          editedLetterHtml: "<p> edited </p>"
        },
        { auditUser: "test" }
      );
      await models.sequelize.transaction(async transaction => {
        await generateLetterPdfBuffer(existingCase.id, false, transaction, {
          getSignature: async args => {
            return await retrieveSignatureImageBySigner(args.sender);
          },
          type: "REFERRAL"
        });
      });
      expect(findByPkSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("sender is official sender", () => {
    beforeEach(async () => {
      const referralLetterAttributes = new ReferralLetter.Builder()
        .defaultReferralLetter()
        .withId(undefined)
        .withCaseId(existingCase.id)
        .withRecipient("recipient title and name")
        .withRecipientAddress("recipient address")
        .withSender(SENDER_NAME)
        .withTranscribedBy("transcriber")
        .withIncludeRetaliationConcerns(true);

      referralLetter = await models.referral_letter.create(
        referralLetterAttributes,
        {
          auditUser: "test"
        }
      );
    });

    test("signature is included when sender is official sender and includeSignature is true", async () => {
      await models.sequelize.transaction(async transaction => {
        const pdfResultsAndAuditDetails = await generateLetterPdfBuffer(
          existingCase.id,
          true,
          transaction,
          {
            getSignature: async args => {
              return await retrieveSignatureImageBySigner(args.sender);
            },
            type: "REFERRAL"
          }
        );
        expect(pdfResultsAndAuditDetails.pdfBuffer).toMatchSnapshot();
      });
    });

    test("signature is not included when includeSignature is false", async () => {
      await models.sequelize.transaction(async transaction => {
        const pdfResultsAndAuditDetails = await generateLetterPdfBuffer(
          existingCase.id,
          false,
          transaction,
          {
            getSignature: async args => {
              return await retrieveSignatureImageBySigner(args.sender);
            },
            type: "REFERRAL"
          }
        );
        expect(pdfResultsAndAuditDetails.pdfBuffer).toMatchSnapshot();
      });
    });
  });
});

import getComplainantLetterPdfData from "./getComplainantLetterPdfData";
import fs from "fs";
import { compareLetter } from "../sharedLetterUtilities/compareLetterPDFTestUtil";
import models from "../../../../policeDataManager/models";
import Signer from "../../../../../sharedTestHelpers/signer";
import LetterType from "../../../../../sharedTestHelpers/letterType";
import LetterTypeLetterImage from "../../../../../sharedTestHelpers/LetterTypeLetterImage";
import LetterImage from "../../../../../sharedTestHelpers/letterImage";
import { cleanupDatabase } from "../../../../testHelpers/requestTestHelpers";
import Case from "../../../../../sharedTestHelpers/case";
import CaseStatus from "../../../../../sharedTestHelpers/caseStatus";
import generateLetterPdfBuffer from "../generateLetterPdfBuffer";
import { retrieveSignatureImage } from "../retrieveSignatureImage";
import { up } from "../../../../seeders/202206130000-seed-letter-fields";

const {
  PERSON_TYPE
} = require(`${process.env.REACT_APP_INSTANCE_FILES_DIR}/constants`);

const AWS = require("aws-sdk");
jest.mock("aws-sdk");

describe("Compare Generated Complainant Letter to Baseline", () => {
  const actualDateNow = Date.now.bind(global.Date);
  beforeEach(async () => {
    await cleanupDatabase();

    await models.caseStatus.create(
      new CaseStatus.Builder().defaultCaseStatus().build(),
      { auditUser: "user" }
    );

    global.Date.now = jest.fn(() => 1530118207007);
    const signerAttr = new Signer.Builder()
      .defaultSigner()
      .withName("Nina Ambroise")
      .withTitle("Acting Police Monitor")
      .withSignatureFile("nina_ambroise.png")
      .build();

    const signer = await models.signers.create(signerAttr, {
      auditUser: "user"
    });

    const complainantLetterTemplate = fs.readFileSync(
      `${process.env.REACT_APP_INSTANCE_FILES_DIR}/complainantLetterPdf.tpl`
    );

    const letterAttr = new LetterType.Builder()
      .defaultLetterType()
      .withType("COMPLAINANT")
      .withTemplate(complainantLetterTemplate.toString())
      .withDefaultSender(signer)
      .build();
    await models.letter_types.create(letterAttr, {
      auditUser: "user"
    });

    const letterAttr2 = new LetterType.Builder()
      .defaultLetterType()
      .withId(783838)
      .withType("REFERRAL")
      .withDefaultSender(signer)
      .build();
    await models.letter_types.create(letterAttr2, {
      auditUser: "user"
    });

    const image1 = await models.letterImage.create(
      new LetterImage.Builder().defaultLetterImage().build(),
      { auditUser: "user" }
    );

    const image2 = await models.letterImage.create(
      new LetterImage.Builder()
        .defaultLetterImage()
        .withId(2)
        .withImage("icon.png")
        .build(),
      { auditUser: "user" }
    );

    await models.letterTypeLetterImage.create(
      new LetterTypeLetterImage.Builder()
        .defaultLetterTypeLetterImage()
        .withLetterId(letterAttr.id)
        .withImageId(image1.id)
        .build(),
      { auditUser: "user" }
    );

    await models.letterTypeLetterImage.create(
      new LetterTypeLetterImage.Builder()
        .defaultLetterTypeLetterImage()
        .withId(2)
        .withLetterId(letterAttr.id)
        .withImageId(image2.id)
        .withMaxWidth("60px")
        .withName("smallIcon")
        .build(),
      { auditUser: "user" }
    );

    await up(models);

    let s3 = AWS.S3.mockImplementation(() => ({
      config: {
        loadFromPath: jest.fn(),
        update: jest.fn()
      },
      getObject: jest.fn((opts, callback) =>
        callback(undefined, {
          ContentType: "image/png",
          Body: {
            toString: () =>
              fs.readFileSync(
                process.cwd() + `/localstack-seed-files/${opts.Key}`,
                "base64"
              )
          }
        })
      )
    }));
  });

  test("src/testPDFs/complainantLetter.pdf should match baseline (instance-files/tests/basePDFs/complainantLetter.pdf); pngs saved in src/testPDFs", async () => {
    const existingCase = await models.cases.create(
      new Case.Builder()
        .defaultCase()
        .withId(1)
        .withFirstContactDate("2020-01-01")
        .build(),
      { auditUser: "nickname" }
    );

    const complainant = {
      civilianTitle: {
        name: "Bobby"
      },
      firstName: "Bob",
      lastName: "Loblaw",
      address: "123 Loblaw Lane",
      email: "bob@bobloblawslawblog.net",
      officerId: "9393448",
      caseEmployeeType: PERSON_TYPE.CIVILIAN_WITHIN_PD.employeeDescription
    };

    let buffer = await models.sequelize.transaction(async transaction => {
      let result = await generateLetterPdfBuffer(
        existingCase.id,
        true,
        transaction,
        {
          getSignature: async ({ sender }) => {
            return await retrieveSignatureImage(
              sender ? sender.signatureFile : undefined
            );
          },
          type: "COMPLAINANT"
        },
        await getComplainantLetterPdfData(complainant)
      );
      return result.pdfBuffer;
    });
    let file = process.cwd() + "/src/testPDFs/complainantLetter.pdf";
    fs.writeFileSync(file, buffer);

    const result = await compareLetter("complainantLetter.pdf");
    expect(result.status).toEqual("passed");
  });

  afterEach(async () => {
    global.Date.now = actualDateNow;
    await cleanupDatabase();
  });
});

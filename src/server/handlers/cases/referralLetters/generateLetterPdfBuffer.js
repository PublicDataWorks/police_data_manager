import models from "../../../policeDataManager/models";
import generatePdfBuffer from "./sharedLetterUtilities/generatePdfBuffer";
import Handlebars from "handlebars";
import getQueryAuditAccessDetails, {
  combineAuditDetails
} from "../../audits/getQueryAuditAccessDetails";
import { retrieveLetterImage } from "./retrieveLetterImage";
import { ASCENDING } from "../../../../sharedUtilities/constants";
require("../../../handlebarHelpers");

const generateLetterPdfBuffer = async (
  caseId,
  includeSignature,
  transaction,
  letterSettings,
  extraData = {}
) => {
  let letterBody, letterType, auditDetails;

  if (letterSettings.letter?.letterType) {
    letterType = letterSettings.letter.letterType;
  } else if (letterSettings.type) {
    letterType = await models.letter_types.findOne({
      where: { type: letterSettings.type },
      include: [
        {
          model: models.letterTypeLetterImage,
          as: "letterTypeLetterImage"
        }
      ]
    });
  }

  let queryOptions = {};
  if (letterType.editableTemplate) {
    let letterData;
    if (letterSettings.letter) {
      letterData = letterSettings.letter;
    } else {
      queryOptions = {
        where: { caseId },
        attributes: ["editedLetterHtml"],
        transaction
      };
      letterData = await models.referral_letter.findOne(queryOptions);
    }
    letterBody = letterData?.editedLetterHtml;

    ({ html: letterBody, auditDetails } = await determineLetterBody(
      letterBody,
      () =>
        getQueryAuditAccessDetails(
          queryOptions,
          letterSettings.letter ? models.letter : models.referral_letter.name
        ),
      letterType,
      caseId,
      transaction
    ));
  }

  const pdfDataAndAuditDetails = await getLetterData(caseId);
  let pdfData = { ...pdfDataAndAuditDetails.data, ...extraData };
  const pdfDataAuditDetails = pdfDataAndAuditDetails.auditDetails;

  if (letterSettings.letter) {
    const { sender, recipient, recipientAddress, transcribedBy } =
      letterSettings.letter;
    pdfData = {
      ...pdfData,
      sender,
      recipient,
      recipientAddress,
      transcribedBy
    };
  }

  const fullLetterHtml = await generateLetterPdfHtml(
    letterBody,
    pdfData,
    includeSignature,
    letterSettings,
    letterType
  );

  auditDetails = auditDetails
    ? combineAuditDetails(auditDetails, pdfDataAuditDetails)
    : pdfDataAuditDetails;

  return {
    pdfBuffer: await generatePdfBuffer(fullLetterHtml),
    auditDetails: auditDetails
  };
};

export const generateLetterPdfHtml = async (
  letterBody,
  pdfData,
  includeSignature,
  letterSettings,
  letterType
) => {
  const currentDate = Date.now();

  let sender = pdfData.sender || pdfData.referralLetter?.sender;
  let signature = includeSignature
    ? await letterSettings.getSignature({ sender })
    : "<p><br></p>";

  let imageTypes = {};
  const letterPromises = letterType?.letterTypeLetterImage.map(
    async imageType => {
      let letterImage = await models.letterImage.findAll({
        where: { id: imageType.imageId }
      });

      await Promise.all(
        letterImage.map(async image => {
          if (!imageTypes[imageType.name]) {
            imageTypes[imageType.name] = await retrieveLetterImage(
              image.image,
              `max-width: ${imageType.maxWidth}`
            );
          }
        })
      );
    }
  );

  await Promise.all(letterPromises);

  const letterPdfData = {
    ...pdfData,
    letterBody,
    signature,
    currentDate,
    ...imageTypes
  };

  const compiledTemplate = Handlebars.compile(letterType.template);
  return compiledTemplate(letterPdfData);
};

export const determineLetterBody = async (
  letterBody,
  auditIfEdited,
  letterType,
  caseId,
  transaction
) => {
  let auditDetails, html;
  console.log("letterBody in determineLetterBody: ", letterBody);
  if (letterBody) {
    html = letterBody;
    auditDetails = auditIfEdited();
  } else {
    const letterDataResults = await getLetterData(caseId);
    const compiledTemplate = Handlebars.compile(letterType.editableTemplate);
    html = compiledTemplate(letterDataResults.data);
    auditDetails = letterDataResults.auditDetails;
  }

  return { html, auditDetails };
};

export const getLetterData = async caseId => {
  let queryOptions = {
    paranoid: false,
    include: [
      {
        model: models.case_classification,
        as: "caseClassifications",
        include: [
          {
            model: models.classification,
            as: "classification"
          }
        ]
      },
      {
        model: models.intake_source,
        as: "intakeSource"
      },
      {
        model: models.how_did_you_hear_about_us_source,
        as: "howDidYouHearAboutUsSource"
      },
      {
        model: models.district,
        as: "caseDistrict"
      },
      {
        model: models.civilian,
        as: "complainantCivilians",
        include: [
          models.address,
          { model: models.race_ethnicity, as: "raceEthnicity" },
          { model: models.gender_identity, as: "genderIdentity" }
        ]
      },
      {
        model: models.civilian,
        as: "witnessCivilians",
        include: [
          models.address,
          { model: models.race_ethnicity, as: "raceEthnicity" },
          { model: models.gender_identity, as: "genderIdentity" }
        ]
      },
      {
        model: models.attachment
      },
      {
        model: models.address,
        as: "incidentLocation"
      },
      {
        model: models.case_officer,
        as: "accusedOfficers",
        include: [
          {
            model: models.officer_allegation,
            as: "allegations",
            include: [models.allegation]
          },
          {
            model: models.letter_officer,
            as: "letterOfficer",
            include: [
              {
                model: models.referral_letter_officer_history_note,
                as: "referralLetterOfficerHistoryNotes",
                separate: true
              },
              {
                model: models.referral_letter_officer_recommended_action,
                as: "referralLetterOfficerRecommendedActions",
                include: [
                  {
                    model: models.recommended_action,
                    as: "recommendedAction",
                    attributes: ["id", "description", "createdAt", "updatedAt"]
                  }
                ],
                separate: true
              }
            ]
          }
        ]
      },
      {
        model: models.case_officer,
        as: "complainantOfficers"
      },
      {
        model: models.case_officer,
        as: "witnessOfficers"
      },
      {
        model: models.referral_letter,
        as: "referralLetter"
      },
      {
        model: models.caseStatus,
        as: "status",
        attributes: ["id", "name", "orderKey"]
      },
      {
        model: models.complaintTypes,
        as: "complaintType",
        attributes: ["name"]
      }
    ],
    order: [
      [
        { model: models.case_classification, as: "caseClassifications" },
        "createdAt",
        ASCENDING
      ],
      [
        { model: models.case_officer, as: "accusedOfficers" },
        "createdAt",
        ASCENDING
      ],
      [
        { model: models.civilian, as: "complainantCivilians" },
        "createdAt",
        ASCENDING
      ],
      [
        { model: models.case_officer, as: "complainantOfficers" },
        "createdAt",
        ASCENDING
      ],
      [
        { model: models.civilian, as: "witnessCivilians" },
        "createdAt",
        ASCENDING
      ],
      [
        { model: models.case_officer, as: "witnessOfficers" },
        "createdAt",
        ASCENDING
      ]
    ]
  };

  let letterData = await models.cases.findByPk(caseId, queryOptions);

  return {
    data: letterData.toJSON(),
    auditDetails: getQueryAuditAccessDetails(queryOptions, models.cases.name)
  };
};

const sortByCreatedAt = list => {
  if (list) {
    return list.sort((a, b) => a.createdAt - b.createdAt);
  }
};

export default generateLetterPdfBuffer;

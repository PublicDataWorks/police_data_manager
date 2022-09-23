import asyncMiddleware from "../asyncMiddleware";
import models from "../../policeDataManager/models";
import Boom from "boom";
import {
  BAD_REQUEST_ERRORS,
  NOT_FOUND_ERRORS
} from "../../../sharedUtilities/errorMessageConstants";

const editLetterType = asyncMiddleware(async (request, response, next) => {
  // read the id from the request
  const typeId = request.params.typeId;

  // query the database based on that id
  const letterTypePromise = models.letter_types.findByPk(typeId, {
    include: ["defaultSender", "requiredStatus"]
  });

  // if defaultSender is set look up the sender by the nickname and use the id of the sender to update the defaultSenderId field
  let defaultSenderPromise, statusPromise, defaultSender, status;
  if (request.body.defaultSender) {
    defaultSenderPromise = models.signers.findOne({
      where: { nickname: request.body.defaultSender }
    });
  }

  if (request.body.requiredStatus) {
    statusPromise = models.caseStatus.findOne({
      where: { name: request.body.requiredStatus }
    });
  }

  // update the fields that are passed in the body
  let letterType = await letterTypePromise;
  if (!letterType) {
    throw Boom.notFound(NOT_FOUND_ERRORS.RESOURCE_NOT_FOUND);
  }

  await Promise.all(
    Object.keys(letterType.toJSON()).map(async key => {
      if (key === "defaultSenderId" && request.body.defaultSender) {
        defaultSender = await defaultSenderPromise;
        if (!defaultSender) {
          throw Boom.badRequest(BAD_REQUEST_ERRORS.INVALID_SENDER);
        }
        letterType.defaultSenderId = defaultSender.id;
      } else if (key === "requiredStatusId" && request.body.requiredStatus) {
        status = await statusPromise;
        if (!status) {
          throw Boom.badRequest(BAD_REQUEST_ERRORS.INVALID_CASE_STATUS);
        }
        letterType.requiredStatusId = status.id;
      } else if (
        request.body[key] !== null &&
        typeof request.body[key] !== "undefined"
      ) {
        letterType[key] = request.body[key];
      }
    })
  );

  // update the database accordingly
  await letterType.save({ auditUser: request.nickname });
  letterType = await letterType.reload({
    include: ["defaultSender", "requiredStatus"]
  });

  response.status(200).send(letterType.toPayload(letterType));
});

export default editLetterType;
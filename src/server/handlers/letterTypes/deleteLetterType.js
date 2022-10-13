import asyncMiddleware from "../asyncMiddleware";
import models from "../../policeDataManager/models";
import Boom from "boom";
import { NOT_FOUND_ERRORS } from "../../../sharedUtilities/errorMessageConstants";

const deleteLetterType = asyncMiddleware(async (request, response, next) => {
  const letterType = await models.letter_types.findByPk(request.params.typeId);

  if (letterType) {
    await models.letterTypeLetterImage.destroy({
      where: { letterId: request.params.typeId }
    });
    await letterType.destroy();
    response.status(204).send();
  } else {
    throw Boom.notFound(NOT_FOUND_ERRORS.RESOURCE_NOT_FOUND);
  }
});

export default deleteLetterType;

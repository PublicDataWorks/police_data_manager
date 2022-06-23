import {
  AUDIT_SUBJECT,
  MANAGER_TYPE
} from "../../../sharedUtilities/constants";
import asyncMiddleware from "../asyncMiddleware";
import auditDataAccess from "../audits/auditDataAccess";
import models from "../../policeDataManager/models";
import getQueryAuditAccessDetails from "../audits/getQueryAuditAccessDetails";

const getSigners = asyncMiddleware(async (request, response, next) => {
  const queryOptions = {
    attributes: ["id", "name", "nickname", "title", "phone"]
  };
  const signers = await models.signers.findAll(queryOptions);

  auditDataAccess(
    request.nickname,
    null,
    MANAGER_TYPE.COMPLAINT,
    AUDIT_SUBJECT.SIGNERS,
    getQueryAuditAccessDetails(queryOptions, models.signers.name),
    null
  );

  response.status(200).send(signers.map(signer => signer.toPayload(signer)));
});

export default getSigners;

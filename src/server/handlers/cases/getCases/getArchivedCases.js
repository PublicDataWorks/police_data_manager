import { getCasesInclude, getCasesOptions } from "./getWorkingCases";

import models from "../../../models";
import asyncMiddleware from "../../asyncMiddleware";
import { AUDIT_SUBJECT } from "../../../../sharedUtilities/constants";
import auditDataAccess from "../../auditDataAccess";
import getCases, { CASES_TYPE } from "./getCases";

const getArchivedCases = asyncMiddleware(async (req, res) => {
  const cases = await models.sequelize.transaction(async transaction => {
    await auditDataAccess(
      req.nickname,
      undefined,
      AUDIT_SUBJECT.ALL_ARCHIVED_CASES,
      transaction
    );

    return await getCases(transaction, CASES_TYPE.ARCHIVED);
  });

  res.status(200).send({ cases });
});

export default getArchivedCases;

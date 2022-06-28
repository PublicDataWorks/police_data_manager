import models from "../../../policeDataManager/models";
import sequelize from "sequelize";
import { CASE_STATUS, DESCENDING } from "../../../../sharedUtilities/constants";
import { calculateFirstContactDateCriteria } from "./queryHelperFunctions";

export const executeQuery = async (nickname, dateRange) => {
  const where = {
    deletedAt: null,
    firstContactDate: calculateFirstContactDateCriteria(dateRange),
    status: [CASE_STATUS.FORWARDED_TO_AGENCY, CASE_STATUS.CLOSED]
  };

  const queryOptions = {
    attributes: [
      "allegation.rule",
      "allegation.directive",
      "allegation.paragraph",
      [sequelize.fn("COUNT", sequelize.col("officer_allegation.case_officer_id")), "count"]
    ],
    include: [
      {
        model: models.allegation,
        as: "allegation",
        attributes: []
      },
      {
        model: models.case_officer,
        as: "caseOfficer",
        required: true,
        attributes: [],
        include: [
          {
          model: models.cases,
          where: where,
          attributes: []
        }
      ]
      }
    ],
    raw: true,
    group: ["allegation.directive", "allegation.rule", "allegation.paragraph"],
    limit: 10,
    order: [["count", DESCENDING]]
  };

  const countByTop10Allegations = await models.sequelize.transaction(
    async transaction => {
      return await models.officer_allegation.findAll(queryOptions);
    }
  );

  return countByTop10Allegations;
};
const csvParse = require("csv-parse");
const models = require("../models");
const _ = require("lodash");
const createConfiguredS3Instance = require("../createConfiguredS3Instance");
const config = require("../config/config");
const winston = require("winston");

const promises = [];
const officersToUpdate = [];
const officersToCreate = [];

const updateOfficerDataFromS3 = async (
  officerFileName = "officerSeedData.csv",
  shouldCloseConnections = false
) => {
  winston.info("File name", officerFileName);
  try {
    const s3 = createConfiguredS3Instance();
    const officerBucketName = config[process.env.NODE_ENV].officerBucket;

    const parser = csvParse({
      auto_parse: parseNullValues,
      columns: true,
      trim: true
    });

    const stream = s3
      .getObject({
        Bucket: officerBucketName,
        Key: officerFileName
      })
      .createReadStream()
      .pipe(parser)
      .on("data", onData);

    await new Promise((resolve, reject) => {
      stream.on("end", () => {
        winston.info(`Received ${promises.length} rows of officer data.`);
        Promise.all(promises)
          .then(async () => {
            await models.officer
              .bulkCreate(officersToCreate)
              .then(() => {
                winston.info(`Created ${officersToCreate.length} officers.`);
              })
              .catch(error => {
                winston.error(
                  "Error creating officers: ",
                  error.name,
                  error.message
                );
              });
          })
          .then(async () => {
            await updateOfficers(officersToUpdate);
            return resolve();
          })
          .catch(error => reject(error));
      });
    });
  } catch (error) {
    winston.error(`Officer Update Error: ${error}`);
  } finally {
    if (shouldCloseConnections) models.sequelize.close();
  }
};

const determineWhetherToCreateOrUpdateOfficer = async seedDataRow => {
  const officerNumber = seedDataRow.officerNumber;
  const existingOfficer = await models.officer.find({
    where: { officerNumber }
  });

  if (existingOfficer) {
    if (rowDataIsOfficerToBeUpdated(seedDataRow, existingOfficer)) {
      officersToUpdate.push(seedDataRow);
    }
  } else {
    officersToCreate.push(seedDataRow);
  }
};

const onData = seedDataRow => {
  const promise = determineWhetherToCreateOrUpdateOfficer(seedDataRow);
  promises.push(promise);
};

const updateOfficers = async officersToUpdate => {
  if (officersToUpdate.length === 0) {
    winston.info("No officers to update");
    return;
  }
  let totalCount = 0;
  let errorCount = 0;
  for (let officerData of officersToUpdate) {
    await models.officer
      .update(officerData, {
        where: { officerNumber: officerData.officerNumber }
      })
      .catch(error => {
        winston.error(
          `Error updating officer number ${officerData.officerNumber}; `,
          error.message
        );
        errorCount++;
      })
      .then(() => {
        totalCount++;
      });
  }
  winston.info(
    `Finished updating ${totalCount - errorCount} officers successfully`
  );
  winston.error(`${errorCount} officer updates failed`);
};

const parseNullValues = value => {
  if (value === "" || value === "NULL") return null;
  return value;
};

const isEqualIgnoringType = (value1, value2) => {
  if (value1 == value2) {
    return true;
  }
};

const rowDataIsOfficerToBeUpdated = (seedDataRow, existingOfficer) => {
  const officerValuesToCompare = _.omit(existingOfficer.dataValues, [
    "id",
    "createdAt",
    "updatedAt"
  ]);

  const keysToPick = Object.keys(officerValuesToCompare);
  const seedDataToCompare = _.pick(seedDataRow, keysToPick);

  return !_.isEqualWith(
    officerValuesToCompare,
    seedDataToCompare,
    isEqualIgnoringType
  );
};

module.exports = updateOfficerDataFromS3;

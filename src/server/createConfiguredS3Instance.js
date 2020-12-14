const AWS = require("aws-sdk");
const config = require("./config/config");
const path = require("path");

const createConfiguredS3Instance = () => {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const areCloudServicesDisabled = process.env.CLOUD_SERVICES_DISABLED == "true";

  let credentials = { accessKeyId, secretAccessKey };

  if (process.env.NODE_ENV === "development" && areCloudServicesDisabled) {
    credentials = { accessKeyId: "test", secretAccessKey: "test" };
    AWS.config.s3 = { endpoint: 'host.docker.internal:4566', s3ForcePathStyle: true };
  }

  const s3 = new AWS.S3(credentials);

  s3.config.update(config.s3config);

  return s3;
};

module.exports = createConfiguredS3Instance;

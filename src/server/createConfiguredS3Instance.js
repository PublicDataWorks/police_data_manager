const AWS = require("aws-sdk");
const path = require("path");
const config = require("./config/config");

const createConfiguredS3Instance = () => {
  let credentials;

  if (["development", "test"].includes(process.env.NODE_ENV)) {
    const localConfig = require(path.join(__dirname, "./awsConfig.json"));
    credentials = { credentials: localConfig };
  }

  const s3 = new AWS.S3(credentials);

  s3.config.update(config.s3config);

  return s3;
};

module.exports = createConfiguredS3Instance;

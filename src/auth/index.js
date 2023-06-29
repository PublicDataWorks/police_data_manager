// CLIENT AUTH
const clientConfig =
  require(`${process.env.REACT_APP_INSTANCE_FILES_DIR}/clientConfig`)[
    process.env.REACT_APP_ENV
  ];

// SERVER AUTH
const serverConfig =
  require(`${process.env.REACT_APP_INSTANCE_FILES_DIR}/serverConfig`)[
    process.env.NODE_ENV
  ];

const jwtCheck =
  process.env.NODE_ENV === "test"
    ? require("./auth0/jwtCheck") // only the auth0 jwt check is currently setup for mocking
    : require(`./${serverConfig.authentication.engine}/jwtCheck`);

const userService = require(`./${serverConfig.authentication.engine}/userService`);

// EXPORT EVERYTHING
export { jwtCheck, userService };

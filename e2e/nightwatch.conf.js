const chromedriver = require("chromedriver");
const selenium = require("selenium-server");

module.exports = {
  src_folders: ["tests"],
  output_folder: "reports",
  custom_commands_path: "",
  custom_assertions_path: "",
  page_objects_path: "./pageObjectModels",
  globals_path: "",
  webdriver: {
    start_process: true,
    server_path: chromedriver.path,
    port: 9515,
    cli_args: ["--log", "debug"]
  },
  test_settings: {
    default: {
      launch_url: "",
      silent: true,
      screenshots: {
        enabled: true,
        path: "./tests",
        on_failure: true,
        on_error: true
      },
      desiredCapabilities: {
        browserName: "chrome",
        chromeOptions: {
          args: ["headless", "--no-sandbox"]
        }
      }
    },
    local: {
      launch_url: "http://app:3000/"
    },
    staging: {
      launch_url: "https://noipm-staging.herokuapp.com/"
    }
  }
};

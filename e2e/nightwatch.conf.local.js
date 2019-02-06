const config = {
  src_folders: ["e2e/tests"],
  output_folder: "reports",
  custom_commands_path: "",
  custom_assertions_path: "",
  page_objects_path: "./e2e/pageObjectModels",
  globals_path: "",
  selenium: {
    start_process: true,
    server_path: "./bin/selenium-server-standalone-3.9.1.jar",
    log_path: "",
    port: 4444,
    cli_args: {
      "webdriver.chrome.driver": "node_modules/.bin/chromedriver"
    }
  },
  test_settings: {
    default: {
      launch_url: "localhost:3000/",
      selenium_port: 4444,
      selenium_host: "localhost",
      silent: true,
      screenshots: {
        enabled: true,
        path: "./e2e/tests",
        on_failure: true,
        on_error: true
      },
      desiredCapabilities: {
        browserName: "chrome",
        chromeOptions: {
          args: ["headless", "--no-sandbox"]
        }
      }
    }
  }
};

module.exports = config;

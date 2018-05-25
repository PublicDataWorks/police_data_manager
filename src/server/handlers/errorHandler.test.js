const errorHandler = require("./errorHandler");
const httpMocks = require("node-mocks-http");
const Boom = require("boom");

describe("errorHandler", () => {
  test("should mask 500 error response", () => {
    const request = httpMocks.createRequest();
    const response = httpMocks.createResponse();

    errorHandler(
      Boom.badImplementation("very sensitive error information"),
      request,
      response
    );

    expect(response.statusCode).toEqual(500);
    expect(response._getData()).toEqual(
      JSON.stringify({
        statusCode: 500,
        error: "Internal Server Error",
        message: "Something went wrong!"
      })
    );
  });

  test("should respond with boomified error message with its status code", () => {
    const request = httpMocks.createRequest();
    const response = httpMocks.createResponse();
    errorHandler(Boom.notFound("Page was not found"), request, response);

    expect(response.statusCode).toEqual(404);
    expect(response._getData()).toEqual(
      JSON.stringify({
        statusCode: 404,
        error: "Not Found",
        message: "Page was not found"
      })
    );
  });
});

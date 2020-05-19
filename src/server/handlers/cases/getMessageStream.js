import checkFeatureToggleEnabled from "../../checkFeatureToggleEnabled";
import { BAD_REQUEST_ERRORS } from "../../../sharedUtilities/errorMessageConstants";
import { sendMessage } from "./helpers/messageStreamHelpers";
import moment from "moment";
import { getNotifications } from "./getNotifications";

const asyncMiddleWare = require("../asyncMiddleware");

let clients = [];

export const getMessageStream = asyncMiddleWare(
  async (request, response, next) => {
    const realtimeNotificationsFeature = checkFeatureToggleEnabled(
      request,
      "realtimeNotificationsFeature"
    );
    if (!realtimeNotificationsFeature) {
      throw new Error(BAD_REQUEST_ERRORS.ACTION_NOT_ALLOWED);
    }

    setResHeaders(response);

    const clientEmail = request.nickname;
    const jsonConnectionMessage = {
      type: "connection",
      message: `${clientEmail} has subscribed to streaming messages including Notifications.`
    };
    response.write(`data: ${JSON.stringify(jsonConnectionMessage)} \n\n`);

    const newClient = {
      id: clientEmail,
      response: response
    };

    await handleClients(newClient);

    request.on("close", () => {
      clients = clients.filter(c => c.id !== clientEmail);
    });

    const jsonPingMessage = { type: "ping", message: "PING!" };

    setInterval(() => {
      response.write(`data: ${JSON.stringify(jsonPingMessage)} \n\n`);
    }, 30 * 1000);
  }
);

const setResHeaders = response => {
  response.setHeader("Cache-Control", "no-cache");
  response.setHeader("Content-Type", "text/event-stream");
  response.setHeader("Connection", "keep-alive");

  const env = process.env.NODE_ENV || "development";
  if (env === "development") {
    response.setHeader("Access-Control-Allow-Origin", "https://localhost");
  }
  if (env === "development_e2e") {
    response.setHeader("Access-Control-Allow-Origin", "https://app-e2e");
  }
};

const handleClients = async newClient => {
  let isNewClient = true;
  clients = clients.map(client => {
    if (client.id === newClient.id) {
      isNewClient = false;
      return newClient;
    } else {
      return client;
    }
  });
  if (isNewClient) {
    clients.push(newClient);
  }

  await sendNotification(newClient.id);
};

export const getClients = () => {
  return clients;
};

export const isActiveClient = client => {
  let isActive = undefined;
  clients.map(c => {
    if (c.id === client) {
      isActive = c;
    }
  });
  return isActive;
};

export const sendNotification = async user => {
  let client = isActiveClient(user);
  if (client) {
    const timestamp = moment().subtract(30, "days");
    const message = await getNotifications(timestamp, client.id);

    sendMessage("notifications", client, message);
  }
};

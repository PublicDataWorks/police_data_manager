import request from "supertest";
import app from "../../server";
import {
  buildTokenWithPermissions,
  cleanupDatabase,
  expectResponse
} from "../../testHelpers/requestTestHelpers";
import models from "../../policeDataManager/models";
import Signer from "../../../sharedTestHelpers/signer";
import { USER_PERMISSIONS } from "../../../sharedUtilities/constants";

describe("getSigners", () => {
  afterEach(async () => {
    await cleanupDatabase();
  });

  afterAll(async () => {
    await models.sequelize.close();
  });

  beforeEach(async () => {
    await models.signers.create(
      new Signer.Builder()
        .defaultSigner()
        .withId(1)
        .withName("John A Simms")
        .withNickname("jsimms@oipm.gov")
        .withPhone("888-576-9922")
        .withTitle("Independent Police Monitor")
        .build(),
      {
        auditUser: "user"
      }
    );

    await models.signers.create(
      new Signer.Builder()
        .defaultSigner()
        .withId(2)
        .withName("Nina Ambroise")
        .withNickname("nambroise@oipm.gov")
        .withPhone("888-576-9922")
        .withTitle("Complaint Intake Specialist")
        .build(),
      {
        auditUser: "user"
      }
    );
  });

  test("returns signers when authorized", async () => {
    const token = buildTokenWithPermissions(
      USER_PERMISSIONS.ADMIN_ACCESS,
      "nickname"
    );
    const responsePromise = request(app)
      .get("/api/signers")
      .set("Content-Header", "application/json")
      .set("Authorization", `Bearer ${token}`);

    await expectResponse(responsePromise, 200, [
      {
        id: 1,
        name: "John A Simms",
        title: "Independent Police Monitor",
        nickname: "jsimms@oipm.gov",
        phone: "888-576-9922",
        links: [
          {
            rel: "signature",
            href: "/api/signers/1/signature"
          }
        ]
      },
      {
        id: 2,
        name: "Nina Ambroise",
        title: "Complaint Intake Specialist",
        nickname: "nambroise@oipm.gov",
        phone: "888-576-9922",
        links: [
          {
            rel: "signature",
            href: "/api/signers/2/signature"
          }
        ]
      }
    ]);
  });
});
import { cleanupDatabase } from "../../../testHelpers/requestTestHelpers";
import { createTestCaseWithoutCivilian } from "../../../testHelpers/modelMothers";
import CaseNote from "../../../testHelpers/caseNote";
import { CASE_STATUS } from "../../../../sharedUtilities/constants";
import models from "../index";

describe("caseNote", () => {
  afterEach(async () => {
    await cleanupDatabase();
  });

  afterAll(async () => {
    await models.sequelize.close();
  });

  test("should update status when you create a case note", async () => {
    const initialCase = await createTestCaseWithoutCivilian();

    const caseNoteToCreate = new CaseNote.Builder()
      .defaultCaseNote()
      .withId(undefined)
      .withCaseId(initialCase.id)
      .build();

    expect(initialCase.status).toEqual(CASE_STATUS.INITIAL);

    await models.case_note.create(caseNoteToCreate, { auditUser: "someone" });

    await initialCase.reload();

    expect(initialCase.status).toEqual(CASE_STATUS.ACTIVE);
  });

  test("should not allow notes to be set to null", async () => {
    const notes = "these are the notes. end of notes";
    const c4se = await createTestCaseWithoutCivilian();
    const caseNote = await models.case_note.create(
      new CaseNote.Builder()
        .defaultCaseNote()
        .withNotes(notes)
        .withCaseId(c4se.id)
        .build(),
      { auditUser: "user" }
    );
    caseNote.notes = null;
    expect(caseNote.notes).toEqual(notes);
  });
});

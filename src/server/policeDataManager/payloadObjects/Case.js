import Boom from "boom";
import { BAD_REQUEST_ERRORS } from "../../../sharedUtilities/errorMessageConstants";
import determineNextCaseStatus from "../../handlers/cases/helpers/determineNextCaseStatus";

export default class Case {
  constructor(caseModel) {
    // TODO maybe allow the constructor to get the model by id from DB (if needed)
    this._model = caseModel;
    this._status = caseModel.currentStatus?.name;
  }

  get model() {
    return this._model;
  }

  get id() {
    return this._model.id;
  }

  get primaryComplainant() {
    return this._model.primaryComplainant;
  }

  get complaintType() {
    return this._model.complaintType;
  }

  /**
   * an async function that retrieves the case's status
   * this getter makes the assumption that the model is only changed via this wrapper class
   * and will break if altered otherwise
   * @returns the current status of the case as a string
   */
  getStatus = async () => {
    if (!this._status) {
      const status = await models.caseStatus.findByPk(
        this._model.currentStatusId
      );
      this._status = status.name;
    }
    return this._status;
  };

  setStatus = async status => {
    const nextStatus = await determineNextCaseStatus(await this.getStatus());
    if (status === nextStatus.name) {
      this._model.currentStatusId = nextStatus.id;
      this._status = nextStatus.name;
    } else if (status !== (await this.getStatus())) {
      throw Boom.badRequest(BAD_REQUEST_ERRORS.INVALID_CASE_STATUS);
    }
  };

  getNextStatus = async () => {
    return await determineNextCaseStatus(await this.getStatus());
  };

  get year() {
    return this._model.year;
  }

  get caseNumber() {
    return this._model.caseNumber;
  }

  get caseReferencePrefix() {
    return this._model.caseReferencePrefix;
  }

  get caseReference() {
    return this._model.caseReference;
  }

  get firstContactDate() {
    return this._model.firstContactDate;
  }

  get incidentDate() {
    return this._model.incidentDate;
  }

  get intakeSourceId() {
    return this._model.intakeSourceId;
  }

  get districtId() {
    return this._model.districtId;
  }

  get incidentTime() {
    return this._model.incidentTime;
  }

  get incidentTimezone() {
    return this._model.incidentTimezone;
  }

  get narrativeSummary() {
    return this._model.narrativeSummary;
  }

  get narrativeDetails() {
    return this._model.narrativeDetails;
  }

  get pibCaseNumber() {
    return this._model.pibCaseNumber;
  }

  get createdBy() {
    return this._model.createdBy;
  }

  get assignedTo() {
    return this._model.assignedTo;
  }

  toJSON = async () => {
    let json = this._model.toJSON();
    json.status = await this.getStatus();
    return json;
  };
}
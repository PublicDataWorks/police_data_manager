import Signer from "./signer";

class LetterType {
  constructor(build) {
    this.id = build.id;
    this.type = build.type;
    this.template = build.template;
    this.editableTemplate = build.editableTemplate;
    this.defaultSenderId = build.defaultSenderId
      ? build.defaultSenderId
      : build.defaultSender.id;
  }

  //TODO: Builders are not usually part of the class that they're building.  The class is usually a domain object used in the app, not just tests.  Should this be refactored?
  static get Builder() {
    class Builder {
      defaultLetterType() {
        this.id = 17;
        this.type = "REFERRAL";
        this.defaultSender = new Signer.Builder().defaultSigner().build();
        this.template = "";
        return this;
      }

      withId(id) {
        this.id = id;
        return this;
      }

      withType(type) {
        this.type = type?.toUpperCase();
        return this;
      }

      withTemplate(template) {
        this.template = template;
        return this;
      }

      withEditableTemplate(editableTemplate) {
        this.editableTemplate = editableTemplate;
        return this;
      }

      withDefaultSender(defaultSender) {
        this.defaultSender = defaultSender;
        return this;
      }

      withDefaultSenderId(defaultSenderId) {
        this.defaultSenderId = defaultSenderId;
        return this;
      }

      build() {
        return new LetterType(this);
      }
    }

    return Builder;
  }
}

export default LetterType;

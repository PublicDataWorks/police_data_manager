class HeardAboutSource {
  constructor(build) {
    this.id = build.id;
    this.name = build.name;
  }

  static get Builder() {
    class Builder {
      defaultHeardAboutSource() {
        this.id = 18;
        this.name = "Email";
        return this;
      }

      withId(id) {
        this.id = id;
        return this;
      }

      withName(name) {
        this.name = name;
        return this;
      }

      build() {
        return new HeardAboutSource(this);
      }
    }
    return Builder;
  }
}

export default HeardAboutSource;

class Renderer {
  constructor({ isLoading, isTextSelected, total, average, method, error }) {
    this.isLoading = isLoading;
    this.isTextSelected = isTextSelected;
    this.total = total;
    this.average = average;
    this.method = method || {};
    this.error = error;
  }

  text() {
    return `Flog: ${this.scoreText}${this.iconText}${this.scoreSuffix}`;
  }

  tooltip() {
    return `${this.tooltipText}${this.scoreText}${this.tooltipSuffix}`;
  }

  // private methods
  get scoreSuffix() {
    if (this.isLoading || this.error) { return ""; }
    if (this.isTextSelected) { return " (selection)"; }
    if (this.method.score !== undefined) { return ` (method: ${this.method.name})`; }

    return " (average per method)";
  }

  get iconText() {
    if (this.isLoading) { return "$(loading~spin)"; }
    if (this.error) { return "$(warning)"; }
    if (this.isTextSelected) { return ""; }
    if (this.score !== null && this.score <= 10) { return " $(verified)"; }

    return "";
  }

  get scoreText() {
    return this.score || "";
  }

  get tooltipText() {
    if (this.error) { return this.error; }
    if (this.isTextSelected) { return "Total Flog for Selected Text: "; }
    if (this.method.score !== undefined) { return `Flog for Method ${this.method.name}: `; }
    if (!this.isLoading) { return "Average Flog per Method: "; }

    return "";
  }

  get tooltipSuffix() {
    if (this.score === null) { return ""; }
    if (this.score <= 10) { return " 🤩"; }
    if (this.score <= 20) { return " 🙂"; }
    if (this.score <= 60) { return " 🤔"; }
    if (this.score <= 100) { return " 🙁"; }
    if (this.score <= 200) { return " 😫"; }

    return " 😱";
  }

  get score() {
    if (this.isLoading || this.error) { return null; }
    if (this.isTextSelected) { return this.total; }
    if (this.method.score !== undefined) { return this.method.score; }

    return this.average;
  }
}

exports.Renderer = Renderer;

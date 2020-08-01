class Renderer {
  constructor({ isLoading, isTextSelected, total, average, error }) {
    this.isLoading = isLoading;
    this.isTextSelected = isTextSelected;
    this.total = total;
    this.average = average;
    this.error = error;
  }

  text() {
    return `Flog: ${this.scoreAttributes().score}${this.scoreAttributes().icon}`;
  }

  tooltip() {
    return `${this.scoreAttributes().tooltip}${this.scoreAttributes().score}`;
  }

  // private methods
  scoreAttributes() {
    if (this.isLoading) { return { icon: "$(loading~spin)", score: "", tooltip: "" } }
    if (this.error) { return { icon: "$(warning)", score: "", tooltip: this.error }; }
    if (this.isTextSelected) { return { icon: "", score: this.total, tooltip: "Total Flog for Selected Text: " }; }
    if (this.average < 10) { return { icon: " $(verified)", score: this.average, tooltip: "Average Flog per Method: " }; }
    return { icon: "", score: this.average, tooltip: "Average Flog per Method: " };
  }
}

exports.Renderer = Renderer;
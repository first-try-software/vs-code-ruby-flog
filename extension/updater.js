class Updater {
  constructor({ show, flogCLI, activeTextEditor, flogExecutable = "flog" }) {
    this.show = show;
    this.flogCLI = flogCLI;
    this.activeTextEditor = activeTextEditor;
    this.flogExecutable = flogExecutable;
  }

  update() {
    this.show({ isLoading: true });

    if (this.isTextSelected()) {
      this.updateFromSelection();
    } else {
      this.updateFromFile();
    }
  }

  // private methods

  isTextSelected() {
    return !this.getSelection().isEmpty;
  }

  showResults(results) {
    const { total, average, methods } = results;
    const method = methods[this.getCursorLocation()];

    this.show({ isTextSelected: this.isTextSelected(), total, average, method })
  }

  updateFromSelection() {
    this.flogCLI.getFlogFromText(this.getSelectedText(), this.showResults.bind(this));
  }

  updateFromFile() {
    this.flogCLI.getFlogFromFile(this.getFileName(), this.showResults.bind(this), this.flogExecutable);
  }

  getSelectedText() {
    const range = this.getSelection();
    if (range === undefined || range.isEmpty) { return; }

    return this.getActiveDocument().getText(range);
  }

  getFileName() {
    return this.getActiveDocument().fileName;
  }

  getSelection() {
    return this.activeTextEditor.selection;
  }

  getCursorLocation() {
    // Line numbers are zero-based
    return this.getSelection().active.line + 1;
  }

  getActiveDocument() {
    if (this.activeTextEditor === undefined) {
      return { filename: null, getText: () => null };
    }

    return this.activeTextEditor.document;
  }
}

exports.Updater = Updater;

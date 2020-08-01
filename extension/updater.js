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
    } else if (this.flogCLI.isFlogInstalled) {
      this.updateFromFile();
    } else {
      this.updateFromText();
    }
  }

  // private methods

  isTextSelected() {
    return !this.getSelection().isEmpty;
  }

  showResults(results) {
    this.show({ isTextSelected: this.isTextSelected(), ...results })
  }

  updateFromSelection() {
    this.flogCLI.getFlogFromText(this.getSelectedText(), this.showResults.bind(this));
  }

  updateFromText() {
    this.flogCLI.getFlogFromText(this.getAllText(), this.showResults.bind(this));
  }

  updateFromFile() {
    this.flogCLI.getFlogFromFile(this.getFileName(), this.showResults.bind(this), this.flogExecutable);
  }

  getSelectedText() {
    const range = this.getSelection();
    if (range === undefined || range.isEmpty) { return; }

    return this.getActiveDocument().getText(range);
  }

  getAllText() {
    return this.getActiveDocument().getText();
  }

  getFileName() {
    return this.getActiveDocument().fileName;
  }

  getSelection() {
    return this.activeTextEditor.selection;
  }

  getActiveDocument() {
    if (this.activeTextEditor === undefined) {
      return { filename: null, getText: () => null };
    }

    return this.activeTextEditor.document;
  }
}

exports.Updater = Updater;

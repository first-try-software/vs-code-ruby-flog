const debounce = require("lodash.debounce");
const autobind = require("class-autobind");
const { FlogCLI } = require('./flogCli');
const { Renderer } = require("./renderer");

class Extension {
  constructor({ window, workspace, subscriptions, statusBarItem }) {
    this.window = window;
    this.workspace = workspace;
    this.subscriptions = subscriptions;
    this.statusBarItem = statusBarItem;
    this.isStatusBarItemVisible = false;
    this.greeted = false;
    autobind.default(this);

    this.update = debounce(this.updateScores, 500);
    this.flogCLI = new FlogCLI();
  }

  activate() {
    this.subscriptions.push(this.window.onDidChangeActiveTextEditor(this.initialize));
    this.subscriptions.push(this.window.onDidChangeTextEditorSelection(this.update));
    this.subscriptions.push(this.workspace.onDidChangeTextDocument(this.update));

    this.initialize();
  }

  initialize() {
    this.greet();
    this.flogCLI.checkFlogInstalled();
    this.update();
  }

  greet() {
    if (!this.greeted) {
      console.log("First Try! Software presents Ruby Flog!");
      this.greeted = true;
    }
  }

  isTextSelected() {
    return !this.getSelection().isEmpty;
  }

  updateScores() {
    this.showLoadingState();

    if (this.isTextSelected()) {
      this.updateFromSelection();
    } else if (this.flogCLI.isFlogInstalled) {
      this.updateFromFile();
    } else {
      this.updateFromText();
    }
  }

  updateFromSelection() {
    this.flogCLI.getFlogFromText(this.getSelectedText(), this.render.bind(this));
  }

  updateFromText() {
    this.flogCLI.getFlogFromText(this.getAllText(), this.render.bind(this));
  }

  updateFromFile() {
    const flogExecutable = this.workspace.getConfiguration("ruby-flog").get("flogExecutable");
    this.flogCLI.getFlogFromFile(this.getFileName(), this.render.bind(this), flogExecutable);
  }

  render(flogResult) {
    const isSelectedText = this.isTextSelected()
    const renderer = new Renderer({ isTextSelected: isSelectedText , ...flogResult });
    this.updateStatusBarItem(renderer);
  }

  showLoadingState() {
    this.statusBarItem.text = "Flog: $(tree-item-loading~spin)";
    this.statusBarItem.show();
  }

  updateStatusBarItem(renderer) {
    this.statusBarItem.text = renderer.text();
    this.statusBarItem.tooltip = renderer.tooltip();
    this.statusBarItem.show();
  }

  getSelectedText() {
    const range = this.getSelection();
    if (range === undefined || range.isEmpty) { return; }

    const document = this.getActiveDocument();
    if (!this.isValidDocument(document)) { return this.statusBarItem.hide(); }

    return document.getText(range);
  }

  getAllText() {
    const document = this.getActiveDocument();
    if (!this.isValidDocument(document)) { return this.statusBarItem.hide(); }

    return document.getText();
  }

  getFileName() {
    const document = this.getActiveDocument();
    if (!this.isValidDocument(document)) { return this.statusBarItem.hide(); }

    return document.fileName;
  }

  getSelection() {
    return this.getActiveTextEditor().selection;
  }

  getActiveDocument() {
    const activeTextEditor = this.getActiveTextEditor();
    if (activeTextEditor === undefined) { return; }

    return activeTextEditor.document;
  }

  getActiveTextEditor() {
    return this.window.activeTextEditor;
  }

  isValidDocument(document) {
    return (
      document !== undefined &&
      document.languageId === 'ruby'
    );
  }
}

exports.Extension = Extension;
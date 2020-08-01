const debounce = require("lodash.debounce");
const autobind = require("class-autobind");
const { FlogCLI } = require('./flogCli');
const { Renderer } = require("./renderer");
const { Updater } = require("./updater");

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

  getActiveTextEditor() {
    return this.window.activeTextEditor || {};
  }

  isRubyDocument() {
    const { document } = this.getActiveTextEditor();
    return document !== undefined && document.languageId === "ruby";
  }

  updateScores() {
    if (!this.isRubyDocument()) { return this.statusBarItem.hide(); }

    const updater = new Updater({
      show: this.show.bind(this),
      flogCLI: this.flogCLI,
      activeTextEditor: this.getActiveTextEditor(),
      flogExecutable: this.workspace.getConfiguration("ruby-flog").get("flogExecutable")
    });

    updater.update();
  }

  show({ isLoading = false, ...result } = {}) {
    const renderer = new Renderer({ isLoading, ...result });

    this.statusBarItem.text = renderer.text();
    this.statusBarItem.tooltip = renderer.tooltip();
    this.statusBarItem.show();
  }
}

exports.Extension = Extension;
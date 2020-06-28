const vscode = require('vscode');
const cp = require('child_process');

let statusBarItem;
let timeoutId;
let state = 'deselected';
let greeted = false;

function activate({subscriptions}) {
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1000);
  subscriptions.push(vscode.window.onDidChangeActiveTextEditor(initialize));
  subscriptions.push(vscode.window.onDidChangeTextEditorSelection(changeSelection));
  subscriptions.push(vscode.workspace.onDidChangeTextDocument(edit));

  initialize();
}
exports.activate = activate;

// Private functions

function greet() {
  if (!greeted) {
    console.log("First Try! presents Ruby Flog!");
    greeted = true;
  }
}

function initialize() {
  greet();
  transitionState('initialize');
  debounce(update);
}

function debounce(updateMethod) {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(updateMethod, 200);
}

function edit() {
  debounce(update);
}

function changeSelection() {
  if (!getSelection().isEmpty) {
    transitionState('select');
    debounce(update);
  } else if (state === 'selected') {
    transitionState('deselect');
    debounce(update);
  }
}

function transitionState(event) {
  state = event === 'select' ? 'selected' : 'deselected';
}

function update() {
  if (state === 'selected') {
    updateFromSelection();
  } else {
    updateFromFile();
  }
}

function updateFromSelection() {
  executeCommand(getFlogFromText(getSelectedText()));
}

function updateFromFile() {
  const document = getActiveDocument();
  if (!isValidDocument(document)) { return statusBarItem.hide(); }

  const fileName = document.fileName;
  if (fileName === undefined) { return statusBarItem.hide(); }

  executeCommand(getFlogFromFile(fileName));
}

function executeCommand(command) {
  showLoadingState();
  cp.exec(command, updateFlogScores);
}

function updateFlogScores(err, stdout) {
  if (err) {
    return updateStatusBarItem("Flog: $(warning)", "Error parsing selected text");
  }

  render(getFlogScores(stdout));
}

function render({ total, average }) {
  if (state === 'selected') {
    updateStatusBarItem(`Flog: ${total}`, `Total Flog for Selected Text: ${total}`);
  } else {
    let verified = "";
    if (average < 10) { verified = " $(verified)"}
    updateStatusBarItem(`Flog: ${average}${verified}`, `Average Flog per Method: ${average}`);
  }
}

function getSelectedText() {
  const range = getSelection();
  if (range === undefined || range.isEmpty) { return; }

  const document = getActiveDocument();
  if (!isValidDocument(document)) { return statusBarItem.hide(); }

  return document.getText(range);
}

function getActiveDocument() {
  const activeTextEditor = getActiveTextEditor();

  if (activeTextEditor === undefined) { return; }

  return activeTextEditor.document;
}

function getSelection() {
  return getActiveTextEditor().selection;
}

function getActiveTextEditor() {
  return vscode.window.activeTextEditor;
}

function showLoadingState() {
  statusBarItem.text = "Flog: $(tree-item-loading~spin)";
  statusBarItem.show();
}

function updateStatusBarItem(message, tooltip) {
  statusBarItem.text = message;
  statusBarItem.tooltip = tooltip;
  statusBarItem.show();
}

function isValidDocument(document) {
  return (
    document !== undefined &&
    document.languageId === 'ruby'
  );
}

function getFlogScores(flogResult) {
  const lines = flogResult.split("\n");
  const total = lines[0].split(":")[0].trim();
  const average = lines[1].split(":")[0].trim();
  return { total, average };
}

function getFlogFromFile(file) {
  return `flog -s ${file}`
}

function getFlogFromText(text) {
  const escapedText = text.replace(/"/g, '\\"');
  const changeToStdin = `echo "${escapedText}"`;
  const flogFromStdin = `ruby -e "require 'flog_cli'; FlogCLI.new(FlogCLI.parse_options(ARGV)).tap { |f| f.flog('-'); f.report }"`;
  return `${changeToStdin} | ${flogFromStdin}`;
}

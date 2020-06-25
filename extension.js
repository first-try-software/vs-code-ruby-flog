const vscode = require('vscode');
const cp = require('child_process');

let statusBarItem;
let handle;
let mode = 'average';
let state = 'deselected';
let total;
let average;

function activate({subscriptions}) {
  const commandId = 'ruby-flog.average';

  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1000);
  statusBarItem.command = commandId;
  subscriptions.push(statusBarItem);

  subscriptions.push(vscode.commands.registerCommand(commandId, toggle));
  subscriptions.push(vscode.window.onDidChangeActiveTextEditor(initialize));
  subscriptions.push(vscode.window.onDidChangeTextEditorSelection(changeSelection));
  subscriptions.push(vscode.workspace.onDidChangeTextDocument(edit));

  initialize();
}
exports.activate = activate;

// Private functions

function debounce(updateMethod) {
  clearTimeout(handle);
  handle = setTimeout(updateMethod, 200);
}

function initialize() {
  transitionState('initialize');
  debounce(update);
}

function toggle() {
  transitionMode();
  render();
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

function transitionMode() {
  mode = mode === 'average' ? 'total' : 'average';
}

function transitionState(event) {
  state = event === 'select' ? 'selected' : 'deselected';
}

function update() {
  const text = state === 'selected' ? getText(getSelection()) : getText();
  if (text === undefined) { return; }

  showLoadingState();

  cp.exec(flogCommand(text), (err, stdout) => {
    if (err) { return; }

    const scores = getFlogScores(stdout);
    total = scores.total;
    average = scores.average;

    render();
  });
}

function render() {
  if (state === 'selected') {
    showFlogScore(`Total Selected Flog: ${total}`);
  } else if (mode === 'total') {
    showFlogScore(`Total Flog: ${total}`);
  } else {
    showFlogScore(`Average Flog: ${average}`);
  }
}

function getText(range) {
  const document = getActiveDocument();

  if (!isValidDocument(document)) {
    statusBarItem.hide();
    return;
  }

  if (range === undefined || range.isEmpty) {
    return document.getText();
  } else {
    return document.getText(range);
  }
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
  statusBarItem.text = "Calculating Flog $(tree-item-loading~spin)";
  statusBarItem.show();
}

function showFlogScore(message) {
  statusBarItem.text = message;
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

function flogCommand(text) {
  const escapedText = text.replace(/"/g, '\\"');
  const changeToStdin = `echo "${escapedText}"`;
  const flogFromStdin = `ruby -e "require 'flog_cli'; FlogCLI.new(FlogCLI.parse_options(ARGV)).tap { |f| f.flog('-'); f.report }"`;
  return `${changeToStdin} | ${flogFromStdin}`;
}

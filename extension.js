const vscode = require('vscode');
const cp = require('child_process');

let statusBarItem;
let timeoutId;
let initialized = false;
let rubyInstalled;
let flogInstalled;

function activate({subscriptions}) {
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1000);
  subscriptions.push(vscode.window.onDidChangeActiveTextEditor(() => debounce(update)));
  subscriptions.push(vscode.window.onDidChangeTextEditorSelection(() => debounce(update)));
  subscriptions.push(vscode.workspace.onDidChangeTextDocument(edit));

  initialize();
  debounce(update);
}
exports.activate = activate;

// Private functions

function initialize() {
  if (!initialized) {
    console.log("First Try! Software presents Ruby Flog!");
    checkDependenciesInstalled();
    initialized = true;
  }
}

function checkDependenciesInstalled() {
  cp.exec('which ruby', (err) => {
    rubyInstalled = !err;
    if (rubyInstalled) {
      checkFlogInstalled();
    } else {
      vscode.window.showWarningMessage('Please install Ruby in order to use Ruby Flog.');
    }
  });
}

function checkFlogInstalled() {
  cp.exec('which flog', handleWhichFlog);
}

function handleWhichFlog(err) {
  flogInstalled = !err;
  if (!flogInstalled) {
    vscode.window.showWarningMessage(
      'Please install Flog in order to use Ruby Flog.',
      'Install Now', 'Remind Me Later'
    ).then(handleFlogInstallationDialogResponse);
  }
}

function handleFlogInstallationDialogResponse(selectedOption) {
  if (selectedOption === 'Install Now') {
    cp.exec('gem install flog', handleFlogInstall);
  }
}

function handleFlogInstall(err) {
  if (!!err) {
    vscode.window.showErrorMessage('Unable to install Flog.');
  } else {
    vscode.window.showInformationMessage('Flog successfully installed.')
    flogInstalled = true;
    update();
  }
}

function debounce(updateMethod) {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(updateMethod, 200);
}

function edit() {
  debounce(update);
}

function isTextSelected() {
  return !!getSelectedText();
}

function update() {
  if (isTextSelected()) {
    updateFromSelection();
  } else if (flogInstalled) {
    updateFromFile();
  } else {
    updateFromText();
  }
}

function updateFromSelection() {
  executeCommand(getFlogFromText(getSelectedText()));
}

function updateFromText() {
  executeCommand(getFlogFromText(getAllText()));
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
  try {
    cp.exec(command, updateFlogScores);
  } catch (error) {
    updateStatusBarItem("Flog: $(warning)", "Ruby Flog could not parse the file. It is too large.");
  }
}

function updateFlogScores(err, stdout) {
  if (err) {
    if (rubyInstalled && flogInstalled) {
      return updateStatusBarItem("Flog: $(warning)", "Ruby Flog could not parse the selected text.");
    } else if (rubyInstalled) {
      return updateStatusBarItem("Flog: $(warning)", "Please install Flog in order to use Ruby Flog.");
    } else {
      return updateStatusBarItem("Flog: $(warning)", "Please install Ruby in order to use Ruby Flog.");
    }
  }

  render(getFlogScores(stdout));
}

function render({ total, average }) {
  if (isTextSelected()) {
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

function getAllText() {
  const document = getActiveDocument();
  if (!isValidDocument(document)) { return statusBarItem.hide(); }

  return document.getText();
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

const vscode = require('vscode');
const cp = require('child_process');

let myStatusBarItem;

function activate({subscriptions}) {

  const commandId = 'ruby-flog.average';
  myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1000);
  myStatusBarItem.command = commandId;
  subscriptions.push(myStatusBarItem);

  subscriptions.push(vscode.commands.registerCommand(commandId, updateStatusBarItem));
  subscriptions.push(vscode.window.onDidChangeActiveTextEditor(updateStatusBarItem));
  subscriptions.push(vscode.workspace.onDidChangeTextDocument(updateStatusBarItem));

  updateStatusBarItem();
}
exports.activate = activate;

function updateStatusBarItem() {
  const activeTextEditor = vscode.window.activeTextEditor;

  if (activeTextEditor === undefined) { return; }

  const document = activeTextEditor.document;
  const languageId = document.languageId;

  if (languageId !== 'ruby') { return myStatusBarItem.hide(); }

  cp.exec(flogCommand(escapedText(document)), (_, flogResult) => {
    updateFlogScore(flogResult);
  });
}

function escapedText(document) {
  return document.getText().replace(/"/g, '\\"');
}

function flogCommand(documentText) {
  const changeToStdin = `echo "${documentText}"`;
  const flogFromStdin = `ruby -e "require 'flog_cli'; FlogCLI.new(FlogCLI.parse_options(ARGV)).tap { |f| f.flog('-'); f.report }"`;
  return `${changeToStdin} | ${flogFromStdin}`;
}

function updateFlogScore(flogResult) {
  const averageScore = flogResult.split("\n")[1].split(":")[0].trim();
  myStatusBarItem.text = `Average Flog: ${averageScore}`;
  myStatusBarItem.show();
}

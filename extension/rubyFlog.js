const vscode = require('vscode');
const { Extension } = require('./extension');

function activate({ subscriptions }) {
  const { window, workspace } = vscode;
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1000);
  const extension = new Extension({ window, workspace, subscriptions, statusBarItem })

  extension.activate();
}

exports.activate = activate;

const cp = require('child_process');

class FlogCLI {
  checkFlogInstalled(flogExecutable = "flog") {
    cp.exec(`which ${flogExecutable}`, (err) => {
      this.isFlogInstalled = !err;
    });
  }

  getFlogFromFile(file, callback, flogExecutable = "flog") {
    if (!file) { return; }

    this.executeCommand(`${flogExecutable} -am ${file}`, callback)
  }

  getFlogFromText(text, callback) {
    if (!text) { return; }

    const escapedText = text.replace(/"/g, '\\"');
    const changeToStdin = `echo "${escapedText}"`;
    const flogFromStdin = `ruby -e "require 'flog_cli'; FlogCLI.new(FlogCLI.parse_options(ARGV)).tap { |f| f.flog('-'); f.report }"`;

    this.executeCommand(`${changeToStdin} | ${flogFromStdin}`, callback);
  }

  // private methods

  parseResult(error, flogResult) {
    let errorMessage;

    if (error) {
      if (this.isFlogInstalled) {
        errorMessage = "Error parsing selected text";
      } else {
        errorMessage = "Unable to find flog executable specified in settings";
      }

      return { error: errorMessage }
    };

    const lines = flogResult.split("\n");
    const total = lines[0].split(":")[0].trim();
    const average = lines[1].split(":")[0].trim();
    const methods = {};
    const methodRegex = /(?<score>\d*\.\d):\s.*#(?<name>\w*).*:(?<start>\d*)-(?<end>\d*)/mg;
    const methodMatches = [...flogResult.matchAll(methodRegex)].map(match => match.groups);
    for (let { start, end, score, name } of methodMatches) {
      for (let i = parseInt(start); i <= parseInt(end) + 1; i++) { methods[i] = { score, name }; }
    }

    return { total, average, methods };
  }

  executeCommand(command, callback) {
    const processResult = (error, result) => {
      callback(this.parseResult(error, result))
    };

    try {
      cp.exec(command, processResult);
    } catch (error) {
      callback({ error: "File too large to parse" });
    }
  }
}

exports.FlogCLI = FlogCLI;

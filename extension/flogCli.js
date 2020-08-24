const cp = require('child_process');

class FlogCLI {
  checkFlogInstalled(flogExecutable = "flog") {
    cp.exec(`which ${flogExecutable}`, (err) => {
      this.isFlogInstalled = !err;
    });
  }

  getFlogFromFile(file, callback, flogExecutable = "flog") {
    if (!file) { return; }

    this.executeCommand(`${flogExecutable} -s ${file}`, callback)
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
    return { total, average };
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
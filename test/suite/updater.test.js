const expect = require('expect.js');
const sinon = require('sinon');
const { Updater } = require('../../extension/updater');

describe('Updater', () => {
  describe('#update()', () => {
    describe('always', () => {
      const show = sinon.spy();
      const flogCLI = { getFlogFromText: () => 0 };
      const selection = { isEmpty: true };
      const document = { getText: () => '' };
      const activeTextEditor = { selection, document };

      const updater = new Updater({ show, flogCLI, activeTextEditor });

      it('calls show with isLoading set to true', () => {
        updater.update();

        expect(show.firstCall.args[0]).to.eql({ isLoading: true });
      });
    });

    describe('when text is selected', () => {
      const show = sinon.spy();
      const flogCLI = { getFlogFromText: sinon.spy() };
      const selection = { isEmpty: false };
      const text = 'text';
      const document = { getText: () => text };
      const activeTextEditor = { selection, document };

      const updater = new Updater({ show, flogCLI, activeTextEditor });

      afterEach(() => {
        show.resetHistory();
      });

      it('delegates to the flogCLI to get the flog score of the selected text', () => {
        updater.update();

        expect(flogCLI.getFlogFromText.getCall(0).args[0]).to.eql(text);
      });

      it('passes callback to flogCLI to show results', () => {
        updater.update();

        const callback = flogCLI.getFlogFromText.getCall(0).args[1];
        const results = { score: 42 };
        callback(results);

        expect(show.secondCall.args[0]).to.eql({ isTextSelected: true, ...results });
      });
    });

    describe('when text is NOT selected', () => {
      describe('and flog is installed', () => {
        const show = sinon.spy();
        const flogCLI = { getFlogFromFile: sinon.spy(), isFlogInstalled: true };
        const selection = { isEmpty: true };
        const fileName = 'fileName';
        const document = { fileName };
        const activeTextEditor = { selection, document };
        const flogExecutable = 'flog';

        const updater = new Updater({ show, flogCLI, activeTextEditor, flogExecutable });

        afterEach(() => {
          show.resetHistory();
        });

        it('delegates to the flogCLI to get the flog score of from the file', () => {
          updater.update();

          expect(flogCLI.getFlogFromFile.getCall(0).args[0]).to.eql(fileName);
        });

        it('passes callback to flogCLI to show results', () => {
          updater.update();

          const callback = flogCLI.getFlogFromFile.getCall(0).args[1];
          const results = { score: 42 };
          callback(results);

          expect(show.secondCall.args[0]).to.eql({ isTextSelected: false, ...results });
        });

        it('passes the flog executable', () => {
          updater.update();

          expect(flogCLI.getFlogFromFile.getCall(0).args[2]).to.eql(flogExecutable);
        });
      });

      describe('and flog is NOT installed', () => {
        const show = sinon.spy();
        const flogCLI = { getFlogFromText: sinon.spy(), isFlogInstalled: false };
        const selection = { isEmpty: true };
        const text = 'text';
        const document = { getText: () => text };
        const activeTextEditor = { selection, document };

        const updater = new Updater({ show, flogCLI, activeTextEditor });

        afterEach(() => {
          show.resetHistory();
        });

        it('delegates to the flogCLI to get the flog score of all the text', () => {
          updater.update();

          expect(flogCLI.getFlogFromText.getCall(0).args[0]).to.eql(text);
        });

        it('passes callback to flogCLI to show results', () => {
          updater.update();

          const callback = flogCLI.getFlogFromText.getCall(0).args[1];
          const results = { score: 42 };
          callback(results);

          expect(show.secondCall.args[0]).to.eql({ isTextSelected: false, ...results });
        });
      });
    });
  });
});
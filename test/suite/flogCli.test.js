const cp = require('child_process');
const expect = require('expect.js');
const sinon = require('sinon');
const { FlogCLI } = require('../../extension/flogCli');

describe('FlogCLI', () => {
  const cli = new FlogCLI();

  describe('#getFlogFromFile()', () => {
    describe('when file is undefined', () => {
      const callback = sinon.spy();

      it('returns undefined', () => {
        expect(cli.getFlogFromFile(undefined, callback)).to.eql(undefined);
      });
    });

    describe('when file is defined', () => {
      const sandbox = sinon.createSandbox();

      beforeEach(() => {
        sandbox.spy(cp);
      });

      afterEach(function () {
        sandbox.restore();
      });

      it('executes the correct command', () => {
        cli.getFlogFromFile('test.rb', () => {});

        expect(cp.exec.getCall(0).args[0]).to.eql('flog -s test.rb')
      });

      describe('when executing the command raises an error', () => {
        const callback = sinon.spy();

        beforeEach(() => {
          const fakeExec = sinon.fake.throws(new Error('error'));
          sinon.replace(cp, 'exec', fakeExec);
        });

        afterEach(() => {
          sinon.restore();
        });

        it('calls the callback with an error', () => {
          cli.getFlogFromFile('test.rb', callback);

          expect(callback.getCall(0).args[0]).to.only.have.keys('error');
        });
      });

      describe('when there is an error', () => {
        const callback = sinon.spy();

        beforeEach(() => {
          const fakeExec = sinon.fake.yields("error", null);
          sinon.replace(cp, 'exec', fakeExec);
        });

        afterEach(() => {
          sinon.restore();
        });

        it('calls the callback with an error', () => {
          cli.getFlogFromFile('test.rb', callback);

          expect(callback.getCall(0).args[0]).to.only.have.keys('error');
        });
      });

      describe('when there is NO error', () => {
        const total = "total";
        const average = "average";
        const result = `${total}: total flog\n${average}: average flog`;
        const callback = sinon.spy();

        beforeEach(() => {
          const fakeExec = sinon.fake.yields(null, result);
          sinon.replace(cp, 'exec', fakeExec);
        });

        afterEach(() => {
          sinon.restore();
        });

        it('calls the callback with the results', () => {
          cli.getFlogFromFile('test.rb', callback);

          expect(callback.getCall(0).args[0]).to.eql({ total, average })
        });
      });
    });
  });

  describe('#getFlogFromText()', () => {
    describe('when text is NOT present', () => {
      const callback = sinon.spy();

      it('returns undefined', () => {
        expect(cli.getFlogFromFile('', callback)).to.eql(undefined);
      });
    });

    describe('when text is present', () => {
      const sandbox = sinon.createSandbox();

      beforeEach(() => {
        sandbox.spy(cp);
      });

      afterEach(function () {
        sandbox.restore();
      });

      it('executes the correct command', () => {
        cli.getFlogFromText('1 + 1', () => {});

        expect(cp.exec.getCall(0).args[0]).to.eql(
          `echo "1 + 1" | ruby -e "require 'flog_cli'; FlogCLI.new(FlogCLI.parse_options(ARGV)).tap { |f| f.flog('-'); f.report }"`
        );
      });

      describe('when executing the command raises an error', () => {
        const callback = sinon.spy();

        beforeEach(() => {
          const fakeExec = sinon.fake.throws(new Error('error'));
          sinon.replace(cp, 'exec', fakeExec);
        });

        afterEach(() => {
          sinon.restore();
        });

        it('calls the callback with an error', () => {
          cli.getFlogFromText('1 + 1', callback);

          expect(callback.getCall(0).args[0]).to.only.have.keys('error');
        });
      });

      describe('when there is an error', () => {
        const callback = sinon.spy();

        beforeEach(() => {
          const fakeExec = sinon.fake.yields("error", null);
          sinon.replace(cp, 'exec', fakeExec);
        });

        afterEach(() => {
          sinon.restore();
        });

        it('calls the callback with an error', () => {
          cli.getFlogFromText('1 + 1', callback);

          expect(callback.getCall(0).args[0]).to.only.have.keys('error');
        });
      });

      describe('when there is NO error', () => {
        const total = "total";
        const average = "average";
        const result = `${total}: total flog\n${average}: average flog`;
        const callback = sinon.spy();

        beforeEach(() => {
          const fakeExec = sinon.fake.yields(null, result);
          sinon.replace(cp, 'exec', fakeExec);
        });

        afterEach(() => {
          sinon.restore();
        });

        it('calls the callback with the results', () => {
          cli.getFlogFromText('1 + 1', callback);

          expect(callback.getCall(0).args[0]).to.eql({ total, average })
        });
      });
    });
  });
});
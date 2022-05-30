const cp = require('child_process');
const expect = require('expect.js');
const sinon = require('sinon');
const { FlogCLI } = require('../../extension/flogCli');

describe('FlogCLI', () => {
  let cli = new FlogCLI();

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

      describe('when a flogExecutable is NOT provided', () => {
        let cli = new FlogCLI();

        it('executes the correct command', () => {
          cli.getFlogFromFile('test.rb', () => {});

          expect(cp.exec.getCall(0).args[0]).to.eql('flog -am test.rb')
        });
      })

      describe('when a flogExecutable is provided', () => {
        let cli = new FlogCLI();

        it('executes the correct command', () => {
          cli.getFlogFromFile('test.rb', () => {}, 'path/to/flog');

          expect(cp.exec.getCall(0).args[0]).to.eql('path/to/flog -am test.rb')
        });
      })

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
        const total = "18.5";
        const average = "3.1";
        const method1 = { score: "5.2", name: "foo" };
        const method2 = { score: "3.9", name: "bar" };
        const methods = { 24: method1, 25: method1, 26: method1, 27: method1, 28: method1, 30: method2, 31: method2, 32: method2 }
        const result = `${total}: flog total\n${average}: flog/method average\n\n5.2: Class1#foo class1.rb:24-27\n3.9: Class1#bar class1.rb:30-31`

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

          expect(callback.getCall(0).args[0]).to.eql({ total, average, methods })
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
        const total = "18.5";
        const average = "3.1";
        const method1 = { score: "5.2", name: "foo" };
        const method2 = { score: "3.9", name: "bar" };
        const methods = { 24: method1, 25: method1, 26: method1, 27: method1, 28: method1, 30: method2, 31: method2, 32: method2 }
        const result = `${total}: flog total\n${average}: flog/method average\n\n5.2: Class1#foo class1.rb:24-27\n3.9: Class1#bar class1.rb:30-31`
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

          expect(callback.getCall(0).args[0]).to.eql({ total, average, methods })
        });
      });
    });
  });
});

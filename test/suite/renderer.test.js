const expect = require('expect.js');
const { Renderer } = require('../../extension/renderer');

describe('Renderer', () => {
  describe('#text()', () => {
    describe('when there is an error', () => {
      const error = "error";
      const renderer = new Renderer({ error });

      it('returns the correct text', () => {
        expect(renderer.text()).to.eql('Flog: $(warning)');
      });
    });

    describe('when there is selected text', () => {
      const isTextSelected = true;
      const total = 42.0;
      const renderer = new Renderer({ isTextSelected, total });

      it('returns the correct text', () => {
        expect(renderer.text()).to.eql('Flog: 42');
      });
    });

    describe('when the average is less than 10', () => {
      const isTextSelected = false;
      const average = 4.2;
      const renderer = new Renderer({ isTextSelected, average });

      it('returns the correct text', () => {
        expect(renderer.text()).to.eql('Flog: 4.2 $(verified)');
      });
    });

    describe('when the average is 10 or more', () => {
      const isTextSelected = false;
      const average = 42.0;
      const renderer = new Renderer({ isTextSelected, average });

      it('returns the correct text', () => {
        expect(renderer.text()).to.eql('Flog: 42');
      });
    });
  });

  describe('#tooltip()', () => {
    describe('when there is an error', () => {
      const error = "error";
      const renderer = new Renderer({ error });

      it('returns the correct tooltip', () => {
        expect(renderer.tooltip()).to.eql('error');
      });
    });

    describe('when there is selected text', () => {
      const isTextSelected = true;
      const total = 42.0;
      const renderer = new Renderer({ isTextSelected, total });

      it('returns the correct tooltip', () => {
        expect(renderer.tooltip()).to.eql('Total Flog for Selected Text: 42');
      });
    });

    describe('when the average is less than 10', () => {
      const isTextSelected = false;
      const average = 4.2;
      const renderer = new Renderer({ isTextSelected, average });

      it('returns the correct tooltip', () => {
        expect(renderer.tooltip()).to.eql('Average Flog per Method: 4.2');
      });
    });

    describe('when the average is 10 or more', () => {
      const isTextSelected = false;
      const average = 42.0;
      const renderer = new Renderer({ isTextSelected, average });

      it('returns the correct tooltip', () => {
        expect(renderer.tooltip()).to.eql('Average Flog per Method: 42');
      });
    });
  });
});
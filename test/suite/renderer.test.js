const expect = require('expect.js');
const { Renderer } = require('../../extension/renderer');

describe('Renderer', () => {
  describe('when there is an error', () => {
    const error = "error";
    const renderer = new Renderer({ error });

    it('returns the correct text', () => {
      expect(renderer.text()).to.eql('Flog: $(warning)');
    });

    it('returns the correct tooltip', () => {
      expect(renderer.tooltip()).to.eql('error');
    });
  });

  describe('when there is selected text', () => {
    const isTextSelected = true;
    const total = 14.0;
    const renderer = new Renderer({ isTextSelected, total });

    it('returns the correct text', () => {
      expect(renderer.text()).to.eql('Flog: 14 (selection)');
    });

    it('returns the correct tooltip', () => {
      expect(renderer.tooltip()).to.eql('Total Flog for Selected Text: 14 🙂');
    });
  });

  describe('when the cursor is in a method with a flog score less than 10', () => {
    const isTextSelected = false;
    const method = { score: 3.9, name: 'foo' };
    const renderer = new Renderer({ isTextSelected, method });

    it('returns the correct text', () => {
      expect(renderer.text()).to.eql('Flog: 3.9 $(verified) (method: foo)');
    });

    it('returns the correct tooltip', () => {
      expect(renderer.tooltip()).to.eql('Flog for Method foo: 3.9 🤩');
    });
  });

  describe('when the cursor is in a method with a flog score greater than 10', () => {
    const isTextSelected = false;
    const method = { score: 39, name: 'foo' };
    const renderer = new Renderer({ isTextSelected, method });

    it('returns the correct text', () => {
      expect(renderer.text()).to.eql('Flog: 39 (method: foo)');
    });

    it('returns the correct tooltip', () => {
      expect(renderer.tooltip()).to.eql('Flog for Method foo: 39 🤔');
    });
  });

  describe('when the method score is undefined and the average is less than 10', () => {
    const isTextSelected = false;
    const average = 4.2;
    const renderer = new Renderer({ isTextSelected, average });

    it('returns the correct text', () => {
      expect(renderer.text()).to.eql('Flog: 4.2 $(verified) (average per method)');
    });

    it('returns the correct tooltip', () => {
      expect(renderer.tooltip()).to.eql('Average Flog per Method: 4.2 🤩');
    });
  });

  describe('when the method score is undefined and the average is 10 or more', () => {
    const isTextSelected = false;
    const average = 42.0;
    const renderer = new Renderer({ isTextSelected, average });

    it('returns the correct text', () => {
      expect(renderer.text()).to.eql('Flog: 42 (average per method)');
    });

    it('returns the correct tooltip', () => {
      expect(renderer.tooltip()).to.eql('Average Flog per Method: 42 🤔');
    });
  });
});

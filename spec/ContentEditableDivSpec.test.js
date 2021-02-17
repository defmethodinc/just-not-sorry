import { forEachUniqueContentEditable } from '../src/callbacks/ContentEditableDiv.js';

const buildMutation = (type, target) => {
  return { type, target };
};

describe('handleContentEditableDivChange', () => {
  let mockCallback, handler;
  beforeEach(() => {
    mockCallback = jest.fn((mutation) => mutation);
    handler = forEachUniqueContentEditable(mockCallback);
  });
  describe('when target is node with contentEditable attribute', () => {
    it('should not call the action if mutation is not type childList', () => {
      const div = document.createElement('div');
      div.setAttribute('contentEditable', 'true');

      const mutation = buildMutation('characterData', div);
      handler([mutation]);

      expect(mockCallback.mock.calls.length).toBe(0);
    });

    it('should not call the action callback more than once for each unique mutation of type childList', () => {
      const div = document.createElement('div');
      div.setAttribute('contentEditable', 'true');
      div.setAttribute('id', 'uniqueID');

      const mutation = buildMutation('childList', div);
      handler([mutation]);
      handler([mutation]);
      expect(mockCallback.mock.calls.length).toBe(1);
    });

    it('should call the action callback once for each unique mutation of type childList', () => {
      const div = document.createElement('div');
      div.setAttribute('contentEditable', 'true');

      const mutation = buildMutation('childList', div);
      handler([mutation]);

      expect(mockCallback.mock.calls.length).toBe(1);
      expect(mockCallback.mock.calls[0][0]).toBe(mutation);
    });
  });

  describe('when target is node without contentEditable attribute', () => {
    it('should not call the action callback for each mutation of type childList', () => {
      const div = document.createElement('div');

      const mutation = buildMutation('childList', div);
      handler([mutation]);

      expect(mockCallback.mock.calls.length).toBe(0);
    });

    it('should not call the action if mutation is not type childList', () => {
      const div = document.createElement('div');

      const mutation = buildMutation('characterData', div);
      handler([mutation]);

      expect(mockCallback.mock.calls.length).toBe(0);
    });
  });
});

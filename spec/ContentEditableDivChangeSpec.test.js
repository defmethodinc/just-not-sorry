import { handleContentEditableChange } from '../src/callbacks/ContentEditableChange';

const buildMutation = (type, target) => {
  return { type, target };
};

describe('handleContentEditableDivChange', () => {
  const action = (node) => console.log(node);
  let spy;
  let handler = handleContentEditableChange(action);

  beforeEach(() => {
    spy = jest.spyOn(console, 'log').mockImplementationOnce(() => {});
  });
  describe('when target is node with contentEditable attribute', () => {
    it('should not call the action if mutation is not type childList', () => {
      const div = document.createElement('div');
      div.setAttribute('contentEditable', 'true');

      const mutation = buildMutation('characterData', div);
      handler([mutation]);

      expect(spy).not.toHaveBeenCalledWith(mutation);
    });

    it('should call the action callback for each mutation of type childList', () => {
      const div = document.createElement('div');
      div.setAttribute('contentEditable', 'true');

      const mutation = buildMutation('childList', div);
      handler([mutation]);

      expect(spy).toHaveBeenCalledWith(mutation);
    });
  });

  describe('when target is node without contentEditable attribute', () => {
    it('should not call the action callback for each mutation of type childList', () => {
      const div = document.createElement('div');

      const mutation = buildMutation('childList', div);
      handler([mutation]);

      expect(spy).not.toHaveBeenCalledWith(mutation);
    });

    it('should not call the action if mutation is not type childList', () => {
      const div = document.createElement('div');

      const mutation = buildMutation('characterData', div);
      handler([mutation]);

      expect(spy).not.toHaveBeenCalledWith(mutation);
    });
  });
});

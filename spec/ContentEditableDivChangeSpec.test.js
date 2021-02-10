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

      handler([buildMutation('characterData', div)]);

      expect(spy).not.toHaveBeenCalledWith(div);
    });

    it('should call the action callback for each mutation of type childList', () => {
      const div = document.createElement('div');
      div.setAttribute('contentEditable', 'true');

      handler([buildMutation('childList', div)]);

      expect(spy).toHaveBeenCalledWith(div);
    });
  });

  describe('when target is node without contentEditable attribute', () => {
    it('should not call the action callback for each mutation of type childList', () => {
      const div = document.createElement('div');

      handler([buildMutation('childList', div)]);

      expect(spy).not.toHaveBeenCalledWith(div);
    });

    it('should not call the action if mutation is not type childList', () => {
      const div = document.createElement('div');

      handler([buildMutation('characterData', div)]);

      expect(spy).not.toHaveBeenCalledWith(div);
    });
  });
});

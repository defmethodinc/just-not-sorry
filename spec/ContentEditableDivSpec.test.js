import {
  handleKeyPress,
  handleCarriageReturn,
} from '../src/callbacks/ContentEditableDiv.js';

const buildMutation = (type, target) => {
  return { type, target };
};

describe('handleContentEditableDivChange', () => {
  const action = (node) => console.log(node);
  let spy;
  let handler = handleKeyPress(action);

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

  describe('#handleCarriageReturn', () => {
    let mockNode;
    beforeEach(() => {
      mockNode = {
        dispatchEvent: jest.fn(),
        hasAttribute: () => true,
      };
    });
    describe('when an observed content editable sees a non-text change (such as a line break)', () => {
      it('should dispatch an input event to trigger checking for warnings', () => {
        const mockMutation = {
          type: 'childList',
          target: mockNode,
        };

        handleCarriageReturn([mockMutation]);

        expect(mockNode.dispatchEvent).toHaveBeenCalledWith(expect.any(Event));
      });
    });

    describe('when an observed content editable sees a text change', () => {
      it('should NOT dispatch an extra input event', () => {
        const mockMutation = {
          type: 'characterData',
          target: mockNode,
        };

        handleCarriageReturn([mockMutation]);

        expect(mockNode.dispatchEvent).not.toHaveBeenCalled();
      });
    });
  });
});

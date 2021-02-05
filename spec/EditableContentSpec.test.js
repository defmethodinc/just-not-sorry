import { handleContentEditableContentInsert } from '../src/handlers/EditableContent.js';

describe('#handleContentEditableContentInsert', () => {
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

      handleContentEditableContentInsert([mockMutation]);

      expect(mockNode.dispatchEvent).toHaveBeenCalledWith(expect.any(Event));
    });
  });

  describe('when an observed content editable sees a text change', () => {
    it('should NOT dispatch an extra input event', () => {
      const mockMutation = {
        type: 'characterData',
        target: mockNode,
      };

      handleContentEditableContentInsert([mockMutation]);

      expect(mockNode.dispatchEvent).not.toHaveBeenCalled();
    });
  });
});

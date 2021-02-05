const isContentEditableCharacterData = (mutation) =>
  mutation.type !== 'characterData' &&
  mutation.target.hasAttribute('contentEditable');

const triggerCheckForWarnings = (mutation) =>
  mutation.target.dispatchEvent(
    new Event('input', { bubbles: true, cancelable: true })
  );

export const handleContentEditableContentInsert = (mutations) =>
  mutations
    .filter(isContentEditableCharacterData)
    .forEach(triggerCheckForWarnings);

const isContentEditableChildList = (mutation) =>
  mutation.type === 'childList' &&
  mutation.target.hasAttribute('contentEditable');

export const handleContentEditableChange = (action) => (mutations) =>
  mutations
    .filter(isContentEditableChildList)
    .forEach((mutation) => action(mutation.target));

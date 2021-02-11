const inputEvent = new Event('input', { bubbles: true, cancelable: true });

const bubbleInputEvent = (mutation) => {
  mutation.target.dispatchEvent(inputEvent);
};

const isContentEditableChildList = (mutation) =>
  mutation.type === 'childList' &&
  mutation.target.hasAttribute('contentEditable');

const isContentEditableListOrElement = (mutation) =>
  mutation.type !== 'characterData' &&
  mutation.target.hasAttribute('contentEditable');

export const handleKeyPress = (action) => (mutations) => {
  const index = mutations.findIndex(isContentEditableChildList);
  if (index > -1) {
    action(mutations[index]);
  }
};

export const handleCarriageReturn = (mutations) => {
  const index = mutations.findIndex(isContentEditableListOrElement);
  if (index > -1) {
    bubbleInputEvent(mutations[index]);
  }
};

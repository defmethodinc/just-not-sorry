const isEmailMessageBody = (mutation) =>
  mutation.type === 'childList' &&
  mutation.target.hasAttribute('contentEditable');

export const ifEmailModified = (action) => (mutations) => {
  const index = mutations.findIndex(isEmailMessageBody);
  if (index > -1) {
    action(mutations[index]);
  }
};

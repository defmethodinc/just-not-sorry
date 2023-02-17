const isEmailMessageBody = (mutation) =>
  mutation.target.hasAttribute('contentEditable') &&
  mutation.type === 'childList';

export const forEachUniqueContentEditable = (action) => {
  const uniqueIds = new Set();
  let tempId = 0;
  return (mutations) => {
    mutations.filter(isEmailMessageBody).forEach((mutation) => {
      if (!uniqueIds.has(mutation.target.id)) {
        const id = mutation.target.id || tempId++;
        uniqueIds.add(id);
        action(mutation);
      }
    });
  };
};

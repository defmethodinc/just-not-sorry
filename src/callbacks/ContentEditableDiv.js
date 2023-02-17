const isEmailMessageBody = ({ target, type }) =>
  target.hasAttribute('contentEditable') && type === 'childList';

export const forEachUniqueContentEditable = (action) => {
  const uniqueIds = new Set();
  let tempId = 0;
  return (mutations) => {
    mutations.forEach((mutation) => {
      if (isEmailMessageBody(mutation) && !uniqueIds.has(mutation.target.id)) {
        const id = mutation.target.id || tempId++;
        uniqueIds.add(id);
        action(mutation);
      }
    });
  };
};

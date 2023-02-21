const isEmailMessageBody = ({ target, type }) =>
  target.hasAttribute('contentEditable') && type === 'childList';

export const forEachUniqueContentEditable = (action) => {
  const uniqueIds = new Set();
  let tempId = 0;
  return (mutations) => {
    mutations.forEach((mutation) => {
      if (isEmailMessageBody(mutation)) {
        const id = mutation.target.id || tempId++;
        if (!uniqueIds.has(id)) {
          uniqueIds.add(id);
          action(mutation);
        }
      }
    });
  };
};

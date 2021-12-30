function isEmailMessageBody(mutation) {
  return (
    mutation.type === 'childList' &&
    mutation.target.hasAttribute('contentEditable')
  );
}
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

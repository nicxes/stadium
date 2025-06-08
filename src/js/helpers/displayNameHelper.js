/**
 * Devuelve el nombre a mostrar de un item, priorizando displayName si existe
 * @param {Object} item - El item con name y opcionalmente displayName
 * @returns {string} - El nombre a mostrar
 */
export const getDisplayName = (item) => {
  if (!item) return '';
  return item.displayName || item.name || '';
};

export default getDisplayName;

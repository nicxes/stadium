export const decodeBase64ToString = (value) => {
  if (!value) return '';
  const base64String = decodeURIComponent(value);
  return atob(base64String);
};

export const encodeStringToBase64 = (value) => {
  if (!value) return '';
  const rawString = btoa(value);
  return encodeURIComponent(rawString);
};

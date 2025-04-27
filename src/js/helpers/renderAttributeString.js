import { statDescriptions } from './statDescriptions';

const renderAttributeString = (attr) => {
  if (attr.type === 'description') return attr.value;
  const matchedKey = Object.entries(statDescriptions).find((entry) => entry[1] === attr.type)?.[0];
  return `<b>${attr.value}</b> ${matchedKey ?? attr.type}`;
};

export default renderAttributeString;

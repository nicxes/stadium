import { statDescriptions } from './statDescriptions';

const renderAttributeString = (attr) => {
  if (attr.type === 'description') return attr.value;
  const attrString = statDescriptions[attr.type];
  return `<b>${attr.value}</b> ${attrString ?? attr.type}`;
};

export default renderAttributeString;

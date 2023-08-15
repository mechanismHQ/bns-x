import { ordCardTemplate } from './card';

export const inscriptionJsSrc = '/content/TODO';

export const inscriptionContentType = 'text/plain';
export const inscriptionContentForName = (name: string) => {
  let template = ordCardTemplate;
  template = template.replace(/{{CARD_SRC}}/g, inscriptionJsSrc);
  template = template.replace(/{{CARD_NAME}}/g, name);
  return template;
};

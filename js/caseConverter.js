const convertToUpperCase = (text) => text.toUpperCase();

const convertToLowerCase = (text) => text.toLowerCase();

const convertToTitleCase = (text) => 
  text.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );

const convertToSentenceCase = (text) => {
  return text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
};

const convertToCamelCase = (text) => {
  return text.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
    if (+match === 0) return "";
    return index === 0 ? match.toLowerCase() : match.toUpperCase();
  }).replace(/[^\w]/g, "");
};

const convertToPascalCase = (text) => {
  return text.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match) => {
    if (+match === 0) return "";
    return match.toUpperCase();
  }).replace(/[^\w]/g, "");
};

const convertToSnakeCase = (text) => {
  return text.trim()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '_')
    .toLowerCase();
};

const convertToKebabCase = (text) => {
  return text.trim()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
};

const convertToInverseCase = (text) => {
  return text.split('').map((char) => 
    char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()
  ).join('');
};

const convertToRandomCase = (text) => {
  return text.split('').map((char) => 
    Math.random() > 0.5 ? char.toUpperCase() : char.toLowerCase()
  ).join('');
};

const conversionMethods = {
  'UPPER CASE': convertToUpperCase,
  'lower case': convertToLowerCase,
  'Title Case': convertToTitleCase,
  'Sentence case': convertToSentenceCase,
  'camelCase': convertToCamelCase,
  'PascalCase': convertToPascalCase,
  'snake_case': convertToSnakeCase,
  'kebab-case': convertToKebabCase,
  'iNvErSe CaSe': convertToInverseCase,
  'RaNdOm CaSe': convertToRandomCase,
};
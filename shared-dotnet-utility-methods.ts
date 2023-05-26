import { buildNameVariations, camelCase } from "./name-variations";

export const getConstructorParameters = (props) => {
  const constructorParametersWithCommas = props
    .filter((p) => p.type === "string")
    .map((p) => {
      return `string ${camelCase(p.value)}`;
    })
    .join(",");

  const parametersLength = constructorParametersWithCommas.length;
  const constructorParameters = constructorParametersWithCommas.slice(0);

  return constructorParameters;
};

export const getValueTypeMembers = (props) =>
  props.filter((p) => p.type !== "objectList");

export const getforeignObjSchemas = (props) =>
  props
    .filter((p) => p.type === "objectList")
    .map((p) => {
      return buildNameVariations(p.value);
    });

export const quoteWrapper = (value) => {
  if (typeof value === "string") {
    return `"${value}"`;
  } else {
    return value;
  }
};

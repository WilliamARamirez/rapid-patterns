import { camelCase } from "./name-variations";

   export const getConstructorParameters = (props) => {
     const constructorParametersWithCommas =  props.filter((p) => p.type === 'string').map((p) => {
          return `string ${camelCase(p.value)}`;
      }).join(",");

    const parametersLength =  constructorParametersWithCommas.length
    const constructorParameters =  constructorParametersWithCommas.slice(
        0
    );     

    return constructorParameters;
      }


     export const getStringsFromProps = (props) => props.filter((p) => p.type === 'string');
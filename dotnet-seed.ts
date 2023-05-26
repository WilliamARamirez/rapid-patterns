import { Config, Generator, Schema } from "./meta-models";
import {
  buildNameVariations,
  camelCase,
  lowercase,
  pascalCase,
  startCase,
} from "./name-variations";
import {
  getConstructorParameters,
  getforeignObjSchemas,
  getValueTypeMembers,
  quoteWrapper,
} from "./shared-dotnet-utility-methods";
import { faker } from "@faker-js/faker";

const generate = (schema: Schema, { name }: Config) => {
  const { ref, refs, model, models, singleParams } =
    buildNameVariations(schema);
  const { props } = schema;

  const valueTypeMembers = getValueTypeMembers(props);

  const objectValueAssignment = (prop) => {
    return valueTypeMembers
      .map((m) => {
        let memberValue;
        switch (m.type) {
          case "string":
            memberValue = faker.lorem.word();
            break;
          case "int":
            memberValue = faker.number.int(100);
            break;
          case "boolean":
            memberValue = faker.datatype.boolean();
            break;
          case "date":
            memberValue = faker.date.soon();
            break;
          default:
            memberValue = "null";
            break;
        }

        return `\t\t${pascalCase(m.value)} = ${quoteWrapper(memberValue)}`;
      })
      .join("\n");
  };

  const foreignObjects = getforeignObjSchemas(props);

  const foreignObjectValueAssignment = (
    foreignObjects,
    parent,
    numOfForeignObjects = 3
  ) => {
    const delcarations = [];
    const addStatements = [];
    let counter = 1;
    while (numOfForeignObjects >= counter) {
      const round = foreignObjects
        .map((f) => {
          addStatements.push(
            `\n${parent}.AddItem(${f.model}${counter}For${parent});`
          );

          return `
\tpublic static readonly ${f.model} ${f.model}${counter}For${parent} = new ${
            f.model
          }
\t{
${objectValueAssignment(f.props)}
\t};



`;
        })
        .join("\n");

      counter++;
      delcarations.push(round);
    }
    return delcarations.join("\n") + addStatements.join("");
  };

  const genExamples = (num = 3) => {
    const examples = [];
    let counter = 1;
    while (num >= counter) {
      const example = `
\tpublic static readonly ${model} ${model}${counter}= new ${model}
\t{
${objectValueAssignment(props)}
\t};



${foreignObjectValueAssignment(foreignObjects, `${model}${counter}`)}
`;

      counter++;
      examples.push(example);
    }
    return examples.join("\n");
  };

  const template = `${genExamples()}`;

  return {
    template,
    title: `${model} Entity`,
    fileName: `libs/core-data/src/lib/services/${refs}/${refs}.service.ts`,
  };
};

export const DotnetSeedGenerator: Generator = {
  generate,
};

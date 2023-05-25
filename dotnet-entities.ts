import { Config, Generator, Schema } from "./meta-models";
import {
  buildNameVariations,
  camelCase,
  lowercase,
  pascalCase,
  startCase,
} from "./name-variations";

const generate = (schema: Schema, { name }: Config) => {
  const { ref, refs, model, models, singleParams } =
    buildNameVariations(schema);

  const { props } = schema;
  console.log(buildNameVariations(schema));
  console.log(props);

  const declarationStatements = props
    .map((p) => {
      for (const [key, value] of Object.entries(p)) {
        switch (key) {
          case "string":
            return `  public string ${startCase(value)} { get; private set; }
`;
          case "objectList":
            const { ref, refs, model, models, singleParams } =
              buildNameVariations(value);
            return `  private readonly List< ${model} > _${refs} = new List< ${model} >();
  public IEnumerable< ${model} > ${refs} => _${refs}.AsReadOnly();
            
`;
        }
      }
    })
    .join("");

  const constructorParameters = props
    .map((p) => {
      for (const [key, value] of Object.entries(p)) {
        switch (key) {
          case "string":
            return `string ${camelCase(value)}`;
        }}}).join(", ");

  const assignments = props.map
  ((p) => {
    for (const [key, value] of Object.entries(p)) {
      switch (key) {
        case "string":
          return `${startCase(value)} = Guard.Against.NullOrEmpty(${camelCase(value)}, nameof(${camelCase(value)}));
`;  
      }}}).join("");

const addObjectMethods = props.map((p) => {
  for (const [key, value] of Object.entries(p)) {
    switch (key) {
          case "objectList":
            const obj = buildNameVariations(value);
            return `public void Add${obj.model}(${obj.model} new${obj.model})
{
  Guard.Against.Null(new${obj.model}, nameof(new${obj.model}));
  _${obj.ref}.Add(new${obj.model});
          
  var new${obj.model}AddedEvent = new New${obj.model}AddedEvent(this, new${obj.model});
  base.RegisterDomainEvent(new${obj.model}AddedEvent);
};
            `;
        }
      }
    })
    .join("");


    const constructor =  `public ${model}(${constructorParameters})
{
${assignments}
}`

  const template = `
using Ardalis.GuardClauses;
using ${name}.Core.ProjectAggregate.Events;
using ${name}.SharedKernel;
using ${name}.SharedKernel.Interfaces;

namespace ${name}.Core.ProjectAggregate;

public class ${model} : EntityBase, IAggregateRoot
{

${constructor}
${addObjectMethods}  


  
`;

  return {
    template,
    title: `${model} Entity`,
    fileName: `libs/core-data/src/lib/services/${refs}/${refs}.service.ts`,
  };
};

export const DotnetEntityGenerator: Generator = {
  generate,
};

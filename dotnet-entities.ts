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
} from "./shared-dotnet-utility-methods";

const generate = (schema: Schema, { name }: Config) => {
  const { ref, refs, model, models, singleParams } =
    buildNameVariations(schema);
  const { props } = schema;

  const constructorParameters = getConstructorParameters(props);
  const foreignObjSchemas = getforeignObjSchemas(props);

  const assignments = props
    .filter((p) => p.type === "string")
    .map((p) => {
      return `\t${startCase(p.value)} = Guard.Against.NullOrEmpty(${camelCase(
        p.value
      )}, nameof(${camelCase(p.value)}));
`;
    })
    .join("");

  const addObjectMethods = foreignObjSchemas
    .map((obj) => {
      return `\tpublic void Add${obj.model}(${obj.model} new${obj.model})
\t{
\t\tGuard.Against.Null(new${obj.model}, nameof(new${obj.model}));
\t\t_${obj.ref}.Add(new${obj.model});
          
\t\tvar new${obj.model}AddedEvent = new New${obj.model}AddedEvent(this, new${obj.model});
\t\tbase.RegisterDomainEvent(new${obj.model}AddedEvent);
\t};

\tpublic void Remove${obj.model}(${obj.model} ${obj.ref})
\t{
\t\tGuard.Against.Null(${obj.ref}, nameof(${obj.ref}));
\t\t_${obj.ref}.Remove(${obj.ref});
          
\t\tvar new${obj.model}RemovedEvent = new New${obj.model}RemovedEvent(this, ${obj.model});
\t\tbase.RegisterDomainEvent(new${obj.model}RemovedEvent);
\t};
            `;
    })
    .join("");

  const constructor = `\tpublic ${model}(${constructorParameters})
\t{
${assignments}
\t}`;

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

}
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

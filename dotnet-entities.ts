import { Config, Generator, Schema } from "./meta-models";
import {
  buildNameVariations,
  camelCase,
  lowercase,
  pascalCase,
  startCase,
} from "./name-variations";
import { getConstructorParameters } from "./shared-dotnet-utility-methods";

const generate = (schema: Schema, { name }: Config) => {
  const { ref, refs, model, models, singleParams } =
    buildNameVariations(schema);
  const { props } = schema;
  
  const constructorParameters = getConstructorParameters(props);

  const assignments = props.filter((p) => p.type === 'string').map((p) =>  {
          return `${startCase(p.value)} = Guard.Against.NullOrEmpty(${camelCase(p.value)}, nameof(${camelCase(p.value)}));
`;  
      }).join("");

const addObjectMethods = props.filter((p) => p.type === 'objectList').map((p) => {
   const obj = buildNameVariations(p.value);
  return `public void Add${obj.model}(${obj.model} new${obj.model})
{
  Guard.Against.Null(new${obj.model}, nameof(new${obj.model}));
  _${obj.ref}.Add(new${obj.model});
          
  var new${obj.model}AddedEvent = new New${obj.model}AddedEvent(this, new${obj.model});
  base.RegisterDomainEvent(new${obj.model}AddedEvent);
};

public void Remove${obj.model}(${obj.model} ${obj.ref})
{
  Guard.Against.Null(${obj.ref}, nameof(${obj.ref}));
  _${obj.ref}.Remove(${obj.ref});
          
  var new${obj.model}RemovedEvent = new New${obj.model}RemovedEvent(this, ${obj.model});
  base.RegisterDomainEvent(new${obj.model}RemovedEvent);
};
            `;
        }
      
    )
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

import { Config, Generator, Schema } from "./meta-models";
import {
  IVariations,
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
  const parent = buildNameVariations(schema);
  const { props } = schema;

  const genEventOfForeignObjectAddedToParent = (
    name,
    foreignObj: Schema,
    parent: IVariations
  ) => {
    const f = buildNameVariations(foreignObj);

    return `
  using ${name}.SharedKernel;
  namespace ${name}.Core.ProjectAggregate.Events;
  
  public class New${f.model}AddedEvent : DomainEventBase
  {

    public ${parent.model} ${parent.model} { get; set; }
    public ${f.model} New${f.model} { get; set; }

    public  New${f.model}AddedEvent(${parent.model} ${parent.ref}, ${f.model} new${f.model})
    {
      New${f.model} = new${f.model};
      ${parent.model} = ${parent.ref};
    }
  
  }
  `;
  };

  const foreignObjects = props.filter((p) => p.type === "objectList");
  const foreignObjectEvents = foreignObjects
    .map((f) => genEventOfForeignObjectAddedToParent(name, f.value, parent))
    .join("\n\n\n");

  const template = `${foreignObjectEvents}
  `;

  return {
    template,
    title: `${parent.model} Entity`,
    fileName: `libs/core-data/src/lib/services/${parent.refs}/${parent.refs}.service.ts`,
  };
};

export const DotnetDomainEventGenerator: Generator = {
  generate,
};

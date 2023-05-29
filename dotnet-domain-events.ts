import { Config, Generator, Schema } from "./meta-models";
import { IVariations, buildNameVariations } from "./name-variations";

const generate = (schema: Schema, { name }: Config) => {
  const parent = buildNameVariations(schema);
  const { props } = schema;
  const safeProps = props || [];

  const genEventOfForeignObjectAddedToParent = (
    name,
    foreignObj: Schema,
    parent: IVariations
  ) => {
    const f = buildNameVariations(foreignObj);
    if (!f.model || !parent.model || !parent.ref || !f.ref) {
      return "";
    }

    return `
  //separate file
  //src/${name}.Core/ProjectAggregate/Events/New${f.model}AddedTo${parent.model}Event.cs
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
  \n\n
  `;
  };

  const foreignObjects = safeProps.filter((p) => p.type === "objectList");
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

import { Config, Generator, Schema } from "./meta-models";
import { buildNameVariations } from "./name-variations";
import {
  getForeignObjectToBeReturnedWithSpecification,
  getforeignObjSchemas,
} from "./shared-dotnet-utility-methods";

const generate = (schema: Schema, { name }: Config) => {
  const parent = buildNameVariations(schema);
  const { props } = schema;
  const safeProps = props || [];

  const foreignObjSchemas = getforeignObjSchemas(safeProps) || [];
  const foreignObjectToBeReturnedWithSpecification =
    getForeignObjectToBeReturnedWithSpecification(foreignObjSchemas) || "";

  const includeStatements = (foreignObjSchemas || [])
    .map((f) => {
      return `.Include(${parent.ref} => ${parent.ref}.${f.model})`;
    })
    .join("\n \t");

  const template = `
using Ardalis.Specification;
using ${name}.Core.ProjectAggregate;

namespace ${name}.Core.ProjectAggregate.Specifications;

public class ${parent.model}ByIdWith${foreignObjectToBeReturnedWithSpecification}Spec : Specification&lt;${parent.model}>, ISingleResultSpecification
{
  public ${parent.model}ByIdWith${foreignObjectToBeReturnedWithSpecification}Spec(int ${parent.ref}Id)
  {
    Query
        .Where(${parent.ref} => ${parent.ref}.Id == ${parent.ref}Id)
       ${includeStatements}
  }
}
  `;

  return {
    template,
    title: `${parent.model} Entity`,
    fileName: `libs/core-data/src/lib/services/${parent.refs}/${parent.refs}.service.ts`,
  };
};

export const DotnetSpecificationsGenerator: Generator = {
  generate,
};

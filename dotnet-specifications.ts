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
  getForeignObjectToBeReturnedWithSpecification,
  getforeignObjSchemas,
  getValueTypeMembers,
  quoteWrapper,
} from "./shared-dotnet-utility-methods";
import { faker } from "@faker-js/faker";

const generate = (schema: Schema, { name }: Config) => {
  const parent = buildNameVariations(schema);
  const { props } = schema;

  const foreignObjSchemas = getforeignObjSchemas(props);
  const foreignObjectToBeReturnedWithSpecification =
    getForeignObjectToBeReturnedWithSpecification(foreignObjSchemas);

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
        .Include(${parent.ref} => ${parent.ref}.${foreignObjectToBeReturnedWithSpecification});
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

import { Config, Generator, Schema } from "./meta-models";
import { buildNameVariations } from "./name-variations";

const generate = (schema: Schema, { name }: Config) => {
  const { ref, refs, model, models, singleParams } =
    buildNameVariations(schema);

  const template = `
  public DbSet&lt;${model}&gt; ${models} => Set&lt;${model}&gt;();
`;

  return {
    template,
    title: `${model} Entity`,
    fileName: `libs/core-data/src/lib/services/${refs}/${refs}.service.ts`,
  };
};

export const DotnetAddToDbContextGenerator: Generator = {
  generate,
};

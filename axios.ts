import { Config, Generator, Schema } from "./meta-models";
import { buildNameVariations } from "./name-variations";

const generate = (schema: Schema, { scope }: Config) => {
  const { ref, refs, model, models, singleParam } = buildNameVariations(schema);

  const template = `
import axios from 'axios';
import { ${model} } from '@${scope}/api-interfaces';
import { environment } from '@env/environment';

const baseURL = environment.apiEndpoint;
const model = '${refs}';

const getUrl = () => \`\${baseURL}\${model}\`;
const getUrlWithId = (id: string | null) => \`\${getUrl()}/\${id}\`;

const load = async () => 
  await axios.get(\`\${getUrl()}\`);

const find = async (id: string) => 
  await axios.get(\`\${getUrlWithId(id)}\`);

const create = async (${singleParam}) =>
  await axios.post(\`\${getUrl()}\`, ${ref});

const update = async (${singleParam}) =>
  await axios.put(\`\${getUrlWithId(${ref}.id)}\`, ${ref});
  
const remove = async (id: string | null) => 
  await axios.delete(\`\${getUrlWithId(id)}\`);

export const ${refs}Api = {
  load,
  find,
  create,
  update,
  remove,
};
`;

  return {
    template,
    title: `${models} Axios Service`,
    fileName: `libs/core-data/src/lib/services/${schema.modelPlural}/${schema.modelPlural}.api.ts`,
  };
};

export const AxiosGenerator: Generator = {
  generate,
};

import "./style.css";
import "highlight.js/styles/tomorrow-night-bright.css";

import hljs from "highlight.js";
import typescript from "highlight.js/lib/languages/typescript";

hljs.registerLanguage("typescript", typescript);

import { AxiosGenerator } from "./axios-generator";
import { ServiceGenerator } from "./service-generator";
import { ReducerGenerator } from "./reducer-generator";
import { Config, Schema } from "./meta-models";
import { buildNameVariations } from "./name-variations";

const albumSchema: Schema = {
  model: "album",
  modelPlural: "albums",
};

const config: Config = {
  name: "workshop",
  application: "dashboard",
  scope: "acme",
};

const appDiv: HTMLElement = document.getElementById("app");
appDiv.innerHTML = `
<h2>Model Name Variations</h2>
<pre>
<code class="language-typescript">${JSON.stringify(
  buildNameVariations(albumSchema),
  null,
  2
)}</code> 
</pre>
<hr />

<h2>HttpClient Template</h2>
<pre>
<code class="language-typescript">${
  ServiceGenerator.generate(albumSchema, config).template
}</code>  
</pre>

<h2>Axios Template</h2>
<pre>
<code class="language-typescript">${
  AxiosGenerator.generate(albumSchema, config).template
}</code>  
</pre>

<h2>Reducer Template</h2>
<pre>
<code class="language-typescript">${
  ReducerGenerator.generate(albumSchema, config).template
}</code>  
</pre>
`;

hljs.highlightAll();

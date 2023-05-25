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
import { GrpcServiceGenerator } from "./grpc-service-generator";
import { DotnetEntityGenerator } from "./dotnet-entities";

const projectSchema: Schema = {
  model: "project",
  modelPlural: "projects",
};

const clientSchema: Schema = {
  model: "client",
  modelPlural: "clients",
  props: [{ string: "name" }, {string: 'primaryContact'}, { objectList: projectSchema }],
};

const config: Config = {
  name: "EQengineered.dotNetDemo",
  application: "",
  scope: "",
};

const appDiv: HTMLElement = document.getElementById("app");
appDiv.innerHTML = `
<h2>.NET Entities </h2>
<pre>
<code class="language-typescript">${
  DotnetEntityGenerator.generate(clientSchema, config).template
}</code>  
</pre>

<h2>.NET GRPC Service </h2>
<pre>
<code class="language-typescript">${
  GrpcServiceGenerator.generate(clientSchema, config).template
}</code>  
</pre>

<h2>Model Name Variations</h2>
<pre>
<code class="language-typescript">${JSON.stringify(
  buildNameVariations(clientSchema),
  null,
  2
)}</code> 
</pre>
<hr />

<h2>HttpClient Template</h2>
<pre>
<code class="language-typescript">${
  ServiceGenerator.generate(clientSchema, config).template
}</code>  
</pre>

<h2>Axios Template</h2>
<pre>
<code class="language-typescript">${
  AxiosGenerator.generate(clientSchema, config).template
}</code>  
</pre>

<h2>Reducer Template</h2>
<pre>
<code class="language-typescript">${
  ReducerGenerator.generate(clientSchema, config).template
}</code>  
</pre>


`;

hljs.highlightAll();

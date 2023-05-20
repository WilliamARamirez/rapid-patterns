import "./style.css";
import "highlight.js/styles/tomorrow-night-bright.css";

import hljs from "highlight.js";
import typescript from "highlight.js/lib/languages/typescript";

hljs.registerLanguage("typescript", typescript);

const SPACE = " ";
const UNDERSCORE = "_";
const HYPHEN = "-";

const title = "Rapid Application Development Patterns";
const removeSpaces = (s) => s.split(SPACE).join("");
const replaceSpaces = (s, sub) => s.split(SPACE).join(sub);
const replace = (s, targ, sub) => s.split(targ).join(sub);

const pascalCase = removeSpaces(title);
const snakeCase = replaceSpaces(title, UNDERSCORE);
const kebabCase = replace(snakeCase, UNDERSCORE, HYPHEN);

// Example: Dynamic Method Invocation
const add = ({ a, b }) => a + b;
const subtract = ({ a, b }) => a - b;
const divide = ({ a, b }) => a / b;
const multiply = ({ a, b }) => a * b;

const transaction = { func: add, params: { a: 1, b: 3 } };

const ledger = [
  { func: add, params: { a: 1, b: 3 } },
  { func: subtract, params: { a: 6, b: 5 } },
  { func: divide, params: { a: 6, b: 3 } },
  { func: multiply, params: { a: 2, b: 3 } },
];

const execute = (action) => action.func(action.params);

const result = execute(transaction);

let output = "";
ledger.forEach((action) => (output += `\nResult: ${execute(action)}`));

const mappedOutput = ledger.map((action) => execute(action));

const reducedOutput = ledger.reduce((total, line) => {
  return (total += execute(line));
}, 0);

const appDiv: HTMLElement = document.getElementById("app");
appDiv.innerHTML = `
<h2>Rapid Primer</h2>

<h4>Basic String Manipulation</h4>
<pre>
<code class="language-typescript">
 "${title}"
 // becomes 
 "${pascalCase}"
 // when we remove spaces

 "${title}"
 // becomes
 "${snakeCase}"
 // when we replace spaces with an underscore

 "${snakeCase}"
 // becomes
 "${kebabCase}"
 // when we replace underscores with a hypen
</code> 
</pre>

<h4>Single Invocation</h4>
<pre>
<code class="language-typescript">${result}</code> 
</pre>

<h4>Sequenced Invocation</h4>
<pre>
<code class="language-typescript">${output}</code> 
</pre>

<h4>Mapped Invocation</h4>
<pre>
<code class="language-typescript">
${JSON.stringify(mappedOutput, null, 2)}
</code> 
</pre>

<h4>Reduced Invocation</h4>
<pre>
<code class="language-typescript">
${JSON.stringify(reducedOutput, null, 2)}
</code> 
</pre>
`;

hljs.highlightAll();

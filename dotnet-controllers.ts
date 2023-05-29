import { Config, Generator, Schema } from "./meta-models";
import {
  buildNameVariations,
  camelCase,
  lowercase,
  pascalCase,
  startCase,
} from "./name-variations";
import {
  getForeignObjectToBeReturnedWithSpecification,
  getValueTypeMembers,
  getforeignObjSchemas,
} from "./shared-dotnet-utility-methods";

const generate = (schema: Schema, { name }: Config) => {
  const { ref, refs, model, models, singleParams } =
    buildNameVariations(schema);

  const { props } = schema;
  const safeProps = props || [];
  const valueTypeMembers = getValueTypeMembers(safeProps) || [];
  const foreignObjSchemas = getforeignObjSchemas(safeProps) || [];

  const foreignObjsAssignmentArray = valueTypeMembers.map((m, index, arr) => {
    const isLast = index === arr.length - 1;
    if (!m.value) {
      return "";
    }
    return `${camelCase(m.value)}: ${ref}.${pascalCase(m.value)}${
      isLast ? "" : ", \n \t"
    }`;
  });
  const dtoValueTypeProperties = [
    ...[`id: ${ref}.Id, \n \t`],
    ...foreignObjsAssignmentArray,
  ].join("\t");

  const foreignObjLists = safeProps
    .filter((p) => p.type === "objectList")
    .map((p) => {
      const obj = p?.value;
      const childSchema = buildNameVariations(obj);
      const memberStrings = (obj?.props || []).filter(
        (m) => m.type === "string"
      );
      const ctorArgsForObj = (memberStrings || []).map((ms, index, arr) => {
        const isLast = index === arr.length - 1;
        if (!childSchema?.ref || !ms.value) {
          return "";
        }
        return `${childSchema.ref}.${startCase(ms.value)}${
          isLast ? "" : ", \n \t"
        }`;
      });

      if (
        !childSchema?.ref ||
        !childSchema?.model ||
        !childSchema?.models ||
        !childSchema?.refs
      ) {
        return "";
      }

      return `${childSchema.refs}: new List&lt;${childSchema.model}DTO&gt;
         (
             ${ref}.${childSchema.models}.Select(${childSchema.ref} => new ${childSchema.model}DTO(${childSchema.ref}.Id, ${ctorArgsForObj}).ToList()
         )
         `;
    });

  const requestObjCtorArgs = (valueTypeMembers || [])
    .map((m, index, arr) => {
      const isLast = index === arr.length - 1;
      if (!m.value) {
        return "";
      }
      return `request.${startCase(m.value)}${isLast ? "" : ", "}`;
    })
    .join("");

  const ctorResultDtoValues = [...[{ value: "id" }], ...valueTypeMembers];
  const creationResultDto = (ctorResultDtoValues || [])
    .map((v, index, arr) => {
      const isLast = index === arr.length - 1;
      if (!v.value) {
        return "";
      }
      return `${lowercase(v.value)}: created${model}.${pascalCase(v.value)}${
        isLast ? "" : ", \n \t"
      }`;
    })
    .join("");

  const foreignObjectToBeReturnedWithSpecification =
    getForeignObjectToBeReturnedWithSpecification(foreignObjSchemas);

  const template = `
  using ${name}.Core.ProjectAggregate;
  using ${name}.Core.ProjectAggregate.Specifications;
  using ${name}.SharedKernel.Interfaces;
  using ${name}.Web.ApiModels;
  using Microsoft.AspNetCore.Mvc;
  
  namespace ${name}.Web.Api;

  public class ${models}Controller : BaseApiController
  {
    private readonly IRepository&lt;${model}&gt; _repository;
  
    public ${models}Controller(IRepository&lt;${model}&gt; repository)
    {
      _repository = repository;
    }
  
    // GET: api/${models}
    [HttpGet]      
    public async Task&lt;IActionResult&gt; List()
    {
      var ${ref}DTOs = (await _repository.ListAsync())
          .Select(${ref} => new ${model}DTO
          (
                ${dtoValueTypeProperties}
          ))
          .ToList();
  
      return Ok(${ref}DTOs);
    }
  
    // GET: api/${models}/{${ref}Id}
    [HttpGet("{${ref}Id:int}")]
    public async Task<IActionResult> GetById(int ${ref}Id)
    {
      var ${model}spec = new ${model}ByIdWith${foreignObjectToBeReturnedWithSpecification}Spec(${ref}Id);
      var ${ref} = await _repository.FirstOrDefaultAsync(${model}spec);
      if (${ref} == null)
      {
        return NotFound();
      }
  
      var result = new ${model}DTO
      (
                ${dtoValueTypeProperties}${foreignObjLists ? "," : ""}
                ${foreignObjLists}
      );
  
      return Ok(result);
    }
  
    // POST: api/${models}
    [HttpPost]
    public async Task<IActionResult> Post([FromBody] Create${model}DTO request)
    {
      var new${model} = new ${model}(${requestObjCtorArgs});
  
      var created${model} = await _repository.AddAsync(new${model});
  
      var result = new ${model}DTO
      (
        ${creationResultDto}
      );
      return Ok(result);
    }
  
  }
`;

  return {
    template,
    title: `${model} Entity`,
    fileName: `libs/core-data/src/lib/services/${refs}/${refs}.service.ts`,
  };
};

export const DotnetControllerGenerator: Generator = {
  generate,
};

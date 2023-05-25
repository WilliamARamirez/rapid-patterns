import { Config, Generator, Schema } from "./meta-models";
import {
  buildNameVariations,
  camelCase,
  lowercase,
  pascalCase,
  startCase,
} from "./name-variations";
import { getConstructorParameters, getStringsFromProps } from "./shared-dotnet-utility-methods";

const generate = (schema: Schema, { name }: Config) => {
    const { ref, refs, model, models, singleParams } =
    buildNameVariations(schema);

    const { props } = schema;
    const topLevelStrings = getStringsFromProps(props);


    const dtoValuePropsArray = topLevelStrings
    .map((p , index, arr) => {
      const isLast = index === arr.length - 1;
            return `${camelCase(p.value)}: ${ref}.${pascalCase(p.value)}${isLast ? "" : ", \n \t"}`;
        })
    const dtoValueProps = [...[`id: ${ref}.Id, \n \t`], ...dtoValuePropsArray].join("\t");


    const dtoObjectProps = props
        .filter((p) => p.type === 'objectList')
        .map((p ) => {
        const obj = p.value;
        const objSchema = buildNameVariations(obj);
        const objStrings = obj.props.filter((p) => p.type === 'string')
         const args =  objStrings.map((p , index, arr) => {
            const isLast = index === arr.length - 1;
            return `${objSchema.ref}.${startCase(p.value)}${isLast ? "" : ", \n \t"}`;
        });
        
        return `${objSchema.refs}: new List&lt;${objSchema.model}DTO&gt;
         (
             ${ref}.${objSchema.models}.Select(${objSchema.ref} => new ${objSchema.model}DTO(${objSchema.ref}.Id, ${args}).ToList()
         )
         `;
        });

    const constructorReqArgs  =  topLevelStrings.map((p , index, arr) => {
        const isLast = index === arr.length - 1;
        return `request.${startCase(p.value)}${isLast ? "" : ", \n \t"}`;
    }).join("");

   const creationResultDtoValues =  [  ... [{value: 'id'}], ...topLevelStrings ];
    const creationResultDto = creationResultDtoValues.map((p , index, arr) => {
        const isLast = index === arr.length - 1;
        return `${lowercase(p.value)}: created${model}.${pascalCase(p.value)}${isLast ? "" : ", \n \t"}`;
    }).join("");


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
                ${dtoValueProps}
          ))
          .ToList();
  
      return Ok(${ref}DTOs);
    }
  
    // GET: api/${models}/{${ref}Id}
    [HttpGet("{${ref}Id:int}")]
    public async Task<IActionResult> GetById(int ${ref}Id)
    {
      var ${model}spec = new ${model}ByIdWithProjectsSpec(${ref}Id);
      var ${ref} = await _repository.FirstOrDefaultAsync(${model}spec);
      if (${ref} == null)
      {
        return NotFound();
      }
  
      var result = new ${model}DTO
      (
                ${dtoValueProps}${dtoObjectProps? ",": ""}
                ${dtoObjectProps}
      );
  
      return Ok(result);
    }
  
    // POST: api/${models}
    [HttpPost]
    public async Task<IActionResult> Post([FromBody] Create${model}DTO request)
    {
      var new${model} = new ${model}(${constructorReqArgs});
  
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

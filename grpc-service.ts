import { Config, Generator, Schema } from "./meta-models";
import { buildNameVariations } from "./name-variations";

const generate = (schema: Schema, { scope }: Config) => {
  const { ref, refs, model, models, singleParam } = buildNameVariations(schema);

  const template = `
  using Grpc.Core;
  using EQengineered.dotNetDemo.Web;
  
  namespace GrpcServices;

  public class ${models}Service : ${models}.${models}Base
{
  private readonly ILogger< ${models}Service> _logger;

  public ${models}Service (ILogger< ${models}Service> logger)
  {
  _logger = logger;
  }

  public override Task< ${model}Reply> Get${model}(${model}Request request, ServerCallContext context)
  {

    var ${model}Id = request.name
    var spec = new ${model}ByIdWithItemsSpec(${model}Id);
    var ${model} = await _${model}Repository.FirstOrDefaultAsync(spec);
    if (${model} == null)
    {
      return NotFound();
    }

      return Task.FromResult(new ${model}Reply
      {
        Id = ${model}.Id,
        Name = ${model}.Name,
        Items = ${model}.Items
                      .Select(ToDoItemViewModel.FromToDoItem)
                      .ToList()
      });
  }

  public override Task< ${models}Reply> Get${models}(${models}Request request, ServerCallContext context)
  {
      return Task.FromResult(new ${models}Reply
      {
              Message = "${ref}"
      });
  }
} `;

  return {
    template,
    title: `${models} Service`,
    fileName: `libs/core-data/src/lib/services/${refs}/${refs}.service.ts`,
  };
};

export const GrpcServiceGenerator: Generator = {
  generate,
};

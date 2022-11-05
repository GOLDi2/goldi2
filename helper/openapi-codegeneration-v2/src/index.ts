import { program } from "commander";
import SwaggerParser from "@apidevtools/swagger-parser";
import {
  quicktype,
  InputData,
  JSONSchemaInput,
  FetchingJSONSchemaStore,
} from "quicktype-core";

import nunjucks from "nunjucks";
import {
  await_filter,
  formatPath_filter,
  hasPathParameter_filter,
  lowerCamelCase_filter,
  lowerSnakeCase_filter,
  replaceRegEx_filter,
  upperCamelCase_filter,
} from "./filter";
import { readdirSync, writeFileSync, mkdirSync } from "fs";
import { OpenAPIV3_1 } from "openapi-types";
import { join, resolve } from "path";

const env = nunjucks.configure({ autoescape: false, noCache: true });
env.addFilter("formatPath", formatPath_filter);
env.addFilter("hasPathParameter", hasPathParameter_filter);
env.addFilter("upperCamelCase", upperCamelCase_filter);
env.addFilter("lowerCamelCase", lowerCamelCase_filter);
env.addFilter("lowerSnakeCase", lowerSnakeCase_filter);
env.addFilter("replaceRegEx", replaceRegEx_filter);
env.addFilter("await", await_filter, true);

let inputData: InputData;
let schema_mapping: string[] = [];

const schemas_cache: Record<string, string>={};
async function schemas(language: string) {
  if (schemas_cache[language]) {
    return schemas_cache[language];
  }
  const res = await quicktype({
    inputData,
    lang: "python",
    rendererOptions: {
      "just-types": "false",
      "nice-property-names": "true",
    },
  });
  schemas_cache[language] = res.lines.join("\n");
  return schemas_cache[language];
}

async function type(language: string, type: string) {
  const s = await schemas(language);
  const re = new RegExp(`^def (.*)_from_dict\\(.*\\) -> (.*):$`, "gm");
  const m = Array.from(s.matchAll(re));
  const i = schema_mapping.indexOf(type);
  if(i>=0)
    return m[i][2];
  return undefined
}

async function transformerFromDict(language: string, type: string) {
  const s = await schemas(language);
  const re = new RegExp(`^def (.*)_from_dict\\(.*\\) -> (.*):$`, "gm");
  const m = Array.from(s.matchAll(re));
  const i = schema_mapping.indexOf(type);
  if(i>=0)
    return m[i][1]+"_from_dict";
  return undefined
}

async function transformerToDict(language: string, type: string) {
  const s = await schemas(language);
  const re = new RegExp(`^def (.*)_from_dict\\(.*\\) -> (.*):$`, "gm");
  const m = Array.from(s.matchAll(re));
  const i = schema_mapping.indexOf(type);
  if(i>=0)
    return m[i][1]+"_to_dict";
  return undefined
}

env.addGlobal("schemas", schemas);
env.addGlobal("type", type);
env.addGlobal("transformerFromDict", transformerFromDict);
env.addGlobal("transformerToDict", transformerToDict);

async function main() {
  program
    .name("openapi-codegeneration")
    .description("Generate code from an OpenAPI service")
    .version("0.2.0")
    .requiredOption("-i, --input <string>", "openapi input file")
    .requiredOption("-t, --template <string>", "openapi template name")
    .requiredOption("-o, --output <string>", "openapi output directory");

  program.parse();
  const options = program.opts();
  const input: string = options.input;

  const api = (await SwaggerParser.validate(input)) as OpenAPIV3_1.Document;
  if (api.openapi !== "3.1.0") {
    console.error(
      `Only OpenAPI 3.1.0 is supported, but ${api.info.version} was provided. Please upgrade your OpenAPI file.`
    );
    process.exit(1);
  }

  inputData = extractSchemaInput(api);
  const context = {
    ...api,
    schemas,
  };

  const outputDir = resolve(process.cwd(), options.output);
  // make sure outputDir exists
  mkdirSync(outputDir, { recursive: true });

  // render all templates in the template directory
  let templateDir = resolve(__dirname, "../templates", options.template);
  if (options.template.startsWith(".")) {
    templateDir = resolve(process.cwd(), options.template);
  }

  for (const file of readdirSync(templateDir)) {
    const template = join(templateDir, file);
    const output = join(outputDir, file.replace(".njk", ""));

    nunjucks.render(template, context, (err, res) => {
      console.log(`Writing ${output}`);
      if (err) console.error(err);
      writeFileSync(output, res as string);
    });
  }
}

main();

function extractSchemaInput(api: OpenAPIV3_1.Document): InputData {
  const schemas = new InputData();

  if (api.paths) {
    for (const path of Object.keys(api.paths)) {
      const pathItem = api.paths[path] as OpenAPIV3_1.PathItemObject;
      for (const method of Object.keys(pathItem)) {
        const operation = pathItem[
          method as OpenAPIV3_1.HttpMethods
        ] as OpenAPIV3_1.OperationObject;
        const requestBody = operation.requestBody as
          | OpenAPIV3_1.RequestBodyObject
          | undefined;
        if (requestBody) {
          const content = requestBody.content;
          const schema = content["application/json"].schema;
          const name = lowerSnakeCase_filter(
            `${method}_${formatPath_filter(path)}_request_body`
          );
          if (schema) {
            schema_mapping.push(name);
            const schemaInput = new JSONSchemaInput(new FetchingJSONSchemaStore());
            schemas.addInput(schemaInput);
            schemaInput.addSource({
              name,
              schema: JSON.stringify(schema),
            });
          }
        }

        const responses = operation.responses;
        for(const key in responses) {
          const response = responses[key];
          if("content" in response) {
            const content = response.content;
            if (content){
              const schema = content["application/json"].schema;
              const name = lowerSnakeCase_filter(`${method}_${formatPath_filter(path)}_response_body_${key}`);
              if (schema) {
                schema_mapping.push(name);
                const schemaInput = new JSONSchemaInput(new FetchingJSONSchemaStore());
                schemas.addInput(schemaInput);
                schemaInput.addSource({
                  name,
                  schema: JSON.stringify(schema),
                });
              }
            }
          }
        }
      }
    }
  }
  return schemas;
}
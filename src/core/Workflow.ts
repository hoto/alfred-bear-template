import { BearTemplateIndex, Template } from "./BearTemplateIndex.js";
import { checkIfTemplateIndexExists } from "./utils.js";
import yaml from "yaml";
import fs from "fs";
import { BearTemplateError } from "./Error.js";
export type TemplateMapperFunction<ResultType> = (
  template: Template,
  index: number,
  array: Template[]
) => ResultType;

export class Workflow {
  private templateIndex: BearTemplateIndex | null = null;

  constructor(private pathToIndexFile: string) {}

  private async readIndexFile(): Promise<BearTemplateIndex> {
    const indexFile = await checkIfTemplateIndexExists(this.pathToIndexFile);
    return new Promise((resolve, _reject) => {
      fs.readFile(indexFile, "utf8", (err, data) => {
        if (err)
          throw new BearTemplateError(
            `Could not read index file at ${indexFile}`
          );
        resolve(yaml.parse(data));
      });
    });
  }

  async init(): Promise<void> {
    this.templateIndex = await this.readIndexFile();
  }

  get templates(): Template[] {
    return this.templateIndex ? this.templateIndex.templates : [];
  }

  mapTemplates<T>(mapper: TemplateMapperFunction<T>): T[] {
    if (this.templateIndex?.templates) {
      return this.templateIndex.templates.map(mapper);
    }
    return [];
  }
}

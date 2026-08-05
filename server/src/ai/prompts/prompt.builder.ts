import { PROMPT_TEMPLATES } from './templates';
import { PromptVariables } from '../types';

export class PromptBuilder {
  private systemTemplate: string = '';
  private userTemplate: string = '';
  private variables: PromptVariables = {};

  constructor(templateKey?: keyof typeof PROMPT_TEMPLATES) {
    if (templateKey && PROMPT_TEMPLATES[templateKey]) {
      this.systemTemplate = PROMPT_TEMPLATES[templateKey].system;
      this.userTemplate = PROMPT_TEMPLATES[templateKey].user;
    }
  }

  public setSystemTemplate(template: string): this {
    this.systemTemplate = template;
    return this;
  }

  public setUserTemplate(template: string): this {
    this.userTemplate = template;
    return this;
  }

  public setVariables(variables: PromptVariables): this {
    this.variables = { ...this.variables, ...variables };
    return this;
  }

  public setVariable(key: string, value: string): this {
    this.variables[key] = value;
    return this;
  }

  private interpolate(template: string, vars: PromptVariables): string {
    let result = template;
    for (const [key, value] of Object.entries(vars)) {
      // Replaces occurrences of {key} with value
      result = result.replace(new RegExp(`{${key}}`, 'g'), value);
    }
    return result;
  }

  /**
   * Compiles templates replacing brackets tokens with variables.
   */
  public build() {
    const systemInstruction = this.interpolate(this.systemTemplate, this.variables);
    const userPrompt = this.interpolate(this.userTemplate, this.variables);

    return {
      systemInstruction,
      userPrompt,
    };
  }
}

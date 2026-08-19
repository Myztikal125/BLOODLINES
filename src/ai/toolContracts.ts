export interface ToolProperty {
  type: "string" | "number" | "integer" | "boolean" | "object" | "array";
  description?: string;
  enum?: string[];
}

export interface ToolContract<Args extends Record<string, unknown> = Record<string, unknown>> {
  name: string;
  description: string;
  properties: Record<string, ToolProperty>;
  required?: readonly string[];
  execute: (args: Args) => Promise<unknown> | unknown;
}

/**
 * Keep the LLM-facing schema and executable handler in one contract.
 * Registration is explicit so an AI cannot expose a tool that has no handler.
 */
export class ToolRegistry {
  private readonly contracts = new Map<string, ToolContract>();

  register<Args extends Record<string, unknown>>(contract: ToolContract<Args>): void {
    if (this.contracts.has(contract.name)) throw new Error(`Tool already registered: ${contract.name}`);
    this.contracts.set(contract.name, contract as ToolContract);
  }

  get(name: string): ToolContract | undefined {
    return this.contracts.get(name);
  }

  list(): ToolContract[] {
    return [...this.contracts.values()];
  }

  async execute(name: string, args: Record<string, unknown>): Promise<unknown> {
    const contract = this.contracts.get(name);
    if (!contract) throw new Error(`Unknown tool: ${name}`);
    validateRequiredArguments(contract, args);
    return contract.execute(args);
  }
}

function validateRequiredArguments(contract: ToolContract, args: Record<string, unknown>): void {
  for (const name of contract.required ?? []) {
    if (!(name in args) || args[name] === undefined || args[name] === null) {
      throw new Error(`Missing required argument '${name}' for tool '${contract.name}'`);
    }
  }
}

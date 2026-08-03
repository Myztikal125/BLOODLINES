import { Command } from "./command";

export class CommandManager {

  private commands: Map<string, Command> =
    new Map();

  register(command: Command) {

    this.commands.set(
      command.name,
      command
    );

  }

  execute(input: string): string {

    const parts =
      input.trim().split(" ");

    const name = parts[0];

    const command =
      this.commands.get(name);

    if (!command) {
      return "Unknown command.";
    }

    return command.execute(
      parts.slice(1)
    );

  }

}

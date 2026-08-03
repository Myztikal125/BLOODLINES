import { Command } from "./command";

export class HelpCommand implements Command {

  name = "help";

  execute(): string {

    return `
Available Commands:

character
inventory
explore
look
attack
cast
help
`;

  }

}

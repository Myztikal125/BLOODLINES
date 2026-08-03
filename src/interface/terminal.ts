import * as readline from "node:readline";

export class TerminalInterface {
  private rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  start(callback: (input: string) => void) {
    console.log(`
=========================
       BLOODLINES
=========================

The adventure begins...
`);

    this.prompt(callback);
  }

  private prompt(callback: (input: string) => void) {
    this.rl.question("> ", (answer) => {
      callback(answer);
      this.prompt(callback);
    });
  }
}

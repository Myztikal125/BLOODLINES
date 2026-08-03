export interface Command {

  name: string;

  execute(
    args?: string[]
  ): string;

}

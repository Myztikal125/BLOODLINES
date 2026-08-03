export interface DMContext {
  location: string;
  players: string[];
  activeQuest?: string;
  situation: string;
}

export class DungeonMaster {

  generateNarration(context: DMContext): string {

    return `
Location: ${context.location}

The adventure continues...

Situation:
${context.situation}
`;
  }

  createQuest(theme: string) {

    return {
      title: `The ${theme}`,
      description:
        "A new mystery has emerged that calls the heroes to action."
    };
  }
}

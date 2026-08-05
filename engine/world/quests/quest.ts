export interface QuestObjective {

  id: string;

  description: string;

  completed: boolean;

}


export interface Quest {

  id: string;

  title: string;

  description: string;

  objectives: QuestObjective[];

  completed: boolean;

  rewards: {

    experience: number;

    gold: number;

  };

}

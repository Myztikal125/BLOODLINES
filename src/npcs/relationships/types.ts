export interface NPCRelationship {

  fromNpc: string;

  toNpc: string;

  type:
    | "friend"
    | "mentor"
    | "rival"
    | "enemy"
    | "family"
    | "student"
    | "ally";

  history: string;

  strength: number;

  trust: number;
}

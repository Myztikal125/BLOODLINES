export interface TimelineEvent<T = unknown> {
  id: string;
  branchId: string;
  sequence: number;
  type: string;
  payload: T;
  timestamp: number;
}

export interface TimelineBranch {
  id: string;
  parentBranchId?: string;
  forkSequence: number;
  createdAt: number;
}

export class Timeline {
  private readonly events: TimelineEvent[] = [];
  private readonly branches = new Map<string, TimelineBranch>();
  private activeBranchId = "main";

  constructor() {
    this.branches.set("main", { id: "main", forkSequence: 0, createdAt: Date.now() });
  }

  append<T>(type: string, payload: T): TimelineEvent<T> {
    const event: TimelineEvent<T> = {
      id: `${this.activeBranchId}:${this.events.length + 1}`,
      branchId: this.activeBranchId,
      sequence: this.events.length + 1,
      type,
      payload,
      timestamp: Date.now(),
    };
    this.events.push(event as TimelineEvent);
    return event;
  }

  fork(branchId: string): TimelineBranch {
    if (this.branches.has(branchId)) throw new Error(`Timeline branch already exists: ${branchId}`);
    const branch: TimelineBranch = {
      id: branchId,
      parentBranchId: this.activeBranchId,
      forkSequence: this.events.length,
      createdAt: Date.now(),
    };
    this.branches.set(branchId, branch);
    this.activeBranchId = branchId;
    return branch;
  }

  selectBranch(branchId: string): void {
    if (!this.branches.has(branchId)) throw new Error(`Unknown timeline branch: ${branchId}`);
    this.activeBranchId = branchId;
  }

  getActiveBranch(): string {
    return this.activeBranchId;
  }

  getEvents(branchId = this.activeBranchId): readonly TimelineEvent[] {
    return this.events.filter(event => event.branchId === branchId);
  }
}

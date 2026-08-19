export interface Checkpoint<T = unknown> {
  id: string;
  branchId: string;
  createdAt: number;
  label: string;
  state: T;
}

export class CheckpointStore<T = unknown> {
  private readonly checkpoints = new Map<string, Checkpoint<T>>();

  save(id: string, label: string, state: T, branchId = "main"): Checkpoint<T> {
    const checkpoint = { id, label, state, branchId, createdAt: Date.now() };
    this.checkpoints.set(id, checkpoint);
    return checkpoint;
  }

  load(id: string): Checkpoint<T> {
    const checkpoint = this.checkpoints.get(id);
    if (!checkpoint) throw new Error(`Checkpoint not found: ${id}`);
    return checkpoint;
  }

  list(branchId?: string): Checkpoint<T>[] {
    return [...this.checkpoints.values()].filter(c => !branchId || c.branchId === branchId);
  }

  delete(id: string): boolean {
    return this.checkpoints.delete(id);
  }
}

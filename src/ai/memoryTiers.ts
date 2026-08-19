export interface MemoryTier<T = unknown> {
  name: "hot" | "warm" | "cold" | "episodic";
  items: readonly T[];
  tokenBudget?: number;
}

export interface ContextBundle<T = unknown> {
  hot: MemoryTier<T>;
  warm: MemoryTier<T>;
  cold: MemoryTier<T>;
  episodic: MemoryTier<T>;
}

/** Keep transient turn context separate from persistent state and retrieved lore. */
export function createContextBundle<T>(input: Partial<ContextBundle<T>>): ContextBundle<T> {
  return {
    hot: input.hot ?? { name: "hot", items: [] },
    warm: input.warm ?? { name: "warm", items: [] },
    cold: input.cold ?? { name: "cold", items: [] },
    episodic: input.episodic ?? { name: "episodic", items: [] },
  };
}

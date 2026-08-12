export enum RestType {
  ShortRest = "shortRest",
  LongRest = "longRest"
}

export class RestLifecycle {
  private current: RestType | undefined;

  begin(type: RestType): RestType {
    this.current = type;
    return type;
  }

  getCurrent(): RestType | undefined {
    return this.current;
  }

  clear(): void {
    this.current = undefined;
  }
}

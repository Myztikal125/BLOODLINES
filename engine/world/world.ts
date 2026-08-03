export interface Location {
  id: string;
  name: string;
  type: string;
  description: string;
}

export interface World {
  id: string;
  name: string;
  description: string;
  locations: Location[];
}

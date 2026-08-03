import { DataLoader } from "../data/dataLoader";

export class FeatureLoader {

  static loadFeatures() {

    return DataLoader.load(
      "data/features/features.json"
    );

  }

  static getFeature(id: string) {

    return this.loadFeatures()
      .find(
        (feature: any) =>
          feature.id === id
      );

  }

}

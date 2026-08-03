import { Feature } from "./feature";
import { FeatureLoader } from "./featureLoader";

export class FeatureManager {

  private features: Feature[] = [];

  addFeature(id: string): void {

    const feature =
      FeatureLoader.getFeature(id);

    if (feature) {
      this.features.push(feature);
    }

  }

  getFeatures(): Feature[] {
    return this.features;
  }

  hasFeature(id: string): boolean {

    return this.features.some(
      feature => feature.id === id
    );

  }

}

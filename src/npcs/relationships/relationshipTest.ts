import { RelationshipService } from "./relationshipService";

const service = new RelationshipService();

service.addRelationship({
  fromNpc: "thalia",
  toNpc: "eldric",
  type: "mentor",
  history: "Eldric taught Thalia ancient druid ways.",
  strength: 90,
  trust: 100
});

console.log(
  service.getRelationshipsForNPC("thalia")
);

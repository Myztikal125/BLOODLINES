import { research } from "./researcher";

async function main() {
  const result = await research(
    `
BLOODLINES Wizard Magic System Research

Study:
- D&D wizard spell progression
- Pathfinder spell systems
- spell preparation vs known spells
- mana/resource based magic systems
- spell schools
- spell customization
- spell crafting
- balancing magic users
- AI generated magic systems

Return:
- Existing system comparisons
- Strengths and weaknesses
- Recommended BLOODLINES mechanics
- Implementation ideas
- Questions for Lead Designer
`
  );

  console.log(result);
}

main();

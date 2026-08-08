import {
  prepareRulesBibleUpdate,
  applyApprovedDecisions
} from "./scribe";

type DecisionStatus =
  | "APPROVED"
  | "UNRESOLVED"
  | "AMBIGUOUS";

interface DecisionRecord {
  id: string;
  system: string;
  selectedOption: string;
  status: DecisionStatus;
  decision: string;
}

/*
 * Complete human decision ledger reconstructed from the approved
 * decision history.
 *
 * IMPORTANT:
 * A response is only considered valid when it corresponds to an
 * option that actually existed in the decision presented to the human.
 */
const decisionLedger: DecisionRecord[] = [
  {
    id: "1",
    system: "Advantage and Disadvantage",
    selectedOption: "A",
    status: "APPROVED",
    decision:
      "Approve the introduction of advantage and disadvantage mechanics."
  },
  {
    id: "2",
    system: "Death and Dying",
    selectedOption: "A",
    status: "APPROVED",
    decision:
      "Approve the implementation of death and dying mechanics."
  },
  {
    id: "3",
    system: "NPC Relationships and Memory",
    selectedOption: "A",
    status: "APPROVED",
    decision:
      "Approve a framework for NPC relationships and memory."
  },
  {
    id: "4",
    system: "Quest System",
    selectedOption: "A",
    status: "APPROVED",
    decision:
      "Approve a structured quest system."
  },
  {
    id: "5",
    system: "Rewards System",
    selectedOption: "A",
    status: "APPROVED",
    decision:
      "Approve enhancements to the rewards system."
  },

  {
    id: "6",
    system: "Skills and Proficiency",
    selectedOption: "B",
    status: "APPROVED",
    decision:
      "Implement a dynamic proficiency system based on character actions or context."
  },
  {
    id: "7",
    system: "Action Economy",
    selectedOption: "A",
    status: "APPROVED",
    decision:
      "Clarify standard action, bonus action, and reaction types."
  },
  {
    id: "8",
    system: "Combat Rounds",
    selectedOption: "A",
    status: "APPROVED",
    decision:
      "Define fixed-duration combat rounds with standardized actions."
  },
  {
    id: "9",
    system: "Attacks",
    selectedOption: "A",
    status: "APPROVED",
    decision:
      "Use defined dice-roll mechanics for attacks, including hit and miss conditions."
  },
  {
    id: "10",
    system: "Damage",
    selectedOption: "A",
    status: "APPROVED",
    decision:
      "Use a simple damage system based on dice rolls and fixed modifiers."
  },
  {
    id: "11",
    system: "Armor Class",
    selectedOption: "A",
    status: "APPROVED",
    decision:
      "Establish fixed Armor Class based on character attributes and equipment."
  },
  {
    id: "12",
    system: "Conditions",
    selectedOption: "A",
    status: "APPROVED",
    decision:
      "Create a basic set of common conditions with standardized effects."
  },
  {
    id: "13",
    system: "Rest and Recovery",
    selectedOption: "B",
    status: "APPROVED",
    decision:
      "Implement a more complex rest and recovery system including resource management and time factors."
  },
  {
    id: "14",
    system: "Spell Slots",
    selectedOption: "B",
    status: "APPROVED",
    decision:
      "Allow spell slots to be regained through specific actions or events."
  },

  /*
   * These three responses were "C", but the presented questions only
   * offered A and B. They MUST NOT be silently interpreted.
   */
  {
    id: "15",
    system: "Encounter Structure",
    selectedOption: "C",
    status: "AMBIGUOUS",
    decision:
      "Human response was C, but only options A and B were presented."
  },
  {
    id: "16",
    system: "Rewards",
    selectedOption: "C",
    status: "AMBIGUOUS",
    decision:
      "Human response was C, but only options A and B were presented."
  },
  {
    id: "17",
    system: "Equipment",
    selectedOption: "C",
    status: "AMBIGUOUS",
    decision:
      "Human response was C, but only options A and B were presented."
  }
];

/*
 * These systems had already been defined by the Rules Compiler and
 * therefore do not need to be re-decided here. Their definitions
 * remain governed by the current Rules Bible.
 */
const previouslyDefinedSystems = [
  "Dynamic Initiative System",
  "Action Synergy",
  "Adaptive Monster AI",
  "Dual Bloodlines",
  "Bloodline Evolution",
  "Legacy Quests",
  "Bloodline Curses",
  "Signature Spells",
  "Spellcrafting System",
  "Loyalty to Schools",
  "Arcane Tutor System",
  "Dynamic Spell Economy"
];

async function main() {
  console.log("=== BLOODLINES COMPLETE DECISION LEDGER ===");
  console.log("");

  const approved = decisionLedger.filter(
    (decision) => decision.status === "APPROVED"
  );

  const ambiguous = decisionLedger.filter(
    (decision) => decision.status === "AMBIGUOUS"
  );

  console.log(`Approved decisions: ${approved.length}`);
  console.log(`Ambiguous decisions: ${ambiguous.length}`);
  console.log(
    `Previously defined systems: ${previouslyDefinedSystems.length}`
  );

  console.log("");
  console.log("=== AMBIGUOUS DECISIONS — NOT APPLIED ===");

  for (const decision of ambiguous) {
    console.log(
      `⚠ ${decision.system}: response ${decision.selectedOption} is not a valid option.`
    );
  }

  console.log("");
  console.log("=== SENDING VALID APPROVALS TO SCRIBE ===");

  const scribeReport = await prepareRulesBibleUpdate(
    approved.map((decision) => ({
      id: decision.id,
      system: decision.system,
      decision: decision.decision
    }))
  );

  console.log("");
  console.log("=== SCRIBE REPORT ===");
  console.log(scribeReport);

  console.log("");
  console.log("=== APPLYING VALID HUMAN APPROVALS ===");

  applyApprovedDecisions(
    approved.map((decision) => ({
      id: decision.id,
      system: decision.system,
      decision: decision.decision
    }))
  );

  console.log("");
  console.log("=== BIBLE UPDATE COMPLETE ===");

  for (const decision of approved) {
    console.log(`✓ ${decision.system}`);
  }

  console.log("");
  console.log("=== NOT APPLIED ===");

  for (const decision of ambiguous) {
    console.log(`⚠ ${decision.system}`);
  }

  console.log("");
  console.log(
    "The Rules Bible remains authoritative. Ambiguous decisions remain unresolved."
  );
}

main().catch((error) => {
  console.error("Decision batch failed:");
  console.error(error);
  process.exit(1);
});

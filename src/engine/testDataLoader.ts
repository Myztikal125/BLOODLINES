import { loadData } from "./dataLoader";

const wizard = loadData("classes", "wizard");
const shadowveil = loadData("bloodlines", "shadowveil");

console.log("Wizard:");
console.log(wizard.name);

console.log("Bloodline:");
console.log(shadowveil.name);

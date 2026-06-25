const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const sandbox = { window: {} };
const source = fs.readFileSync(path.join(root, "assets/js/programs.data.js"), "utf8");

vm.runInNewContext(source, sandbox);

const programs = sandbox.window.IZHT_PROGRAMS || [];
const errors = [];
const allowedLevels = new Set(["basic", "specialized", "bachelor"]);
const allowedForms = new Set(["full", "mixed", "part"]);
const requiredStrings = [
  "number",
  "code",
  "title",
  "specialtyTitle",
  "level",
  "levelName",
  "levelShortName",
  "form",
  "formName",
  "formDisplayName",
  "duration",
  "places",
  "placesLabel",
  "generalPlaces",
  "paidPlaces",
  "exams",
  "about",
];
const requiredArrays = ["professions", "disciplines", "competencies"];

function fail(program, message) {
  const prefix = program ? `program ${program.number || program.id || "unknown"}` : "program data";
  errors.push(`${prefix}: ${message}`);
}

function hasValue(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function getPlacesCategories(label) {
  return (String(label || "").match(/\(([^)]+)\)/)?.[1] || "")
    .split("/")
    .map(item => item.trim())
    .filter(Boolean);
}

if (programs.length !== 33) {
  fail(null, `expected 33 programs, got ${programs.length}`);
}

const seenNumbers = new Set();
const seenProgramIdentities = new Set();

for (const program of programs) {
  for (const field of requiredStrings) {
    if (!hasValue(program[field])) {
      fail(program, `missing string field "${field}"`);
    }
  }

  for (const field of requiredArrays) {
    if (!Array.isArray(program[field]) || program[field].length === 0) {
      fail(program, `missing non-empty array "${field}"`);
      continue;
    }

    program[field].forEach((item, index) => {
      if (!hasValue(item)) {
        fail(program, `empty "${field}" item at index ${index}`);
      }
    });
  }

  if (!allowedLevels.has(program.level)) {
    fail(program, `unsupported level "${program.level}"`);
  }

  if (!allowedForms.has(program.form)) {
    fail(program, `unsupported form "${program.form}"`);
  }

  if (!/^\d{2}$/.test(String(program.number))) {
    fail(program, `number should be two digits, got "${program.number}"`);
  }

  if (seenNumbers.has(program.number)) {
    fail(program, `duplicate number "${program.number}"`);
  }
  seenNumbers.add(program.number);

  const programIdentity = `${program.code} ${program.title} ${program.form} ${program.level}`;
  if (seenProgramIdentities.has(programIdentity)) {
    fail(program, `duplicate program identity "${programIdentity}"`);
  }
  seenProgramIdentities.add(programIdentity);

  const placeValues = String(program.places || "").split("/").map(item => item.trim()).filter(Boolean);
  const placeCategories = getPlacesCategories(program.placesLabel);
  if (placeCategories.length && placeValues.length !== placeCategories.length) {
    fail(program, `places count ${placeValues.length} does not match label count ${placeCategories.length}`);
  }

  if (placeValues.some(value => !/^\d+$/.test(value))) {
    fail(program, `places should contain only numeric values, got "${program.places}"`);
  }

  if (placeValues.length > 0 && program.generalPlaces !== placeValues[0]) {
    fail(program, `generalPlaces "${program.generalPlaces}" does not match places first value "${placeValues[0]}"`);
  }

  if (placeValues.length > 0 && program.paidPlaces !== placeValues[placeValues.length - 1]) {
    fail(program, `paidPlaces "${program.paidPlaces}" does not match places last value "${placeValues[placeValues.length - 1]}"`);
  }
}

if (errors.length > 0) {
  console.error(`Program data errors (${errors.length}):`);
  for (const error of errors) {
    console.error(error);
  }
  process.exit(1);
}

console.log(`program-data-ok programs=${programs.length}`);

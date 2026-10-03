// Notes Toolkit - Day 3 assignment

let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" },
];

const VALID_CATEGORIES = ["personal", "work", "study"];

// Trim, collapse repeated spaces and lower-case, so comparisons ignore
// case and extra spaces.
function normalise(text) {
  return text.trim().replace(/\s+/g, " ").toLowerCase();
}

// Returns an array of notes whose text contains word (case-insensitive).
function searchNotes(word) {
  const target = word.toLowerCase();
  return notes.filter(function (note) {
    return note.text.toLowerCase().includes(target);
  });
}

// Returns the note object with the most characters, or null if no notes.
function longestNote() {
  if (notes.length === 0) {
    return null;
  }
  let longest = notes[0];
  for (let i = 1; i < notes.length; i++) {
    if (notes[i].text.length > longest.text.length) {
      longest = notes[i];
    }
  }
  return longest;
}

// Returns an object counting notes per category.
function countByCategory() {
  const counts = {};
  for (const note of notes) {
    if (counts[note.category]) {
      counts[note.category] += 1;
    } else {
      counts[note.category] = 1;
    }
  }
  return counts;
}

// Returns a sentence such as "5 notes: 2 personal, 1 work, 2 study."
function getSummary() {
  const total = notes.length;
  const word = total === 1 ? "note" : "notes";
  if (total === 0) {
    return `${total} ${word}.`;
  }
  const counts = countByCategory();
  const parts = [];
  for (const category of VALID_CATEGORIES) {
    if (counts[category]) {
      parts.push(`${counts[category]} ${category}`);
    }
  }
  return `${total} ${word}: ${parts.join(", ")}.`;
}

// Returns true if a note with the same text exists (ignoring case and
// extra spaces).
function isDuplicate(text) {
  const target = normalise(text);
  return notes.some(function (note) {
    return normalise(note.text) === target;
  });
}

// Adds a note if the text is 1-200 characters, not a duplicate and the
// category is valid. Returns true when added, false otherwise (and logs why).
function addNote(text, category) {
  if (typeof text !== "string" || text.trim().length < 1) {
    console.log("Not added: text must not be empty.");
    return false;
  }
  if (text.trim().length > 200) {
    console.log("Not added: text must be 200 characters or fewer.");
    return false;
  }
  if (isDuplicate(text)) {
    console.log("Not added: a note with this text already exists.");
    return false;
  }
  if (!VALID_CATEGORIES.includes(category)) {
    console.log("Not added: category must be personal, work or study.");
    return false;
  }
  let maxId = 0;
  for (const note of notes) {
    if (note.id > maxId) {
      maxId = note.id;
    }
  }
  notes.push({ id: maxId + 1, text: text.trim(), category: category });
  return true;
}

// ---------------------------------------------------------------------------
// Tests (expected output in the comment next to each call)
// ---------------------------------------------------------------------------

// searchNotes
console.log(searchNotes("REVISE"));
// [ { id: 4, text: "Revise JavaScript arrays", category: "study" } ]
console.log(searchNotes("zebra"));
// [] (no matches)

// longestNote
console.log(longestNote());
// { id: 3, text: "Email the project report to Grace", category: "work" }
const savedNotes = notes; // keep the real data safe for the edge-case test
notes = [];
console.log(longestNote());
// null (no notes)
notes = savedNotes;

// countByCategory
console.log(countByCategory());
// { personal: 2, study: 2, work: 1 }
notes = [];
console.log(countByCategory());
// {} (no notes)
notes = savedNotes;

// getSummary
console.log(getSummary());
// "5 notes: 2 personal, 1 work, 2 study."
notes = [{ id: 1, text: "Only one", category: "work" }];
console.log(getSummary());
// "1 note: 1 work."
notes = [];
console.log(getSummary());
// "0 notes."
notes = savedNotes;

// isDuplicate
console.log(isDuplicate("  call   MUM "));
// true (same text, ignoring case and extra spaces)
console.log(isDuplicate("Call dad"));
// false

// addNote
console.log(addNote("Plan the weekend trip", "personal"));
// true
console.log(notes.length);
// 6
console.log(addNote("  buy MILK and   bread ", "personal"));
// logs "Not added: a note with this text already exists." then false
console.log(addNote("Water the plants", "hobby"));
// logs "Not added: category must be personal, work or study." then false
console.log(addNote("   ", "work"));
// logs "Not added: text must not be empty." then false
console.log(addNote("x".repeat(201), "work"));
// logs "Not added: text must be 200 characters or fewer." then false
console.log(addNote("x".repeat(200), "study"));
// true (exactly 200 characters is allowed)
console.log(getSummary());
// "7 notes: 3 personal, 1 work, 3 study."

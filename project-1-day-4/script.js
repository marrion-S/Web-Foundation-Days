// QuickNotes

// Select the elements
const noteForm = document.querySelector("#note-form");
const noteInput = document.querySelector("#note-input");
const categorySelect = document.querySelector("#note-category");
const searchInput = document.querySelector("#search-input");
const notesList = document.querySelector("#notes-list");
const noteCount = document.querySelector("#note-count");
const errorMessage = document.querySelector("#error-message");
const clearAllBtn = document.querySelector("#clear-all");

const MAX_LENGTH = 200;
const STORAGE_KEY = "quicknotes-notes";

// Notes are stored as an array of objects: { id, text, category, createdAt }
let notes = loadNotes();

// Save the notes array to localStorage as JSON
function saveNotes() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.log("Could not save notes:", error);
  }
}

// Load the notes array from localStorage (an empty array if nothing valid)
function loadNotes() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(saved)) {
      return [];
    }
    return saved.filter(function (note) {
      return (
        note &&
        typeof note.id === "number" &&
        typeof note.text === "string" &&
        ["personal", "work", "study"].includes(note.category)
      );
    });
  } catch (error) {
    return [];
  }
}

// "work" -> "Work"
function capitalise(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

// A readable date and time, e.g. "11 Oct 2026, 7:54 PM"
function formatDate(date) {
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// Build one note card. textContent is used so user text can never run as HTML.
function createNoteCard(note) {
  const card = document.createElement("li");
  card.className = `note-card category-${note.category}`;

  const text = document.createElement("p");
  text.className = "note-text";
  text.textContent = note.text;

  const meta = document.createElement("div");
  meta.className = "note-meta";

  const label = document.createElement("span");
  label.className = "category-label";
  label.textContent = capitalise(note.category);

  const date = document.createElement("span");
  date.className = "note-date";
  date.textContent = note.createdAt;

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener("click", function () {
    deleteNote(note.id);
  });

  meta.append(label, date, deleteBtn);
  card.append(text, meta);
  return card;
}

// "You have no notes yet." / "You have 1 note." / "You have N notes."
function updateCount() {
  if (notes.length === 0) {
    noteCount.textContent = "You have no notes yet.";
  } else if (notes.length === 1) {
    noteCount.textContent = "You have 1 note.";
  } else {
    noteCount.textContent = `You have ${notes.length} notes.`;
  }
}

// Rebuild the list from the notes array, showing only notes that match
// the search box (not case-sensitive)
function render() {
  const term = searchInput.value.trim().toLowerCase();
  const visibleNotes = notes.filter(function (note) {
    return note.text.toLowerCase().includes(term);
  });

  notesList.textContent = "";

  if (notes.length > 0 && visibleNotes.length === 0) {
    const message = document.createElement("li");
    message.className = "empty-message";
    message.textContent = "No notes match your search.";
    notesList.appendChild(message);
  }

  for (const note of visibleNotes) {
    notesList.appendChild(createNoteCard(note));
  }
  updateCount();
  clearAllBtn.disabled = notes.length === 0;
}

// Remove the note with the given id
function deleteNote(id) {
  notes = notes.filter(function (note) {
    return note.id !== id;
  });
  saveNotes();
  render();
}

// Delete every note, after asking for confirmation
function clearAll() {
  if (notes.length === 0) {
    return;
  }
  if (confirm("Delete all notes?")) {
    notes = [];
    saveNotes();
    render();
  }
}

// Add a note when the form is submitted
function addNote(event) {
  event.preventDefault();

  const text = noteInput.value.trim();

  if (text === "") {
    errorMessage.textContent = "Please type a note first.";
    return;
  }
  if (text.length > MAX_LENGTH) {
    errorMessage.textContent = "Notes must be 200 characters or fewer.";
    return;
  }
  errorMessage.textContent = "";

  let nextId = 1;
  for (const note of notes) {
    if (note.id >= nextId) {
      nextId = note.id + 1;
    }
  }

  notes.push({
    id: nextId,
    text: text,
    category: categorySelect.value,
    createdAt: formatDate(new Date()),
  });

  saveNotes();
  render();
  noteInput.value = "";
  noteInput.focus();
}

noteForm.addEventListener("submit", addNote);
searchInput.addEventListener("input", render);
clearAllBtn.addEventListener("click", clearAll);

render();

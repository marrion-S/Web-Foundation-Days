// QuickNotes counter - Day 4 assignment

const DRAFT_KEY = "quicknotes-draft";
const THEME_KEY = "quicknotes-theme";
const MAX_CHARS = 200;
const WARNING_AT = 180;

// Select all the elements
const noteText = document.getElementById("note-text");
const charCount = document.getElementById("char-count");
const wordCount = document.getElementById("word-count");
const clearBtn = document.getElementById("clear-btn");
const themeToggle = document.getElementById("theme-toggle");

// localStorage can be unavailable (e.g. private mode), so guard every use
function saveItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.log("Could not save to localStorage:", error);
  }
}

function loadItem(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

function removeItem(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.log("Could not remove from localStorage:", error);
  }
}

// Update both counters and the warning / over classes
function updateCounts() {
  const text = noteText.value;
  const length = text.length;
  const trimmed = text.trim();
  const words = trimmed === "" ? 0 : trimmed.split(/\s+/).length;

  charCount.textContent = `${length} / ${MAX_CHARS} characters`;
  wordCount.textContent = `${words} words`;

  charCount.classList.toggle("warning", length > WARNING_AT);
  charCount.classList.toggle("over", length > MAX_CHARS);
}

// Empty the textarea, reset the counters and remove the saved draft
function clearNote() {
  noteText.value = "";
  removeItem(DRAFT_KEY);
  updateCounts();
}

// Apply a theme and keep the button label in step with it
function applyTheme(isDark) {
  document.body.classList.toggle("dark", isDark);
  themeToggle.textContent = isDark ? "Light mode" : "Dark mode";
}

// On every input: update the counters and save the draft
noteText.addEventListener("input", function () {
  updateCounts();
  saveItem(DRAFT_KEY, noteText.value);
});

// Clear button
clearBtn.addEventListener("click", clearNote);

// Escape inside the textarea also clears it
noteText.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    clearNote();
  }
});

// Theme button: toggle dark mode and remember the choice
themeToggle.addEventListener("click", function () {
  const isDark = !document.body.classList.contains("dark");
  applyTheme(isDark);
  saveItem(THEME_KEY, isDark ? "dark" : "light");
});

// On page load: restore the saved draft and theme, then update the counters
const savedDraft = loadItem(DRAFT_KEY);
if (savedDraft !== null) {
  noteText.value = savedDraft;
}
applyTheme(loadItem(THEME_KEY) === "dark");
updateCounts();

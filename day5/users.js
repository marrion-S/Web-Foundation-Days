// User directory - Day 5 assignment

const API_URL = "https://jsonplaceholder.typicode.com/users";

// Select the elements
const loadButton = document.querySelector("#load-users");
const filterInput = document.querySelector("#filter-input");
const statusText = document.querySelector("#status");
const usersList = document.querySelector("#users-list");

// The users loaded from the API are stored here, so filtering never needs
// a new request
let allUsers = [];

// Draw any array of users. Only textContent is used, never innerHTML.
function renderUsers(list) {
  usersList.textContent = "";

  if (list.length === 0) {
    const message = document.createElement("li");
    message.textContent = "No users match your filter.";
    usersList.appendChild(message);
    return;
  }

  for (const user of list) {
    const item = document.createElement("li");

    const name = document.createElement("strong");
    name.textContent = user.name;

    const email = document.createElement("div");
    email.textContent = `Email: ${user.email}`;

    const city = document.createElement("div");
    city.textContent = `City: ${user.address.city}`;

    const company = document.createElement("div");
    company.textContent = `Company: ${user.company.name}`;

    item.append(name, email, city, company);
    usersList.appendChild(item);
  }
}

// Users whose name includes the filter text (not case-sensitive)
function filterUsers() {
  const term = filterInput.value.trim().toLowerCase();
  return allUsers.filter(function (user) {
    return user.name.toLowerCase().includes(term);
  });
}

// Fetch the users from the API and display them
async function loadUsers() {
  loadButton.disabled = true;
  statusText.textContent = "Loading users...";

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    allUsers = await response.json();
    renderUsers(filterUsers());
    statusText.textContent = `Loaded ${allUsers.length} users.`;
  } catch (error) {
    statusText.textContent = `Error: could not load users. ${error.message}`;
  } finally {
    loadButton.disabled = false;
  }
}

loadButton.addEventListener("click", loadUsers);

// Filter the stored array as the user types (no new request)
filterInput.addEventListener("input", function () {
  if (allUsers.length === 0) {
    return; // nothing loaded yet, so there is nothing to filter
  }
  renderUsers(filterUsers());
});

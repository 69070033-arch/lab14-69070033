/* ============================================
   Simple Site — script.js
   All interactivity lives here.
   ============================================ */

// --- Hero image fallback -----------------------------------------
// If the external image fails to load (offline, blocked, service down),
// hide it and let the CSS gradient stand in.
const heroImage = document.getElementById("heroImage");
heroImage.addEventListener("error", () => heroImage.classList.add("is-broken"));

// --- Footer year -------------------------------------------------
document.getElementById("year").textContent = new Date().getFullYear();

// --- Mobile navigation -------------------------------------------
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

// Close the menu after picking a link
navLinks.addEventListener("click", (event) => {
  if (event.target.tagName === "A") {
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  }
});

// --- Dark / light mode -------------------------------------------
const themeToggle = document.getElementById("themeToggle");
const THEME_KEY = "mysite-theme";

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeToggle.textContent = theme === "dark" ? "\u2600" : "\u263E";
}

// Restore the saved theme on load
applyTheme(localStorage.getItem(THEME_KEY) || "light");

themeToggle.addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next);
  localStorage.setItem(THEME_KEY, next);
});

// --- Hero click counter ------------------------------------------
const clickBtn = document.getElementById("clickBtn");
let clicks = 0;

clickBtn.addEventListener("click", () => {
  clicks++;
  clickBtn.textContent = `Clicked ${clicks} ${clicks === 1 ? "time" : "times"}`;
});

// --- Live clock in the About section -----------------------------
const clock = document.getElementById("clock");

function updateClock() {
  clock.textContent = new Date().toLocaleTimeString();
}
updateClock();
setInterval(updateClock, 1000);

// --- Animate numbers + fade in on scroll -------------------------
function animateCount(el) {
  const target = Number(el.dataset.count);
  const duration = 1200;
  const start = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - progress, 3)));
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      entry.target.querySelectorAll("[data-count]").forEach(animateCount);
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.2 }
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// --- To-do list (saved in localStorage) ---------------------------
const TODO_KEY = "mysite-todos";
const todoForm = document.getElementById("todoForm");
const todoInput = document.getElementById("todoInput");
const todoList = document.getElementById("todoList");
const todoEmpty = document.getElementById("todoEmpty");
const todoCount = document.getElementById("todoCount");
const todoClear = document.getElementById("todoClear");

// Each task: { id, text, done }
let todos = loadTodos();

function loadTodos() {
  try {
    const saved = JSON.parse(localStorage.getItem(TODO_KEY));
    if (Array.isArray(saved)) return saved;
  } catch (error) {
    console.warn("Could not read saved to-dos:", error);
  }
  return [];
}

function saveTodos() {
  localStorage.setItem(TODO_KEY, JSON.stringify(todos));
}

function renderTodos() {
  todoList.textContent = "";

  todos.forEach((todo) => {
    const item = document.createElement("li");
    item.className = "todo-item" + (todo.done ? " done" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.done;
    checkbox.setAttribute("aria-label", `Mark "${todo.text}" as ${todo.done ? "not done" : "done"}`);

    const label = document.createElement("span");
    label.className = "todo-text";
    label.textContent = todo.text;
    label.title = "Click to toggle";

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "todo-delete";
    remove.textContent = "\u00D7";
    remove.setAttribute("aria-label", `Delete "${todo.text}"`);

    checkbox.addEventListener("change", () => {
      todo.done = checkbox.checked;
      item.classList.toggle("done", todo.done);
      saveTodos();
      updateCount();
    });

    label.addEventListener("click", () => {
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event("change"));
    });

    remove.addEventListener("click", () => {
      todos = todos.filter((t) => t.id !== todo.id);
      saveTodos();
      renderTodos();
    });

    item.append(checkbox, label, remove);
    todoList.appendChild(item);
  });

  const remaining = todos.filter((t) => !t.done).length;
  todoEmpty.hidden = todos.length > 0;
  todoCount.textContent = `${remaining} item${remaining === 1 ? "" : "s"} left`;
}

todoForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = todoInput.value.trim();
  if (!text) {
    todoInput.focus();
    return;
  }

  todos.push({ id: Date.now() + Math.random(), text, done: false });
  saveTodos();
  todoInput.value = "";
  renderTodos();
  todoInput.focus();
});

todoClear.addEventListener("click", () => {
  todos = todos.filter((t) => !t.done);
  saveTodos();
  renderTodos();
});

renderTodos();

// --- Contact form validation -------------------------------------
const form = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

const fields = [
  {
    input: document.getElementById("name"),
    error: document.getElementById("nameError"),
    test: (v) => v.trim().length >= 2,
    message: "Please enter at least 2 characters.",
  },
  {
    input: document.getElementById("email"),
    error: document.getElementById("emailError"),
    test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    message: "Please enter a valid email address.",
  },
  {
    input: document.getElementById("message"),
    error: document.getElementById("messageError"),
    test: (v) => v.trim().length >= 10,
    message: "Message must be at least 10 characters.",
  },
];

function validateField(field) {
  const valid = field.test(field.input.value);
  field.error.textContent = valid ? "" : field.message;
  field.input.closest(".form-row").classList.toggle("invalid", !valid);
  return valid;
}

fields.forEach((field) => {
  field.input.addEventListener("blur", () => validateField(field));
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const results = fields.map(validateField);

  if (results.includes(false)) {
    formStatus.textContent = "Please fix the highlighted fields.";
    return;
  }

  formStatus.textContent = "Thanks! Your message has been sent.";
  form.reset();
});
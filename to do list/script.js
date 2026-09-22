"use strict";

/*
    ==========================================
    TO-DO APPLICATION
    ==========================================

    Features:
    - Create
    - Read
    - Update
    - Delete
    - localStorage
    - All / Active / Completed filters
    - Dynamic DOM creation
    - Event delegation
*/


// ==========================================
// DOM ELEMENTS
// ==========================================

const todoForm = document.getElementById("todo-form");

const todoInput = document.getElementById("todo-input");

const todoList = document.getElementById("todo-list");

const taskCount = document.getElementById("task-count");

const emptyMessage =
    document.getElementById("empty-message");

const clearCompletedButton =
    document.getElementById("clear-completed");

const filterContainer =
    document.querySelector(".filters");


// ==========================================
// APPLICATION STATE
// ==========================================

let todos = loadTodos();

let currentFilter = "all";


// ==========================================
// LOCAL STORAGE
// ==========================================

const STORAGE_KEY = "todo-app-tasks";


function loadTodos() {

    try {

        const storedTodos =
            window.localStorage.getItem(STORAGE_KEY);

        if (!storedTodos) {
            return [];
        }

        const parsedTodos =
            JSON.parse(storedTodos);

        return Array.isArray(parsedTodos)
            ? parsedTodos
            : [];

    } catch (error) {

        console.error(
            "Could not load tasks:",
            error
        );

        return [];
    }
}


function saveTodos() {

    window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(todos)
    );
}


// ==========================================
// CREATE
// ==========================================

function createTodo(text) {

    const todo = {

        id: Date.now(),

        text: text.trim(),

        completed: false

    };

    todos.push(todo);

    saveTodos();

    renderTodos();
}


// ==========================================
// READ
// ==========================================

function getFilteredTodos() {

    if (currentFilter === "active") {

        return todos.filter(
            todo => !todo.completed
        );
    }

    if (currentFilter === "completed") {

        return todos.filter(
            todo => todo.completed
        );
    }

    return todos;
}


function renderTodos() {

    todoList.innerHTML = "";

    const filteredTodos =
        getFilteredTodos();


    filteredTodos.forEach(todo => {

        const listItem =
            document.createElement("li");

        listItem.className = "todo-item";

        listItem.dataset.id = todo.id;


        if (todo.completed) {

            listItem.classList.add("completed");
        }


        // Checkbox

        const checkbox =
            document.createElement("input");

        checkbox.type = "checkbox";

        checkbox.className = "todo-checkbox";

        checkbox.checked = todo.completed;

        checkbox.setAttribute(
            "aria-label",
            `Mark "${todo.text}" as ${
                todo.completed
                    ? "active"
                    : "completed"
            }`
        );


        // Text

        const text =
            document.createElement("span");

        text.className = "todo-text";

        text.textContent = todo.text;


        // Action container

        const actions =
            document.createElement("div");

        actions.className = "todo-actions";


        // Edit button

        const editButton =
            document.createElement("button");

        editButton.type = "button";

        editButton.className = "edit-btn";

        editButton.dataset.action = "edit";

        editButton.textContent = "Edit";

        editButton.setAttribute(
            "aria-label",
            `Edit task: ${todo.text}`
        );


        // Delete button

        const deleteButton =
            document.createElement("button");

        deleteButton.type = "button";

        deleteButton.className = "delete-btn";

        deleteButton.dataset.action = "delete";

        deleteButton.textContent = "Delete";

        deleteButton.setAttribute(
            "aria-label",
            `Delete task: ${todo.text}`
        );


        actions.append(
            editButton,
            deleteButton
        );


        listItem.append(
            checkbox,
            text,
            actions
        );


        todoList.appendChild(listItem);

    });


    updateTaskCount();

    updateEmptyMessage();

}


// ==========================================
// UPDATE
// ==========================================

function toggleTodo(id) {

    todos = todos.map(todo => {

        if (todo.id === id) {

            return {
                ...todo,
                completed: !todo.completed
            };
        }

        return todo;
    });

    saveTodos();

    renderTodos();
}


function editTodo(id) {

    const todo =
        todos.find(todo => todo.id === id);

    if (!todo) {
        return;
    }


    const updatedText =
        window.prompt(
            "Edit your task:",
            todo.text
        );


    if (
        updatedText === null ||
        updatedText.trim() === ""
    ) {
        return;
    }


    todos = todos.map(todoItem => {

        if (todoItem.id === id) {

            return {
                ...todoItem,
                text: updatedText.trim()
            };
        }

        return todoItem;
    });


    saveTodos();

    renderTodos();
}


// ==========================================
// DELETE
// ==========================================

function deleteTodo(id) {

    todos = todos.filter(
        todo => todo.id !== id
    );

    saveTodos();

    renderTodos();
}


function clearCompleted() {

    todos = todos.filter(
        todo => !todo.completed
    );

    saveTodos();

    renderTodos();
}


// ==========================================
// UI HELPERS
// ==========================================

function updateTaskCount() {

    const activeCount =
        todos.filter(
            todo => !todo.completed
        ).length;


    taskCount.textContent =
        `${activeCount} ${
            activeCount === 1
                ? "task"
                : "tasks"
        } remaining`;
}


function updateEmptyMessage() {

    const filteredTodos =
        getFilteredTodos();


    if (filteredTodos.length === 0) {

        emptyMessage.hidden = false;

        if (todos.length === 0) {

            emptyMessage.textContent =
                "No tasks yet. Add your first task!";

        } else if (currentFilter === "active") {

            emptyMessage.textContent =
                "No active tasks.";

        } else if (currentFilter === "completed") {

            emptyMessage.textContent =
                "No completed tasks.";

        } else {

            emptyMessage.textContent =
                "No tasks found.";
        }

    } else {

        emptyMessage.hidden = true;
    }
}


// ==========================================
// FORM EVENT
// ==========================================

todoForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        const text =
            todoInput.value.trim();


        if (!text) {

            todoInput.focus();

            return;
        }


        createTodo(text);

        todoInput.value = "";

        todoInput.focus();
    }
);


// ==========================================
// EVENT DELEGATION
// ==========================================

todoList.addEventListener(
    "click",
    function (event) {

        const listItem =
            event.target.closest(".todo-item");


        if (!listItem) {
            return;
        }


        const id =
            Number(listItem.dataset.id);


        const actionButton =
            event.target.closest(
                "button[data-action]"
            );


        if (actionButton) {

            const action =
                actionButton.dataset.action;


            if (action === "edit") {

                editTodo(id);
            }


            if (action === "delete") {

                deleteTodo(id);
            }

            return;
        }
    }
);


// ==========================================
// CHECKBOX EVENT DELEGATION
// ==========================================

todoList.addEventListener(
    "change",
    function (event) {

        if (
            !event.target.classList.contains(
                "todo-checkbox"
            )
        ) {
            return;
        }


        const listItem =
            event.target.closest(".todo-item");


        const id =
            Number(listItem.dataset.id);


        toggleTodo(id);
    }
);


// ==========================================
// FILTER EVENT DELEGATION
// ==========================================

filterContainer.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(
                ".filter-btn"
            );


        if (!button) {
            return;
        }


        currentFilter =
            button.dataset.filter;


        document
            .querySelectorAll(".filter-btn")
            .forEach(filterButton => {

                const isActive =
                    filterButton === button;

                filterButton.classList.toggle(
                    "active",
                    isActive
                );

                filterButton.setAttribute(
                    "aria-pressed",
                    String(isActive)
                );
            });


        renderTodos();
    }
);


// ==========================================
// CLEAR COMPLETED
// ==========================================

clearCompletedButton.addEventListener(
    "click",
    clearCompleted
);


// ==========================================
// INITIAL RENDER
// ==========================================

renderTodos();
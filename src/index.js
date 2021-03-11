const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "No username" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { username, name } = request.body;

  const userExists = users.find((user) => user.username === username);

  if (userExists) {
    return response.status(400).json({ error: "User already exists" });
  }

  const id = uuidv4();

  const newUser = {
    id,
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const id = uuidv4();

  const newTodo = {
    id,
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  const { title, deadline } = request.body;

  const selectedTodo = user.todos.find((todo) => todo.id === id);

  if (!selectedTodo) {
    return response.status(404).json({ error: "Todo doesn't exist" });
  }

  selectedTodo.title = title;
  selectedTodo.deadline = new Date(deadline);

  return response.json(selectedTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const selectedTodo = user.todos.find((todo) => todo.id === id);

  if (!selectedTodo) {
    return response.status(404).json({ error: "Todo doesn't exist" });
  }

  selectedTodo.done = true;

  return response.json(selectedTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todoIndex = user.todos.findIndex((todo) => todo.id === id);

  if (todoIndex === -1) {
    return response.status(404).json({ error: "Todo doesn't exist" });
  }

  user.todos.splice(todoIndex, 1);

  return response.status(204).send();
});

module.exports = app;


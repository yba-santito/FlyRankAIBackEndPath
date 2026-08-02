---
name: express-crud
description: Use when working on the Week 2 Express CRUD Task API. Add, modify, or test /tasks endpoints, Swagger docs, or error handling in this project.
---

## Project context
This is the "W2 - Build your first CRUD API" project: a RESTful Task API built with Node.js + Express + Swagger UI.

- Server entry point: `SetUp.js` inside `Week2-Work/Task 0/`
- API docs served at `http://localhost:3000/docs`
- Server runs on port 3000

## Endpoints
| Method | Route         | Purpose                          |
| ------ | ------------- | -------------------------------- |
| GET    | /tasks        | Retrieve all tasks               |
| GET    | /tasks/:id    | Retrieve a task by ID            |
| POST   | /tasks        | Create a task (auto-increment ID)|
| PUT    | /tasks/:id    | Update an existing task          |
| DELETE | /tasks/:id    | Remove a task                    |

## Conventions to follow
- Use `req.params` for URL path parameters.
- Use `express.json()` middleware for body parsing.
- Return `404 Not Found` for missing resources / unknown IDs.
- Keep the OpenAPI 3.0 spec (swagger.json) in sync whenever routes change.

## How to run
- Install deps: `npm install`
- Start server: `node SetUp.js`
- Test via browser: `http://localhost:3000/docs`
- Test via curl: `curl -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '{"title":"Buy milk"}'`

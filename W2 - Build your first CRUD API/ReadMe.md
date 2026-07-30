# Week 2: RESTful Task API with Express & Swagger

This project is a RESTful API built with Node.js and Express that manages a simple task list. It implements full CRUD operations and includes automated, interactive API documentation using Swagger UI.

This project was built as part of the FlyRank AI Internship weekly assignments.

## 🚀 Features

*   **RESTful Routing:** Proper use of URL path parameters (`req.params`) and query handling.
*   **Full CRUD Cycle:**
    *   `GET /tasks` - Retrieve all tasks
    *   `GET /tasks/:id` - Retrieve a specific task by ID
    *   `POST /tasks` - Create a new task (auto-increments ID)
    *   `PUT /tasks/:id` - Update an existing task
    *   `DELETE /tasks/:id` - Remove a task
*   **JSON Body Parsing:** Implements Express middleware (`express.json()`) to safely handle incoming request bodies.
*   **Error Handling:** Custom `404 Not Found` responses for missing resources and graceful handling of unknown IDs.
*   **Interactive Documentation:** Complete OpenAPI 3.0 specification rendered via Swagger UI, allowing users to test the API directly from the browser.

## 🛠️ Tech Stack

*   **Node.js** - Runtime environment
*   **Express.js** - Web application framework
*   **Swagger UI Express** - API documentation interface

## 📦 Installation & Setup

1.  Install the project dependencies:
    ```bash
    npm install
    ```
2.  Start the Express server:
    ```bash
    node SetUp.js
    ```
    *The server will start listening on port 3000.*

## 📖 API Documentation

Once the server is running, you can view the interactive API documentation and test the endpoints visually.

Open your browser and navigate to:
**`http://localhost:3000/docs`**

### Checkpoint: Swagger UI Full CRUD Cycle
*(Note to reviewer: Below is the screenshot demonstrating the successful execution of the full CRUD cycle using the Swagger UI 'Try it out' feature.)*

![6a547f3b3005ce06f34998ace32a1b7b.png](:/b0df52348a4540e0a068f946c8d20d6d)


## 💻 Testing via cURL

If you prefer testing via the terminal, here are the commands for the core endpoints:

**Create a Task (POST):**
```bash
curl -i -X POST http://localhost:3000/tasks \
-H "Content-Type: application/json" \
-d '{"title":"Buy milk"}'

const express = require("express");
const DatabaseConnection = require('./db/connection');
const TaskRepository = require("./db/taskRepository");

const app = express();
const port = 3333;

const swaggerUI = require('swagger-ui-express');
const swaggerDocument = require("./swagger.json");

app.use(express.json());
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

const db = new DatabaseConnection('./tasks.db');
const taskRepo = new TaskRepository(db);

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

async function init() {
    await db.connect();
    await db.initSchema();

    app.get("/tasks", async (req, res) => {
        try {
            const tasks = await taskRepo.findAll();
            res.json({ success: true, count: tasks.length, data: tasks });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.get("/tasks/:id", async (req, res) => {
        try {
            const task = await taskRepo.findById(Number(req.params.id));
            if (!task) return res.status(404).json({ error: "Task not found" });
            res.json({ foundItem: task });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.post("/tasks", async (req, res) => {
        try {
            const { title, done = false } = req.body;
            if (!title) return res.status(400).json({ error: "Title is required" });
            const task = await taskRepo.create(title, done);
            res.status(201).json({ success: true, dataInserted: task });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.put("/tasks/:id", async (req, res) => {
        try {
            const id = Number(req.params.id);
            const { title, done } = req.body;
            if (!title) return res.status(400).json({ error: "Title is required" });
            const updated = await taskRepo.update(id, title, done);
            if (!updated) return res.status(404).json({ error: "Task not found" });
            const task = await taskRepo.findById(id);
            res.json({ success: true, data: task });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.delete("/tasks/:id", async (req, res) => {
        try {
            const id = Number(req.params.id);
            const deleted = await taskRepo.delete(id);
            if (!deleted) return res.status(404).json({ error: "Task not found" });
            res.status(204).send();
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`);
    });
}

init().catch(err => {
    console.error("Failed to start server:", err);
    process.exit(1);
});
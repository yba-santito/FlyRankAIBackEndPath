const request = require('supertest');
const express = require('express');
const DatabaseConnection = require('./db/connection');
const TaskRepository = require('./db/taskRepository');

const createApp = (taskRepo) => {
    const app = express();
    app.use(express.json());

    app.get('/tasks', async (req, res) => {
        try {
            const tasks = await taskRepo.findAll();
            res.json({ success: true, count: tasks.length, data: tasks });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.get('/tasks/:id', async (req, res) => {
        try {
            const task = await taskRepo.findById(Number(req.params.id));
            if (!task) return res.status(404).json({ error: 'Task not found' });
            res.json({ foundItem: task });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.post('/tasks', async (req, res) => {
        try {
            const { title, done = false } = req.body;
            if (!title) return res.status(400).json({ error: 'Title is required' });
            const task = await taskRepo.create(title, done);
            res.status(201).json({ success: true, dataInserted: task });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.put('/tasks/:id', async (req, res) => {
        try {
            const id = Number(req.params.id);
            const { title, done } = req.body;
            if (!title) return res.status(400).json({ error: 'Title is required' });
            const updated = await taskRepo.update(id, title, done);
            if (!updated) return res.status(404).json({ error: 'Task not found' });
            const task = await taskRepo.findById(id);
            res.json({ success: true, data: task });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.delete('/tasks/:id', async (req, res) => {
        try {
            const id = Number(req.params.id);
            const deleted = await taskRepo.delete(id);
            if (!deleted) return res.status(404).json({ error: 'Task not found' });
            res.status(204).send();
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    return app;
};

describe('Task API - SQLite Integration', () => {
    let db;
    let taskRepo;
    let app;
    let server;

    beforeAll(async () => {
        // Use a test database file
        db = new DatabaseConnection('./tasks_test.db');
        await db.connect();
        await db.initSchema();
        taskRepo = new TaskRepository(db);
        app = createApp(taskRepo);
        server = app.listen(0); // Random port
    });

    afterAll(async () => {
        await new Promise(resolve => server.close(resolve));
        await db.close();
    });

    beforeEach(async () => {
        // Clean up before each test
        await db.run('DELETE FROM Tasks');
    });

    describe('GET /tasks', () => {
        test('returns empty array when no tasks', async () => {
            const res = await request(app).get('/tasks');
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.count).toBe(0);
            expect(res.body.data).toEqual([]);
        });

        test('returns all tasks', async () => {
            await taskRepo.create('Task 1', false);
            await taskRepo.create('Task 2', true);

            const res = await request(app).get('/tasks');
            expect(res.status).toBe(200);
            expect(res.body.count).toBe(2);
            expect(res.body.data).toHaveLength(2);
        });
    });

    describe('GET /tasks/:id', () => {
        test('returns task by id', async () => {
            const created = await taskRepo.create('Test Task', false);
            const res = await request(app).get(`/tasks/${created.id}`);
            expect(res.status).toBe(200);
            expect(res.body.foundItem.title).toBe('Test Task');
            expect(res.body.foundItem.done).toBe(0); // SQLite returns 0/1 for boolean
        });

        test('returns 404 for unknown id', async () => {
            const res = await request(app).get('/tasks/999');
            expect(res.status).toBe(404);
            expect(res.body.error).toBe('Task not found');
        });
    });

    describe('POST /tasks', () => {
        test('creates task with auto-increment id', async () => {
            const res = await request(app)
                .post('/tasks')
                .send({ title: 'New Task', done: true });
            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.dataInserted.id).toBeDefined();
            expect(res.body.dataInserted.title).toBe('New Task');
            expect(res.body.dataInserted.done).toBe(true);
        });

        test('defaults done to false', async () => {
            const res = await request(app)
                .post('/tasks')
                .send({ title: 'Default Task' });
            expect(res.status).toBe(201);
            expect(res.body.dataInserted.done).toBe(false);
        });

        test('returns 400 for missing title', async () => {
            const res = await request(app)
                .post('/tasks')
                .send({ done: true });
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Title is required');
        });
    });

    describe('PUT /tasks/:id', () => {
        test('updates existing task', async () => {
            const created = await taskRepo.create('Original', false);
            const res = await request(app)
                .put(`/tasks/${created.id}`)
                .send({ title: 'Updated', done: true });
            expect(res.status).toBe(200);
            expect(res.body.data.title).toBe('Updated');
            expect(res.body.data.done).toBe(1); // SQLite returns 1 for true
        });

        test('returns 404 for unknown id', async () => {
            const res = await request(app)
                .put('/tasks/999')
                .send({ title: 'Test', done: false });
            expect(res.status).toBe(404);
            expect(res.body.error).toBe('Task not found');
        });

        test('returns 400 for missing title', async () => {
            await taskRepo.create('Test', false);
            const res = await request(app)
                .put('/tasks/1')
                .send({ done: true });
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Title is required');
        });
    });

    describe('DELETE /tasks/:id', () => {
        test('deletes existing task', async () => {
            const created = await taskRepo.create('To Delete', false);
            const res = await request(app).delete(`/tasks/${created.id}`);
            expect(res.status).toBe(204);

            // Verify deleted
            const getRes = await request(app).get(`/tasks/${created.id}`);
            expect(getRes.status).toBe(404);
        });

        test('returns 404 for unknown id', async () => {
            const res = await request(app).delete('/tasks/999');
            expect(res.status).toBe(404);
            expect(res.body.error).toBe('Task not found');
        });
    });

    describe('Data persistence', () => {
        test('data survives server restart', async () => {
            const created = await taskRepo.create('Persistent Task', true);
            expect(created.id).toBeDefined();

            // Simulate restart by creating new connection to same DB
            const db2 = new DatabaseConnection('./tasks_test.db');
            await db2.connect();
            const taskRepo2 = new TaskRepository(db2);
            const task = await taskRepo2.findById(created.id);
            expect(task).toBeDefined();
            expect(task.title).toBe('Persistent Task');
            expect(task.done).toBe(1);
            await db2.close();
        });

        test('table created automatically if missing', async () => {
            const db2 = new DatabaseConnection('./tasks_new_test.db');
            await db2.connect();
            await db2.initSchema();
            const taskRepo2 = new TaskRepository(db2);
            const tasks = await taskRepo2.findAll();
            expect(tasks).toHaveLength(3); // Seeded data
            await db2.close();
            // Cleanup
            const fs = require('fs');
            fs.unlinkSync('./tasks_new_test.db');
        });

        test('seed runs only once', async () => {
            const db2 = new DatabaseConnection('./tasks_seed_test.db');
            await db2.connect();
            await db2.initSchema(); // First run - seeds
            await db2.initSchema(); // Second run - should not seed again
            const taskRepo2 = new TaskRepository(db2);
            const tasks = await taskRepo2.findAll();
            expect(tasks).toHaveLength(3); // Still only 3, not 6
            await db2.close();
            const fs = require('fs');
            fs.unlinkSync('./tasks_seed_test.db');
        });
    });
});
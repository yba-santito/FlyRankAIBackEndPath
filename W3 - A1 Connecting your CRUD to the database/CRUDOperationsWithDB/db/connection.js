const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');

class DatabaseConnection {
    constructor(dbPath = "./tasks.db") {
        this.dbPath = dbPath;
        this.db = null;
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    reject(err);
                } else {
                    this.db.run("PRAGMA foreign_keys = ON");
                    resolve(this);
                }
            });
        });
    }

async initSchema() {
        // Check if table exists first
        const tableExists = await this.get(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='Tasks'"
        );
        
        if (!tableExists) {
            await this.run(`
                CREATE TABLE Tasks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title VARCHAR(100) NOT NULL,
                    done BOOLEAN DEFAULT 0
                )
            `);
            await this.seed(); // Only seed on first creation
        }
    }

    async seed() {
        const tasks = [
            { title: "Life Of Santito", done: 1 },
            { title: "Is not a joke", done: 1 },
            { title: "Did the opp win?", done: 0 }
        ];
        for (const task of tasks) {
            await this.run(
                'INSERT INTO Tasks (title, done) VALUES (?, ?)',
                [task.title, task.done]
            );
        }
    }

    get run() {
            return (sql, params = []) => new Promise((resolve, reject) => {
                this.db.run(sql, params, function(err) {
                    if (err) reject(err);
                    else resolve(this); // 'this' = statement object with lastID, changes
                });
            });
        }
    get get() { return promisify(this.db.get).bind(this.db); }
    get all() { return promisify(this.db.all).bind(this.db); }

    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => err ? reject(err) : resolve());
        });
    }
}

module.exports = DatabaseConnection;
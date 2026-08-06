// // const sqlite3 = require('sqlite3').verbose();
// // const { promisify } = require('util');
// const {Pool} = require('pg');

// class DatabaseConnection {
//     constructor() {
//         this.pool = new Pool({
//             connectionString: process.env.Database_URL,
//         })
//     }

//     connect() {
//         return new Promise((resolve, reject) => {
//             this.db = new sqlite3.Database(this.dbPath, (err) => {
//                 if (err) {
//                     reject(err);
//                 } else {
//                     this.db.run("PRAGMA foreign_keys = ON");
//                     resolve(this);
//                 }
//             });
//         });
//     }

// async initSchema() {
//         // Check if table exists first
//         const tableExists = await this.get(
//             "SELECT name FROM sqlite_master WHERE type='table' AND name='Tasks'"
//         );
        
//         if (!tableExists) {
//             await this.run(`
//                 CREATE TABLE Tasks (
//                     id INTEGER PRIMARY KEY AUTOINCREMENT,
//                     title VARCHAR(100) NOT NULL,
//                     done BOOLEAN DEFAULT 0
//                 )
//             `);
//             await this.seed(); // Only seed on first creation
//         }
//     }

//     async seed() {
//         const tasks = [
//             { title: "Life Of Santito", done: 1 },
//             { title: "Is not a joke", done: 1 },
//             { title: "Did the opp win?", done: 0 }
//         ];
//         for (const task of tasks) {
//             await this.run(
//                 'INSERT INTO Tasks (title, done) VALUES (?, ?)',
//                 [task.title, task.done]
//             );
//         }
//     }

//     get run() {
//             return (sql, params = []) => new Promise((resolve, reject) => {
//                 this.db.run(sql, params, function(err) {
//                     if (err) reject(err);
//                     else resolve(this); // 'this' = statement object with lastID, changes
//                 });
//             });
//         }
//     get get() { return promisify(this.db.get).bind(this.db); }
//     get all() { return promisify(this.db.all).bind(this.db); }

//     close() {
//         return new Promise((resolve, reject) => {
//             this.db.close((err) => err ? reject(err) : resolve());
//         });
//     }
// }

// module.exports = DatabaseConnection;
require('dotenv').config();
const {Pool} = require('pg');
const port = process.env.PORT || 3000;

class DatabaseConnection {
    constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL,
        })
    }

    async connect(){
        const client = await this.pool.connect();
        await client.query("Select 1");
        client.release();
        return this
    }

    async initSchema(){
        const result = await this.query(
            "SELECT 1 FROM information_schema.tables WHERE table_name ='tasks'"
        );

        if (result.rows.length === 0){
            await this.query(`
                Create Table tasks (
                id serial primary key,
                title Text Not Null,
                done Boolean Default false)`);
                await this.seed();
            };
    }

    async seed(){
        const tasks = [
            {title: "Life Of Santito", done : true},
            {title: "Is not a joke", done : true},
            {title: "Did the opp win", done : false}
        ];
        for (const task of tasks){
            await this.query(
                "Insert Into tasks (title, done) Values ($1, $2)",
                [task.title, task.done]
            );
        }
    }

    async query (sql, params = []){
        return this.pool.query(sql, params);
    }

    async close(){
        await this.pool.end();
    }
}

module.exports = DatabaseConnection;
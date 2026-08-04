const sqlite3 = require('sqlite3').verbose();
const {promisify} =require('util');

class DatabaseConnection{
    constructor(dbPath = "./tasks.db"){
        this.dbPath = dbPath;
        this.db = null
    }

    connect(){
        return new Promise((resolve, reject)=>{
            this.db = new sqlite3.Database(this.dbPath, (err)=>{
                if (err) reject (err);
                else{
                    this.db.run("PRAGMA foreign_keys = ON");
                    resolve(this);
                }
            })
        })
    }

    get run() {return promisify(this.db.run).bind(this.db)};
    get get() {return promisify(this.db.get).bind(this.db)};
    get all() {return promisify(this.db.all).bind(this.db)};

    close (){
        return new Promise((resolve, reject)=>{
            this.db.close((err)=> err ? reject(err): resolve())
        })
    }
}

module.exports= DatabaseConnection;
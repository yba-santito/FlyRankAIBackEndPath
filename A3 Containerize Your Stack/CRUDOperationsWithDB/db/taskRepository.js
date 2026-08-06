class TaskRepository{
    constructor(db){
        this.db = db;
    }

    async findAll(){
        const r = await this.db.query("Select * From tasks");
        return r.rows;
    }

    async findById(id){
        const r = await this.db.query("SELECT * FROM tasks Where id = $1",[id]); 
        return r.rows[0];
    }

    async update(id, title, done){
        const result = await this.db.run(
            "Update Tasks SET Title = ?, done = ? where id = ?",
            [title, done, id]
        );
        return result.changes > 0;
    }

    async create(title, done = false){
        const result = await this.db.run(
            "Insert Into Tasks (title, done) Values (?,?)",
            [title, done]
        );
        return {id: result.lastID, title, done};
    }

    async delete(id) {
        const result = await this.db.run('DELETE FROM Tasks WHERE id = ?', [id]);
        return result.changes > 0;
    }
}

module.exports = TaskRepository;
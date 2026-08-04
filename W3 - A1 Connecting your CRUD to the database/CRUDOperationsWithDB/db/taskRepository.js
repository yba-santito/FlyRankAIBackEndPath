class TaskRepository{
    constructor(db){
        this.db = db;
    }

    async findAll(){
        return this.db.all("Select * From Tasks");
    }

    async findById(id){
        return this.db.get("Select * From Tasks Where id = ?", [id]);
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
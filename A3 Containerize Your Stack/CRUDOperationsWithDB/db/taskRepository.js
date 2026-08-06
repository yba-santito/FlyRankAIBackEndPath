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
        const result = await this.db.query(
            "Update Tasks SET Title = $1, done = $2 where id = $3",
            [title, done, id]
        );
        return result.rowCount > 0;
    }

    async create(title, done = false){
        const result = await this.db.query(
            "Insert Into Tasks (title, done) Values ($1,$2)",
            [title, done]
        );
        return result.rows[0];
    }

    async delete(id) {
        const result = await this.db.query('DELETE FROM Tasks WHERE id = $1', [id]);
        return result.rowCount > 0;
    }
}

module.exports = TaskRepository;
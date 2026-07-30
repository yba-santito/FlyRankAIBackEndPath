const express = require('express');
const app = express();
const port = 3000;
const swaggerUI = require('swagger-ui-express');
const swaggerDocument = require("./swagger.json");


app.use(express.json());
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

const taskLists = [{"id": 1, "title": "How did I get here", "done": true},
  {"id": 2, "title": "By always embracing change", "done": true},
{"id": 2, "title": "And never give up", "done": true},
]

app.get("/", (req,res)=> {
  res.send({ "name": "Task API", "version": "1.0", "endpoints": ["/tasks"] }
)
})

app.get("/health", (req,res)=> {
  res.send({"status": "ok"}
)
})

app.get("/tasks", (req,res)=> {
  res.send({success: true,
    count: taskLists.length,
    data: taskLists
  })}
)

app.get("/tasks/:id", (req,res)=> {
  const taskId = Number(req.params.id);
  const foundItem = taskLists.find(task => task.id === taskId);

  if (!foundItem){
    return res.status(404).json({error: `Task ${taskId} not found`})
  }
  
  res.send({foundItem})});

app.get("/health", (req,res)=> {
  res.send({"status": "ok"}
)
});

app.post("/tasks", (req, res)=>{
  const {title, done} =req.body;

  const newId = taskLists.length > 0
                ? Math.max(...taskLists.map(task => task.id)) + 1
                : 1;

  const newTask = {
    id :newId,
    title : title,

    done : done !== undefined ? done : false
  };

  taskLists.push(newTask);

  res.status(201).json({
    success: true,
    dataInserted: newTask
  });
});

app.put("/tasks/:id", (req, res)=>
{
  const taskId = Number(req.params.id);
  const foundItem = taskLists.findIndex(task => task.id === taskId);
  const updatedData = req.body;


  if (foundItem !== -1){
    taskLists[foundItem] = {id: taskId, ...updatedData};

    res.status(200).json({
      success: true,
      data: taskLists[foundItem]
    })
  }
  else{
    return res.status(404).json({error: "Unknown id"})
  }
})

app.delete("/tasks/:id", (req, res)=>
{
  const taskId = Number(req.params.id);
  const foundItem = taskLists.findIndex(task => task.id === taskId);

  if (foundItem !== -1){
    taskLists.splice(foundItem, 1);

    res.status(204).json({
      "No content": "Success, nothing to say",
    })
  }
  else{
    return res.status(404).json({error: "Unknown id"})
  }
})
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
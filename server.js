const express = require("express")
const app = express()
app.use(express.json())

const {open} = require("sqlite")

const sqlite3 = require("sqlite3")

const path = require("path")

const dbPath = path.join(__dirname, "server.db")

let db = null
const initializeDBAndServer = async () =>{
    try{
        db = await open({
        filename: dbPath,
        driver: sqlite3.Database,
    })

    app.listen(4001, ()=>{
        console.log("Server running at http://localhost:4001")
    })
    }catch(e){
        console.log(e.message)
    }
}

initializeDBAndServer()

app.post("/tasks", async (request, response)=>{
    const {title, status, priority, createdAt, updatedAt} = request.body

    const addTaskQuery = `
        INSERT INTO todos(title, status, priority, created_at, updated_at)
        VALUES('${title}', '${status}', '${priority}', '${createdAt}', '${updatedAt}');
    `
    const responseObj = await db.run(addTaskQuery)
    const {lastID} = responseObj
    response.send(`Todo with ${lastID} created`)
})

app.get("/tasks", async (request, response) =>{
    const getTodosQuery = `
        SELECT * FROM todos ORDER BY id;
    `

    const todosArray = await db.all(getTodosQuery)
    response.send(todosArray)
})

app.get("/tasks/:taskId/", async (request, response)=>{
    const {taskId} = request.params

    const getTaskQuery = `
        SELECT * FROM todos WHERE id = ${taskId};
    `

    const todoArray = await db.get(getTaskQuery)
    response.send(todoArray)
})

app.delete("/tasks/:taskId", async (request, response)=>{
    const {taskId} = request.params

    const deleteTodoQuery = `
        DELETE FROM todos WHERE id = ${taskId};
    `
    await db.run(deleteTodoQuery)
    response.send(`task with Id ${taskId} deleted successfully`)
})


app.put("/tasks/:taskId", async (request, response) => {
    const { taskId } = request.params;
    const { title, status, priority } = request.body;

    // Construct the update query with only provided fields
    let updateFields = [];
    if (title) updateFields.push(`title = '${title}'`);
    if (status) updateFields.push(`status = '${status}'`);
    if (priority) updateFields.push(`priority = '${priority}'`);

    if (updateFields.length === 0) {
        return response.status(400).send('No update fields provided');
    }

    const updateTodoQuery = `
        UPDATE todos SET ${updateFields.join(', ')} WHERE id = ${taskId};
    `;
    
    
    await db.run(updateTodoQuery);
    response.send(`Task with Id ${taskId} updated successfully`);
});

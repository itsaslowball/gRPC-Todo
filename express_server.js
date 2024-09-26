const express = require("express");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const PROTO_PATH = "./todo.proto";

// Load the protobuf file
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const todoProto = grpc.loadPackageDefinition(packageDefinition).todo;

// Create a gRPC client
const client = new todoProto.ToDoService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

const app = express();
app.use(express.json());

// REST API endpoint to add a task via gRPC
app.post("/add-task", (req, res) => {
  const { description } = req.body;

  client.AddTask({ description }, (err, response) => {
    if (err) {
      res.status(500).send("Error adding task");
    } else {
      res.status(200).json(response);
    }
  });
});

// REST API endpoint to get tasks via gRPC
app.get("/tasks", (req, res) => {
  client.GetTasks({}, (err, response) => {
    if (err) {
      res.status(500).send("Error fetching tasks");
    } else {
      res.status(200).json(response.tasks);
    }
  });
});

// REST API endpoint to mark a task as done via gRPC
app.post("/mark-task/:id", (req, res) => {
  const taskId = parseInt(req.params.id);

  client.MarkTaskAsDone({ id: taskId }, (err, response) => {
    if (err) {
      res.status(500).send("Error marking task as done");
    } else {
      res.status(200).json(response);
    }
  });
});

// Start Express server on port 3000
app.listen(3000, () => {
  console.log("Express server running on port 3000");
});

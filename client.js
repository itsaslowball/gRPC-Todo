const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const PROTO_PATH = "./todo.proto";

// Load the protobuf file
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const todoProto = grpc.loadPackageDefinition(packageDefinition).todo;

// Create a gRPC client connected to the server on port 50051
const client = new todoProto.ToDoService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

// Add a task
client.AddTask({ description: "Buy groceries" }, (err, response) => {
  if (!err) {
    console.log("Task added:", response);
  }

  // Get the list of tasks
  client.GetTasks({}, (err, response) => {
    if (!err) {
      console.log("List of tasks:", response.tasks);

      // Mark the first task as done
      const firstTaskId = response.tasks[0].id;
      client.MarkTaskAsDone({ id: firstTaskId }, (err, response) => {
        if (!err) {
          console.log("Task marked as done:", response);
        }
      });
    }
  });
});

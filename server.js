const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const PROTO_PATH = "./todo.proto";

// Load the protobuf file
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const todoProto = grpc.loadPackageDefinition(packageDefinition).todo;

let tasks = [];
let taskIdCounter = 1;

// Implement the gRPC ToDoService methods
const ToDoService = {
  AddTask: (call, callback) => {
    const task = {
      id: taskIdCounter++,
      description: call.request.description,
      completed: false,
    };
    tasks.push(task);
    callback(null, task);
  },

  GetTasks: (call, callback) => {
    callback(null, { tasks });
  },

  MarkTaskAsDone: (call, callback) => {
    const task = tasks.find((t) => t.id === call.request.id);
    if (task) {
      task.completed = true;
      callback(null, task);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "Task not found",
      });
    }
  },
};

// Create a gRPC server and bind the ToDoService
const server = new grpc.Server();
server.addService(todoProto.ToDoService.service, ToDoService);

// Bind the server to port 50051
server.bindAsync(
  "0.0.0.0:50051",
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log("gRPC server running on port 50051");
    server.start();
  }
);

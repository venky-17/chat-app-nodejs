const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { generateMsg, generateLocMsg } = require("../src/utils/messages");
const {
  addUser,
  removeUser,
  getAllUsers,
  getUser,
} = require("../src/utils/users");

const app = express();

const server = http.createServer(app); //create a http server

const io = socketio(server);

const port = process.env.PORT || 3000;

const publicPath = path.join(__dirname, "../public"); //needed for derving static files

app.use(express.static(publicPath));

io.on("connection", (socket) => {
  console.log("Connected to client!");

  socket.on("sendMsg", (input, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();
    if (filter.isProfane(input)) {
      return callback("cuss words not allowed");
    }

    io.to(user.room).emit("message", generateMsg(input, user.username));
    callback();
  });

  socket.on("disconnect", () => {
    const user = getUser(socket.id);
    if (user) {
      removeUser(socket.id);
      io.to(user.room).emit(
        "message",
        generateMsg(`${user.username} has left the chat`, "Admin")
      );
      io.to(user.room).emit("usersInRoom", {
        room: user.room,
        users: getAllUsers(user.room),
      });
    }
  });

  socket.on("sendLoc", (location, callback) => {
    const user = getUser(socket.id);

    //io.emit("locationMessage", location);
    io.to(user.room).emit(
      "locationMessage",
      generateLocMsg(user.username, location)
    );
    callback();
  });

  socket.on("joinRoom", ({ username, room }, callback) => {
    const { error, user } = addUser({
      id: socket.id,
      username: username,
      room: room,
    });
    if (error) {
      return callback(error);
    }
    socket.join(user.room);
    const userName = getUser(socket.id);
    socket.emit("message", generateMsg(`welcome to Room ${room}`, "Admin"));

    socket.broadcast
      .to(user.room)
      .emit("message", generateMsg(`${user.username} has joined`, "Admin"));

    io.to(user.room).emit("usersInRoom", {
      room: user.room,
      users: getAllUsers(user.room),
    });
    callback();
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`); //app.listen
});

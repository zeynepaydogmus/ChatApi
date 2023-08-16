const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001",
  },
});
const mongoDbConnection = require("./helpers/mongoDbConnection")();
// const { messagesDbConnection } = require("./helpers/mongoDbConnection");
const config = require("./config");
const TableMessage = require("./models/Message");
const userRouter = require("./routes/user");

//middleware
const verifyToken = require("./middleware/verify-token");
app.use(express.static("public"));
app.use(cors({ origin: true, credentials: true }));
app.set("api_secret_key", config.api_secret_key);

app.use("/api", verifyToken);

app.use("/user", userRouter);

io.on("connection", (socket) => {
  // İstemci bağlandığında işlemler

  socket.on("join_room", (msg) => {
    // Oda katılma işlemleri
    socket.join(msg.room_id);

    io.in(msg.room_id).emit(
      "room_users",
      // allUsers yerine oda katılımcılarını belirlemek için socket.rooms kullanılıyor
      Object.keys(socket.rooms)
    );

    TableMessage.find({
      roomId: msg.room_id,
    })
      .then((messages) => {
        io.to(socket.id).emit("old_messages", messages);
      })
      .catch((err) => {
        console.log(err);
      });
  });

  socket.on("send_message", (msg) => {
    io.in(msg.room_id).emit("send_message", msg);

    new TableMessage({
      content: msg.message,
      roomId: msg.room_id,
      username: msg.username,
    }).save();
  });

  socket.on("disconnect", () => {
    // İstemci bağlantısı kesildiğinde işlemler
    io.emit("total_user_count", io.sockets.sockets.size);

    // socket.rooms kullanılarak bağlı olduğu odalar belirleniyor
    Object.keys(socket.rooms).forEach((room) => {
      io.in(room).emit("room_users", socket.rooms[room]);
    });
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});

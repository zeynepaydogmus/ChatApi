const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
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

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
app.use("/api", verifyToken);

app.use("/user", userRouter);
//tüm userları dizi içinde sakla
let allUsers = [];
//bağlantıyı dinliyoruz.
//socket.id, bağlanan istemcinin benzersiz kimliğidir. Ardından, kullanıcı adı ve oda kimliği varsayılan değerlerle eklenir. username ve roomid burda değer olarak verilmiştir.
io.on("connection", (socket) => {
  let findIndex = allUsers.findIndex((item) => item.id === socket.id);
  if (findIndex === -1) {
    allUsers.push({
      id: socket.id,
      username: "default",
      room_id: "0",
    });
  }

  //io.emit ile tüm istemcilere istek atarak count'unu elde edebiliriz.
  io.emit("total_user_count", allUsers.length);

  //join room olaylarını burada dinleriz.

  socket.on("join_room", (msg) => {
    // allUsers dizisinde istemcinin kimliğini (socket.id) arar ve kullanıcıyı bulmak için dizi üzerinde bir indeks bulur.
    let findIndex = allUsers.findIndex((item) => item.id === socket.id);
    //dizideki ilgili kullanıcı bilgilerini günceller. msg nesnesinden gelen verilere göre kullanıcı adı ve oda kimliği değiştirilir.
    allUsers[findIndex] = {
      id: socket.id,
      username: msg.username,
      room_id: msg.room_id,
    };
    // istemciyi belirtilen odada (msg.room_id) birleştirir. Bu, istemciyi belirtilen odaya katılımcı olarak ekler.
    socket.join(msg.room_id);
    //belirtilen odaya katılan tüm kullanıcılara bir mesaj gönderir.
    // Bu durumda, "room_users" adlı bir olay tetiklenir ve oda katılımcıları olan allUsers dizisinin bir kısmı ile birlikte gönderilir.
    io.in(msg.room_id).emit(
      "room_users",
      allUsers.filter((x) => x.room_id == msg.room_id)
    );
    //veritabanından belirli bir oda kimliği
    //(msg.room_id) ile ilişkili eski mesajları almak için kullanılır. Bu, daha önce o odada gönderilmiş mesajların alınmasını sağlar.
    TableMessage.find({
      roomId: msg.room_id,
    })
      .then((messages) => {
        //belirli istemciye bir mesaj gönderir.
        //Bu durumda, "old_messages" adlı bir olay tetiklenir ve alınan eski mesajlar (messages) belirli istemciye gönderilir.
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
    let removeIndex = allUsers.findIndex((item) => item.id === socket.id);
    let findRoomId = allUsers[removeIndex].room_id;
    allUsers.splice(removeIndex, 1);

    io.emit("total_user_count", allUsers.length);
    io.in(findRoomId).emit(
      "room_users",
      allUsers.filter((x) => x.room_id == findRoomId)
    );
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});

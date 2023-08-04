var mongoose = require("mongoose");

module.exports = () => {
  mongoose.connect(
    "mongodb+srv://mydb:545454@cluster0.jfczb.mongodb.net/MessagesDb?retryWrites=true&w=majority"
  );

  mongoose.connection.on("open", () => {
    console.log("MongoDB: Connected");
  });
  mongoose.connection.on("error", (err) => {
    console.log("MongoDB: Error", err);
  });

  mongoose.Promise = global.Promise;
};
// const mongoose = require("mongoose");

// const messagesDbURI =
//   "mongodb+srv://mydb:545454@cluster0.jfczb.mongodb.net/MessagesDb?retryWrites=true&w=majority";
// const userDbURI =
//   "mongodb+srv://mydb:545454@cluster0.jfczb.mongodb.net/UserDb?retryWrites=true&w=majority";

// // İlk veritabanı bağlantısı (MessagesDb)
// const messagesDbOptions = {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// };

// const messagesDbConnection = mongoose.createConnection(
//   messagesDbURI,
//   messagesDbOptions
// );

// messagesDbConnection.on("open", () => {
//   console.log("MessagesDb: Connected");
// });

// messagesDbConnection.on("error", (err) => {
//   console.error("MessagesDb: Connection error", err);
// });

// // İkinci veritabanı bağlantısı (UserDb)
// const userDbOptions = {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// };

// const userDbConnection = mongoose.createConnection(userDbURI, userDbOptions);

// userDbConnection.on("open", () => {
//   console.log("UserDb: Connected");
// });

// userDbConnection.on("error", (err) => {
//   console.error("UserDb: Connection error", err);
// });

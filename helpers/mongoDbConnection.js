var mongoose = require("mongoose");

module.exports = () => {
  mongoose.connect(
    "mongodb+srv://*******@cluster0.jfczb.mongodb.net/MessagesDb?retryWrites=true&w=majority"
  );

  mongoose.connection.on("open", () => {
    console.log("MongoDB: Connected");
  });
  mongoose.connection.on("error", (err) => {
    console.log("MongoDB: Error", err);
  });

  mongoose.Promise = global.Promise;
};

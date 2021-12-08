import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const openConnection = () => {
  // connect mongoose here
  mongoose
    .connect(process.env.DB_CONNECT, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .catch((error) => console.error(error));
  const con = mongoose.connection;
  con.once("open", () => console.log("connection is opened"));
  con.on("error", (err) => console.error(err));

  return con;
};

export default openConnection;

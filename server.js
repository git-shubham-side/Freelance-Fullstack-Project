require("dotenv").config();

const mongoose = require("mongoose");
const app = require("./app");

const startServer = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not configured.");
    }

    await mongoose.connect(process.env.MONGO_URI);

    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`server started on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();

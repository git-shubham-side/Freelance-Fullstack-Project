const app = require("./app");
const dotenv = require("dotenv").config();
// dotenv.config({ path: "./config.env" });

app.listen(process.env.PORT || 5000, () => {
  console.log(`server started on port on http://localhost:${process.env.PORT}`);
});

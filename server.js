const app = require("./app");
const env = require("./src/config/env");

const port = env.PORT;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

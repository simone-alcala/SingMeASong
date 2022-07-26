import app from "./app.js";

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}.`);
  console.log(`NODE_ENV ${NODE_ENV}.`);
});

import express from "express";
import ViteExpress from "vite-express";
import expressSession from "express-session";
import api from "./api.js";

const app = express();

app.use(expressSession({
  resave: false,
  saveUninitialized: false,
  secret: 'y7Td#J9@2X!aFbZe',
  cookie: {
    signed: true,
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60
  }
}));

app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use('/api', api);



app.use((err, req, res, next) => {
  res.status(500);
  res.json({
    msg: err.message
  });
});


ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000..."),
);

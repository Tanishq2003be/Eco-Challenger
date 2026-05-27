import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import ecochallenge from "./api/eco-challenge.route.js";
import session from "express-session";
import LocalStrategy from "passport-local";
import MongoStore from "connect-mongo";
import bcrypt from "bcryptjs";
import passport from "passport";
import UserDAO from "./dao/user.dao.js";
import UserCtrl from "./api/user.controller.js";

dotenv.config();

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  if (req.headers.origin === "http://localhost:3000") {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, X-Auth-Token");
  }
  next();
});

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.ECOCHALLENGE_SESSION_HASH,
    store: MongoStore.create({ mongoUrl: process.env.ECOCHALLENGE_DB_URI, dbName: process.env.ECOCHALLENGE_NS }),
    resave: false,
    saveUninitialized: false,
  })
);

const LS = LocalStrategy.Strategy;

const strategy = new LS(
  {
    usernameField: "username",
  },
  async function (username, password, done) {
    let json, user;
    const response = await UserDAO.getUserByUsername(username)
      .then((response) => {
        json = JSON.stringify(response);
        user = JSON.parse(json);
      })
      .catch((e) => {
        console.log("err");
        return done(e);
      });

    if (user == null) {
      return done(null, false, { message: "Incorrect username" });
    }

    if (!bcrypt.compareSync(password, user.password)) {
      return done(null, false, { message: "Incorrect password" });
    }

    return done(null, user);
  }
);

passport.serializeUser((user, done) => {
  done(null, { _id: user._id, username: user.username });
});

passport.deserializeUser(async (id, done) => {
  let j, user_json;
  const response = await UserDAO.getUserById(id["_id"])
    .then((response) => {
      j = JSON.stringify(response);
      user_json = JSON.parse(j);
    })
    .catch((e) => {
      return done(e);
    });
  return done(null, user_json);
});

passport.use(strategy);

app.use(passport.initialize());
app.use(passport.session());

ecochallenge.route("/login").post(
  function (req, res, next) {
    next();
  },
  passport.authenticate("local"),
  (req, res) => {
    var userInfo = {
      username: req.user.name,
      id: req.user._id,
    };
    res.send(userInfo);
  }
);

ecochallenge.route("/get-user").get(async (req, res, next) => {
  if (req.user) {
    await UserCtrl.apiGetUserById(req.user._id, req.user.total_points).then((response) => {
      const info = JSON.stringify(response);
      const json = JSON.parse(info);
      res.json({ user: json });
    });
  } else {
    res.json({ user: null });
  }
});

ecochallenge.route("/logout").post((req, res) => {
  if (req.user) {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.json({ msg: "logging out" });
    });
  } else {
    res.json({ msg: "no user to log out" });
  }
});

app.use("/api/eco-challenge", ecochallenge);
app.use("*", (req, res) => res.status(404).json({ error: "not found" }));

export default app;

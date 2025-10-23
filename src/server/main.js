import express from "express";
import ViteExpress from "vite-express";
import expressSession from "express-session";
import api from "./api.js";
import passport from 'passport';
import { Strategy as LocalStrategy} from 'passport-local';
import {Strategy as JwtStrategy, ExtractJwt} from 'passport-jwt';
import User from "./models/User.js";
import TutorCourse from "./models/TutorCourse.js";
import bcrypt from 'bcryptjs';
import cors from 'cors';
import dotenv from 'dotenv';

import { generateToken } from "./utils/jwt.js";

const port = process.env.PORT || 3000;

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

dotenv.config();

const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(passport.authenticate('session')); 
app.use(cors({
  origin: allowedOrigin, // frontend dev server
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Authorization", "Content-Type"],
  credentials: true
}));


app.use('/api', api);

const JWT_SECRET = process.env.SECRET_KEY; 

const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey =  JWT_SECRET;

passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
  try {
    const user = await User.findOne({
      where: { email: jwt_payload.email },
      attributes: ['user_id', 'email', 'password_hash', 'role']
    });

    if (!user) {
      console.log('User not found');
      return done(null, false, { message: 'Incorrect username' });
    }
    return done(null, user);
  }
  catch(e) {
    console.error(e);
    return done(e);
  }
}));


// Passport Configuration
passport.use(
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password_hash' }, async (email, password, done) => {
    try {
      const user = await User.findOne({
        where: { email },
        attributes: ['user_id', 'email', 'password_hash']
      });

      if (!user) {
        console.log('User not found');
        return done(null, false, { message: 'Incorrect username' });
      }

      const storedHash = user.password_hash;

      let passwordsMatch;
      if (storedHash.startsWith('$2a$')) {
        passwordsMatch = bcrypt.compareSync(password, storedHash);
      } else {
        const defaultPasswordHash = bcrypt.hashSync(user.password_hash, 10);
        passwordsMatch = bcrypt.compareSync(password, defaultPasswordHash);
        
        if (passwordsMatch) {
          user.password_hash = defaultPasswordHash;
          await user.save();
        }
      }

      console.log('Passwords Match:', passwordsMatch);

      if (passwordsMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Incorrect password' });
      }
    } catch (err) {
      return done(err);
    }
  })
);



passport.serializeUser((user, done) => {
  done(null, user.user_id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Routes
app.post(
  "/login",
  passport.authenticate("local", { session: true }),  // Disable passport session management
  (req, res) => {
    req.session.name = req.body.email;
    req.session.save();
    const token = generateToken(req.user);
    console.log('User authenticated:', req.user.dataValues.email);
    console.log('Token generated');
    res.status(200).json({ message: "User authenticated", user: req.user, token });
  }
);




app.post('/signup', async (req, res) => {
  try {
    const { first_name, last_name, email, password_hash, ku_id, major, courses } = req.body;
    const role = 'student';
    const hashedPassword = bcrypt.hashSync(password_hash, 10);
    const newUser = await User.create({ first_name, last_name, email, role, password_hash: hashedPassword, ku_id, major_id: major });
    if (Array.isArray(courses)) {
      for (const course of courses) {
        await TutorCourse.create({
          user_id: newUser.user_id,
          course_id: course,
          status: 'Received'
        });
      }
    }
    console.log(newUser)
    res.send('User created successfully');
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).send('Username or email already exists');
    }
    res.status(400).send(err.message);
  }
});

/*
app.post('/check/:id?/:email?', async(req, res) => {
  const {id, email} = req.params

  const userID = await User.findByPk(id)
  const userEmail = User.findOne({ where: { email } });

  if(userID || userEmail) {
    return res.status(400).send('Username or email already exists');
  }

})
*/

// app.get('/logout', (req, res) => {
//     req.logout();
//     res.send('Logged out successfully');
  
// });

app.post('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) {
      return next(err);
    }
    req.session.destroy(function(err) {
      if (err) {
        return next(err);
      }
      res.clearCookie('connect.sid', { path: '/' }); 
      res.status(200).send({ message: 'Logout successful' });
    });
  });
});


// Protected Route
app.get('/protected', (req, res) => {
  if (req.isAuthenticated()) {
    res.send('Protected Route');
  } else {
    res.status(401).send('Unauthorized');
  }
});


app.use((err, req, res, next) => {
  res.status(500);
  res.json({
    msg: err.message
  });
});


ViteExpress.listen(app, port,() =>
  console.log(`Server is listening on port ${port}..`),
);







import express from "express";
import ViteExpress from "vite-express";
import expressSession from "express-session";
import api from "./api.js";
import passport from 'passport';
import { Strategy as LocalStrategy} from 'passport-local';
import User from "./models/User.js";
import bcrypt from 'bcryptjs';
import cors from 'cors';

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
app.use(passport.authenticate('session'));
app.use(cors());

app.use('/api', api);

// Passport Configuration
passport.use(
  new LocalStrategy({ usernameField: 'email', passwordField: 'password_hash' }, async (email, password, done) => {
    try {
      const user = await User.findOne({
        where: { email },
        attributes: ['user_id', 'email', 'password_hash']
      });

      console.log('Email:', email);
      console.log('Entered Password:', password);

      if (!user) {
        console.log('User not found');
        return done(null, false, { message: 'Incorrect username' });
      }

      const storedHash = user.password_hash;
      console.log('Stored Hash:', storedHash);

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
  passport.authenticate("local", { session: true }), 
  (req, res) => {
    req.session.name = req.body.email;
    req.session.save();
    console.log(req.user)
    if (req.user) {
      res.status(200).json({ message: "User authenticated", user: req.user });
    } else {
      res.status(401).json({ message: "Authentication failed" });
    }
  }
);

app.post('/signup', async (req, res) => {
  try {
    const { first_name, last_name, email, password_hash, ku_id } = req.body;
    const hashedPassword = bcrypt.hashSync(password_hash, 10);
    const newUser = await User.create({ first_name, last_name, email, password_hash: hashedPassword, ku_id });
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
    if (err) { return next(err); }
    console.log(req.session)
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


ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000..."),
);

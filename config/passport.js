// Require related packages
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

const bcrypt = require('bcryptjs')

// Require User model
const User = require('../models/user')

// Export function
module.exports = app => {
  // Initialize Passport and restore authentication state, if any, from the session
  app.use(passport.initialize())
  app.use(passport.session())

  passport.use(
    new LocalStrategy(
      { usernameField: 'email', passReqToCallback: true },
      async (req, email, password, done) => {
        try {
          const user = await User.findOne({ email })

          if (!user || !bcrypt.compareSync(password, user.password)) {
            req.session.email = req.body.email
            req.session.password = req.body.password
            return done(null, false, {
              message: 'Incorrect Email or Password'
            })
          }

          return done(null, user)
        } catch (err) {
          done(err, false)
        }
      }
    )
  )

  // Set up facebook strategy


  // Set up google strategy
 

  passport.serializeUser((user, done) => {
    done(null, user.id)
  })
  passport.deserializeUser((id, done) => {
    User.findById(id)
      .lean()
      .then(user => done(null, user))
      .catch(err => done(err, null))
  })
}

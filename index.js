// @flow

// ----
// Authenticate with google (via passport)
// and grant access to users who match an email whitelist
// ----

type Env = {
  // google auth config
  GOOGLE_CLIENT_ID: string,
  GOOGLE_CLIENT_SECRET: string,
  GOOGLE_CALLBACK_URL: string,
  GOOGLE_AUTH_WHITELIST: string
}

import type { $Application } from 'express'

const normalizeWhitelist = require('./lib/normalize-whitelist')
const isEmailInWhitelist = require('./lib/is-email-in-whitelist')

const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy

passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((user, done) => {
  done(null, user)
})

module.exports = function (env: Env, app: $Application) {
  const whitelist = normalizeWhitelist(env.GOOGLE_AUTH_WHITELIST)

  const opts = {
    clientID: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    callbackURL: env.GOOGLE_CALLBACK_URL
  }

  const loginCb = (accessToken, refreshToken, profile, done) => {
    if (!accessToken || !profile) {
      return done(new Error('oauth failed'))
    }

    // store info from the user's google profile
    const user = {
      id: profile.id,
      token: accessToken,
      name: profile.displayName || `${profile.name.givenName} ${profile.name.familyName}`,
      photo: profile.photos[0].value,
      email: profile.emails[0].value
    }

    if (user.id !== null && isEmailInWhitelist(whitelist, user.email)) {
      return done(null, user)
    } else {
      return done(null, false)
    }
  }

  // tell passport to use google auth
  passport.use(new GoogleStrategy(opts, loginCb))

  // tell express to use passport middleware
  app.use(passport.initialize())
  app.use(passport.session())

  // ----
  // routes for google auth

  // - initiate login
  app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

  // - callback that google auth brings the user back to
  // (need to make sure google is configured with the same route)
  app.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/admin',
    successRedirect: '/admin',
    failureFlash: true
  }))
}

// Middleware to ensure the user is authenticated before proceeding
module.exports.requireAuth = function requireAuth (req, res, next) {
  // If user is authenticated in the session, carry on
  if (typeof req.isAuthenticated === 'function' && req.isAuthenticated()) { return next() }

  // Otherwise send 401 response
  res.sendStatus(401)
}

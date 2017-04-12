// ----
// Authenticate with google (via passport)
// and grant access to users who match an email whitelist
// ----

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

function getOptionsFromEnv (env, opts={}) {
  // the email whitelist to determine who can login
  opts.whitelist = normalizeWhitelist(opts.whitelist || env.GOOGLE_AUTH_WHITELIST)

  // options for the google oauth strategy
  opts.google = Object.assign({
    clientID: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    callbackURL: env.GOOGLE_CALLBACK_URL
  }, opts.google || {})

  // options for express routes
  opts.routes = Object.assign({
    init: '/auth/google',
    callback: '/auth/google/callback',
    success: '/admin',
    failure: '/admin'
  }, opts.routes || {})

  return opts
}

module.exports = function (app, opts) {
  if (typeof app.use !== 'function') {
    throw new Error('Expected first argument to be an express app instance')
  }

  opts = getOptionsFromEnv(process.env, opts)

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

    if (user.id !== null && isEmailInWhitelist(opts.whitelist, user.email)) {
      return done(null, user)
    } else {
      return done(null, false)
    }
  }

  // tell passport to use google auth
  passport.use(new GoogleStrategy(opts.google, loginCb))

  // tell express to use passport middleware
  app.use(passport.initialize())
  app.use(passport.session())

  // ----
  // routes for google auth

  const routes = opts.routes

  // - initiate login
  app.get(routes.init, passport.authenticate('google', { scope: ['profile', 'email'] }))

  // - callback that google auth brings the user back to
  // (need to make sure google is configured with the same route)
  app.get(routes.callback, passport.authenticate('google', {
    failureRedirect: routes.failure,
    successRedirect: routes.success,
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

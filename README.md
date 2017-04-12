# express-google-oauth

[![Build Status](https://secure.travis-ci.org/x-team/express-google-oauth.png)](http://travis-ci.org/x-team/express-google-oauth)

## Usage

```
const app = require('express')()
const googleOauth = require('express-google-oauth')

googleOauth(app)
```

### Options

The function can be called with a second `options` argument, with the following structure:

```
{
  google: {
    // oauth client ID
    clientID: string,

    // oauth client secret
    clientSecret: string,

    // callback, as configured in the google oauth console
    callbackURL: string
  },

  routes: {
    // route where the oauth flow is initiated
    init: string,

    // route where the oauth callback is handled
    callback: string

    // route where successful logins are redirected
    success: string,

    // route where failed logins are redirected
    failure: string
  },

  // comma-separated list of email addresses of people who are allowed to log in
  whitelist: string
}
```

To keep secrets out of your codebase, it is recommended to use the following ENV variables. If the the `options.google` section is undefined, values from `process.env` will be used by default:

- `GOOGLE_CLIENT_ID` becomes `opts.google.clientID`
- `GOOGLE_CLIENT_SECRET` becomes `opts.google.clientSecret`
- `GOOGLE_CALLBACK_URL` becomes `opts.google.callbackURL`

The whitelist can also be stored in ENV, since it probably changes from one environment to the next:

- `GOOGLE_AUTH_WHITELIST` becomes `opts.whitelist`

## License

MIT

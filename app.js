const express = require('express'), // Express web server framework
 request = require('request'), // "Request" library
 querystring = require('querystring'),
 cookieParser = require('cookie-parser'),
  PORT = process.env.PORT || 8888,
  keys = require('./config/keys.js')
const client_id = keys.clientID
const client_secret = keys.clientSecret
const redirect_uri = '/callback' // redirect uri

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
const generateRandomString = (length) => {
  let text = ''
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

const stateKey = 'spotify_auth_state', 
app = express()

app.use(express.static(__dirname + '/public'))
  .use(cookieParser())

app.get('/login', (req, res) => {

  let state = generateRandomString(16)
  res.cookie(stateKey, state)

  // application requests authorization
  let scope = 'user-read-private user-read-email'
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }))
})

app.get('/callback', (req, res) => {
  // application requests refresh and access tokens
  // after checking the state parameter
  let code = req.query.code || null
  let state = req.query.state || null
  let storedState = req.cookies ? req.cookies[stateKey] : null

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }))
  } else {
    res.clearCookie(stateKey)
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    }

    request.post(authOptions, (error, response, body) => {
      if (!error && response.statusCode === 200) {

        let access_token = body.access_token,
          refresh_token = body.refresh_token

        let options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        }

        // access token to access the Spotify Web API
        request.get(options, (error, response, body) => {
          // console.log(body)
        })

        // pass the token to the browser to make requests
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }))
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }))
      }
    })
  }
})

app.get('/refresh_token', (req, res) => {

  // requesting access token from refresh token
  let refresh_token = req.query.refresh_token
  let authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  }

  request.post(authOptions, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      let access_token = body.access_token
      res.send({
        'access_token': access_token
      })
    }
  })
})

app.listen(PORT, () => console.log(`Listening on port ${PORT}`))

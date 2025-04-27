// Require packages
const express = require('express')
const session = require('express-session')
const redis = require('redis')
const redisStore = require('connect-redis')(session)
const exphbs = require('express-handlebars')
const flash = require('connect-flash')
const methodOverride = require('method-override')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const routes = require('./routes')
const usePassport = require('./config/passport')
require('./config/mongoose')
require('./utils/handlebars-helper')

const PORT = process.env.PORT || 3000
const app = express()

// Connect Redis (fixed for redis v3.x)
const client = redis.createClient(
  6379,  // Default Redis port
  process.env.REDIS_ENDPOINT_URI, // Your Upstash endpoint
  { 
    password: process.env.REDIS_PASSWORD,
    tls: {}  // Upstash needs TLS
  }
)

client.on('connect', function () {
  console.log('Connected to Redis successfully!')
})

client.on('error', function (err) {
  console.error('Redis Client Error:', err)
})

// Set up template engine
app.engine('hbs', exphbs({ defaultLayout: 'main', extname: '.hbs' }))
app.set('view engine', 'hbs')

// Handle session
app.use(
  session({
    store: new redisStore({ client }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      sameSite: 'strict',
      secure: true,    // <<< Important for HTTPS on Render
      httpOnly: true
    }
  })
)

// Set up body-parser
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Set up method-override
app.use(methodOverride('_method'))

// Set up static files
app.use(express.static('public'))

// Initialize Passport
usePassport(app)

// Use flash
app.use(flash())

// Global middleware for template variables
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated()
  res.locals.user = req.user
  res.locals.success_msg = req.flash('success_msg')
  res.locals.warning_msg = req.flash('warning_msg')
  res.locals.error_msg = req.flash('error_msg')
  next()
})

// Routes
app.use(routes)

// Start server
app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`)
})

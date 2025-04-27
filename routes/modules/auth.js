// Require Express and Express router
const express = require('express')
const router = express.Router()

const userController = require('../../controllers/userController')
const { authenticator } = require('../../middleware/auth')

const passport = require('passport')

// Google Login


router.get(
  '/google/callback',
  passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/users/login'
  })
)

// Export router
module.exports = router

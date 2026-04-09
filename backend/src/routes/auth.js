'use strict'

const express = require('express')
const jwt = require('jsonwebtoken')

const router = express.Router()

router.post('/login', (req, res) => {
  const { username, password } = req.body ?? {}
  if (
    username !== process.env.SHOP_USERNAME ||
    password !== process.env.SHOP_PASSWORD
  ) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '8h' })
  return res.json({ token })
})

module.exports = router

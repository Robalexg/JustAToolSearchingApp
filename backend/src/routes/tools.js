'use strict'

const express = require('express')
const tools = require('../data/tools.json')

const router = express.Router()

router.get('/', (req, res) => {
  res.json(tools)
})

module.exports = router

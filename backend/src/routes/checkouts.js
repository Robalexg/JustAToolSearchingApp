'use strict'

const express = require('express')
const { getHistory, checkOut, checkIn } = require('../db/dynamo')

const router = express.Router({ mergeParams: true })

// GET /tools/:id/checkouts — history, newest first
router.get('/', async (req, res) => {
  try {
    const history = await getHistory(req.params.id)
    res.json(history)
  } catch (err) {
    console.log("madeit",err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /tools/:id/checkouts — check out
router.post('/', async (req, res) => {

  const { roNumber, techName } = req.body ?? {}
  if (!roNumber?.trim() || !techName?.trim()) {
    return res.status(400).json({ error: 'roNumber and techName are required' })
  }
  try {
    const record = await checkOut(req.params.id, {
      roNumber: roNumber.trim(),
      techName: techName.trim(),
    })
    res.status(201).json(record)
  } catch (err) {
    const status = err.statusCode ?? 500
    res.status(status).json({ error: err.message })
  }
})

// PUT /tools/:id/checkouts/checkin — check in
router.put('/checkin', async (req, res) => {

  try {
    const record = await checkIn(req.params.id)
    res.json(record)
  } catch (err) {
    const status = err.statusCode ?? 500
    res.status(status).json({ error: err.message })
  }
})

module.exports = router



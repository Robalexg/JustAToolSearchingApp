'use strict'

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
  UpdateCommand,
} = require('@aws-sdk/lib-dynamodb')

const client = new DynamoDBClient({ region: process.env.AWS_REGION })
const ddb = DynamoDBDocumentClient.from(client)

const TABLE = () => process.env.DYNAMODB_TABLE

/**
 * Returns all checkout records for a tool, newest first.
 * @param {string} toolId
 * @returns {Promise<Array>}
 */
async function getHistory(toolId) {
  const result = await ddb.send(new QueryCommand({
    TableName: TABLE(),
    KeyConditionExpression: 'toolId = :id',
    ExpressionAttributeValues: { ':id': toolId },
    ScanIndexForward: false,
  }))
  return result.Items ?? []
}

/**
 * Returns the open checkout record if the tool is currently checked out, or null.
 * @param {string} toolId
 * @returns {Promise<Object|null>}
 */
async function getCurrentCheckout(toolId) {
  const result = await ddb.send(new QueryCommand({
    TableName: TABLE(),
    KeyConditionExpression: 'toolId = :id',
    ExpressionAttributeValues: { ':id': toolId },
    ScanIndexForward: false,
    Limit: 1,
  }))
  const latest = result.Items?.[0]
  if (!latest || latest.returnDate !== undefined) return null
  return latest
}

/**
 * Creates a new checkout record. Throws if the tool is already checked out.
 * @param {string} toolId
 * @param {{ roNumber: string, techName: string }} data
 * @returns {Promise<Object>} the new record
 */
async function checkOut(toolId, { roNumber, techName }) {
  const existing = await getCurrentCheckout(toolId)
  if (existing) {
    const err = new Error('Tool is already checked out')
    err.statusCode = 409
    throw err
  }
  const checkoutDate = new Date().toISOString()
  const item = { toolId, checkoutDate, roNumber, techName }
  await ddb.send(new PutCommand({ TableName: TABLE(), Item: item }))
  return item
}

/**
 * Closes the current open checkout. Throws if the tool is not checked out.
 * @param {string} toolId
 * @returns {Promise<Object>} the updated record
 */
async function checkIn(toolId) {
  console.log("toolID")
  const current = await getCurrentCheckout(toolId)
  if (!current) {
    const err = new Error('Tool is not currently checked out')
    err.statusCode = 409
    throw err
  }
  const returnDate = new Date().toISOString()
  await ddb.send(new UpdateCommand({
    TableName: TABLE(),
    Key: { toolId, checkoutDate: current.checkoutDate },
    UpdateExpression: 'SET returnDate = :rd',
    ConditionExpression: 'attribute_not_exists(returnDate)',
    ExpressionAttributeValues: { ':rd': returnDate },
  }))
  return { ...current, returnDate }
}

module.exports = { getHistory, getCurrentCheckout, checkOut, checkIn }

/* eslint-disable camelcase */
const {
  crypto_box_seal,
  crypto_box_seal_open,
  crypto_box_keypair,
  crypto_box_SEALBYTES,
  crypto_box_PUBLICKEYBYTES,
  crypto_box_SECRETKEYBYTES
} = require('sodium-universal')
/* eslint-enable camelcase */
const createDebug = require('debug')

// Global registry names (used as session variables)
const KEY_SK = 'reg/sk'
const KEY_BOX_LIKES_PK = 'reg/likes_pk'
const KEY_BOX_LIKES_SK = 'reg/likes_sk'

// Block-types
const TYPE_PROFILE = 'profile'
const TYPE_VIBE = 'vibe' // A.k.a ❤️ Like ❤️
const TYPE_VIBE_RESP = 'vibe-response' // <3 / </3
const TYPE_MESSAGE = 'message'
const TYPE_BYE = 'bye'
const TYPE_BYE_RESP = 'byebye'

// Other Constants
const VIBE_REJECTED = Buffer.from('💔')
const PASS_TURN = Buffer.from('😶')
const PEACE = 0
const UNDERSTANDING = 1
const LOVE = 2

/**
 * Convert Object to buffer
 */
function encodeBlock (type, seq, payload) {
  // TODO: Convert to protobuffer instead of JSON to allow storing images and video
  return JSON.stringify({
    ...payload,
    type,
    seq,
    date: new Date().getTime()
  })
}

/**
 * Converts buffer to Object
 */
function decodeBlock (body, offset = 0) {
  // TODO: Convert to protobuffer instead of JSON to allow storing images and video
  return JSON.parse(body, bufferReplacer)
}

function bufferReplacer (k, o) {
  return (o && typeof o === 'object' && o.type === 'Buffer') ? Buffer.from(o.data) : o
}

/**
 * Fixes JSON.parse(JSON.stringify(Buffer.alloc(1))) => Buffer
 * instead of: { type: 'Buffer', data [ 0 ] }
 */
function fixJsonBuffers (o) {
  if (typeof o === 'object' && o.type === 'Buffer') return Buffer.from(o.data)
  if (Array.isArray(o)) return o.map(fixJsonBuffers)
  if (typeof o === 'object') {
    for (const prop in o) {
      o[prop] = fixJsonBuffers(o[prop])
    }
  }
  return o
}

/**
 * Converts hexString to buffer
 */
function toBuffer (o) {
  if (!o) return o
  if (Buffer.isBuffer(o)) return o
  if (typeof o === 'string' && /^[0-9A-f]+$/.test(o)) return Buffer.from(o, 'hex')
  if (typeof o === 'string') return Buffer.from(o) // Not sure if like, remember PHP anyone?
  if (typeof o === 'object' && o.type === 'Buffer') return Buffer.from(o.data)
  else return o
}

/*
 * Sodium seal/unseal encryption
 * https://doc.libsodium.org/public-key_cryptography/sealed_boxes
 */
function seal (m, pk) {
  const c = Buffer.allocUnsafe(crypto_box_SEALBYTES + m.length) // eslint-disable-line camelcase
  crypto_box_seal(c, m, pk)
  return c
}

function unseal (c, sk, pk) {
  const m = Buffer.allocUnsafe(c.length - crypto_box_SEALBYTES) // eslint-disable-line camelcase
  const succ = crypto_box_seal_open(m, c, pk, sk)
  if (!succ) throw new Error('DecryptionFailedError')
  return m
}

function boxPair () {
  const pk = Buffer.allocUnsafe(crypto_box_PUBLICKEYBYTES)
  const sk = Buffer.allocUnsafe(crypto_box_SECRETKEYBYTES)
  crypto_box_keypair(pk, sk)
  return { pk, sk }
}

/* -------------------- */
createDebug.formatters.h = v => {
  if (!Buffer.isBuffer(v) || !v?.length) return v
  return v.slice(0, Math.min(8, v.length)).toString('hex')
}
createDebug.formatters.H = v => {
  if (!Buffer.isBuffer(v) || !v?.length) return v
  return v.toString('hex')
}

module.exports = {
  KEY_SK,
  KEY_BOX_LIKES_PK,
  KEY_BOX_LIKES_SK,
  TYPE_PROFILE,
  TYPE_VIBE,
  TYPE_VIBE_RESP,
  TYPE_MESSAGE,
  TYPE_BYE,
  TYPE_BYE_RESP,
  VIBE_REJECTED,
  PASS_TURN,
  PEACE,
  LOVE,
  UNDERSTANDING,
  encodeBlock,
  decodeBlock,
  fixJsonBuffers,
  toBuffer,
  boxPair,
  seal,
  unseal,
  bufferReplacer
}

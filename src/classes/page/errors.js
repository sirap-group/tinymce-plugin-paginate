'use strict'

exports.InvalidOrientationLabelError = InvalidOrientationLabelError

/**
 * Must be thrown when trying to orientate a page with an invalid orientation label
 * @constructor
 * @param {string} label The invalid orientation label
 */
function InvalidOrientationLabelError (label) {
  this.name = 'InvalidOrientationLabelError'
  this.message = label + ' is an invalid orientation label !'
  this.stack = (new Error()).stack
}

InvalidOrientationLabelError.prototype = Error.prototype

InvalidOrientationLabelError.prototype.name = 'InvalidOrientationLabelError'

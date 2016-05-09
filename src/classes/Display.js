/**
 * Display class module
 * @module class/Display
 */

'use strict'

var $ = window.jquery

module.exports = Display

/**
 * @constructor
 * @param {DOMDocument} _document The document currently in edition
 */
function Display (_document) {
  /**
  * @property {Element}
  */
  this._testDPIElement = null
  this.document = _document
  this._setScreenDPI()
}

/**
 * @method
 * @return the screen DPI
 */
Display.prototype._setScreenDPI = function () {
  var testNode
  _createTestDPIElement.call(this)
  testNode = this._testDPIElement[0]
  if (testNode.offsetWidth !== testNode.offsetHeight) throw new Error('FATAL ERROR: Bad Screen DPI !')
  this.screenDPI = this._testDPIElement[0].offsetWidth
}

/**
 * @method
 * @param {String} unit
 * @return `_document` body height in `unit` unit
 */
Display.prototype.height = function (unit) {
  if (!unit) throw new Error('Explicit unit for getting document height is required')

  var pixels = $('body', this.document).height()

  if (unit === 'px') return pixels
  if (unit === 'mm') return this.px2mm(pixels)
}

/**
 * Converts pixels amount to milimeters, in function of current display DPI
 * @description
 * Calculus rule
 * 1 dpi := pixel / inch
 * 1 in = 25.4 mm
 * size in mm = pixels * 25.4 / DPI
 *
 * @method
 * @param {Number} px   The amount of pixels to Converts
 * @return {Number}   The amount of milimeters converted
 */
Display.prototype.px2mm = function (px) {
  if (!this.screenDPI) throw new Error('Screen DPI is not defined. Is Display object instantied ?')
  return px * 25.4 / this.screenDPI
}

/**
 * Converts milimeters amount in pixels, in function of current display DPI
 *
 * Calculus rule
 * 1 dpi := pixel / inch
 * 1 in = 25.4 mm
 * size in px = mm * DPI / 25.4
 *
 * @method
 * @param {Number} mm   The amount of milimeters to converts
 * @return {Number} px  The amount of pixels converted
 */
Display.prototype.mm2px = function (mm) {
  if (!this.screenDPI) throw new Error('Screen DPI is not defined. Is Display object instantied ?')
  return mm * this.screenDPI / 25.4
}

/**
 * Create the test DPI element
 * @method
 * @private
 */
function _createTestDPIElement () {
  this._testDPIElement = $('<div/>')
    .attr('id', 'dpi-test')
    .css({
      position: 'absolute',
      top: '-100%',
      left: '-100%',
      height: '1in',
      width: '1in',
      border: 'red 1px solid'
    })
  $('body').prepend(this._testDPIElement)
}

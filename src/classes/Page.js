/**
 * Page class module
 * @module class/Page
 */

'use strict'

var $ = window.jQuery

var supportedFormats = require('../utils/page-formats')

var pageErrors = require('./page/errors')

var InvalidOrientationLabelError = pageErrors.InvalidOrientationLabelError

module.exports = Page

/**
 * @constructor
 * @param {String} formatLabel A supported format mabel. For example: `A4`.
 * @param {Sring} orientation An orientation in `('portrait','landscape')`.
 * @param {Number} rank The page rank `(1..n)`
 * @param {HTMLDivElement} wrappedPageDiv The `div[data-paginator]` HTMLDivElement
 */
function Page (formatLabel, orientation, rank, wrappedPageDiv) {
  this._content = null
  this.rank = null

  this.format(formatLabel)
  this.orientate(orientation)

  if (rank !== undefined) {
    this.rank = rank
  }

  if (wrappedPageDiv !== undefined || wrappedPageDiv !== null) {
    this.content(wrappedPageDiv)
  }
}

/**
 * Getter-setter for page div content Element
 * @method
 * @param {DOMElement} The content to fill the page
 * @return {DOMElement|void} The page div Element to return in getter usage
 */
Page.prototype.content = function (wrappedPageDiv) {
  if (wrappedPageDiv === undefined) {
    return this._content
  } else {
    this._content = wrappedPageDiv
    $(this._content).on('remove', function (evt, d) {
      console.error('page %s has been removed from the DOM !')
    })
  }
}

/**
 * Append the given node list to the page content.
 * @method
 * @param {Array}<Node> nodes The nodes to insert.
 * @returns {Page} `this` page instance.
 */
Page.prototype.append = function (nodes) {
  $(nodes).appendTo(this.content())
  return this
}

/**
 * Prepend the given node list to the page content.
 * @method
 * @param {Array}<Node> nodes The nodes to insert.
 * @returns {Page} `this` page instance.
 */
Page.prototype.prepend = function (nodes) {
  $(nodes).prependTo(this.content())
  return this
}

/**
 * getter-setter of the orientation
 * @method
 * @param <string> orientation
 * @return void
 */
Page.prototype.orientate = function (orientation) {
  var inValidType = (typeof (orientation) !== 'string')
  var inValidLabel = (orientation.toLowerCase() !== 'portrait' && orientation.toLowerCase() !== 'paysage')

  if (inValidType || inValidLabel) throw new InvalidOrientationLabelError(orientation)

  this.orientation = orientation

  if (orientation === 'portrait') {
    this.width = this.format().short
    this.height = this.format().long
  } else {
    this.width = this.format().long
    this.height = this.format().short
  }
}

/**
 * @method getter-setter for the page format
 * @param {String} label The format's label to set if used as setter, undefined to use it as getter
 * @return {Format | Page}
 * - the defined format for the page if used as getter,
 * - or the page instance if used as setter (to permit chaining)
 */
Page.prototype.format = function (label) {
  if (label !== undefined) {
    if (!supportedFormats[label]) throw new Error('Format ' + label + ' is not supported yet.')

    this._format = supportedFormats[label]
    return this
  }

  else return this._format
}

/**
 * Compute the real height of the page's content. It must equals the page inner height, except the time where the content overflows it, juste before to be repaged by the `Paginator::_repage()` method that bring back the content height to the page inner one.
 * @method
 * @returns {Number} The resulted height in pixels.
 */
Page.prototype.getContentHeight = function () {
  var contentHeight = $(this.content()).css('height')
  var inPixels = contentHeight.split('px').join('')
  return Number(inPixels)
}

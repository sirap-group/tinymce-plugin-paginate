/**
 * Paginator class module
 * @module classes/Paginator
 */

'use strict'

var $ = window.jquery

// var _ = require('lodash')
var Display = require('./Display')
var Page = require('./Page')
var parser = require('./paginator/parser')

var errors = require('./paginator/errors')
var InvalidPageRankError = errors.InvalidPageRankError
var InvalidFocusedRangeError = errors.InvalidFocusedRangeError
var InvalidPageHeightError = errors.InvalidPageHeightError
var InvalidCursorPosition = errors.InvalidCursorPosition

// Exports Paginator class
exports = module.exports = Paginator

// Bind errors to the classes/paginator module.
exports.errors = errors

/**
 * Paginator is the page manager
 * @constructor
 * @param {string} pageFormatLabel The label of the paper format for all pages. For example, 'A4'
 * @param {string} pageOrientation The label of the orientation for all pages. May be 'portait' or 'landscape'
 * @param {DOMDocument} doc The document given by editor.getDoc() of the tinymce API
 *
 * @example
 paginator = new Paginator('A4','portait', editor.getDoc())
 *
 * @see utils/page-formats
 */
function Paginator (pageFormatLabel, pageOrientation, ed) {
  /**
   * The current page
   * @property {Page}
   */
  this._currentPage = null

  /**
   * The list of pages
   * @property {Array}
   */
  this._pages = []

  /**
   * Current editor
   * @property {Editor}
   */
  this._editor = ed

  /**
   * The DOMDocument given in the constructor
   * @property {DOMDocument}
   * @private
   */
  this._document = ed.getDoc()
  /**
   * The Display to manage screen and dimensions
   * @property {Display}
   * @private
   */
  this._display = new Display(this._document)
  /**
   * The default abstract page from all real pages inherits
   * @property {Page}
   * @private
   */
  this._defaultPage = new Page(pageFormatLabel, pageOrientation)
  /**
   * The body element of the full document
   * @property {Element}
   * @private
   */
  this._body = this._document.getElementsByTagName('body')
}

Paginator.prototype.destroy = function () {
  this._pages = null
  this._currentPage = null
  this._editor = null
  this._document = null
  this._display = null
  this._defaultPage = null
  this._body = null
}

/**
 * Set of the two constant values representing the `origin` or the `end` of possible ranges to focus when focusing/navigating to a page.
 * @type {object}
 * @property {string} ORIGIN equals 'ORIGIN'
 * @property {string} END equals 'END'
 */
Paginator.prototype.CURSOR_POSITION = { ORIGIN: 'ORIGIN', END: 'END' }

/**
 * Initialize the paginator. The editor and its content has to be loaded before initialize the paginator
 * @method
 * @return void
 */
Paginator.prototype.init = function () {
  function findPageWrappers () {
    return $('div[data-paginator-page-rank]', that._body)
  }
  var that = this

  // search the paginator page wrappers
  var wrappedPages = findPageWrappers()
  var wrapper = _createEmptyDivWrapper.call(this, 1)

  // wrap unwrapped content
  if (!wrappedPages.length) {
    $(this._body).wrapInner(wrapper)
    this._editor.save()
    wrappedPages = findPageWrappers()
  }

  this._pages = []
  $.each(wrappedPages, function (i, el) {
    that._pages.push(new Page(that._defaultPage.format().label, that._defaultPage.orientation, i + 1, el))
  })
}

/**
 * Get the current page
 * @method
 * @return {Page} the current page loaded in editor
 */
Paginator.prototype.getCurrentPage = function () {
  return this._currentPage
}

/**
 * Get the page with the given rank
 * @method
 * @param {Number} rank The requested page rank
 * @return {Page} The requested page
 * @throws {Error}
 * @throws {InvalidPageRankError}
 */
Paginator.prototype.getPage = function (rank) {
  try {
    rank = Number(rank)
  } catch (err) {
    throw new InvalidPageRankError(rank)
  }
  if (!this._pages.length) throw new Error("Paginator pages length in null. Can't iterate on it.")

  var ret
  var isLower = rank - 1 < 0
  var isGreater = rank - 1 > this._pages.length

  if (isLower || isGreater) throw new InvalidPageRankError(rank)
  else {
    $.each(this._pages, function (i, page) {
      if (page.rank === rank) ret = page
    })
    return ret
  }
}

/**
 * Get all pages in paginator
 * @method
 * @return {Array<Page>} all paginator pages
 */
Paginator.prototype.getPages = function () {
  return this._pages
}

/**
 * Return the previous page
 * @method
 * @return {Page} The previous page
 */
Paginator.prototype.getPrevious = function () {
  try {
    return this.getPage(this.getCurrentPage().rank - 1)
  } catch (err) {
    return null
  }
}

/**
 * Get the next page
 * @method
 * @return {Page} The next page
 */
Paginator.prototype.getNext = function () {
  try {
    return this.getPage(this.getCurrentPage().rank + 1)
  } catch (err) {
    return null
  }
}

/**
 * Navigate to the given page
 * @method
 * @param {Page} toPage - The page to navigate to
 * @param {string} [cursorPosition] - The requested cursor  position to set after navigating to
 * @return void
 */
Paginator.prototype.gotoPage = function (toPage, cursorPosition) {
  var that = this
  var toPageContent = this.getPage(toPage.rank).content()
  var fromPage = this._currentPage
  var fromPageContent
  if (fromPage) {
    fromPageContent = this.getPage(fromPage.rank).content()
  }

  if (!toPage) throw new Error('Cant navigate to undefined page')

  if (toPage !== fromPage) {
    $.each(this.getPages(), function (i, page) {
      if (page.rank === toPage.rank) {
        $(toPageContent).css({ display: 'block' })
      } else if (fromPage && page.rank === fromPage.rank) {
        $(fromPageContent).css({ display: 'none' })
      } else {
        $(that.getPage(page.rank).content()).css({ display: 'none' })
      }
    })

    // cursorPosition may be a DOM Element, `ORIGIN`, `END` or undefined
    if (typeof (cursorPosition) === 'object') {
      console.info('focus to node', cursorPosition)
      focusToNode(cursorPosition)
    } else if (cursorPosition === this.CURSOR_POSITION.ORIGIN) {
      console.info('focus to top')
      focusToTop(toPage, that._editor)
    } else if (cursorPosition === this.CURSOR_POSITION.END) {
      console.info('focus to bottom')
      focusToBottom(toPage, that._editor)
    } else if (cursorPosition !== undefined) {
      console.error('InvalidCursorPosition')
      throw new InvalidCursorPosition(cursorPosition)
    } else {
      console.error('no valid cursor position')
      console.log(cursorPosition)
    }

    this._editor.focus()

    // set the page as current page
    this._currentPage = toPage

    this._editor.dom.fire(this._editor.getDoc(), 'PageChange', {
      fromPage: fromPage,
      toPage: toPage,
      timestamp: new Date().getTime()
    })
  }
}

/**
 * Go to the page having the focus
 * @method
 * @return void
 */
Paginator.prototype.gotoFocusedPage = function () {
  var focusedPage, focusedDiv

  try {
    var pageRank
    focusedDiv = _getFocusedPageDiv.call(this)
    pageRank = $(focusedDiv).attr('data-paginator-page-rank')
    focusedPage = this.getPage(pageRank)
  } catch (e) {
    // if there is no focused page div, focus to the first page
    focusedPage = this.getPage(1)
    focusedDiv = focusedPage.content()
    this._editor.selection.select(focusedDiv, true)
  } finally {
    this.gotoPage(focusedPage, this.CURSOR_POSITION.END)
  }
}

/**
 * Navigate to the previous page
 * @method
 * @param {string} [cursorPosition] - The requested cursor  position to set after navigating to
 * @return {Page|null} The previous page after navigation is done, null if previous page doesn'nt exist.
 */
Paginator.prototype.gotoPrevious = function (cursorPosition) {
  var prevPage = this.getPrevious()
  cursorPosition = cursorPosition || this.CURSOR_POSITION.END
  return (prevPage) ? this.gotoPage(prevPage, cursorPosition) : null
}

/**
 * Navigate to the next page
 * @method
 * @param {string} [cursorPosition] - The requested cursor  position to set after navigating to
 * @return {Page|null} The next page after navigation is done, null if next page doesn'nt exist.
 */
Paginator.prototype.gotoNext = function (cursorPosition) {
  var nextPage = this.getNext()
  cursorPosition = cursorPosition || this.CURSOR_POSITION.END
  return (nextPage) ? this.gotoPage(nextPage, cursorPosition) : null
}

/**
 * Watch the current page, to check if content overflows the page's max-height.
 * @method
 * @return void
 * @throws {InvalidPageHeightError} if `currentHeight` fall down to zero meaning the link with DOM element is broken
 */
Paginator.prototype.watchPage = function () {
  var maxHeight
  var currentHeight
  var iteratee = -1 // pass to zero during the first loop
  var cursorPositionAfterRepaging
  var lastBlock, savedLastBlock

  // check if the current page is overflown by its content
  // if true, repage the content
  do {
    if (lastBlock) savedLastBlock = lastBlock
    iteratee++; lastBlock = null

    maxHeight = _getPageInnerHeight.call(this)
    currentHeight = this.getCurrentPage().getContentHeight()

    if (currentHeight === 0) throw new InvalidPageHeightError(currentHeight)

    if (currentHeight > maxHeight) {
      lastBlock = _repage.call(this)
    }
  } while (lastBlock)

  // if more than one loop ocured, there was be repaging.
  if (iteratee) {
    // pass the saved lastblock to the gotoNext() method for focusing on it after page change.
    this.gotoNext(savedLastBlock)
  }
}

/**
 * Move the overflowing content from the current page, to the next page.
 * Must be called when the page's content overflows.
 * @method
 * @private
 * @returns {boolean} True if success to move last block to the next page.
 *
 * @todo If it overflows, put the content that overflows in the next page, then, check if
 * the text on the next page can fill the current one without overflowing.
 */
function _repage () {
  console.info('repaging...')

  var currentRng = this._editor.selection.getRng()
  var children = $(this._currentPage.content()).children()
  var lastBlock = children[children.length - 1]
  var nextPage = this.getNext() || _createNextPage.call(this)

  switch (lastBlock.nodeName) {
    case 'DIV':
    case 'P':
      // Prepend element to page
      $(lastBlock).prependTo($(nextPage.content()))
      // Append page to document
      $(nextPage.content()).appendTo(this._body)

      break

    default:
      window.alert("Une erreur est survenue dans le plugin de pagination. Merci de visionner l'erreur dans la console et de déclarer cette erreur au support «support@sirap.fr»")
      throw new Error('Unsupported block type for repaging: ' + lastBlock.nodeName)

  }

  return lastBlock
}

/**
 * Get the current computed padding
 * @method
 * @private
 * @return {object}
 */
function _getDocPadding () {
  var that = this
  return {
    top: $(that._body).css('padding-top'),
    right: $(that._body).css('padding-right'),
    bottom: $(that._body).css('padding-bottom'),
    left: $(that._body).css('padding-left')
  }
}

/**
 * Compute the page inner height in pixels. It must maches the height of the `div[data-paginator]` block.
 * @method
 * @private
 * @return {Number} The resulted height in pixels.
 */
function _getPageInnerHeight () {
  var outerHeight = Number(this._display.mm2px(this._defaultPage.height))
  var docPadding = _getDocPadding.call(this)
  var paddingTop = Number(docPadding.top.split('px').join(''))
  var paddingBottom = Number(docPadding.bottom.split('px').join(''))

  var innerHeight = outerHeight - paddingTop - paddingBottom

  return Math.ceil(innerHeight - 1) // -1 is the dirty fix mentionned in the todo tag
}

/**
 * Create an empty HTML div element to wrap the futur content to fill a new page.
 * @method
 * @private
 * @param {number} pageRank The page rank to put in the attribute `data-paginator-page-rank`.
 * @returns {HTMLDivElement} The ready to fill div element.
 *
 * @todo Replace inline CSS style rules by adding an inner page CSS class. This CSS class has to be created and versionned carefully.
 */
function _createEmptyDivWrapper (pageRank) {
  var that = this
  return $('<div>').attr({
    'data-paginator': true,
    'data-paginator-page-rank': pageRank
  }).css({
    'page-break-after': 'always',
    'min-height': _getPageInnerHeight.call(that),
    'background': 'linear-gradient(#FFF0F5,#FFFACD)' // @TODO remove for production
  })
}

/**
 * Create the next page with or without a content to put in, and append it to the paginator available pages.
 * @method
 * @private
 * @param {NodeList} contentNodeList The optional node list to put in the new next page.
 * @returns {Page} The just created page
 */
function _createNextPage (contentNodeList) {
  var newPage
  var nextRank = (this._currentPage) ? (this._currentPage.rank + 1) : 1
  var divWrapper = _createEmptyDivWrapper.call(this, nextRank)
  if (contentNodeList) {
    $(contentNodeList).appendTo(divWrapper)
  }
  newPage = new Page(this._defaultPage.format().label, this._defaultPage.orientation, nextRank, divWrapper[0])
  this._pages.push(newPage)
  return newPage
}

/**
 * Get all text nodes from a given node
 * @function
 * @inner
 * @param {Node} node The parent, given node
 * @param {number} nodeType The number matching the searched node type
 * @param {array} result The result passed for recursive iteration
 */
function getTextNodes (node, nodeType, result) {
  var children = node.childNodes
  nodeType = nodeType ? nodeType : 3
  result = !result ? [] : result
  if (node.nodeType === nodeType) {
    result.push(node)
  }
  if (children) {
    for (var i = 0; i < children.length; i++) {
      result = getTextNodes(children[i], nodeType, result)
    }
  }
  return result
}

/**
 * Set cursor location to the bottom of the destination page
 * @function
 * @inner
 * @param {Page} page The page instance to focus on top
 * @param {Editor} editor The current editor instance
 * @return void
 */
function focusToTop (page, editor) {
  var content, firstNode
  content = page.content()
  firstNode = content.firstChild
  // set Cursor to last position
  editor.selection.setCursorLocation(firstNode, 0)
}

/**
 * Focus to the specified node
 * @function
 * @private
 * @param {DOMElement} node The node to focus on
 * @param {Editor} editor The current editor
 */
function focusToNode (node, editor) {
  editor.selection.setCursorLocation(node, 0)
}

/**
 * Set cursor location to the bottom of the destination page
 * @function
 * @inner
 * @param {Page} page The page to focus on
 * @param {Editor} editor The current editor
 * @return void
 */
function focusToBottom (page, editor) {
  // get all Textnodes from lastchild, calc length
  var content, lastChild, textNodes, lastNode, locationOffset
  content = page.content()
  if (content.length) {
    lastChild = content[0].lastChild
  } else {
    lastChild = content.lastChild
  }
  if (lastChild) {
    textNodes = getTextNodes(lastChild)
    if (textNodes.length) {
      lastNode = textNodes[textNodes.length - 1]
      locationOffset = lastNode.textContent.length
    } else {
      lastNode = lastChild
      locationOffset = 0
    }
  } else {
    lastNode = content
    locationOffset = 0
  }
  // set Cursor to last position
  editor.selection.setCursorLocation(lastNode, locationOffset)
}

/**
 * Get the currently focused page div
 * @method
 * @private
 * @return {Element} The parent div element having an attribute data-paginator
 * @throws InvalidFocusedRangeError
 */
function _getFocusedPageDiv () {
  var ret, selectedElement, parents
  var currentRng = this._editor.selection.getRng()

  selectedElement = currentRng.startContainer
  parents = $(selectedElement).closest('div[data-paginator="true"]')
  if (!parents.length) {
    throw new InvalidFocusedRangeError()
  } else {
    ret = parents[0]
  }

  return ret
}

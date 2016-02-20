/**
 * page-formats module
 * @module utils/page-formats
 * @type array<Format>
 * @description When required, this module exports an array of formats supported by the application
 */

'use strict';

/**
 * Define a page format
 * @constructor
 * @param {string} label The format's label
 * @param {number} long The format's long dimension in milimeters
 * @param {number} short The format's short dimension in milimeters
 */
function Format(label,long,short){
  this.label = label;
  this.long = long;
  this.short = short;
}

/**
 * Register the only formats supported now by the application
 * @var supportedFormats
 * @global
 *
 * @todo this should be a plugin parameter defined in the setup function of the editor
 */
var supportedFormats = {
  'A4': {
    long: '297',
    short: '210'
  }
};

var exp = [];
$.each(supportedFormats,function(label,format){
  exp[label] = new Format(label, format.long, format.short);
});


module.exports = exp;

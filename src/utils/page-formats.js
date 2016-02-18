/**
 * page-formats module
 * @module utils/page-formats
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

/**
 * @exports each supported format as instances of Format
 */
$.each(supportedFormats,function(label,format){
  exports[label] = new Format(label, format.long, format.short);
});

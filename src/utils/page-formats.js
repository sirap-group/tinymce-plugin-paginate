'use strict';

function Format(label,long,short){
  this.label = label;
  this.long = long;
  this.short = short;
}

var supportedFormats = {
  'A4': {
    long: '297',
    short: '210'
  }
};

$.each(supportedFormats,function(label,format){
  exports[label] = new Format(label, format.long, format.short);
});

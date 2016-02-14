'use strict';

/**
 * @function document Parse a full content document
 * @return {Object}
 * - htmlHead {String}
 * - htmlBody {String}
 * - bodyTagAttrs {Object}
 */
exports.document = function(domDocument,stringDocument){
  var htmlHead, htmlBody, bodyTagAttrs;

  // console.log(doc);
  // console.log($(doc));

  // console.log(domDocument,stringDocument);

  var body = domDocument.getElementsByTagName('body')[0];


  // search paginator wrapper
  var wrappedPages = $('div[data-paginator-page-rank]',body);

  if (wrappedPages.length) {
  } else {
    // wrap unwrapped content
    $(body).wrapInner('<div data-paginator-page-rank="1"></div>');
  }

  console.log('wrappedPages',wrappedPages);


  // console.info('before');
  // console.log(body.childNodes);
  //
  // $.each(body.childNodes, function(i,el){
  //   console.log('try to remove child',el);
  //   try {
  //     body.removeChild(el);
  //
  //   } catch (e) {
  //     console.log('failed to remove element');
  //   }
  // });
  //
  // console.info('after');
  // console.log(body.childNodes);

  // var parsed = $(doc);
  // var trimed = [];
  // $.each(parsed,function(i,el){
  //   if (el.nodeName !== '#text') trimed.push(el);
  // });
  // console.log(trimed);

  // var htmlHead =
  // var htmlBody = $('body',$(doc));

  return {
    htmlHead: htmlHead,
    htmlBody: htmlBody,
    bodyTagAttrs: bodyTagAttrs
  };
};

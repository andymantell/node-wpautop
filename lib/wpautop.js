/**
 * JavaScript port of wpautop
 * @see: http://develop.svn.wordpress.org/trunk/src/wp-includes/formatting.php
 */
var phpjs = require('phpjs');

/**
 * Newline preservation help function for wpautop
 *
 * @since 3.1.0
 * @access private
 *
 * @param array $matches preg_replace_callback matches array
 * @return string
 */
function _autop_newline_preservation_helper( matches ) {
  return phpjs.str_replace("\n", "<WPPreserveNewline />", matches[0]);
}

/**
 * Replaces double line-breaks with paragraph elements.
 *
 * A group of regex replaces used to identify text formatted with newlines and
 * replace double line-breaks with HTML paragraph tags. The remaining
 * line-breaks after conversion become <<br />> tags, unless $br is set to '0'
 * or 'false'.
 *
 * @since 0.71
 *
 * @param string pee The text which has to be formatted.
 * @param bool br Optional. If set, this will convert all remaining line-breaks after paragraphing. Default true.
 * @return string Text which has been converted into correct paragraph tags.
 */
function wpautop(pee, br) {

  if(typeof(br) === 'undefined') {
    br = true;
  }

  var pre_tags = [];
  if ( phpjs.trim(pee) === '' ) {
    return '';
  }

  pee = pee + "\n"; // just to make things a little easier, pad the end
  if ( phpjs.strpos(pee, '<pre') !== false ) {
    var pee_parts = phpjs.explode( '</pre>', pee );
    var last_pee = phpjs.array_pop(pee_parts);
    pee = '';
    pee_parts.forEach(function(pee_part, index) {
      var start = phpjs.strpos(pee_part, '<pre');

      // Malformed html?
      if ( start === false ) {
        pee += pee_part;
        return;
      }

      var name = "<pre wp-pre-tag-" + index + "></pre>";
      pre_tags[name] = phpjs.substr( pee_part, start ) + '</pre>';
      pee = phpjs.substr( pee_part, 0, start ) + name;

    });
    pee += last_pee;
  }

  pee = pee.replace(new RegExp('<br />\s*<br />'), "\n\n");

  // Space things out a little
  var allblocks = '(?:table|thead|tfoot|caption|col|colgroup|tbody|tr|td|th|div|dl|dd|dt|ul|ol|li|pre|form|map|area|blockquote|address|math|style|p|h[1-6]|hr|fieldset|legend|section|article|aside|hgroup|header|footer|nav|figure|figcaption|details|menu|summary)';
  pee = pee.replace(new RegExp('(<' + allblocks + '[^>]*>)', 'gmi'), "\n$1");
  pee = pee.replace(new RegExp('(</' + allblocks + '>)', 'gmi'), "$1\n\n");
  pee = phpjs.str_replace(["\r\n", "\r"], "\n", pee); // cross-platform newlines

  if ( phpjs.strpos( pee, '<option' ) !== false ) {
    // no P/BR around option
    pee = pee.replace( new RegExp('\s*<option', 'gmi'), '<option');
    pee = pee.replace( new RegExp('</option>\s*', 'gmi'), '</option>');
  }

  if ( phpjs.strpos( pee, '</object>' ) !== false ) {
    // no P/BR around param and embed
    pee = pee.replace( new RegExp('(<object[^>]*>)\s*', 'gmi'), '$1');
    pee = pee.replace( new RegExp('\s*</object>', 'gmi'), '</object>' );
    pee = pee.replace( new RegExp('\s*(</?(?:param|embed)[^>]*>)\s*', 'gmi'), '$1');
  }

  if ( phpjs.strpos( pee, '<source' ) !== false || phpjs.strpos( pee, '<track' ) !== false ) {
    // no P/BR around source and track
    pee = pee.replace( new RegExp('([<\[](?:audio|video)[^>\]]*[>\]])\s*', 'gmi'), '$1');
    pee = pee.replace( new RegExp('\s*([<\[]/(?:audio|video)[>\]])', 'gmi'), '$1');
    pee = pee.replace( new RegExp('\s*(<(?:source|track)[^>]*>)\s*', 'gmi'), '$1');
  }

  pee = pee.replace(new RegExp("\n\n+", 'gmi'), "\n\n"); // take care of duplicates

  // make paragraphs, including one at the end
  var pees = pee.split(new RegExp('\n\s*\n'));
  pee = '';
  pees.forEach(function(tinkle) {
    pee += '<p>' + phpjs.trim(tinkle, "\n") + "</p>\n";
  });

  pee = pee.replace(new RegExp('<p>\s*</p>', 'gmi'), ''); // under certain strange conditions it could create a P of entirely whitespace
  pee = pee.replace(new RegExp('<p>([^<]+)</(div|address|form)>', 'gmi'), "<p>$1</p></$2>");
  pee = pee.replace(new RegExp('<p>\s*(</?' + allblocks + '[^>]*>)\s*</p>', 'gmi'), "$1", pee); // don't pee all over a tag
  pee = pee.replace(new RegExp("<p>(<li.+?)</p>", 'gmi'), "$1"); // problem with nested lists
  pee = pee.replace(new RegExp('<p><blockquote([^>]*)>', 'gmi'), "<blockquote$1><p>");
  pee = pee.replace(new RegExp('</blockquote></p>', 'gmi'), '</p></blockquote>');
  pee = pee.replace(new RegExp('<p>\s*(</?' + allblocks + '[^>]*>)', 'gmi'), "$1");
  pee = pee.replace(new RegExp('(</?' + allblocks + '[^>]*>)\s*</p>', 'gmi'), "$1");

  if ( br ) {
    pee = pee.replace(new RegExp('/<(script|style).*?<\/\\1>/s', 'gmi'), _autop_newline_preservation_helper);
    pee = pee.replace(/(<br \/>)?\s*\n/gmi, "<br />\n"); // optionally make line breaks
    pee = phpjs.str_replace('<WPPreserveNewline />', "\n", pee);
  }

  pee = pee.replace(new RegExp('(</?' + allblocks + '[^>]*>)\s*<br />', 'gmi'), "$1");
  pee = pee.replace(new RegExp('<br />(\s*</?(?:p|li|div|dl|dd|dt|th|pre|td|ul|ol)[^>]*>)', 'gmi'), '$1');
  pee = pee.replace(new RegExp("\n</p>$", 'gmi'), '</p>');

  if ( !phpjs.empty(pre_tags)) {
    pee = phpjs.str_replace(phpjs.array_keys(pre_tags), phpjs.array_values(pre_tags), pee);
  }

  return pee;
}

module.exports = wpautop;

var should = require('should');
var fs = require('fs');
var path = require('path');
var phpjs = require('phpjs');

var wpautop = require('../lib/wpautop');

var fixtures = path.join(__dirname, 'fixtures');

describe('wpautop', function() {
  //From ticket https://core.trac.wordpress.org/ticket/11008
  it('should process the "first post" correctly', function() {
    var input = fs.readFileSync(path.resolve(fixtures, 'first-post-input.txt'), {encoding: 'UTF-8'});
    var expected = fs.readFileSync(path.resolve(fixtures, 'first-post-expected.txt'), {encoding: 'UTF-8'});
    wpautop(input).should.be.eql(expected);
  });

  it('should treat block level HTML elements as blocks', function() {
    var blocks = [
      'table',
      'thead',
      'tfoot',
      'caption',
      'col',
      'colgroup',
      'tbody',
      'tr',
      'td',
      'th',
      'div',
      'dl',
      'dd',
      'dt',
      'ul',
      'ol',
      'li',
      'pre',
      'form',
      'map',
      'area',
      'address',
      'math',
      'style',
      'p',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'hr',
      'fieldset',
      'legend',
      'section',
      'article',
      'aside',
      'hgroup',
      'header',
      'footer',
      'nav',
      'figure',
      'details',
      'menu',
      'summary'
    ];

    content = [];

    blocks.forEach(function(block) {
      content.push('<' + block + '>foo</' + block + '>');
    })

    var expected = content.join("\n");
    content = content.join("\n\n"); // WS difference

    phpjs.trim(wpautop(content)).should.be.eql(expected);
  });

  it('should treat inline HTML elements as inline', function() {
    var inlines = [
      'a',
      'em',
      'strong',
      'small',
      's',
      'cite',
      'q',
      'dfn',
      'abbr',
      'data',
      'time',
      'code',
      'var',
      'samp',
      'kbd',
      'sub',
      'sup',
      'i',
      'b',
      'u',
      'mark',
      'span',
      'del',
      'ins',
      'noscript',
      'select',
    ];

    var content = [];
    var expected = [];

    inlines.forEach(function(inline) {
      content.push('<' + inline + '>foo</' + inline + '>');
      expected.push('<p><' + inline + '>foo</' + inline + '></p>');
    });

    content = content.join("\n\n");
    expected = expected.join("\n");

    phpjs.trim(wpautop(content)).should.be.eql(expected);
  });

  it('should not alter the contents of "<pre>" elements', function() {
    var str, expected;

    var code = fs.readFileSync(path.resolve(fixtures, 'sizzle.js'), {encoding: 'UTF-8'});
    code = code.replace( "\r", '', code );
    code = phpjs.htmlentities(code);

    // Not wrapped in <p> tags
    str = '<pre>' + code + '</pre>';
    phpjs.trim(wpautop(str)).should.be.eql(str);

    // Text before/after is wrapped in <p> tags
    str = 'Look at this code\n\n<pre>' + code + '</pre>\n\nIsn\'t that cool?';

    // Expected text after wpautop
    expected = '<p>Look at this code</p>' + "\n<pre>" + code + "</pre>\n" + '<p>Isn\'t that cool?</p>';
    phpjs.trim(wpautop(str)).should.be.eql(expected);

    // Make sure HTML breaks are maintained if manually inserted
    str = "Look at this code\n\n<pre>Line1<br />Line2<br>Line3<br/>Line4\nActual Line 2\nActual Line 3</pre>\n\nCool, huh?";
    expected = "<p>Look at this code</p>\n<pre>Line1<br />Line2<br>Line3<br/>Line4\nActual Line 2\nActual Line 3</pre>\n<p>Cool, huh?</p>";
    phpjs.trim(wpautop(str)).should.be.eql(expected);

  });

  it('should not add <br/> to "<input>" elements', function() {
    var str = 'Username: <input type="text" id="username" name="username" /><br />Password: <input type="password" id="password1" name="password1" />';
    phpjs.trim(wpautop(str)).should.eql('<p>' + str + '</p>');
  });

  it('should not add <p> and <br/> around <source> and <track>', function() {

    var content = "Paragraph one.\n\n" +
      '<video class="wp-video-shortcode" id="video-0-1" width="640" height="360" preload="metadata" controls="controls">' +
      '\n<source type="video/mp4" src="http://domain.tld/wp-content/uploads/2013/12/xyz.mp4" />' +
      '\n<!-- WebM/VP8 for Firefox4, Opera, and Chrome -->' +
      '\n<source type="video/webm" src="myvideo.webm" />' +
      '\n<!-- Ogg/Vorbis for older Firefox and Opera versions -->' +
      '\n<source type="video/ogg" src="myvideo.ogv" />' +
      '\n<!-- Optional: Add subtitles for each language -->' +
      '\n<track kind="subtitles" src="subtitles.srt" srclang="en" />' +
      '\n<!-- Optional: Add chapters -->' +
      '\n<track kind="chapters" src="chapters.srt" srclang="en" />' +
      '\n<a href="http://domain.tld/wp-content/uploads/2013/12/xyz.mp4">http://domain.tld/wp-content/uploads/2013/12/xyz.mp4</a>' +
      '\n</video>' +
      "\n\nParagraph two.";

    var content2 = "Paragraph one.\n\n" +
      '<video class="wp-video-shortcode" id="video-0-1" width="640" height="360" preload="metadata" controls="controls">' +
      '\n' +
      '\n<source type="video/mp4" src="http://domain.tld/wp-content/uploads/2013/12/xyz.mp4" />' +
      '\n' +
      '\n<!-- WebM/VP8 for Firefox4, Opera, and Chrome -->' +
      '\n<source type="video/webm" src="myvideo.webm" />' +
      '\n' +
      '\n<!-- Ogg/Vorbis for older Firefox and Opera versions -->' +
      '\n<source type="video/ogg" src="myvideo.ogv" />' +
      '\n' +
      '\n<!-- Optional: Add subtitles for each language -->' +
      '\n<track kind="subtitles" src="subtitles.srt" srclang="en" />' +
      '\n' +
      '\n<!-- Optional: Add chapters -->' +
      '\n<track kind="chapters" src="chapters.srt" srclang="en" />' +
      '\n' +
      '\n<a href="http://domain.tld/wp-content/uploads/2013/12/xyz.mp4">http://domain.tld/wp-content/uploads/2013/12/xyz.mp4</a>' +
      '\n' +
      '\n</video>'  +
      "\n\nParagraph two.";

    var expected = "<p>Paragraph one.</p>\n" + // line breaks only after <p>
      '<p><video class="wp-video-shortcode" id="video-0-1" width="640" height="360" preload="metadata" controls="controls">' +
      '<source type="video/mp4" src="http://domain.tld/wp-content/uploads/2013/12/xyz.mp4" />' +
      '<!-- WebM/VP8 for Firefox4, Opera, and Chrome -->' +
      '<source type="video/webm" src="myvideo.webm" />' +
      '<!-- Ogg/Vorbis for older Firefox and Opera versions -->' +
      '<source type="video/ogg" src="myvideo.ogv" />' +
      '<!-- Optional: Add subtitles for each language -->' +
      '<track kind="subtitles" src="subtitles.srt" srclang="en" />' +
      '<!-- Optional: Add chapters -->' +
      '<track kind="chapters" src="chapters.srt" srclang="en" />' +
      '<a href="http://domain.tld/wp-content/uploads/2013/12/xyz.mp4">' +
      "http://domain.tld/wp-content/uploads/2013/12/xyz.mp4</a></video></p>\n" +
      '<p>Paragraph two.</p>';

    // When running the content through wpautop() from wp_richedit_pre()
    var shortcode_content = "Paragraph one.\n\n"  +
      '\n[video width="720" height="480" mp4="http://domain.tld/wp-content/uploads/2013/12/xyz.mp4"]' +
      '\n<!-- WebM/VP8 for Firefox4, Opera, and Chrome -->' +
      '\n<source type="video/webm" src="myvideo.webm" />' +
      '\n<!-- Ogg/Vorbis for older Firefox and Opera versions -->' +
      '\n<source type="video/ogg" src="myvideo.ogv" />' +
      '\n<!-- Optional: Add subtitles for each language -->' +
      '\n<track kind="subtitles" src="subtitles.srt" srclang="en" />' +
      '\n<!-- Optional: Add chapters -->' +
      '\n<track kind="chapters" src="chapters.srt" srclang="en" />' +
      '\n[/video]' +
      "\n\nParagraph two.";

    var shortcode_expected = "<p>Paragraph one.</p>\n" + // line breaks only after <p>
      '<p>[video width="720" height="480" mp4="http://domain.tld/wp-content/uploads/2013/12/xyz.mp4"]' +
      '<!-- WebM/VP8 for Firefox4, Opera, and Chrome --><source type="video/webm" src="myvideo.webm" />' +
      '<!-- Ogg/Vorbis for older Firefox and Opera versions --><source type="video/ogg" src="myvideo.ogv" />' +
      '<!-- Optional: Add subtitles for each language --><track kind="subtitles" src="subtitles.srt" srclang="en" />' +
      '<!-- Optional: Add chapters --><track kind="chapters" src="chapters.srt" srclang="en" />' +
      "[/video]</p>\n" +
      '<p>Paragraph two.</p>';

    phpjs.trim(wpautop(content)).should.be.eql(expected);
    phpjs.trim(wpautop(content2)).should.be.eql(expected);
    phpjs.trim(wpautop(shortcode_content)).should.be.eql(shortcode_expected);

  });

  it('should not add <p> and <br/> around <param> and <embed>', function() {

    var content1 = '\nParagraph one.' +
      '\n' +
      '\n<object width="400" height="224" classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0">' +
      '\n<param name="src" value="http://domain.tld/wp-content/uploads/2013/12/xyz.swf" />' +
      '\n<param name="allowfullscreen" value="true" />' +
      '\n<param name="allowscriptaccess" value="always" />' +
      '\n<param name="overstretch" value="true" />' +
      '\n<param name="flashvars" value="isDynamicSeeking=true" />' +
      '\n' +
      '\n<embed width="400" height="224" type="application/x-shockwave-flash" src="http://domain.tld/wp-content/uploads/2013/12/xyz.swf" wmode="direct" seamlesstabbing="true" allowfullscreen="true" overstretch="true" flashvars="isDynamicSeeking=true" />' +
      '\n</object>' +
      '\n' +
      '\nParagraph two.';

    var expected1 = "<p>Paragraph one.</p>\n" + // line breaks only after <p>
      '<p><object width="400" height="224" classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0">' +
      '<param name="src" value="http://domain.tld/wp-content/uploads/2013/12/xyz.swf" />' +
      '<param name="allowfullscreen" value="true" />' +
      '<param name="allowscriptaccess" value="always" />' +
      '<param name="overstretch" value="true" />' +
      '<param name="flashvars" value="isDynamicSeeking=true" />' +
      '<embed width="400" height="224" type="application/x-shockwave-flash" src="http://domain.tld/wp-content/uploads/2013/12/xyz.swf" wmode="direct" seamlesstabbing="true" allowfullscreen="true" overstretch="true" flashvars="isDynamicSeeking=true" />' +
      "</object></p>\n" +
      '<p>Paragraph two.</p>';

    var content2 = '\nParagraph one.' +
      '\n' +
      '\n<div class="video-player" id="x-video-0">' +
      '\n<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="640" height="360" id="video-0" standby="Standby text">' +
      '\n<param name="movie" value="http://domain.tld/wp-content/uploads/2013/12/xyz.swf" />' +
      '\n<param name="quality" value="best" />' +
      '\n' +
      '\n<param name="seamlesstabbing" value="true" />' +
      '\n<param name="allowfullscreen" value="true" />' +
      '\n<param name="allowscriptaccess" value="always" />' +
      '\n<param name="overstretch" value="true" />' +
      '\n' +
      '\n<!--[if !IE]--><object type="application/x-shockwave-flash" data="http://domain.tld/wp-content/uploads/2013/12/xyz.swf" width="640" height="360" standby="Standby text">' +
      '\n<param name="quality" value="best" />' +
      '\n' +
      '\n<param name="seamlesstabbing" value="true" />' +
      '\n<param name="allowfullscreen" value="true" />' +
      '\n<param name="allowscriptaccess" value="always" />' +
      '\n<param name="overstretch" value="true" />' +
      '\n</object><!--<![endif]-->' +
      '\n</object></div>' +
      '\n' +
      '\nParagraph two.';

    var expected2 = "<p>Paragraph one.</p>\n" + // line breaks only after block tags
      '<div class="video-player" id="x-video-0">' + "\n" +
      '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="640" height="360" id="video-0" standby="Standby text">' +
      '<param name="movie" value="http://domain.tld/wp-content/uploads/2013/12/xyz.swf" />' +
      '<param name="quality" value="best" />' +
      '<param name="seamlesstabbing" value="true" />' +
      '<param name="allowfullscreen" value="true" />' +
      '<param name="allowscriptaccess" value="always" />' +
      '<param name="overstretch" value="true" />' +
      '<!--[if !IE]--><object type="application/x-shockwave-flash" data="http://domain.tld/wp-content/uploads/2013/12/xyz.swf" width="640" height="360" standby="Standby text">' +
      '<param name="quality" value="best" />' +
      '<param name="seamlesstabbing" value="true" />' +
      '<param name="allowfullscreen" value="true" />' +
      '<param name="allowscriptaccess" value="always" />' +
      '<param name="overstretch" value="true" /></object><!--<![endif]-->' +
      "</object></div>\n" +
      '<p>Paragraph two.</p>';

    phpjs.trim(wpautop(content1)).should.be.eql(expected1);
    phpjs.trim(wpautop(content2)).should.be.eql(expected2);
  });

  it('should not add <br/> to "<select>" or "<option>" elements', function() {
    var str = 'Country: <select id="state" name="state"><option value="1">Alabama</option><option value="2">Alaska</option><option value="3">Arizona</option><option value="4">Arkansas</option><option value="5">California</option></select>';
    phpjs.trim(wpautop(str)).should.be.eql('<p>' + str + '</p>');
  });

  it('should autop a blockquotes contents but not the blockquote itself', function() {
    var content  = "<blockquote>foo</blockquote>";
    var expected = "<blockquote><p>foo</p></blockquote>";

    phpjs.trim(wpautop(content)).should.be.eql(expected);
  });

});

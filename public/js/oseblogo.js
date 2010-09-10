//Google statistics
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-1978426-3']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

function exec(funcName) {
  if (typeof funcName == 'string' &&
  eval('typeof ' + funcName) == 'function') {
    eval(funcName+'()');
  }
}

$(document).ready(function() {
  prettyPrint();
  exec('loadDecathlon2010'); //2010.08.21 MSG Decathlon
});
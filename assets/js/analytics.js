(function () {
  "use strict";

  var id = window.SITE_CONFIG && window.SITE_CONFIG.baiduAnalyticsId;
  if (!id) return;

  window._hmt = window._hmt || [];
  var script = document.createElement("script");
  script.async = true;
  script.src = "https://hm.baidu.com/hm.js?" + id;
  document.head.appendChild(script);
})();

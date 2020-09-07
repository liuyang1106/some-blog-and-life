(function flexible(window, document) {
  var docEl = document.documentElement;
  var tid;
  var dpr = window.devicePixelRatio || 1;
  docEl.setAttribute("data-dpr", dpr);

  function setRemUnit() {
      var width = docEl.getBoundingClientRect().width;
      if (width > 750) { // 设计稿的宽度是750px
          docEl.style.fontSize = 100 + 'px';
      }
      else {
          var rem = width / 7.5;
          docEl.style.fontSize = rem + 'px';
      }
  }

  setRemUnit();

  window.addEventListener('resize', function () {
      clearTimeout(tid);
      tid = setTimeout(setRemUnit, 200);
  }, false);
  window.addEventListener('pageshow', function (e) {
      if (e.persisted) {
          clearTimeout(tid);
          tid = setTimeout(setRemUnit, 200);
      }
  }, false);
}(window, document));

window.addEventListener("load", function () {
  setTimeout(function () {
      window.scrollTo(0, 0);
  }, 0);
}, false);
(function () {
  var v = 0;
  try { v = +localStorage.getItem('theme') || 0; } catch (e) {}
  if (!v) { var m = document.cookie.match(/(?:^|; )theme=(\d)/); if (m) v = +m[1]; }
  var bg = v ? '#000' : '#fff', fg = v ? '#fff' : '#000';
  var s = document.createElement('style');
  s.textContent = 'html,body,.layer{background:' + bg + ' !important;color:' + fg + ' !important}';
  document.head.appendChild(s);
})();

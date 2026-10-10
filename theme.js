(function () {
  var dark = 0;
  try { dark = +localStorage.getItem('theme') || 0; } catch (e) {}
  var r = document.documentElement;
  r.style.setProperty('--bg', dark ? '#000' : '#fff');
  r.style.setProperty('--fg', dark ? '#fff' : '#000');

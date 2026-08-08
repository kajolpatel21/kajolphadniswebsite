/* Cookie consent banner + Google Consent Mode v2 updates.
   The consent DEFAULT (denied until chosen) is set inline in each page's <head>
   before GTM/gtag load — this file only renders the banner and records choices. */
(function () {
  var KEY = 'kp_consent';
  var stored = null;
  try { stored = localStorage.getItem(KEY); } catch (e) {}
  if (stored === 'granted' || stored === 'denied') return; // choice already made

  var css = '.kp-consent{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:520px;margin:0 auto;background:#2c2333;color:#faf7f2;border-radius:18px;padding:22px 24px;box-shadow:0 18px 48px rgba(20,16,26,.45);font-family:Inter,system-ui,sans-serif}' +
    '.kp-consent p{margin:0 0 16px;font-size:.92rem;line-height:1.6;color:rgba(250,247,242,.85)}' +
    '.kp-consent strong{color:#fff}' +
    '.kp-consent-btns{display:flex;gap:10px;flex-wrap:wrap}' +
    '.kp-consent button{font:inherit;font-weight:700;font-size:.9rem;border-radius:100px;padding:11px 22px;cursor:pointer;border:none}' +
    '.kp-accept{background:#f59e0b;color:#2c2333}' +
    '.kp-accept:hover{background:#ffb02e}' +
    '.kp-decline{background:transparent;color:#faf7f2;border:1.5px solid rgba(250,247,242,.45)!important}' +
    '.kp-decline:hover{border-color:#faf7f2!important}' +
    '.kp-consent a{color:#f59e0b;font-weight:700;text-decoration:none}' +
    '.kp-consent a:hover{text-decoration:underline}' +
    '@media(max-width:480px){.kp-consent{left:10px;right:10px;bottom:10px;padding:18px}}';
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var box = document.createElement('div');
  box.className = 'kp-consent';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-label', 'Cookie consent');
  box.innerHTML =
    '<p><strong>A quick cookie question.</strong> I use Google Analytics to understand which pages and quizzes people find useful. No ads, no selling data — just analytics. Okay with that? <a href="/privacy">Privacy policy</a></p>' +
    '<div class="kp-consent-btns">' +
    '<button type="button" class="kp-accept">Accept analytics</button>' +
    '<button type="button" class="kp-decline">Essential only</button>' +
    '</div>';

  function choose(granted) {
    try { localStorage.setItem(KEY, granted ? 'granted' : 'denied'); } catch (e) {}
    if (granted && typeof gtag === 'function') {
      gtag('consent', 'update', { analytics_storage: 'granted' });
    }
    box.remove();
  }
  box.querySelector('.kp-accept').addEventListener('click', function () { choose(true); });
  box.querySelector('.kp-decline').addEventListener('click', function () { choose(false); });

  if (document.body) document.body.appendChild(box);
  else document.addEventListener('DOMContentLoaded', function () { document.body.appendChild(box); });
})();

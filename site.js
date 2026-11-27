/* Site-wide helpers, loaded on every page.
   - Records "book a call" (Calendly) and email-link clicks in GA4, so we can see
     which pages lead to bookings. GA4 only records them once a visitor accepts
     analytics (Consent Mode, see consent.js).
   - Runs the inline newsletter signup on articles (form.nl-form), posting to the
     same Kit form as the homepage newsletter. */
(function(){
  function ev(name,params){ if(window.gtag) gtag('event',name,params); }

  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href]'); if(!a) return;
    var href=a.getAttribute('href')||'';
    if(href.indexOf('calendly.com')>-1){
      ev('book_call_click',{link_url:href,link_text:(a.textContent||'').trim().slice(0,80),page_path:location.pathname});
    } else if(href.indexOf('mailto:')===0){
      ev('email_click',{page_path:location.pathname});
    }
  });

  var forms=document.querySelectorAll('form.nl-form');
  for(var i=0;i<forms.length;i++) (function(f){
    var box=f.parentNode, ok=box.querySelector('.nl-ok'), err=box.querySelector('.nl-err'), btn=f.querySelector('button');
    function fail(msg){ err.textContent=msg; err.hidden=false; btn.disabled=false; btn.textContent='Sign up free'; }
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var em=(f.email_address.value||'').trim(); err.hidden=true;
      if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)){ fail('Please enter a valid email address.'); return; }
      btn.disabled=true; btn.textContent='Signing you up…';
      var fd=new FormData(); fd.append('email_address',em); fd.append('fields[interest]','Newsletter');
      fetch('https://app.kit.com/forms/9677223/subscriptions',{method:'POST',headers:{'Accept':'application/json'},body:fd})
        .then(function(res){ return res.json().catch(function(){return{};}).then(function(d){return{res:res,data:d};}); })
        .then(function(r){
          // Kit answers 200 even when it rejects the address, so trust the payload
          if(!r.res.ok || (r.data && r.data.status==='failed')) throw new Error('failed');
          f.hidden=true; ok.hidden=false;
          ev('sign_up',{method:'article_newsletter',page_path:location.pathname});
        })
        .catch(function(){ fail('That didn’t work — please try again, or email hello@kajolphadnis.com.'); });
    });
  })(forms[i]);
})();

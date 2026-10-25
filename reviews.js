/* Review form for product pages and the toolkit product pop-up.

   The reviews themselves are plain HTML written by scripts/build_reviews.py from
   data/reviews.json, so crawlers that don't run JavaScript can still read them.
   This file only adds the form into each .rv-form-slot.

   Kept as short as possible: tap a star, then one box and a name. A link to
   /promotion-case-template?rating=5#write-review (e.g. from a buyer email)
   arrives with that rating already picked and the form open. */
(function(){
  var NAMES = { 'promotion-case-template': 'The Promotion Case Template' };
  var WEB3FORMS_KEY = '77fa2887-eee8-4052-803f-0d567a5c2568';
  var preset = (location.search.match(/[?&]rating=([1-5])\b/)||[])[1];

  function build(slot, key, uid){
    var name = NAMES[key]||key;
    slot.innerHTML =
      '<form class="rv-form" novalidate>'+
      '<fieldset class="rv-rate"><legend>Used it? Tap to rate</legend><span class="rv-stars-in">'+
      [5,4,3,2,1].map(function(n){ return '<input type="radio" name="rating" value="'+n+'" id="'+uid+'-r'+n+'"><label for="'+uid+'-r'+n+'"><span aria-hidden="true">★</span><span class="sr">'+n+' star'+(n>1?'s':'')+'</span></label>'; }).join('')+
      '</span></fieldset>'+
      '<div class="rv-more" hidden>'+
      '<label class="rv-f">What did it help you do?<textarea name="review" rows="3" placeholder="e.g. Used the summary format for my Manager case and got promoted"></textarea></label>'+
      '<label class="rv-f">Your name, as you\'d like it shown<input name="name" autocomplete="name" placeholder="e.g. Priya S., Consultant"></label>'+
      '<label class="rv-f">Email <span class="rv-opt">optional, kept private, gets you a "Verified buyer" badge</span><input type="email" name="email" autocomplete="email"></label>'+
      '<input type="checkbox" name="botcheck" class="rv-hp" tabindex="-1" autocomplete="off" aria-hidden="true">'+
      '<button class="btn btn-marigold" type="submit">Post review</button>'+
      '<p class="rv-note">By posting, you\'re happy for your review and name to appear on this site.</p>'+
      '</div><p class="rv-msg" role="status"></p></form>';

    var f=slot.querySelector('form'), more=f.querySelector('.rv-more'), msg=f.querySelector('.rv-msg');
    function reveal(){ if(more.hidden){ more.hidden=false; } }
    f.addEventListener('change',function(e){ if(e.target.name==='rating'){ reveal(); f.review.focus({preventScroll:true}); } });
    if(preset){ var r=f.querySelector('input[value="'+preset+'"]'); if(r){ r.checked=true; reveal(); } }

    f.addEventListener('submit',function(e){
      e.preventDefault();
      var rating=(f.querySelector('input[name=rating]:checked')||{}).value;
      var text=f.review.value.trim(), nm=f.name.value.trim(), em=f.email.value.trim();
      var err = !rating ? 'Tap a star first.' :
                text.length<5 ? 'Add a few words about how it went.' :
                !nm ? 'Add the name you\'d like shown.' :
                (em && em.indexOf('@')<1) ? 'That email doesn\'t look right (or leave it blank).' : '';
      if(err){ msg.className='rv-msg rv-bad'; msg.textContent=err; return; }
      if(f.botcheck.checked) return;
      var btn=f.querySelector('button'); btn.disabled=true; btn.textContent='Posting…'; msg.textContent='';
      var body={access_key:WEB3FORMS_KEY, subject:'New review ('+rating+'★): '+name, from_name:'Website reviews',
        Product:name, Rating:rating+' / 5', Review:text, 'Show as':nm, 'Buyer email':em||'not given', Page:location.pathname};
      if(em) body.email=em;
      fetch('https://api.web3forms.com/submit',{
        method:'POST', headers:{'Content-Type':'application/json','Accept':'application/json'}, body:JSON.stringify(body)
      }).then(function(r){return r.json();}).then(function(d){
        if(!d||!d.success) throw new Error('rejected');
        if(window.gtag) gtag('event','review_submitted',{item_id:key,rating:+rating});
        f.innerHTML='<p class="rv-msg rv-good">Thank you! Your review will appear here shortly.</p>';
      }).catch(function(){
        btn.disabled=false; btn.textContent='Post review';
        msg.className='rv-msg rv-bad';
        msg.innerHTML='That didn\'t send. Please email it to <a href="mailto:hello@kajolphadnis.com">hello@kajolphadnis.com</a> instead.';
      });
    });
  }

  function init(){
    var boxes=document.querySelectorAll('[data-reviews]');
    for(var i=0;i<boxes.length;i++){
      var slot=boxes[i].querySelector('.rv-form-slot');
      if(slot) build(slot, boxes[i].getAttribute('data-reviews'), 'rv'+i);
    }
    if(preset && location.hash==='#write-review'){
      var t=document.getElementById('write-review');
      if(t) setTimeout(function(){ t.scrollIntoView({block:'center'}); },50);
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();

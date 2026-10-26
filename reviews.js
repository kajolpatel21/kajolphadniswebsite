/* Review form for product pages and the toolkit product pop-up.

   The reviews themselves are plain HTML written by scripts/build_reviews.py from
   data/reviews.json, so crawlers that don't run JavaScript can still read them.
   This file only adds the form into each .rv-form-slot.

   Kept as short as possible: tap a star, then one box and a name. Quick-pick
   chips start the sentence for people. A link to /promotion-case-template?rating=5#write-review
   (e.g. from a buyer email) arrives with that rating already picked and the
   form open. */
(function(){
  var NAMES = { 'promotion-case-template': 'The Promotion Case Template' };
  var WEB3FORMS_KEY = '77fa2887-eee8-4052-803f-0d567a5c2568';
  var MOODS = ['', 'Not for me', 'Meh', 'Did the job', 'Really useful', 'Absolute game-changer'];
  var CHIPS = ['Got promoted', 'Built my case', 'Nailed my review', 'Asked for a raise', 'Felt more confident'];
  var GOOD_LEN = 60;
  var preset = (location.search.match(/[?&]rating=([1-5])\b/)||[])[1];

  function build(slot, key, uid){
    var name = NAMES[key]||key;
    slot.innerHTML =
      '<form class="rv-form" novalidate>'+
      '<fieldset class="rv-rate"><legend>Used it? Tap to rate</legend>'+
      '<div class="rv-rate-row"><span class="rv-stars-in">'+
      [5,4,3,2,1].map(function(n){ return '<input type="radio" name="rating" value="'+n+'" id="'+uid+'-r'+n+'"><label for="'+uid+'-r'+n+'" data-n="'+n+'"><span aria-hidden="true">★</span><span class="sr">'+n+' star'+(n>1?'s':'')+'</span></label>'; }).join('')+
      '</span><span class="rv-mood" aria-live="polite"></span></div></fieldset>'+
      '<div class="rv-more" hidden>'+
      '<div class="rv-f"><label for="'+uid+'-txt">What did it help you do?</label>'+
      '<div class="rv-chips" role="group" aria-label="Quick picks">'+
      CHIPS.map(function(c){ return '<button type="button" class="rv-chip" aria-pressed="false">'+c+'</button>'; }).join('')+
      '</div>'+
      '<textarea id="'+uid+'-txt" name="review" rows="3" placeholder="e.g. Used the summary format for my Manager case and got promoted"></textarea>'+
      '<span class="rv-count">A sentence or two is perfect</span></div>'+
      '<label class="rv-f rv-check">Your name, as you\'d like it shown<input name="name" autocomplete="name" placeholder="e.g. Priya S., Consultant"></label>'+
      '<input type="checkbox" name="botcheck" class="rv-hp" tabindex="-1" autocomplete="off" aria-hidden="true">'+
      '<button class="btn btn-marigold rv-submit" type="submit">Post review</button>'+
      '<p class="rv-note">By posting, you\'re happy for your review and name to appear on this site.</p>'+
      '</div><p class="rv-msg" role="status"></p></form>';

    var f=slot.querySelector('form'), more=f.querySelector('.rv-more'), msg=f.querySelector('.rv-msg');
    var mood=f.querySelector('.rv-mood'), count=f.querySelector('.rv-count'), btn=f.querySelector('.rv-submit');
    var chips=f.querySelectorAll('.rv-chip');

    function rating(){ return +((f.querySelector('input[name=rating]:checked')||{}).value||0); }
    function showMood(n){ mood.textContent=n?MOODS[n]:''; mood.className='rv-mood'+(n?' on':''); }
    function sentences(v){ return v.split(/[.!]\s*/).map(function(s){ return s.trim(); }).filter(Boolean); }

    function refresh(){
      var r=rating(), text=f.review.value.trim(), nm=f.name.value.trim();
      showMood(r);
      var len=text.length;
      count.textContent = !len ? 'A sentence or two is perfect' : len<GOOD_LEN ? 'Keep going, a bit more detail helps' : 'Perfect, that\'s really helpful';
      count.className='rv-count'+(len>=GOOD_LEN?' good':'');
      f.name.parentNode.classList.toggle('done', !!nm);
      var low=text.toLowerCase();
      for(var i=0;i<chips.length;i++) chips[i].setAttribute('aria-pressed', low.indexOf(chips[i].textContent.toLowerCase())>-1);
      if(!btn.disabled) btn.textContent = r ? 'Post my '+r+'★ review' : 'Post review';
      btn.classList.toggle('ready', !!(r && len>=5 && nm));
    }

    function replay(el, cls){ el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
    function reveal(){ if(more.hidden){ more.hidden=false; requestAnimationFrame(function(){ more.classList.add('in'); }); } }

    f.addEventListener('change',function(e){
      if(e.target.name!=='rating') return;
      var lab=f.querySelector('label[for="'+e.target.id+'"]');
      if(lab) replay(lab,'bounce');
      var first=more.hidden; reveal(); refresh();
      if(first) f.review.focus({preventScroll:true});
    });

    // Hovering a star previews its label; leaving goes back to the picked one.
    var row=f.querySelector('.rv-stars-in');
    row.addEventListener('mouseover',function(e){ var l=e.target.closest('label'); if(l) showMood(+l.getAttribute('data-n')); });
    row.addEventListener('mouseleave',function(){ showMood(rating()); });

    // A chip adds its phrase as a sentence; tapping it again takes it back out.
    for(var i=0;i<chips.length;i++) chips[i].addEventListener('click',function(){
      var t=this.textContent, parts=sentences(f.review.value);
      var kept=parts.filter(function(s){ return s.toLowerCase()!==t.toLowerCase(); });
      if(kept.length===parts.length) kept.push(t);
      f.review.value=kept.length ? kept.join('. ')+'. ' : '';
      f.review.focus(); refresh();
    });

    f.addEventListener('input',refresh);
    if(preset){ var r=f.querySelector('input[value="'+preset+'"]'); if(r){ r.checked=true; reveal(); } }
    refresh();

    f.addEventListener('submit',function(e){
      e.preventDefault();
      var rating=(f.querySelector('input[name=rating]:checked')||{}).value;
      var text=f.review.value.trim(), nm=f.name.value.trim();
      var err = !rating ? 'Tap a star first.' :
                text.length<5 ? 'Add a few words about how it went.' :
                !nm ? 'Add the name you\'d like shown.' : '';
      if(err){ msg.className='rv-msg rv-bad'; msg.textContent=err; replay(f,'rv-shake'); return; }
      if(f.botcheck.checked) return;
      btn.disabled=true; btn.textContent='Posting…'; msg.textContent='';
      var body={access_key:WEB3FORMS_KEY, subject:'New review ('+rating+'★): '+name, from_name:'Website reviews',
        Product:name, Rating:rating+' / 5', Review:text, 'Show as':nm,
        'Quick picks':Array.prototype.filter.call(chips,function(c){return c.getAttribute('aria-pressed')==='true';}).map(function(c){return c.textContent;}).join(', ')||'none chosen',
        Page:location.pathname};
      fetch('https://api.web3forms.com/submit',{
        method:'POST', headers:{'Content-Type':'application/json','Accept':'application/json'}, body:JSON.stringify(body)
      }).then(function(r){return r.json();}).then(function(d){
        if(!d||!d.success) throw new Error('rejected');
        if(window.gtag) gtag('event','review_submitted',{item_id:key,rating:+rating});
        f.innerHTML='<div class="rv-done" role="status"><div class="rv-burst" aria-hidden="true">'+
          '<i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><span>🧡</span></div>'+
          '<p class="rv-done-h"></p>'+
          '<p class="rv-done-p">That genuinely made my day. Your review will appear here shortly, and it\'ll help the next person decide.</p>'+
          '<p class="rv-done-sig">Kajol, your corporate aunty</p></div>';
        f.querySelector('.rv-done-h').textContent='Thank you, '+nm.split(/[\s,]/)[0]+'!';
      }).catch(function(){
        btn.disabled=false; refresh();
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

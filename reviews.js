/* Customer reviews: shown in the toolkit product pop-up and on each product page.
   Drop <div data-reviews="product-key"></div> anywhere and this fills it.

   Only real reviews go in REVIEWS. They arrive by email via the form below; check
   the email against a Payhip order, then add it here as
     {name:'Priya S.', role:'Consultant, Big 4', rating:5, date:'2026-11-02', verified:true,
      text:'...'}
   When the first ones go in, also add aggregateRating + review to the Product
   JSON-LD on the product page so search engines can read them. */
(function(){
  var REVIEWS = {
    'promotion-case-template': []
  };
  var NAMES = {
    'promotion-case-template': 'The Promotion Case Template'
  };
  var WEB3FORMS_KEY = '77fa2887-eee8-4052-803f-0d567a5c2568';

  function esc(s){ return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function stars(n){ var s=''; for(var i=1;i<=5;i++) s+=i<=Math.round(n)?'★':'☆'; return s; }
  function fmtDate(d){ try{ return new Date(d+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}); }catch(e){ return d; } }

  function render(box, uid){
    var key=box.getAttribute('data-reviews'), list=REVIEWS[key]||[], name=NAMES[key]||key;
    var h='<h3 class="rv-h">Customer reviews</h3>';
    if(list.length){
      var avg=list.reduce(function(a,r){return a+r.rating;},0)/list.length;
      h+='<p class="rv-summary"><span class="rv-stars" aria-hidden="true">'+stars(avg)+'</span> <strong>'+avg.toFixed(1)+' out of 5</strong> · '+list.length+' review'+(list.length>1?'s':'')+'</p><ul class="rv-list">';
      list.forEach(function(r){
        h+='<li class="rv-item"><div class="rv-top"><span class="rv-stars" role="img" aria-label="'+r.rating+' out of 5 stars">'+stars(r.rating)+'</span>'+(r.verified?'<span class="rv-ver">Verified buyer</span>':'')+'</div>'+
           '<p class="rv-text">'+esc(r.text)+'</p><p class="rv-by">'+esc(r.name)+(r.role?' · '+esc(r.role):'')+(r.date?' · '+fmtDate(r.date):'')+'</p></li>';
      });
      h+='</ul>';
    } else {
      h+='<p class="rv-empty">No reviews yet. If you\'ve used it, I\'d love to hear how it went, and your review will help the next person decide.</p>';
    }
    h+='<details class="rv-write"><summary class="btn btn-ghost">Write a review</summary>'+
       '<form class="rv-form" novalidate>'+
       '<fieldset class="rv-rate"><legend>Your rating</legend><span class="rv-stars-in">'+
       [5,4,3,2,1].map(function(n){ return '<input type="radio" name="rating" value="'+n+'" id="'+uid+'-r'+n+'"><label for="'+uid+'-r'+n+'" title="'+n+' star'+(n>1?'s':'')+'"><span aria-hidden="true">★</span><span class="sr">'+n+' star'+(n>1?'s':'')+'</span></label>'; }).join('')+
       '</span></fieldset>'+
       '<label class="rv-f">Your review<textarea name="review" rows="4" required placeholder="What did it help you do? Did you get the promotion?"></textarea></label>'+
       '<div class="rv-row"><label class="rv-f">Name to show<input name="name" required placeholder="e.g. Priya S."></label>'+
       '<label class="rv-f">Role (optional)<input name="role" placeholder="e.g. Consultant, Big 4"></label></div>'+
       '<label class="rv-f">Email you bought with<input type="email" name="email" required placeholder="Kept private, just to match your order"></label>'+
       '<input type="checkbox" name="botcheck" class="rv-hp" tabindex="-1" autocomplete="off">'+
       '<label class="rv-ok"><input type="checkbox" name="consent" required> I\'m happy for my review, name and role to be shown on this site.</label>'+
       '<button class="btn btn-marigold" type="submit">Send review</button>'+
       '<p class="rv-msg" role="status"></p></form></details>';
    box.innerHTML=h;

    var f=box.querySelector('.rv-form'), msg=box.querySelector('.rv-msg');
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var rating=(f.querySelector('input[name=rating]:checked')||{}).value;
      var text=f.review.value.trim(), nm=f.name.value.trim(), em=f.email.value.trim();
      var err = !rating ? 'Please choose a star rating.' :
                text.length<10 ? 'Please write a sentence or two.' :
                !nm ? 'Please add the name you\'d like shown.' :
                em.indexOf('@')<1 ? 'Please add the email you bought with.' :
                !f.consent.checked ? 'Please tick the box so I can show your review.' : '';
      if(err){ msg.className='rv-msg rv-bad'; msg.textContent=err; return; }
      if(f.botcheck.checked) return;
      var btn=f.querySelector('button'); btn.disabled=true; btn.textContent='Sending…'; msg.textContent='';
      fetch('https://api.web3forms.com/submit',{
        method:'POST', headers:{'Content-Type':'application/json','Accept':'application/json'},
        body:JSON.stringify({access_key:WEB3FORMS_KEY, subject:'New review ('+rating+'★): '+name, from_name:'Website reviews',
          email:em, Product:name, Rating:rating+' / 5', Review:text, 'Show as':nm, Role:f.role.value.trim()||'—', 'Consent to publish':'Yes'})
      }).then(function(r){return r.json();}).then(function(d){
        if(!d||!d.success) throw new Error('rejected');
        if(window.gtag) gtag('event','review_submitted',{item_id:key,rating:+rating});
        f.innerHTML='<p class="rv-msg rv-good">Thank you. I read every review, and yours will appear here once I\'ve matched it to your order.</p>';
      }).catch(function(){
        btn.disabled=false; btn.textContent='Send review';
        msg.className='rv-msg rv-bad';
        msg.innerHTML='That didn\'t send. Please email it to <a href="mailto:hello@kajolphadnis.com">hello@kajolphadnis.com</a> instead.';
      });
    });
  }

  function init(){
    var boxes=document.querySelectorAll('[data-reviews]');
    for(var i=0;i<boxes.length;i++) render(boxes[i],'rv'+i);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();

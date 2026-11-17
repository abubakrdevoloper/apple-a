const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];

const registerModal = $('#registerModal');
const purchaseModal = $('#purchaseModal');
const toast = $('#toast');
let lastFocused = null;

function showModal(modal){
  lastFocused = document.activeElement;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
  const first = $('input', modal);
  if(first) setTimeout(()=>first.focus(),80);
}
function closeModals(){
  $$('.modal.open').forEach(modal=>{
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
  });
  document.body.style.overflow='';
  if(lastFocused && typeof lastFocused.focus==='function') lastFocused.focus();
}
function showToast(message){
  toast.textContent=message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer=window.setTimeout(()=>toast.classList.remove('show'),2600);
}

$$('[data-open-register]').forEach(el=>el.addEventListener('click',e=>{
  e.preventDefault(); showModal(registerModal);
}));
$('#accountBtn').addEventListener('click',()=>showModal(registerModal));
$$('[data-close-modal]').forEach(el=>el.addEventListener('click',closeModals));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModals();});

function openPurchase(product){
  $('#selectedProduct').textContent=product;
  $('#purchaseMessage').textContent='';
  showModal(purchaseModal);
}
$$('[data-buy]').forEach(btn=>btn.addEventListener('click',()=>openPurchase(btn.dataset.buy)));

// Product tiles and carousel product links lead to registration as requested.
$$('.product-card').forEach(card=>{
  card.addEventListener('click',e=>{
    if(e.target.closest('button')) return;
    showModal(registerModal);
  });
  card.setAttribute('tabindex','0');
  card.setAttribute('role','button');
  card.setAttribute('aria-label',`${card.dataset.name} haqida ma’lumot va ro‘yxatdan o‘tish`);
  card.addEventListener('keydown',e=>{
    if((e.key==='Enter'||e.key===' ') && e.target===card){e.preventDefault();showModal(registerModal);}
  });
});
$$('[data-product]').forEach(btn=>btn.addEventListener('click',()=>showModal(registerModal)));

$('#registerForm').addEventListener('submit',e=>{
  e.preventDefault();
  const data=new FormData(e.currentTarget);
  if((data.get('password')||'').length<8){$('#registerMessage').textContent='Parol kamida 8 ta belgidan iborat bo‘lishi kerak.';return;}
  $('#registerMessage').textContent='Muvaffaqiyatli! Demo ro‘yxatdan o‘tish yakunlandi.';
  e.currentTarget.reset();
  showToast('Ro‘yxatdan o‘tish ma’lumoti qabul qilindi.');
});
$('#purchaseForm').addEventListener('submit',e=>{
  e.preventDefault();
  $('#purchaseMessage').textContent='Buyurtma so‘rovi qabul qilindi. Tez orada siz bilan bog‘lanamiz.';
  e.currentTarget.reset();
  showToast('Buyurtma so‘rovi yuborildi (demo).');
});
$('#showLogin').addEventListener('click',()=>{
  $('#registerTitle').textContent='Hisobingizga kiring.';
  $('#registerMessage').textContent='Demo sahifada kirish oynasi ro‘yxatdan o‘tish formasidan foydalanadi.';
  $('#registerForm [name="password"]').setAttribute('autocomplete','current-password');
});

// Category filters and live search
let activeFilter='all';
function filterProducts(){
  const query=$('#searchInput').value.trim().toLowerCase();
  let visible=0;
  $$('.product-card').forEach(card=>{
    const categoryMatch=activeFilter==='all'||card.dataset.category===activeFilter;
    const searchMatch=!query||card.dataset.name.toLowerCase().includes(query)||card.textContent.toLowerCase().includes(query);
    const show=categoryMatch&&searchMatch;
    card.hidden=!show;
    if(show)visible++;
  });
  $('#noResults').hidden=visible!==0;
}
$$('.filter').forEach(btn=>btn.addEventListener('click',()=>{
  $$('.filter').forEach(item=>item.classList.remove('active'));
  btn.classList.add('active');activeFilter=btn.dataset.filter;filterProducts();
}));
$('#searchToggle').addEventListener('click',()=>{
  $('#searchPanel').classList.toggle('open');
  if($('#searchPanel').classList.contains('open'))$('#searchInput').focus();
});
$('#searchClose').addEventListener('click',()=>$('#searchPanel').classList.remove('open'));
$('#searchInput').addEventListener('input',filterProducts);

// Favorites
$$('.heart').forEach(btn=>btn.addEventListener('click',()=>{
  btn.classList.toggle('liked');
  btn.textContent=btn.classList.contains('liked')?'♥':'♡';
  btn.setAttribute('aria-pressed',String(btn.classList.contains('liked')));
}));

// Carousel
const carousel=$('#heroCarousel');
const slides=$$('.slide',carousel);
const dots=$$('#carouselDots button');
let currentSlide=0;
function goToSlide(index){
  currentSlide=(index+slides.length)%slides.length;
  carousel.scrollTo({left:slides[currentSlide].offsetLeft-carousel.offsetLeft,behavior:'smooth'});
  dots.forEach((dot,i)=>dot.classList.toggle('selected',i===currentSlide));
}
$('#prevSlide').addEventListener('click',()=>goToSlide(currentSlide-1));
$('#nextSlide').addEventListener('click',()=>goToSlide(currentSlide+1));
dots.forEach((dot,i)=>dot.addEventListener('click',()=>goToSlide(i)));
let touchStart=0;
carousel.addEventListener('touchstart',e=>touchStart=e.changedTouches[0].screenX,{passive:true});
carousel.addEventListener('touchend',e=>{
  const delta=e.changedTouches[0].screenX-touchStart;
  if(Math.abs(delta)>45)goToSlide(currentSlide+(delta<0?1:-1));
},{passive:true});

// Mobile navigation
const menuToggle=$('#menuToggle'), navLinks=$('#navLinks');
menuToggle.addEventListener('click',()=>{
  const open=navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded',String(open));
  menuToggle.textContent=open?'×':'☰';
});
$$('.nav-links a').forEach(link=>link.addEventListener('click',()=>{
  navLinks.classList.remove('open');menuToggle.setAttribute('aria-expanded','false');menuToggle.textContent='☰';
}));

// Close modal with a click on the card's close control; keep all form controls keyboard accessible.
$$('.modal-card').forEach(card=>card.addEventListener('click',e=>e.stopPropagation()));

// SVG motion is presentation time (tau_ui), not measured or calibrated dynamics.
const picture=document.querySelector('[data-scientific-hero]');
const toggle=document.querySelector('[data-hero-motion-toggle]');
if(picture&&toggle){
  const staticSrc=picture.dataset.staticSrc;
  const animatedSrc=picture.dataset.animatedSrc;
  const media=window.matchMedia('(prefers-reduced-motion: reduce)');
  let userChose=false;
  let playing=false;
  function render(play){
    playing=Boolean(play);
    const src=playing?animatedSrc:staticSrc;
    if(picture.getAttribute('src')!==src)picture.setAttribute('src',src);
    const label=playing?'Pause diagram motion':'Play diagram motion';
    toggle.textContent=label;
    toggle.setAttribute('aria-label',label);
    toggle.dataset.playing=String(playing);
  }
  picture.addEventListener('error',()=>{
    if(picture.getAttribute('src')===animatedSrc){render(false);toggle.hidden=true;}
  });
  toggle.addEventListener('click',()=>{userChose=true;render(!playing);});
  if(typeof media.addEventListener==='function'){
    media.addEventListener('change',e=>{if(!userChose)render(!e.matches);});
  }
  render(!media.matches);
}

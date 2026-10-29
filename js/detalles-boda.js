/* Fecha de la ceremonia con zona horaria explícita de Bolivia. */
window.FECHA_BODA = '2026-11-28T14:00:00-04:00';
window.iconoBoda = function(nombre){
 const paths={heart:'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',calendar:'M5 5h14v16H5z M8 2v6 M16 2v6 M5 10h14',clock:'M12 8v5l3 2 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',pin:'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0',music:'M9 18V5l11-3v13 M9 5v4l11-3 M9 18c0 4-7 4-7 0s7-4 7 0 M20 15c0 4-7 4-7 0s7-4 7 0',leaf:'M20 3C7 1 1 9 6 16c7 5 15-1 14-13Z M4 21 17 7 M9 16v-5 M13 12h5',home:'m3 11 9-8 9 8 M5 9v12h14V9 M10 21v-7h4v7',spark:'m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z',alert:'m12 3 10 18H2Z M12 9v5 M12 17v1',cup:'M5 4h12v9a6 6 0 0 1-12 0Z M17 5h2a3 3 0 0 1 0 6h-2 M3 22h16',arrow:'M12 3v18 m-6-6 6 6 6-6'};
 return '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="'+(paths[nombre]||paths.heart)+'"/></svg>';
};
document.addEventListener('DOMContentLoaded',()=>{
 const symbols={'📅':'calendar','⏰':'clock','📍':'pin','☕':'cup','✨':'spark','🤍':'heart','❤️':'heart','💐':'leaf','🌿':'leaf','🏡':'home','🎉':'heart','💌':'heart','⚠️':'alert','✏️':'leaf','↓':'arrow'};
 const walk=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement.closest('script,style,svg,textarea')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
 const nodes=[];while(walk.nextNode())nodes.push(walk.currentNode);
 for(const node of nodes){let value=node.textContent;if(!Object.keys(symbols).some(x=>value.includes(x)))continue;const holder=document.createElement('span');const regex=/(📅|⏰|📍|☕|✨|🤍|❤️|💐|🌿|🏡|🎉|💌|⚠️|✏️|↓)/gu;let end=0;for(const m of value.matchAll(regex)){holder.append(document.createTextNode(value.slice(end,m.index)));holder.insertAdjacentHTML('beforeend',iconoBoda(symbols[m[0]]));end=m.index+m[0].length}holder.append(document.createTextNode(value.slice(end)));node.replaceWith(holder)}
 const deadline=new Date(FECHA_BODA).getTime();let timer;
 function tick(){const ms=Math.max(0,deadline-Date.now()),sec=Math.floor(ms/1000);const vals=[Math.floor(sec/86400),Math.floor(sec/3600)%24,Math.floor(sec/60)%60,sec%60];['days','hours','minutes','seconds'].forEach((unit,i)=>document.getElementById('cd-'+unit).textContent=String(vals[i]).padStart(2,'0'));if(ms===0){document.getElementById('count-title').textContent='EL COMIENZO DE NUESTRA VIDA JUNTOS';clearInterval(timer)}}
 timer=setInterval(tick,1000);tick();document.addEventListener('visibilitychange',()=>{if(!document.hidden)tick()});
 const btn=document.getElementById('music-toggle'),audio=document.getElementById('wedding-audio'),label=document.getElementById('music-label');document.getElementById('music-icon').innerHTML=iconoBoda('music');audio.volume=.3;
 btn.onclick=async()=>{if(!audio.paused){audio.pause();return}try{await audio.play()}catch{label.textContent='Toca para reintentar';btn.setAttribute('aria-pressed','false')}};
 audio.onplay=()=>{btn.setAttribute('aria-pressed','true');btn.setAttribute('aria-label','Pausar música');label.textContent='Pausar melodía'};
 audio.onpause=()=>{btn.setAttribute('aria-pressed','false');btn.setAttribute('aria-label','Reproducir música');label.textContent='Nuestra melodía'};
 const intro=document.getElementById('letter-intro'),content=document.getElementById('invitation-content');
 let opened=false;
 function openLetter(withMusic){
  if(opened)return;opened=true;
  if(withMusic)audio.play().catch(()=>{label.textContent='Reproducir música';});
  intro.classList.add('opening');document.getElementById('letter-instruction').textContent='Bienvenidos a nuestra historia';
  document.getElementById('open-letter').disabled=true;document.getElementById('open-silent').disabled=true;
  const delay=matchMedia('(prefers-reduced-motion: reduce)').matches?0:1250;
  setTimeout(()=>{intro.hidden=true;content.inert=false;document.body.classList.add('letter-open');window.scrollTo(0,0);dispatchEvent(new Event('resize'));const title=document.getElementById('tt');title.tabIndex=-1;title.focus({preventScroll:true});},delay);
 }
 document.getElementById('open-letter').addEventListener('click',()=>openLetter(true));
 document.getElementById('open-silent').addEventListener('click',()=>openLetter(false));
 if(location.hash==='#editar'){intro.hidden=true;content.inert=false;document.body.classList.add('letter-open');}else document.getElementById('open-letter').focus({preventScroll:true});
});

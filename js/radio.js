/* ============================================================
   RADIO NUPCIAL + CARTA DE ENTRADA
   - La radio es el ÚNICO reproductor (no hay otro <audio>).
   - Canal 1 = tu canción (audio/nuestro-comienzo.wav).
   - #music-toggle reproduce / pausa la radio.
   - Al abrir la carta con el sello suena el Canal 1.
   ============================================================ */
(function(){
"use strict";

/* ---------- CANALES ----------
   src:"ruta.mp3" → suena tu archivo.
   src:""         → suena una melodía de muestra generada por el navegador. */
const STATIONS=[
 {name:"Nuestra melodía",            src:"audio/nuestro-comienzo.wav", root:262, scale:[0,2,4,7,9],       bpm:84},
 {name:"Canal 2 · Julio Jaramillo",  src:"audio/Julio Jaramillo Nuestro Juramento.mp3", root:220, scale:[0,2,4,7,9],        bpm:72},
 {name:"Canal 3 · Jose Jose",        src:"audio/José José - El Amar y El Querer (Letra Lyrics).mp3", root:196, scale:[0,3,5,7,10],      bpm:66},
 {name:"Canal 4 · Ricchi E Poveri", src:"audio/Ricchi E Poveri - Sara Perche Ti Amo (Testo Lyrics).mp3", root:294, scale:[0,2,4,7,9],       bpm:120},
 {name:"Canal 5 · Amor",             src:"audio/Marwan - Animales (VIDEOCLIP OFICIAL).mp3", root:247, scale:[0,2,4,5,7,9,11], bpm:90},
 {name:"Canal 6 · Until I Found You",          src:"audio/Stephen Sanchez - Until I Found You (Official Video).mp3", root:175, scale:[0,3,5,7,10],      bpm:60},
 {name:"Canal 7 · Folklore",         src:"audio/Vivir Junto a Ti.mp3", root:330, scale:[0,3,5,7,10],      bpm:104},
 {name:"Canal 8 · Tercer Cielo",              src:"audio/Tercer Cielo- Amor Real (Audio.mp3", root:233, scale:[0,2,4,7,9],       bpm:110},
 {name:"Canal 9 · Última canción",   src:"audio/Natalia Lafourcade - Hasta La Raíz Sigo cruzando rios.mp3", root:208, scale:[0,2,4,7,9],       bpm:76}
];

const MIN=880,MAX=1080,W=9;
STATIONS.forEach((s,i)=>s.f=890+i*22);
const $=id=>document.getElementById(id);
const tuner=$("tuner"),dial=$("dial"),chips=$("chips"),pwr=$("pwr");

/* ---------- Dial y botones de canal ---------- */
STATIONS.forEach((s,i)=>{
  const t=document.createElement("i");
  t.style.left=((s.f-MIN)/(MAX-MIN)*100)+"%";
  t.innerHTML="<em>"+(i+1)+"</em>";
  dial.appendChild(t);
  const b=document.createElement("button");
  b.type="button";b.textContent=i+1;
  b.setAttribute("aria-label","Canal "+(i+1));
  b.onclick=()=>{power(true);tuner.value=s.f;tune()};
  chips.appendChild(b);
});

/* ---------- Audio ---------- */
let ctx,master,noiseG,musicG,cur=-1,timer=null,audioEl=null,on=false,step=0,lastCh=0;

function init(){
  if(ctx)return;
  ctx=new (window.AudioContext||window.webkitAudioContext)();
  master=ctx.createGain();master.gain.value=.8;master.connect(ctx.destination);
  noiseG=ctx.createGain();noiseG.gain.value=0;
  musicG=ctx.createGain();musicG.gain.value=0;
  const buf=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),d=buf.getChannelData(0);
  for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  const n=ctx.createBufferSource();n.buffer=buf;n.loop=true;
  const bp=ctx.createBiquadFilter();bp.type="bandpass";bp.frequency.value=2500;bp.Q.value=.4;
  n.connect(bp);bp.connect(noiseG);noiseG.connect(master);musicG.connect(master);n.start();
}

function stopStation(){
  clearInterval(timer);timer=null;
  /* Solo pausa: NO se descarta el audio, para que al volver a darle play
     continúe desde donde se quedó (no desde 0). */
  if(audioEl){audioEl.pause();audioEl=null}
  cur=-1;
}

function startStation(i){
  stopStation();cur=i;const s=STATIONS[i];
  if(s.src){
    /* Un único <audio> por canal, guardado en s.el: se reutiliza al reanudar */
    if(!s.el){
      const a=new Audio(s.src);
      a.loop=true;
      /* Si el archivo no existe o falla, suena la melodía de muestra */
      a.onerror=()=>{s.el=null;if(audioEl===a){s.src="";startStation(i)}};
      s.el=a;
    }
    audioEl=s.el;
    audioEl.play().catch(()=>{});
    return;
  }
  let idx=2;
  const beat=60000/s.bpm/2;
  timer=setInterval(()=>{
    step++;
    if(Math.random()<.2)return;
    idx=Math.max(0,Math.min(s.scale.length*2-1,idx+[-2,-1,-1,0,1,1,2][Math.floor(Math.random()*7)]));
    const oct=Math.floor(idx/s.scale.length),deg=s.scale[idx%s.scale.length];
    const f=s.root*Math.pow(2,(deg+12*oct)/12);
    const o=ctx.createOscillator(),g=ctx.createGain(),t=ctx.currentTime;
    o.type="triangle";o.frequency.value=f;
    g.gain.setValueAtTime(0,t);
    g.gain.linearRampToValueAtTime(.35,t+.03);
    g.gain.exponentialRampToValueAtTime(.001,t+beat/1000*2.2);
    o.connect(g);g.connect(musicG);o.start(t);o.stop(t+beat/1000*2.4);
    if(step%4===0){
      const b=ctx.createOscillator(),bg=ctx.createGain();
      b.type="sine";b.frequency.value=s.root/2;
      bg.gain.setValueAtTime(.3,t);bg.gain.exponentialRampToValueAtTime(.001,t+.9);
      b.connect(bg);bg.connect(musicG);b.start(t);b.stop(t+1);
    }
  },beat);
}

function tune(){
  const v=+tuner.value;
  $("freq").textContent=(v/10).toFixed(1);
  let bi=0,bd=1e9;
  STATIONS.forEach((s,i)=>{const d=Math.abs(s.f-v);if(d<bd){bd=d;bi=i}});
  const k=Math.max(0,1-bd/W);
  if(k>.6)lastCh=bi;
  [...chips.children].forEach((c,i)=>c.classList.toggle("on",k>.5&&i===bi));
  $("name").textContent=k>.6?STATIONS[bi].name:(on?"· · · estática · · ·":"Radio apagada");
  if(!on||!ctx)return;
  noiseG.gain.setTargetAtTime(Math.pow(1-k,1.2)*.22,ctx.currentTime,.05);
  musicG.gain.setTargetAtTime(Math.pow(k,1.5)*.9,ctx.currentTime,.05);
  if(k>.05){if(cur!==bi)startStation(bi)}else if(cur!==-1)stopStation();
  if(audioEl)audioEl.volume=Math.pow(k,1.5);
}

function power(v){
  init();if(ctx.state==="suspended")ctx.resume();
  on=v;
  pwr.classList.toggle("on",on);
  $("radioBtn").classList.toggle("playing",on);
  pwr.textContent=on?"Apagar":"Encender";
  if(!on){stopStation();noiseG.gain.value=0;musicG.gain.value=0}
  tune();
  /* Avisa al resto de la página (para el botón #music-toggle) */
  document.dispatchEvent(new CustomEvent("radiochange",{detail:{on}}));
}

tuner.addEventListener("input",()=>{if(!on)power(true);else tune()});
pwr.onclick=()=>power(!on);

/* ---------- Panel de la radio ---------- */
function toggleRadio(){
  const r=$("radio");
  r.classList.toggle("show");
  r.setAttribute("aria-hidden",!r.classList.contains("show"));
}
$("radioBtn").onclick=toggleRadio;

/* ---------- API pública ---------- */
const WeddingRadio={
  play(ch){
    if(typeof ch!=="number")ch=lastCh;
    lastCh=ch;
    power(true);
    tuner.value=STATIONS[ch].f;
    tune();
  },
  stop(){power(false)},
  toggle(){on?WeddingRadio.stop():WeddingRadio.play(lastCh)},
  get isOn(){return on}
};
window.WeddingRadio=WeddingRadio;
window.toggleRadio=toggleRadio;

/* ============================================================
   BOTÓN #music-toggle  (reproducir / pausar la melodía)
   ============================================================ */
const mt=$("music-toggle"),mIcon=$("music-icon"),mLabel=$("music-label");
const ICON_PLAY='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>';
const ICON_PAUSE='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="5.5" y="4" width="4.5" height="16" rx="1"/><rect x="14" y="4" width="4.5" height="16" rx="1"/></svg>';

function syncMusicButton(isOn){
  mt.setAttribute("aria-pressed",String(isOn));
  mt.setAttribute("aria-label",isOn?"Pausar música":"Reproducir música");
  mIcon.innerHTML=isOn?ICON_PAUSE:ICON_PLAY;
  mLabel.textContent=isOn?"Pausar melodía":"Nuestra melodía";
}
syncMusicButton(false);
mt.addEventListener("click",()=>WeddingRadio.toggle());
document.addEventListener("radiochange",e=>syncMusicButton(e.detail.on));

/* ============================================================
   CARTA DE ENTRADA
   Si ya tienes tu propia animación, conserva la tuya y llama a
   WeddingRadio.play(0) en el clic del sello.
   ============================================================ */
const intro=$("letter-intro"),content=$("invitation-content");
const openBtn=$("open-letter"),silentBtn=$("open-silent");

function openInvitation(withMusic){
  /* IMPORTANTE: la música se inicia aquí, dentro del clic del usuario;
     los navegadores (sobre todo en celular) no permiten iniciarla de otra forma. */
  if(withMusic)WeddingRadio.play(0);
  intro.classList.add("is-open");
  setTimeout(()=>{
    intro.hidden=true;
    content.removeAttribute("inert");
    content.focus&&content.focus({preventScroll:true});
  },900);
}
openBtn.addEventListener("click",()=>openInvitation(true));
silentBtn.addEventListener("click",()=>openInvitation(false));

})();
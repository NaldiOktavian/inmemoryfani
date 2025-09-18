// =========================
// KONFIGURASI MUDAH DIGANTI
// =========================
const NAMA = "Fanny";                   // Nama target
const HARI = 90;                        // Lama hukuman
const ZONA = "Asia/Jakarta";            // Zona waktu tampilan
const SONG = {
  url: "assets/lagu-tribute.mp3",       // GANTI ke file/URL lagu kamu (mp3/ogg)
  title: "Lagu Kenangan Fani"
};
// Daftar foto kenangan (GANTI URL di sini).
const PHOTOS = [
  "assets/fani-1.jpg",
  "assets/fani-2.jpg",
  "assets/fani-3.jpg",
  "assets/fani-4.jpg",
  "assets/fani-5.jpg",
  "assets/fani-6.jpg",
  "assets/fani-7.jpg",
  "assets/fani-8.jpg",
  "assets/fani-9.jpg",
  "assets/fani-10.jpg"  
];
const SLIDE_MS = 6000;                  // auto-geser galeri

// =========================
// ELEMEN
// =========================
const el = {
  d: document.getElementById('d'),
  h: document.getElementById('h'),
  m: document.getElementById('m'),
  s: document.getElementById('s'),
  status: document.getElementById('status'),
  startAt: document.getElementById('startAt'),
  endAt: document.getElementById('endAt'),
  copyEnd: document.getElementById('copyEnd'),
  reset: document.getElementById('reset'),
  nama: document.getElementById('namaTarget'),
  audio: document.getElementById('audio'),
  play: document.getElementById('play'),
  mute: document.getElementById('mute'),
  restart: document.getElementById('restart'),
  prog: document.getElementById('prog'),
  frame: document.getElementById('frame'),
  prev: document.getElementById('prev'),
  next: document.getElementById('next'),
  songTitle: document.getElementById('songTitle'),
};
el.nama.textContent = NAMA;

// =========================
// UTIL
// =========================
const z = n => n.toString().padStart(2,'0');
const fmt = (d) => new Date(d).toLocaleString('id-ID', {
  timeZone: ZONA, weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
  hour: '2-digit', minute: '2-digit'
});

// =========================
// COUNTDOWN (persist di localStorage)
// =========================
const KEY_END = 'freeze_end_ts';
const KEY_START = 'freeze_start_ts';

function setNewWindow(days){
  const now = Date.now();
  const end = now + days * 24 * 60 * 60 * 1000;
  localStorage.setItem(KEY_START, now.toString());
  localStorage.setItem(KEY_END, end.toString());
  return {start: now, end};
}
function ensureWindow(){
  let end = parseInt(localStorage.getItem(KEY_END)||'0',10);
  let start = parseInt(localStorage.getItem(KEY_START)||'0',10);
  if(!end || end <= Date.now()){
    const s = setNewWindow(HARI); start = s.start; end = s.end;
  }
  return {start, end};
}

let {start, end} = ensureWindow();
el.startAt.textContent = fmt(start);
el.endAt.textContent = fmt(end);

function tick(){
  const now = Date.now();
  const diff = end - now;
  if (diff <= 0){
    el.d.textContent = '00'; el.h.textContent = '00'; el.m.textContent = '00'; el.s.textContent = '00';
    el.status.textContent = 'Selesai';
    clearInterval(timer);
    return;
  }
  const total = Math.floor(diff/1000);
  const d = Math.floor(total/86400);
  const h = Math.floor((total%86400)/3600);
  const m = Math.floor((total%3600)/60);
  const s = total%60;
  el.d.textContent = z(d); el.h.textContent = z(h); el.m.textContent = z(m); el.s.textContent = z(s);
  el.status.textContent = 'Berjalan';
}
const timer = setInterval(tick, 1000); tick();

el.copyEnd.addEventListener('click', async () => {
  try{
    await navigator.clipboard.writeText(el.endAt.textContent);
    el.copyEnd.textContent = 'Tersalin!';
    setTimeout(()=> el.copyEnd.textContent='Salin tanggal akhir', 1200);
  }catch{
    alert('Salin manual:\n'+ el.endAt.textContent);
  }
});
el.reset.addEventListener('click', () => {
  if(!confirm('Reset ke 90 hari dari sekarang?')) return;
  const s = setNewWindow(HARI); start = s.start; end = s.end;
  el.startAt.textContent = fmt(start); el.endAt.textContent = fmt(end); tick();
});

// =========================
// AUDIO TRIBUTE
// =========================
el.audio.src = SONG.url;
el.songTitle.textContent = SONG.title;

let playing = false;
function togglePlay(){
  if(!playing){
    el.audio.play().then(()=>{
      playing = true;
      el.play.textContent = '⏸';
      el.play.classList.add('ring');
    }).catch(()=>{
      alert('Browser memblokir autoplay. Tekan tombol Putar lagi setelah interaksi.');
    });
  } else {
    el.audio.pause();
    playing = false;
    el.play.textContent = '▶';
    el.play.classList.remove('ring');
  }
}
el.play.addEventListener('click', togglePlay);
el.restart.addEventListener('click', ()=>{ el.audio.currentTime = 0; if(!playing) togglePlay(); });
el.mute.addEventListener('click', ()=>{
  el.audio.muted = !el.audio.muted;
  el.mute.textContent = el.audio.muted ? 'Unmute' : 'Mute';
});
el.audio.addEventListener('timeupdate', ()=>{
  const p = (el.audio.currentTime / (el.audio.duration||1)) * 100;
  el.prog.style.width = p + '%';
});
el.audio.addEventListener('ended', ()=>{
  playing=false; el.play.textContent='▶'; el.play.classList.remove('ring');
});

// =========================
// GALERI FOTO (SLIDER)
// =========================
let idx = 0;
const imgs = PHOTOS.map(src => {
  const im = document.createElement('img');
  im.loading = 'lazy'; im.alt = 'Foto kenangan Fani'; im.src = src;
  el.frame.appendChild(im);
  return im;
});
function show(i){
  imgs.forEach((im,k)=> im.classList.toggle('active', k===i));
  idx = i;
}
function next(){ show((idx+1) % imgs.length); }
function prev(){ show((idx-1+imgs.length) % imgs.length); }
el.next.addEventListener('click', ()=>{ next(); resetAuto(); });
el.prev.addEventListener('click', ()=>{ prev(); resetAuto(); });

let auto = null;
function startAuto(){ if(imgs.length>1){ auto = setInterval(next, SLIDE_MS); } }
function resetAuto(){ if(auto){ clearInterval(auto); startAuto(); } }

if (imgs.length){
  show(0);
  startAuto();
} else {
  const ph = document.createElement('div');
  ph.style.position='absolute'; ph.style.inset='0';
  ph.style.background='linear-gradient(135deg,#111827,#0b1220)';
  el.frame.appendChild(ph);
}

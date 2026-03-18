const getTheme = () => localStorage.getItem('theme') || 'light';

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);

  const pic = document.getElementById('profile-pic');
  if (pic) pic.src = theme === 'dark' ? pic.dataset.dark : pic.dataset.light;
};

applyTheme(getTheme());

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const next = getTheme() === 'light' ? 'dark' : 'light';
      applyTheme(next);
    });
  }
});


function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.pageYOffset - 90;
  window.scrollTo({ top: y, behavior: 'smooth' });
}


const typingEl = document.querySelector('.typing-text');
const typingName = 'Ger Merwin E. Ytac';
let charIndex = 0;
let isDeleting = false;

function typeWriter() {
  if (!typingEl) return;

  typingEl.textContent = typingName.substring(0, charIndex);

  if (!isDeleting) {
    if (charIndex < typingName.length) {
      charIndex++;
      setTimeout(typeWriter, 100);
    } else {
      setTimeout(() => { isDeleting = true; typeWriter(); }, 1500);
    }
  } else {
    if (charIndex > 0) {
      charIndex--;
      setTimeout(typeWriter, 60);
    } else {
      isDeleting = false;
      setTimeout(typeWriter, 500);
    }
  }
}

if (typingEl) setTimeout(typeWriter, 500);


const playlist = [
  { name: 'Golden Hour Instrumental', artist: 'JVKE',          src: 'Song1.mp3' },
  { name: 'Virus (extreme)',           artist: 'Beethoven',     src: 'Song2.mp3' },
  { name: 'La Maritza',                artist: 'Sylvie Vartan', src: 'Song3.mp3' },
];

let currentTrack = 0;
let isPlaying = false;

const audio         = document.getElementById('audioPlayer');
const playBtn       = document.getElementById('playBtn');
const playIcon      = document.getElementById('playIcon');
const prevBtn       = document.getElementById('prevBtn');
const nextBtn       = document.getElementById('nextBtn');
const muteBtn       = document.getElementById('muteBtn');
const volumeIcon    = document.getElementById('volumeIcon');
const volumeSlider  = document.getElementById('volumeSlider');
const progressBar   = document.querySelector('.progress-bar');
const progressFill  = document.getElementById('progress');
const currentTimeEl = document.getElementById('currentTime');
const durationEl    = document.getElementById('duration');
const trackNameEl   = document.getElementById('trackName');
const trackArtistEl = document.getElementById('trackArtist');

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function loadTrack(index) {
  const track = playlist[index];
  audio.src = track.src;
  trackNameEl.textContent = track.name;
  trackArtistEl.textContent = track.artist;
  progressFill.style.width = '0%';
  currentTimeEl.textContent = '0:00';
}

function play() {
  audio.play();
  isPlaying = true;
  playIcon.className = 'fas fa-pause';
}

function pause() {
  audio.pause();
  isPlaying = false;
  playIcon.className = 'fas fa-play';
}

function updateVolumeIcon(val) {
  if      (val == 0) volumeIcon.className = 'fas fa-volume-mute';
  else if (val < 50) volumeIcon.className = 'fas fa-volume-down';
  else               volumeIcon.className = 'fas fa-volume-up';
}

if (audio) {
  playBtn.addEventListener('click', () => isPlaying ? pause() : play());

  prevBtn.addEventListener('click', () => {
    currentTrack = (currentTrack - 1 + playlist.length) % playlist.length;
    loadTrack(currentTrack);
    if (isPlaying) play();
  });

  nextBtn.addEventListener('click', () => {
    currentTrack = (currentTrack + 1) % playlist.length;
    loadTrack(currentTrack);
    if (isPlaying) play();
  });

  audio.addEventListener('ended', () => {
    currentTrack = (currentTrack + 1) % playlist.length;
    loadTrack(currentTrack);
    play();
  });

  muteBtn.addEventListener('click', () => {
    audio.muted = !audio.muted;
    updateVolumeIcon(audio.muted ? 0 : volumeSlider.value);
  });

  volumeSlider.addEventListener('input', function () {
    audio.volume = this.value / 100;
    updateVolumeIcon(this.value);
  });

  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = pct + '%';
    currentTimeEl.textContent = formatTime(audio.currentTime);
    durationEl.textContent    = formatTime(audio.duration);
  });

  progressBar.addEventListener('click', (e) => {
    const pct = (e.clientX - progressBar.getBoundingClientRect().left) / progressBar.offsetWidth;
    audio.currentTime = pct * audio.duration;
  });

  loadTrack(0);
  audio.volume = 0.7;
}


document.addEventListener('DOMContentLoaded', () => {
  const pages        = document.querySelectorAll('.document-page');
  const prevDocBtn   = document.getElementById('prevDocBtn');
  const nextDocBtn   = document.getElementById('nextDocBtn');
  const pageNumEl    = document.getElementById('currentDocPage');
  const totalPagesEl = document.getElementById('totalDocPages');

  if (!pages.length) return;

  const totalPages = pages.length;
  let currentPage  = 1;
  let isAnimating  = false;

  const stackStyles = [
    { z: 5, y: 0,  r: 0,    o: 1    },
    { z: 4, y: 8,  r: -1,   o: 0.95 },
    { z: 3, y: 16, r: 1.5,  o: 0.9  },
    { z: 2, y: 24, r: -0.8, o: 0.85 },
    { z: 1, y: 32, r: 0.5,  o: 0.8  },
  ];

  if (totalPagesEl) totalPagesEl.textContent = totalPages;

  function updateButtons() {
    if (prevDocBtn) prevDocBtn.disabled = currentPage === 1 || isAnimating;
    if (nextDocBtn) nextDocBtn.disabled = currentPage === totalPages || isAnimating;
    if (pageNumEl)  pageNumEl.textContent = currentPage;
  }

  function restackPages() {
    pages.forEach((page, i) => {
      const pos = i + 1;
      page.classList.remove('read', 'toss-1', 'toss-2', 'toss-3', 'toss-4', 'return-1', 'return-2', 'return-3', 'return-4');

      if (pos < currentPage) {
        Object.assign(page.style, { opacity: '0', pointerEvents: 'none', zIndex: '0' });
        return;
      }

      const slot = Math.min(pos - currentPage, stackStyles.length - 1);
      const s = stackStyles[slot];
      Object.assign(page.style, {
        zIndex: String(s.z),
        opacity: String(s.o),
        pointerEvents: 'auto',
        transform: `translateX(-50%) translateY(${s.y}px) rotate(${s.r}deg)`,
      });
    });
  }

  function randomToss() { return Math.floor(Math.random() * 4) + 1; }

  function nextPage() {
    if (currentPage >= totalPages || isAnimating) return;
    isAnimating = true;
    updateButtons();

    const top = pages[currentPage - 1];
    const toss = randomToss();
    top.classList.add(`toss-${toss}`, 'read');
    top.style.zIndex = '10';

    setTimeout(() => { currentPage++; restackPages(); isAnimating = false; updateButtons(); }, 900);
  }

  function prevPage() {
    if (currentPage === 1 || isAnimating) return;
    isAnimating = true;
    updateButtons();
    currentPage--;

    const returning = pages[currentPage - 1];
    const ret = randomToss();
    Object.assign(returning.style, { opacity: '1', pointerEvents: 'auto', zIndex: '10' });
    returning.classList.add(`return-${ret}`);

    setTimeout(() => {
      returning.classList.remove(`return-${ret}`);
      restackPages();
      isAnimating = false;
      updateButtons();
    }, 900);
  }

  if (nextDocBtn) nextDocBtn.addEventListener('click', nextPage);
  if (prevDocBtn) prevDocBtn.addEventListener('click', prevPage);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') nextPage();
    if (e.key === 'ArrowLeft')  prevPage();
  });

  restackPages();
  updateButtons();
});


document.addEventListener('DOMContentLoaded', () => {
  const sections = ['header', 'home', 'about', 'facts', 'games'];
  const navBtns  = document.querySelectorAll('#navbar button');

  function updateActiveNav() {
    const scrollY = window.pageYOffset + window.innerHeight / 2;

    let active = 0;
    sections.forEach((id, i) => {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= scrollY) active = i;
    });

    navBtns.forEach((btn, i) => btn.classList.toggle('active', i === active));
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();
});

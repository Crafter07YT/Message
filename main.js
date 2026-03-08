
(function() {
  const theme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', theme);

  document.addEventListener('DOMContentLoaded', function() {
    const toggle = document.querySelector('.theme-toggle');

    const pic = document.getElementById('profile-pic');
    if (pic) {
      const saved = localStorage.getItem('theme') || 'light';
      pic.src = saved === 'dark' ? pic.dataset.dark : pic.dataset.light;
    }

    if (toggle) {
      toggle.addEventListener('click', function() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);

        const pic = document.getElementById('profile-pic');
        if (pic) pic.src = next === 'dark' ? pic.dataset.dark : pic.dataset.light;
      });
    }
  });
})();

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    const y = el.getBoundingClientRect().top + window.pageYOffset - 90;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
}

const typingElement = document.querySelector('.typing-text');
const textToType = "Ger Merwin E. Ytac";
let charIndex = 0;
let isDeleting = false;

function typeWriter() {
  if (!typingElement) return;
  const currentText = textToType.substring(0, charIndex);
  typingElement.textContent = currentText;

  if (!isDeleting) {
    if (charIndex < textToType.length) {
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

if (typingElement) setTimeout(typeWriter, 500);

const playlist = [
  { name: "Golden Hour Instrumental", artist: "JVKE", src: "Song1.mp3" },
  { name: "Virus (extreme)", artist: "Beethoven", src: "Song2.mp3" },
  { name: "La Maritza", artist: "Sylvie Vartan", src: "Song3.mp3" }
];

let currentTrack = 0;
let isPlaying = false;

const audioPlayer = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const playIcon = document.getElementById('playIcon');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const muteBtn = document.getElementById('muteBtn');
const volumeIcon = document.getElementById('volumeIcon');
const volumeSlider = document.getElementById('volumeSlider');
const progressBar = document.querySelector('.progress-bar');
const progress = document.getElementById('progress');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const trackNameEl = document.getElementById('trackName');
const trackArtistEl = document.getElementById('trackArtist');

if (audioPlayer) {
  function loadTrack(index) {
    const track = playlist[index];
    audioPlayer.src = track.src;
    trackNameEl.textContent = track.name;
    trackArtistEl.textContent = track.artist;
    progress.style.width = '0%';
    currentTimeEl.textContent = '0:00';
  }

  function playTrack() {
    audioPlayer.play();
    isPlaying = true;
    playIcon.classList.remove('fa-play');
    playIcon.classList.add('fa-pause');
  }

  function pauseTrack() {
    audioPlayer.pause();
    isPlaying = false;
    playIcon.classList.remove('fa-pause');
    playIcon.classList.add('fa-play');
  }

  playBtn.addEventListener('click', () => isPlaying ? pauseTrack() : playTrack());

  prevBtn.addEventListener('click', () => {
    currentTrack = (currentTrack - 1 + playlist.length) % playlist.length;
    loadTrack(currentTrack);
    if (isPlaying) playTrack();
  });

  nextBtn.addEventListener('click', () => {
    currentTrack = (currentTrack + 1) % playlist.length;
    loadTrack(currentTrack);
    if (isPlaying) playTrack();
  });

  audioPlayer.addEventListener('ended', () => {
    currentTrack = (currentTrack + 1) % playlist.length;
    loadTrack(currentTrack);
    playTrack();
  });

  muteBtn.addEventListener('click', () => {
    audioPlayer.muted = !audioPlayer.muted;
    volumeIcon.classList.toggle('fa-volume-up');
    volumeIcon.classList.toggle('fa-volume-mute');
  });

  volumeSlider.addEventListener('input', function() {
    audioPlayer.volume = this.value / 100;
    if (this.value == 0) {
      volumeIcon.classList.remove('fa-volume-up', 'fa-volume-down');
      volumeIcon.classList.add('fa-volume-mute');
    } else if (this.value < 50) {
      volumeIcon.classList.remove('fa-volume-up', 'fa-volume-mute');
      volumeIcon.classList.add('fa-volume-down');
    } else {
      volumeIcon.classList.remove('fa-volume-down', 'fa-volume-mute');
      volumeIcon.classList.add('fa-volume-up');
    }
  });

  audioPlayer.addEventListener('timeupdate', () => {
    if (audioPlayer.duration) {
      const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
      progress.style.width = percent + '%';
      currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
      durationEl.textContent = formatTime(audioPlayer.duration);
    }
  });

  progressBar.addEventListener('click', (e) => {
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioPlayer.currentTime = percent * audioPlayer.duration;
  });

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  loadTrack(0);
  audioPlayer.volume = 0.7;
}

document.addEventListener('DOMContentLoaded', function() {
  const pages = document.querySelectorAll('.document-page');
  const prevDocBtn = document.getElementById('prevDocBtn');
  const nextDocBtn = document.getElementById('nextDocBtn');
  const currentPageSpan = document.getElementById('currentDocPage');
  const totalPagesSpan = document.getElementById('totalDocPages');

  let currentPage = 1;
  const totalPages = pages.length;
  let isAnimating = false;

  if (totalPagesSpan) totalPagesSpan.textContent = totalPages;

  function updateUI() {
    if (prevDocBtn) prevDocBtn.disabled = currentPage === 1 || isAnimating;
    if (nextDocBtn) nextDocBtn.disabled = currentPage === totalPages || isAnimating;
    if (currentPageSpan) currentPageSpan.textContent = currentPage;
  }

  function restackPages() {
    pages.forEach((page, index) => {
      const pageNum = index + 1;
      page.classList.remove('read', 'toss-1', 'toss-2', 'toss-3', 'toss-4', 'return-1', 'return-2', 'return-3', 'return-4');

      if (pageNum < currentPage) {
        page.style.opacity = '0';
        page.style.pointerEvents = 'none';
        page.style.zIndex = '0';
      } else {
        page.style.pointerEvents = 'auto';
        const stackPosition = pageNum - currentPage;
        if (stackPosition === 0) {
          page.style.zIndex = '5'; page.style.transform = 'translateX(-50%) translateY(0px) rotate(0deg)'; page.style.opacity = '1';
        } else if (stackPosition === 1) {
          page.style.zIndex = '4'; page.style.transform = 'translateX(-50%) translateY(8px) rotate(-1deg)'; page.style.opacity = '0.95';
        } else if (stackPosition === 2) {
          page.style.zIndex = '3'; page.style.transform = 'translateX(-50%) translateY(16px) rotate(1.5deg)'; page.style.opacity = '0.9';
        } else if (stackPosition === 3) {
          page.style.zIndex = '2'; page.style.transform = 'translateX(-50%) translateY(24px) rotate(-0.8deg)'; page.style.opacity = '0.85';
        } else {
          page.style.zIndex = '1'; page.style.transform = 'translateX(-50%) translateY(32px) rotate(0.5deg)'; page.style.opacity = '0.8';
        }
      }
    });
  }

  function nextPage() {
    if (currentPage >= totalPages || isAnimating) return;
    isAnimating = true;
    updateUI();
    const currentPageEl = pages[currentPage - 1];
    const randomToss = Math.floor(Math.random() * 4) + 1;
    currentPageEl.classList.add(`toss-${randomToss}`, 'read');
    currentPageEl.style.zIndex = '10';
    setTimeout(() => { currentPage++; restackPages(); isAnimating = false; updateUI(); }, 900);
  }

  function prevPage() {
    if (currentPage === 1 || isAnimating) return;
    isAnimating = true;
    updateUI();
    currentPage--;
    const returningPageEl = pages[currentPage - 1];
    const randomReturn = Math.floor(Math.random() * 4) + 1;
    returningPageEl.style.opacity = '1';
    returningPageEl.style.pointerEvents = 'auto';
    returningPageEl.style.zIndex = '10';
    returningPageEl.classList.add(`return-${randomReturn}`);
    setTimeout(() => {
      returningPageEl.classList.remove(`return-${randomReturn}`);
      restackPages();
      isAnimating = false;
      updateUI();
    }, 900);
  }

  if (nextDocBtn) nextDocBtn.addEventListener('click', nextPage);
  if (prevDocBtn) prevDocBtn.addEventListener('click', prevPage);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') nextPage();
    else if (e.key === 'ArrowLeft') prevPage();
  });

  restackPages();
  updateUI();
});

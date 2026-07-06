//new app.js
let hlsInstance = null;

/* ---------------- PROVIDERS ---------------- */

const providers = [
  { name: "1 Vidsrc-emded ru", url: id => `https://vidsrc-embed.ru/embed/movie?tmdb=${id}` },
  { name: "2 Vidsrc-emded su ", url: id => `https://vidsrc-embed.su/embed/movie?tmdb=${id}` },
  { name: "3 Vidsrc.me", url: id => `https://vidsrc.me/movie?tmdb=${id}` },
  { name: "4 multiembed", url: id => `https://multiembed.mov/movie?tmdb=${id}` },
  { name: "5 Vidsrc.me/embed", url: id => `https://vidsrc.me/embed/movie?tmdb=${id}` },
  { name: "6 Vidsrc.vip", url: id => `https://vidsrc.vip/embed/movie?tmdb=${id}` },
  { name: "7", url: id => `https://vidlink.pro/movie/${id}`},
  { name: "9", url: id => `https://vidsrc.me/embed/movie?tmdb=${id}` },
  { name: "10", url: id => `https://vidsrc.xyz/embed/movie?tmdb=${id}` },
  { name: "11", url: id => `https://vidsrc.vip/embed/movie?tmdb=${id}` },
  { name: "12", url: id => `https://superembed.stream/embed/movie?tmdb=${id}` },
  { name: "13", url: id => `https://vidsrc.cc/embed/movie?tmdb=${id}` },
  { name: "14", url: id => `https://vidsrc.xyz/embed/movie?tmdb=${id}` },
  { name: "15", url: id => `https://vidsrc.cc/embed/movie?tmdb=${id}` },
  { name: "16", url: id => `https://vidsrc.to/embed/movie?tmdb=${id}` },
  { name: "17", url: id => `https://smashystream.com/play/movie/${id}` },
  { name: "18", url: id => `https://www.2embed.cc/embed/${id}` },
];

let fastestProviderIndex = 0;

/* ---------------- INIT ---------------- */

document.addEventListener("DOMContentLoaded", () => {
  // Filter out disabled movies
  if (movies) {
    movies = movies.filter(m => !m.disabled);
  }
  detectFastestProvider();
  displayAll();
});

/* ---------------- AUTO-DETECT FASTEST PROVIDER ---------------- */

function detectFastestProvider() {
  const testId = 550; // Fight Club
  const results = new Array(providers.length).fill(Infinity);
  let completed = 0;

  providers.forEach((providerFn, index) => {
    const url = providerFn.url(testId);
    const startTime = performance.now();

    const iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.style.display = "none";

    iframe.onload = () => {
      results[index] = performance.now() - startTime;
      cleanup();
      checkDone();
    };

    iframe.onerror = () => {
      results[index] = Infinity;
      cleanup();
      checkDone();
    };

    document.body.appendChild(iframe);

    function checkDone() {
      completed++;
      if (completed === providers.length) {
        const minTime = Math.min(...results);
        fastestProviderIndex = results.indexOf(minTime);
        if (minTime === Infinity) fastestProviderIndex = 0;
        console.log("Fastest provider:", providers[fastestProviderIndex].name);
        cleanup();
      }
    }

    function cleanup() {
      document.querySelectorAll("iframe").forEach(f => {
        if (f !== iframe) f.remove();
      });
    }
  });
}

/* ---------------- DISPLAY ALL ---------------- */

function displayAll() {
  const container = document.getElementById("mainContainer");
  container.innerHTML = "";

  const categories = [...new Set(movies.map(m => m.category))];

  categories.forEach(cat => {
    const section = document.createElement("div");
    section.innerHTML = `<h2>${cat}</h2>`;
    const grid = document.createElement("div");
    grid.className = "grid";

    if (cat === "MovieSet") {
      const sets = [...new Set(movies.filter(m => m.category === "MovieSet").map(m => m.set))];
      sets.forEach(setName => {
        const firstMovie = movies.find(m => m.set === setName);
        if (firstMovie) {
          const card = createCard(firstMovie, () => openSet(setName));
          grid.appendChild(card);
        }
      });
    } else {
      movies
        .filter(m => m.category === cat)
        .forEach(m => {
          grid.appendChild(createCard(m));
        });
    }

    section.appendChild(grid);
    container.appendChild(section);
  });
}

/* ---------------- OPEN SET ---------------- */

function openSet(setName) {
  const container = document.getElementById("mainContainer");
  container.innerHTML = `
    <h2>${setName}</h2>
    <button onclick="displayAll()">⬅ Back</button>
  `;

  const grid = document.createElement("div");
  grid.className = "grid";

  movies
    .filter(m => m.set === setName)
    .forEach(m => {
      grid.appendChild(createCard(m));
    });

  container.appendChild(grid);
}

/* ---------------- CREATE CARD ---------------- */

function createCard(movie, customClick) {
  const div = document.createElement("div");
  div.className = "movie";

  div.innerHTML = `
    <img src="${movie.img || ''}" onerror="this.style.display='none'">
    <div class="title">${movie.title || "No Title"}</div>
  `;

  div.onclick = customClick || (() => playMovie(movie));
  return div;
}

/* ---------------- PLAY MOVIE ---------------- */

function playMovie(movie) {
  if (!movie) {
    console.error("No movie supplied.");
    return;
  }

  const player = document.getElementById("player");
  const video = document.getElementById("videoPlayer");
  const frame = document.getElementById("frame");
  const closeBtn = document.getElementById("closeBtn");

  // Reset previous player state
  resetPlayer(video, frame);

  // Show the player container
  player.style.display = "flex";
  closeBtn.style.display = "block";

  // Remove previous children
  player.innerHTML = "";
  player.appendChild(closeBtn);

  // Add loading indicator
  const loading = document.createElement("div");
  loading.style.cssText = `
    width:100%;
    height:100%;
    display:flex;
    flex-direction:column;
    justify-content:center;
    align-items:center;
    background:#000;
    color:#fff;
  `;
  loading.innerHTML = `
    <div class="loader"></div>
    <div style="margin-top:15px;opacity:.7;">Loading...</div>
  `;
  player.appendChild(loading);

  // Handle video sources
  if (movie.video) {
    setTimeout(() => {
      loading.remove();
      player.appendChild(video);
      playVideo(movie.video, video);
    }, 100);
    return;
  }

  // Placeholder for iframe or other content
  if (movie.id) {
    setTimeout(() => {
      loading.remove();
      player.appendChild(frame);
      frame.src = ""; // Set your iframe source if available
      // For now, just log
      console.log("Load movie by ID:", movie.id);
    }, 100);
    return;
  }

  // No source available
  loading.innerHTML = `
    <div style="font-size:48px;">⚠️</div>
    <h2>No video available</h2>
    <p>This movie doesn't have a playable source.</p>
  `;
}

/* ---------------- PLAY VIDEO ---------------- */

function playVideo(url, video) {
  video.style.display = "block";

  if (url.endsWith(".mp4")) {
    video.src = url;
    video.play().catch(() => {});
    return;
  }

  if (url.endsWith(".m3u8")) {
    if (window.Hls && Hls.isSupported()) {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
      hlsInstance = new Hls();
      hlsInstance.loadSource(url);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.play().catch(() => {});
    } else {
      alert("Your browser doesn't support this stream format.");
    }
  }
}

/* ---------------- RESET PLAYER ---------------- */

function resetPlayer(video, frame) {
  // Destroy existing HLS instance if any
  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }
  // Stop video
  if (video) {
    video.pause();
    video.src = "";
  }
  // Clear iframe
  if (frame) {
    frame.src = "";
  }
}

/* ---------------- CLOSE PLAYER ---------------- */

function closePlayer() {
  const video = document.getElementById("videoPlayer");
  const frame = document.getElementById("frame");
  const player = document.getElementById("player");
  const closeBtn = document.getElementById("closeBtn");

  resetPlayer(video, frame);

  player.style.display = "none";

  // Restore the structure
  player.innerHTML = "";
  player.appendChild(closeBtn);
  player.appendChild(video);
  player.appendChild(frame);
}

/* ---------------- SEARCH ---------------- */

document.getElementById("search").addEventListener("input", function () {
  const val = this.value.toLowerCase().trim();
  const container = document.getElementById("mainContainer");

  container.innerHTML = "";

  if (!val) {
    displayAll();
    return;
  }

  const filtered = movies.filter(m =>
    (m.title || "").toLowerCase().includes(val)
  );

  const title = document.createElement("h2");
  title.textContent = "Search Results";
  container.appendChild(title);

  const grid = document.createElement("div");
  grid.className = "grid";

  filtered.forEach(m => grid.appendChild(createCard(m)));

  container.appendChild(grid);
});

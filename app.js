//12.20

let hlsInstance = null;

/* ---------------- PROVIDERS ---------------- */

const providers = [
  { name: "Vidsrc RU", tmdb: id => `https://vidsrc-embed.ru/embed/movie?tmdb=${id}` },
  { name: "Vidsrc SU", tmdb: id => `https://vidsrc-embed.su/embed/movie?tmdb=${id}` },
  { name: "Vidsrc.me", tmdb: id => `https://vidsrc.me/embed/movie?tmdb=${id}` },
  { name: "Multiembed", tmdb: id => `https://multiembed.mov/movie?tmdb=${id}` },
  { name: "Vidlink", tmdb: id => `https://vidlink.pro/movie/${id}` },
  { name: "Superembed", tmdb: id => `https://superembed.stream/embed/movie?tmdb=${id}` },
  { name: "2Embed", tmdb: id => `https://www.2embed.cc/embed/${id}` },

  // IMDb fallback provider
  { name: "Vidsrc IMDb", imdb: id => `https://vidsrc.me/embed/movie?imdb=${id}` },
];

let activeProviderIndex = 0;

/* ---------------- INIT ---------------- */

document.addEventListener("DOMContentLoaded", () => {
  if (typeof movies !== "undefined") {
    movies = movies.filter(m => !m.disabled);
  }

  createProviderSelector();
  displayAll();
});

/* ---------------- PROVIDER UI ---------------- */

function createProviderSelector() {
  const el = document.getElementById("providerSelector");
  if (!el) return;

  const select = document.createElement("select");

  providers.forEach((p, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = p.name;
    select.appendChild(opt);
  });

  select.value = activeProviderIndex;

  select.addEventListener("change", () => {
    activeProviderIndex = parseInt(select.value, 10);
  });

  el.appendChild(select);
}

/* ---------------- ROUTER (FIX CORE ISSUE) ---------------- */

function resolveStreamUrl(movie) {
  if (!movie) return null;

  // Local MP4 / HLS
  if (movie.video) return { type: "video", src: movie.video };

  const id = movie.id;

  if (!id) return null;

  // TMDB numeric ID
  if (/^\d+$/.test(id)) {
    const provider = providers[activeProviderIndex];
    if (provider.tmdb) {
      return { type: "iframe", src: provider.tmdb(id) };
    }
  }

  // IMDb ID
  if (id.startsWith("tt")) {
    const imdbProvider = providers.find(p => p.imdb);
    if (imdbProvider) {
      return { type: "iframe", src: imdbProvider.imdb(id) };
    }
  }

  return null;
}

/* ---------------- DISPLAY ---------------- */

function displayAll() {
  const container = document.getElementById("mainContainer");
  container.innerHTML = "";

  const categories = [...new Set(movies.map(m => m.category))];

  categories.forEach(cat => {
    const section = document.createElement("div");

    const title = document.createElement("h2");
    title.textContent = cat;

    const grid = document.createElement("div");
    grid.className = "grid";

    if (cat === "MovieSet") {
      const sets = [...new Set(movies.filter(m => m.category === "MovieSet").map(m => m.set))];

      sets.forEach(setName => {
        const first = movies.find(m => m.set === setName);
        if (first) {
          grid.appendChild(createCard(first, () => openSet(setName)));
        }
      });
    } else {
      movies.filter(m => m.category === cat)
        .forEach(m => grid.appendChild(createCard(m)));
    }

    section.appendChild(title);
    section.appendChild(grid);
    container.appendChild(section);
  });
}

/* ---------------- SET VIEW ---------------- */

function openSet(setName) {
  const container = document.getElementById("mainContainer");
  container.innerHTML = "";

  const title = document.createElement("h2");
  title.textContent = setName;

  const back = document.createElement("button");
  back.textContent = "⬅ Back";
  back.onclick = displayAll;

  const grid = document.createElement("div");
  grid.className = "grid";

  movies.filter(m => m.set === setName)
    .forEach(m => grid.appendChild(createCard(m)));

  container.appendChild(title);
  container.appendChild(back);
  container.appendChild(grid);
}

/* ---------------- CARD ---------------- */

function createCard(movie, customClick) {
  const div = document.createElement("div");
  div.className = "movie";

  const img = document.createElement("img");
  img.src = movie.img || "";
  img.onerror = () => (img.style.display = "none");

  const title = document.createElement("div");
  title.className = "title";
  title.textContent = movie.title || "No Title";

  div.appendChild(img);
  div.appendChild(title);

  div.onclick = customClick || (() => playMovie(movie));

  return div;
}

/* ---------------- PLAYER (FIX BLANK SCREEN ISSUE) ---------------- */

function playMovie(movie) {
  const player = document.getElementById("player");
  const video = document.getElementById("videoPlayer");
  const frame = document.getElementById("frame");
  const closeBtn = document.getElementById("closeBtn");

  resetPlayer(video, frame);

  player.style.display = "flex";
  player.innerHTML = "";
  player.appendChild(closeBtn);

  const loading = document.createElement("div");
  loading.style.cssText = `
    width:100%;
    height:100%;
    display:flex;
    justify-content:center;
    align-items:center;
    background:#000;
    color:#fff;
    flex-direction:column;
  `;
  loading.textContent = "Loading...";
  player.appendChild(loading);

  setTimeout(() => {
    const stream = resolveStreamUrl(movie);

    if (!stream) {
      loading.innerHTML = "❌ No playable source found";
      return;
    }

    loading.remove();

    if (stream.type === "video") {
      player.appendChild(video);
      playVideo(stream.src, video);
      return;
    }

    if (stream.type === "iframe") {
      player.appendChild(frame);
      frame.style.display = "block";
      frame.style.width = "100%";
      frame.style.height = "100%";
      frame.src = stream.src;
      return;
    }

    loading.innerHTML = "❌ Unsupported format";
  }, 200);
}

/* ---------------- VIDEO PLAYER ---------------- */

function playVideo(url, video) {
  video.style.display = "block";

  if (url.includes(".mp4")) {
    video.src = url;
    video.play().catch(() => {});
    return;
  }

  if (url.includes(".m3u8")) {
    if (window.Hls && Hls.isSupported()) {
      if (hlsInstance) hlsInstance.destroy();

      hlsInstance = new Hls();
      hlsInstance.loadSource(url);
      hlsInstance.attachMedia(video);

      hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.play().catch(() => {});
    }
  }
}

/* ---------------- RESET ---------------- */

function resetPlayer(video, frame) {
  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }

  if (video) {
    video.pause();
    video.src = "";
  }

  if (frame) {
    frame.src = "";
  }
}

/* ---------------- CLOSE ---------------- */

function closePlayer() {
  const player = document.getElementById("player");
  const video = document.getElementById("videoPlayer");
  const frame = document.getElementById("frame");
  const closeBtn = document.getElementById("closeBtn");

  resetPlayer(video, frame);

  player.style.display = "none";
  player.innerHTML = "";

  player.appendChild(closeBtn);
  player.appendChild(video);
  player.appendChild(frame);
}

/* ---------------- SEARCH ---------------- */

const search = document.getElementById("search");

if (search) {
  search.addEventListener("input", function () {
    const val = this.value.toLowerCase().trim();
    const container = document.getElementById("mainContainer");

    container.innerHTML = "";

    if (!val) return displayAll();

    const filtered = movies.filter(m =>
      (m.title || "").toLowerCase().includes(val)
    );

    const title = document.createElement("h2");
    title.textContent = "Search Results";

    const grid = document.createElement("div");
    grid.className = "grid";

    filtered.forEach(m => grid.appendChild(createCard(m)));

    container.appendChild(title);
    container.appendChild(grid);
  });
}

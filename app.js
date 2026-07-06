//12.10

let hlsInstance = null;

/* ---------------- PROVIDERS ---------------- */

const providers = [
  { name: "Vidsrc (ru)", url: id => `https://vidsrc-embed.ru/embed/movie?tmdb=${id}` },
  { name: "Vidsrc (su)", url: id => `https://vidsrc-embed.su/embed/movie?tmdb=${id}` },
  { name: "Vidsrc.me", url: id => `https://vidsrc.me/movie?tmdb=${id}` },
  { name: "Multiembed", url: id => `https://multiembed.mov/movie?tmdb=${id}` },
  { name: "Vidsrc.vip", url: id => `https://vidsrc.vip/embed/movie?tmdb=${id}` },
  { name: "Vidlink", url: id => `https://vidlink.pro/movie/${id}` },
  { name: "Superembed", url: id => `https://superembed.stream/embed/movie?tmdb=${id}` },
  { name: "2Embed", url: id => `https://www.2embed.cc/embed/${id}` },
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

/* ---------------- PROVIDER SELECTOR ---------------- */

function createProviderSelector() {
  const container = document.getElementById("providerSelector");
  if (!container) return;

  const select = document.createElement("select");

  providers.forEach((p, i) => {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = p.name;
    select.appendChild(option);
  });

  select.value = activeProviderIndex;

  select.addEventListener("change", () => {
    activeProviderIndex = parseInt(select.value, 10);
  });

  container.appendChild(select);
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
      movies
        .filter(m => m.category === cat)
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

  movies
    .filter(m => m.set === setName)
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

/* ---------------- PLAYER ---------------- */

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
  `;
  loading.textContent = "Loading...";
  player.appendChild(loading);

  setTimeout(() => {
    loading.remove();

    if (movie.video) {
      player.appendChild(video);
      playVideo(movie.video, video);
      return;
    }

    if (movie.id) {
      player.appendChild(frame);
      frame.src = providers[activeProviderIndex].url(movie.id);
      frame.style.display = "block";
      return;
    }

    loading.textContent = "No video available";
    player.appendChild(loading);
  }, 200);
}

/* ---------------- VIDEO ---------------- */

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

    if (!val) {
      displayAll();
      return;
    }

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

let hlsInstance = null;

/* ---------------- INIT ---------------- */

document.addEventListener("DOMContentLoaded", () => {
  if (typeof movies !== "undefined") {
    movies = movies.filter(m => !m.disabled);
  }

  displayAll();
});

/* ---------------- STREAM RESOLVER ---------------- */

function resolveStreamUrl(movie) {
  if (!movie) return null;

  // Local video
  if (movie.video) {
    return {
      type: "video",
      src: movie.video
    };
  }

  const id = movie.id;

  if (!id) return null;

  // TMDB ID
  if (/^\d+$/.test(id)) {
    return {
      type: "iframe",
      src: `https://vidsrc.me/embed/movie?tmdb=${id}`
    };
  }

  // IMDb ID
  if (id.startsWith("tt")) {
    return {
      type: "iframe",
      src: `https://vidsrc.me/embed/movie?imdb=${id}`
    };
  }

  return null;
}

/* ---------------- DISPLAY ---------------- */

function displayAll() {
  const container = document.getElementById("mainContainer");
  container.innerHTML = "";

  const categories = [...new Set(movies.map(m => m.category))];

  categories.forEach(category => {

    const section = document.createElement("div");

    const title = document.createElement("h2");
    title.textContent = category;

    const grid = document.createElement("div");
    grid.className = "grid";

    if (category === "MovieSet") {

      const sets = [...new Set(
        movies
          .filter(m => m.category === "MovieSet")
          .map(m => m.set)
      )];

      sets.forEach(setName => {

        const first = movies.find(m => m.set === setName);

        if (first) {
          grid.appendChild(createCard(first, () => openSet(setName)));
        }

      });

    } else {

      movies
        .filter(m => m.category === category)
        .forEach(movie => {
          grid.appendChild(createCard(movie));
        });

    }

    section.appendChild(title);
    section.appendChild(grid);

    container.appendChild(section);

  });
}

/* ---------------- MOVIE SET ---------------- */

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
    .forEach(movie => {
      grid.appendChild(createCard(movie));
    });

  container.appendChild(title);
  container.appendChild(back);
  container.appendChild(grid);
}

/* ---------------- CARD ---------------- */

function createCard(movie, customClick) {

  const card = document.createElement("div");
  card.className = "movie";

  const img = document.createElement("img");
  img.src = movie.img || "";
  img.onerror = () => img.style.display = "none";

  const title = document.createElement("div");
  title.className = "title";
  title.textContent = movie.title || "Untitled";

  card.appendChild(img);
  card.appendChild(title);

  card.onclick = customClick || (() => playMovie(movie));

  return card;
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

  const stream = resolveStreamUrl(movie);

  if (!stream) {

    const error = document.createElement("div");
    error.style.color = "#fff";
    error.textContent = "No playable source.";

    player.appendChild(error);

    return;
  }

  if (stream.type === "video") {

    player.appendChild(video);

    playVideo(stream.src, video);

    return;
  }

  player.appendChild(frame);

  frame.style.display = "block";
  frame.style.width = "100%";
  frame.style.height = "100%";
  frame.src = stream.src;
}

/* ---------------- VIDEO ---------------- */

function playVideo(url, video) {

  video.style.display = "block";

  if (url.endsWith(".mp4")) {

    video.src = url;

    video.play().catch(() => {});

    return;
  }

  if (url.includes(".m3u8")) {

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

    video.removeAttribute("src");

    video.load();
  }

  if (frame) {

    frame.removeAttribute("src");
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

    const value = this.value.toLowerCase().trim();

    if (!value) {
      displayAll();
      return;
    }

    const container = document.getElementById("mainContainer");

    container.innerHTML = "";

    const title = document.createElement("h2");
    title.textContent = "Search Results";

    const grid = document.createElement("div");
    grid.className = "grid";

    movies
      .filter(movie =>
        (movie.title || "")
          .toLowerCase()
          .includes(value)
      )
      .forEach(movie => {
        grid.appendChild(createCard(movie));
      });

    container.appendChild(title);
    container.appendChild(grid);

  });

}

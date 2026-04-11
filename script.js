const API_KEY = "b824da48e49048e6783eb8e6b585c7d9";
const IMG = "https://image.tmdb.org/t/p/w500";

const moviesContainer = document.getElementById("movies");
const searchInput = document.getElementById("search");

const player = document.getElementById("player");

const overlay = document.getElementById("overlay");
const overlayPlayer = document.getElementById("overlay-player");
const closeBtn = document.getElementById("close");
const fullscreenBtn = document.getElementById("fullscreen-btn");

let page = 1;
let loading = false;
let currentQuery = "";

/* ---------------- LOAD MOVIES (INFINITE) ---------------- */

async function loadMovies() {
  if (loading) return;
  loading = true;

  const url = currentQuery
    ? `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${currentQuery}&page=${page}`
    : `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&page=${page}`;

  const res = await fetch(url);
  const data = await res.json();

  renderMovies(data.results);

  loading = false;
}

function renderMovies(list) {
  list.forEach(movie => {
    if (!movie.poster_path) return;

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${IMG + movie.poster_path}">
      <p>${movie.title}</p>
    `;

    card.onclick = () => {
      player.src = `https://www.2embed.cc/embed/${movie.id}`;
    };

    moviesContainer.appendChild(card);
  });
}

/* ---------------- INFINITE SCROLL ---------------- */

window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
    page++;
    loadMovies();
  }
});

/* ---------------- SEARCH ---------------- */

searchInput.addEventListener("input", () => {
  moviesContainer.innerHTML = "";
  page = 1;
  currentQuery = searchInput.value;

  loadMovies();
});

/* ---------------- FULLSCREEN PLAYER ---------------- */

fullscreenBtn.onclick = () => {
  overlay.style.display = "flex";
  overlayPlayer.src = player.src;
};

closeBtn.onclick = () => {
  overlay.style.display = "none";
  overlayPlayer.src = "";
};

/* INIT */
loadMovies();

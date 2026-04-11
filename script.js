const API_KEY = "b824da48e49048e6783eb8e6b585c7d9";
const API_KEY = "YOUR_API_KEY_HERE";
const IMG = "https://image.tmdb.org/t/p/w500";

const moviesContainer = document.getElementById("movies");
const searchInput = document.getElementById("search");
const genreSelect = document.getElementById("genre");
const watchlistContainer = document.getElementById("watchlist");

const player = document.getElementById("player");

const loadMoreBtn = document.getElementById("load-more");

const overlay = document.getElementById("overlay");
const overlayPlayer = document.getElementById("overlay-player");
const closeBtn = document.getElementById("close");
const fullscreenBtn = document.getElementById("fullscreen-btn");

let currentMovies = [];
let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

let page = 1;

/* ---------------- FETCH MOVIES (PAGINATION) ---------------- */

async function loadMovies(pageNum = 1) {
  const res = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&page=${pageNum}`);
  const data = await res.json();

  currentMovies = [...currentMovies, ...data.results];
  displayMovies(currentMovies);
}

loadMovies();

/* ---------------- DISPLAY ---------------- */

function displayMovies(list) {
  moviesContainer.innerHTML = "";

  list.forEach(movie => {
    if (!movie.poster_path) return;

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${IMG + movie.poster_path}">
      <p>${movie.title}</p>
      <button class="heart">❤</button>
    `;

    card.onclick = (e) => {
      if (e.target.classList.contains("heart")) return;

      player.src = `https://www.2embed.cc/embed/${movie.id}`;
    };

    card.querySelector(".heart").onclick = (e) => {
      e.stopPropagation();
      toggleWatchlist(movie);
    };

    moviesContainer.appendChild(card);
  });
}

/* ---------------- LOAD MORE ---------------- */

loadMoreBtn.onclick = () => {
  page++;
  loadMovies(page);
};

/* ---------------- WATCHLIST ---------------- */

function toggleWatchlist(movie) {
  const exists = watchlist.find(m => m.id === movie.id);

  if (exists) {
    watchlist = watchlist.filter(m => m.id !== movie.id);
  } else {
    watchlist.push(movie);
  }

  localStorage.setItem("watchlist", JSON.stringify(watchlist));
  renderWatchlist();
}

function renderWatchlist() {
  watchlistContainer.innerHTML = "";

  watchlist.forEach(movie => {
    const item = document.createElement("div");
    item.className = "watch-item";
    item.innerText = movie.title;

    item.onclick = () => {
      player.src = `https://www.2embed.cc/embed/${movie.id}`;
    };

    watchlistContainer.appendChild(item);
  });
}

renderWatchlist();

/* ---------------- SEARCH ---------------- */

searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase();

  const filtered = currentMovies.filter(m =>
    m.title.toLowerCase().includes(q)
  );

  displayMovies(filtered);
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

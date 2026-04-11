const API_KEY = "b824da48e49048e6783eb8e6b585c7d9";
const IMG = "https://image.tmdb.org/t/p/w500";

const moviesContainer = document.getElementById("movies");
const searchInput = document.getElementById("search");
const genreSelect = document.getElementById("genre");
const watchlistContainer = document.getElementById("watchlist");

const player = document.getElementById("player");

let currentMovies = [];
let genres = [];

let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

/* ---------------- LOAD DATA ---------------- */

fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`)
  .then(res => res.json())
  .then(data => {
    currentMovies = data.results;
    displayMovies(currentMovies);
  });

fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`)
  .then(res => res.json())
  .then(data => {
    genres = data.genres;
    genres.forEach(g => {
      const opt = document.createElement("option");
      opt.value = g.id;
      opt.innerText = g.name;
      genreSelect.appendChild(opt);
    });
  });

/* ---------------- DISPLAY MOVIES ---------------- */

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

    /* PLAY INSIDE PAGE */
    card.onclick = (e) => {
      if (e.target.classList.contains("heart")) return;
      player.src = `https://www.2embed.cc/embed/${movie.id}`;
    };

    /* WATCHLIST */
    const heartBtn = card.querySelector(".heart");
    heartBtn.onclick = (e) => {
      e.stopPropagation();
      toggleWatchlist(movie);
    };

    moviesContainer.appendChild(card);
  });
}

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

  displayMovies(
    currentMovies.filter(m => m.title.toLowerCase().includes(q))
  );
});

/* ---------------- GENRE FILTER ---------------- */

genreSelect.addEventListener("change", () => {
  const id = genreSelect.value;

  if (!id) return displayMovies(currentMovies);

  displayMovies(
    currentMovies.filter(m => m.genre_ids.includes(Number(id)))
  );
});

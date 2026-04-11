const API_KEY = "b824da48e49048e6783eb8e6b585c7d9";
const API_KEY = "YOUR_API_KEY_HERE";
const IMG = "https://image.tmdb.org/t/p/w500";

const moviesContainer = document.getElementById("movies");
const searchInput = document.getElementById("search");
const genreSelect = document.getElementById("genre");

let currentMovies = [];
let genres = [];

// 🎬 Load Genres
fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`)
  .then(res => res.json())
  .then(data => {
    genres = data.genres;
    populateGenres();
  });

// 🎬 Load Movies
function loadMovies() {
  fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`)
    .then(res => res.json())
    .then(data => {
      currentMovies = data.results;
      displayMovies(currentMovies);
    });
}

// 🎯 Display Movies
function displayMovies(list) {
  moviesContainer.innerHTML = "";

  list.forEach(movie => {
    if (!movie.poster_path) return;

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${IMG + movie.poster_path}">
      <p>${movie.title}</p>
    `;

    card.onclick = () => {
      window.open(`https://www.2embed.cc/embed/${movie.id}`, "_blank");
    };

    moviesContainer.appendChild(card);
  });
}

// 🎯 Populate Genre Dropdown
function populateGenres() {
  genres.forEach(g => {
    const option = document.createElement("option");
    option.value = g.id;
    option.innerText = g.name;
    genreSelect.appendChild(option);
  });
}

// 🔍 Search
searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();

  const filtered = currentMovies.filter(m =>
    m.title.toLowerCase().includes(query)
  );

  displayMovies(filtered);
});

// 🎭 Filter by Genre
genreSelect.addEventListener("change", () => {
  const genreId = genreSelect.value;

  if (!genreId) {
    displayMovies(currentMovies);
    return;
  }

  const filtered = currentMovies.filter(m =>
    m.genre_ids.includes(Number(genreId))
  );

  displayMovies(filtered);
});

// 🚀 INIT
loadMovies();

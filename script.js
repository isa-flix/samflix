const API_KEY = "YOUR_API_KEY_HERE";
const IMG = "https://image.tmdb.org/t/p/w500";

const player = document.getElementById("player");
const trendingContainer = document.getElementById("trending");
const resultsContainer = document.getElementById("results");
const searchInput = document.getElementById("search");

// Load Trending Movies
fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}`)
  .then(res => res.json())
  .then(data => showMovies(data.results, trendingContainer));

// Show Movies
function showMovies(movies, container) {
  container.innerHTML = "";

  movies.forEach(movie => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${IMG + movie.poster_path}">
      <p>${movie.title}</p>
    `;

    card.onclick = () => {
      player.src = `https://www.2embed.cc/embed/${movie.id}`;
    };

    container.appendChild(card);
  });
}

// Search
searchInput.addEventListener("input", () => {
  const query = searchInput.value;

  if (query.length < 3) return;

  fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}`)
    .then(res => res.json())
    .then(data => showMovies(data.results, resultsContainer));
});

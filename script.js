const API_KEY = "b824da48e49048e6783eb8e6b585c7d9";
const IMG = "https://image.tmdb.org/t/p/w500";

const player = document.getElementById("player");
const trendingContainer = document.getElementById("trending");
const resultsContainer = document.getElementById("results");

const searchInput = document.getElementById("search");

// 🔥 Load Trending Movies
fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}`)
  .then(res => res.json())
  .then(data => showMovies(data.results, trendingContainer));

// 🔥 Load Trending TV Shows
fetch(`https://api.themoviedb.org/3/trending/tv/week?api_key=${API_KEY}`)
  .then(res => res.json())
  .then(data => showTV(data.results));

// 🎬 Show Movies
function showMovies(movies, container) {
  container.innerHTML = "";

  movies.forEach(movie => {
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

    container.appendChild(card);
  });
}

// 📺 Show TV Shows
function showTV(shows) {
  const section = document.createElement("div");
  section.innerHTML = "<h2>TV Shows</h2>";
  
  const row = document.createElement("div");
  row.className = "row";

  shows.forEach(show => {
    if (!show.poster_path) return;

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${IMG + show.poster_path}">
      <p>${show.name}</p>
    `;

    card.onclick = () => loadSeasons(show.id);

    row.appendChild(card);
  });

  section.appendChild(row);
  document.body.appendChild(section);
}

// 🎯 Load Seasons
function loadSeasons(showId) {
  fetch(`https://api.themoviedb.org/3/tv/${showId}?api_key=${API_KEY}`)
    .then(res => res.json())
    .then(data => {
      const seasons = data.seasons;
      showSeasonButtons(showId, seasons);
    });
}

// 🎯 Show Season Buttons
function showSeasonButtons(showId, seasons) {
  resultsContainer.innerHTML = "<h3>Seasons</h3>";

  seasons.forEach(season => {
    if (season.season_number === 0) return;

    const btn = document.createElement("div");
    btn.className = "episode-btn";
    btn.innerText = "Season " + season.season_number;

    btn.onclick = () => loadEpisodes(showId, season.season_number);

    resultsContainer.appendChild(btn);
  });
}

// 🎯 Load Episodes
function loadEpisodes(showId, seasonNumber) {
  fetch(`https://api.themoviedb.org/3/tv/${showId}/season/${seasonNumber}?api_key=${API_KEY}`)
    .then(res => res.json())
    .then(data => {
      showEpisodes(showId, seasonNumber, data.episodes);
    });
}

// 🎯 Show Episodes
function showEpisodes(showId, seasonNumber, episodes) {
  resultsContainer.innerHTML = "<h3>Episodes</h3>";

  episodes.forEach(ep => {
    const btn = document.createElement("div");
    btn.className = "episode-btn";
    btn.innerText = ep.name;

    btn.onclick = () => {
      player.src = `https://www.2embed.cc/embed/tmdb/tv?id=${showId}&s=${seasonNumber}&e=${ep.episode_number}`;
    };

    resultsContainer.appendChild(btn);
  });
}

// 🔍 Search (Movies + TV)
searchInput.addEventListener("input", () => {
  const query = searchInput.value;

  if (query.length < 3) return;

  fetch(`https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${query}`)
    .then(res => res.json())
    .then(data => showSearch(data.results));
});

// 🔍 Show Search Results
function showSearch(results) {
  resultsContainer.innerHTML = "";

  results.forEach(item => {
    if (!item.poster_path) return;

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${IMG + item.poster_path}">
      <p>${item.title || item.name}</p>
    `;

    card.onclick = () => {
      if (item.media_type === "movie") {
        player.src = `https://www.2embed.cc/embed/${item.id}`;
      } else {
        loadSeasons(item.id);
      }
    };

    resultsContainer.appendChild(card);
  });
}

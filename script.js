const player = document.getElementById("player");
const moviesContainer = document.getElementById("movies");
const seriesContainer = document.getElementById("series");
const episodesContainer = document.getElementById("episodes");

// Fetch JSON
fetch("data.json")
  .then(res => res.json())
  .then(data => {
    loadMovies(data.movies);
    loadSeries(data.series);
  });

function loadMovies(movies) {
  movies.forEach(movie => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${movie.img}">
      <p>${movie.title}</p>
    `;

    card.onclick = () => {
      player.src = `https://www.2embed.cc/embed/${movie.id}`;
      episodesContainer.innerHTML = "";
    };

    moviesContainer.appendChild(card);
  });
}

function loadSeries(series) {
  series.forEach(show => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${show.img}">
      <p>${show.title}</p>
    `;

    card.onclick = () => {
      loadEpisodes(show.episodes);
    };

    seriesContainer.appendChild(card);
  });
}

function loadEpisodes(episodes) {
  episodesContainer.innerHTML = "<h3>Episodes</h3>";

  episodes.forEach((ep, index) => {
    const btn = document.createElement("div");
    btn.className = "episode-btn";
    btn.innerText = "Episode " + (index + 1);

    btn.onclick = () => {
      player.src = `https://www.2embed.cc/embed/${ep}`;
    };

    episodesContainer.appendChild(btn);
  });
}

const API_KEY = "b824da48e49048e6783eb8e6b585c7d9";
const IMG = "https://image.tmdb.org/t/p/original";

const player = document.getElementById("player");
const hero = document.getElementById("hero");
const heroTitle = document.getElementById("hero-title");
const heroDesc = document.getElementById("hero-desc");
const playBtn = document.getElementById("play-btn");

const trending = document.getElementById("trending");
const moviesRow = document.getElementById("movies");
const tvRow = document.getElementById("tv");
const results = document.getElementById("results");

const search = document.getElementById("search");

let currentHeroId = null;

// 🎬 HERO + TRENDING
fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}`)
  .then(res => res.json())
  .then(data => {
    setHero(data.results[0]);
    show(data.results, trending);
  });

// 🎬 MOVIES
fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`)
  .then(res => res.json())
  .then(data => show(data.results, moviesRow));

// 📺 TV
fetch(`https://api.themoviedb.org/3/tv/popular?api_key=${API_KEY}`)
  .then(res => res.json())
  .then(data => showTV(data.results));

// 🎯 SET HERO
function setHero(movie) {
  hero.style.backgroundImage = `url(${IMG + movie.backdrop_path})`;
  heroTitle.innerText = movie.title;
  heroDesc.innerText = movie.overview;
  currentHeroId = movie.id;
}

// ▶ PLAY HERO
playBtn.onclick = () => {
  player.src = `https://www.2embed.cc/embed/${currentHeroId}`;
};

// 🎬 SHOW MOVIES
function show(list, container) {
  container.innerHTML = "";

  list.forEach(item => {
    if (!item.poster_path) return;

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `<img src="${IMG + item.poster_path}">`;

    card.onclick = () => {
      setHero(item);
      player.src = `https://www.2embed.cc/embed/${item.id}`;
    };

    container.appendChild(card);
  });
}

// 📺 SHOW TV
function showTV(list) {
  tvRow.innerHTML = "";

  list.forEach(show => {
    if (!show.poster_path) return;

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `<img src="${IMG + show.poster_path}">`;

    card.onclick = () => loadSeasons(show.id);

    tvRow.appendChild(card);
  });
}

// 📺 LOAD SEASONS
function loadSeasons(id) {
  fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}`)
    .then(res => res.json())
    .then(data => {
      results.innerHTML = "<h3>Seasons</h3>";

      data.seasons.forEach(s => {
        if (s.season_number === 0) return;

        const btn = document.createElement("div");
        btn.className = "card";
        btn.innerText = "Season " + s.season_number;

        btn.onclick = () => loadEpisodes(id, s.season_number);

        results.appendChild(btn);
      });
    });
}

// 📺 LOAD EPISODES
function loadEpisodes(id, season) {
  fetch(`https://api.themoviedb.org/3/tv/${id}/season/${season}?api_key=${API_KEY}`)
    .then(res => res.json())
    .then(data => {
      results.innerHTML = "<h3>Episodes</h3>";

      data.episodes.forEach(ep => {
        const btn = document.createElement("div");
        btn.className = "card";
        btn.innerText = ep.name;

        btn.onclick = () => {
          player.src = `https://www.2embed.cc/embed/tmdb/tv?id=${id}&s=${season}&e=${ep.episode_number}`;
        };

        results.appendChild(btn);
      });
    });
}

// 🔍 SEARCH
search.addEventListener("input", () => {
  const q = search.value;

  if (q.length < 3) return;

  fetch(`https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${q}`)
    .then(res => res.json())
    .then(data => {
      results.innerHTML = "";
      show(data.results, results);
    });
});

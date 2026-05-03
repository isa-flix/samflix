/* ---------------- CONFIG ---------------- */
const API_KEY = "b824da48e49048e6783eb8e6b585c7d9";

/* ---------------- STORAGE ---------------- */
let moviesList = JSON.parse(localStorage.getItem("movies")) || [];
let seriesList = JSON.parse(localStorage.getItem("series")) || [];

let current = {};

/* ---------------- HELPERS ---------------- */
function extractIMDB(input) {
    let match = input.match(/tt\d+/);
    return match ? match[0] : null;
}

async function getTMDBfromIMDB(imdb_id, type="movie") {
    let url = `https://api.themoviedb.org/3/find/${imdb_id}?api_key=${API_KEY}&external_source=imdb_id`;
    let res = await fetch(url);
    let data = await res.json();

    return type === "movie"
        ? data.movie_results[0]
        : data.tv_results[0];
}

/* ---------------- HOME ---------------- */
function showHome() {
    document.getElementById("app").innerHTML = `
        <div class="grid">
            <button onclick="showMovies()">🎬 Movies</button>
            <button onclick="showSeries()">📺 Series</button>
            <button onclick="showAdmin()">⚙️ Admin</button>
        </div>
    `;
}

/* ---------------- MOVIES ---------------- */
function showMovies() {
    let html = '<div class="grid">';
    moviesList.forEach(m => {
        html += `
            <div class="card" onclick="playMovie('${m.id}')">
                <img src="${m.img}">
                <p>${m.title}</p>
            </div>
        `;
    });
    html += '</div>';
    document.getElementById("app").innerHTML = html;
}

function playMovie(id) {
    let m = moviesList.find(x => x.id === id);

    document.getElementById("app").innerHTML = `
        <button onclick="showMovies()">⬅ Back</button>
        <h2>${m.title}</h2>
        <iframe src="https://www.2embed.cc/embed/${m.tmdb_id}" allowfullscreen></iframe>
    `;
}

/* ---------------- SERIES ---------------- */
function showSeries() {
    let html = '<div class="grid">';
    seriesList.forEach(s => {
        html += `
            <div class="card" onclick="openSeries('${s.id}')">
                <img src="${s.img}">
                <p>${s.title}</p>
            </div>
        `;
    });
    html += '</div>';
    document.getElementById("app").innerHTML = html;
}

function openSeries(id) {
    let s = seriesList.find(x => x.id === id);
    current = { id, season: 1, episode: 1 };

    document.getElementById("app").innerHTML = `
        <button onclick="showSeries()">⬅ Back</button>
        <h2>${s.title}</h2>
        <select onchange="changeSeason('${id}', this.value)">
            ${s.seasons.map(se => `<option value="${se.season}">Season ${se.season}</option>`).join("")}
        </select>
        <div id="episodes"></div>
        <div id="player"></div>
    `;

    renderEpisodes(s);
    playEpisode(1,1);
}

function renderEpisodes(s) {
    let seasonData = s.seasons.find(x => x.season == current.season);

    let html = '<div class="episode-grid">';
    for (let i=1;i<=seasonData.episodes;i++) {
        html += `<div class="ep-btn" onclick="playEpisode(${current.season},${i})">E${i}</div>`;
    }
    html += '</div>';

    document.getElementById("episodes").innerHTML = html;
}

function changeSeason(id, season) {
    current.season = parseInt(season);
    let s = seriesList.find(x => x.id === id);
    renderEpisodes(s);
}

function playEpisode(season, episode) {
    current.season = season;
    current.episode = episode;

    let s = seriesList.find(x => x.id === current.id);

    document.getElementById("player").innerHTML = `
        <iframe src="https://www.2embed.cc/embedtv/${s.tmdb_id}&s=${season}&e=${episode}" allowfullscreen></iframe>
    `;
}

/* ---------------- ADMIN ---------------- */
function showAdmin() {
    document.getElementById("app").innerHTML = `
        <div class="admin">
            <h2>Add Content</h2>

            <select id="type">
                <option value="movie">Movie</option>
                <option value="tv">Series</option>
            </select>

            <input id="imdb" placeholder="Paste IMDb link or ID (tt1234567)">
            <input id="seasons" placeholder="Seasons (for series, e.g. 1:8,2:10)">

            <button onclick="addContent()">Add</button>
        </div>
    `;
}

async function addContent() {
    let type = document.getElementById("type").value;
    let imdbInput = document.getElementById("imdb").value;
    let seasonsInput = document.getElementById("seasons").value;

    let imdb = extractIMDB(imdbInput);

    if (!imdb) {
        alert("Invalid IMDb ID");
        return;
    }

    let data = await getTMDBfromIMDB(imdb, type);

    if (!data) {
        alert("Not found");
        return;
    }

    let item = {
        id: data.id,
        title: data.title || data.name,
        img: `https://image.tmdb.org/t/p/w500${data.poster_path}`,
        tmdb_id: data.id
    };

    if (type === "movie") {
        moviesList.push(item);
        localStorage.setItem("movies", JSON.stringify(moviesList));
        alert("Movie added!");
    } else {
        let seasons = seasonsInput.split(",").map(s => {
            let [season, eps] = s.split(":");
            return { season: parseInt(season), episodes: parseInt(eps) };
        });

        item.seasons = seasons;

        seriesList.push(item);
        localStorage.setItem("series", JSON.stringify(seriesList));
        alert("Series added!");
    }
}

/* INIT */
showHome();

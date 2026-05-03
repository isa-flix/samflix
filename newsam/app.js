/* ---------------- MOVIES ---------------- */
let moviesList = [
    {
        id: "inception",
        title: "Inception",
        img: "https://image.tmdb.org/t/p/w600_and_h900_face/qmDpIHrmpJINaRKAfWQfftjCdyi.jpg",
        tmdb_id: "27205"
    },
    {
        id: "john_wick",
        title: "John Wick",
        img: "https://image.tmdb.org/t/p/w600_and_h900_face/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg",
        tmdb_id: "245891"
    }
];

/* ---------------- SERIES ---------------- */
let seriesList = [
    {
        id: "stranger_things",
        title: "Stranger Things",
        img: "https://www.themoviedb.org/t/p/w600_and_h900_face/cVxVGwHce6xnW8UaVUggaPXbmoE.jpg",
        tmdb_id: "66732",
        seasons: [
            { season: 1, episodes: 8 },
            { season: 2, episodes: 9 },
            { season: 3, episodes: 8 },
            { season: 4, episodes: 9 }
        ]
    },
    {
        id: "breaking_bad",
        title: "Breaking Bad",
        img: "https://www.themoviedb.org/t/p/w600_and_h900_face/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg",
        tmdb_id: "1396",
        seasons: [
            { season: 1, episodes: 7 },
            { season: 2, episodes: 13 },
            { season: 3, episodes: 13 },
            { season: 4, episodes: 13 },
            { season: 5, episodes: 16 }
        ]
    }
];

let current = {};

/* ---------------- HOME ---------------- */
function showHome() {
    document.getElementById("app").innerHTML = `
        <div class="home">
            <button onclick="showMovies()">🎬 Movies</button>
            <button onclick="showSeries()">📺 Series</button>
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

        <div id="player">
            <iframe src="https://www.2embed.cc/embed/${m.tmdb_id}" allowfullscreen></iframe>
        </div>
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

    current = { id: id, season: 1, episode: 1 };

    let saved = JSON.parse(localStorage.getItem(id));
    if (saved) current = saved;

    let html = `
        <button onclick="showSeries()">⬅ Back</button>
        <h2>${s.title}</h2>

        Season:
        <select onchange="changeSeason('${id}', this.value)">
    `;

    s.seasons.forEach(se => {
        html += `<option value="${se.season}" ${se.season == current.season ? "selected":""}>
            Season ${se.season}
        </option>`;
    });

    html += `</select>`;
    html += `<div id="episodes"></div><div id="player"></div>`;

    document.getElementById("app").innerHTML = html;

    renderEpisodes(s);
    playEpisode(current.season, current.episode);
}

function renderEpisodes(s) {
    let seasonData = s.seasons.find(x => x.season == current.season);

    let html = `<div class="episode-grid">`;

    for (let ep = 1; ep <= seasonData.episodes; ep++) {
        html += `
            <div class="ep-btn ${ep == current.episode ? "active":""}"
                onclick="playEpisode(${current.season}, ${ep})">
                S${current.season}E${ep}
            </div>
        `;
    }

    html += `</div>`;
    document.getElementById("episodes").innerHTML = html;
}

function changeSeason(id, season) {
    current.season = parseInt(season);
    current.episode = 1;

    let s = seriesList.find(x => x.id === id);
    renderEpisodes(s);
}

function playEpisode(season, episode) {
    current.season = season;
    current.episode = episode;

    let s = seriesList.find(x => x.id === current.id);

    localStorage.setItem(current.id, JSON.stringify(current));

    renderEpisodes(s);

    let url = `https://www.2embed.cc/embedtv/${s.tmdb_id}&s=${season}&e=${episode}`;

    document.getElementById("player").innerHTML = `
        <iframe src="${url}" allowfullscreen></iframe>
    `;

    document.getElementById("player").scrollIntoView({ behavior: "smooth" });
}

/* INIT */
showHome();


let current = {};

/* HOME */
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

/* OPEN SERIES */
function openSeries(id) {
    let s = seriesList.find(x => x.id === id);

    current = { id: id, season: 1, episode: 1 };

    let saved = JSON.parse(localStorage.getItem(id));
    if (saved) current = saved;

    let html = `
        <button onclick="showSeries()">⬅ Back</button>
        <h2>${s.title}</h2>

        <div class="controls">
            Season:
            <select onchange="changeSeason('${id}', this.value)">
    `;

    s.seasons.forEach(se => {
        html += `<option value="${se.season}" ${se.season == current.season ? "selected":""}>
            Season ${se.season}
        </option>`;
    });

    html += `</select></div>`;
    html += `<div id="episodes"></div><div id="player"></div>`;

    document.getElementById("app").innerHTML = html;

    renderEpisodes(s);
    playEpisode(current.season, current.episode);
}

/* EPISODES */
function renderEpisodes(s) {
    let seasonData = s.seasons.find(x => x.season == current.season);

    let html = `<div class="episode-grid">`;

    for (let ep = 1; ep <= seasonData.episodes; ep++) {
        let thumb = `https://image.tmdb.org/t/p/w300/${s.tmdb_id}_S${current.season}_E${ep}.jpg`;

        html += `
            <div class="ep-btn ${ep == current.episode ? "active":""}"
            onclick="playEpisode(${current.season}, ${ep})">
                <img src="${thumb}" onerror="this.style.display='none'">
                S${current.season}E${ep}
            </div>
        `;
    }

    html += `</div>`;
    document.getElementById("episodes").innerHTML = html;
}

/* CHANGE SEASON */
function changeSeason(id, season) {
    current.season = parseInt(season);
    current.episode = 1;

    let s = seriesList.find(x => x.id === id);
    renderEpisodes(s);
}

/* PLAY EPISODE */
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
showSeries();

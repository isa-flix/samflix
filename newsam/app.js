let current = {};

/* HOME  22aug26 4:18*/
function showSeries() {
    const html = `
        <div class="grid">
            ${seriesList.map(s => `
                <div class="card" onclick="openSeries('${s.id}')">
                    <img src="${s.img}">
                    <p>${s.title}</p>
                </div>
            `).join("")}
        </div>
    `;

    document.getElementById("app").innerHTML = html;
}

/* OPEN SERIES */
function openSeries(id) {
    const s = seriesList.find(x => x.id === id);

    current = { id, season: 1, episode: 1 };

    const saved = JSON.parse(localStorage.getItem(id));
    if (saved) current = saved;

    const seasonOptions = s.seasons.map(se => `
        <option value="${se.season}" ${se.season == current.season ? "selected" : ""}>
            Season ${se.season}
        </option>
    `).join("");

    const html = `
        <button onclick="showSeries()">⬅ Back</button>
        <h2>${s.title}</h2>

        <div class="controls">
            Season:
            <select onchange="changeSeason('${id}', this.value)">
                ${seasonOptions}
            </select>
        </div>

        <div id="episodes"></div>
        <div id="player"></div>
    `;

    document.getElementById("app").innerHTML = html;

    renderEpisodes(s);
    playEpisode(current.season, current.episode);
}

/* EPISODES */
function renderEpisodes(s) {
    const seasonData = s.seasons.find(x => x.season == current.season);

    const html = `
        <div class="episode-grid">
            ${Array.from({ length: seasonData.episodes }, (_, i) => {
                const ep = i + 1;
                const thumb = `https://image.tmdb.org/t/p/w300/${s.tmdb_id}_S${current.season}_E${ep}.jpg`;

                return `
                    <div class="ep-btn ${ep == current.episode ? "active" : ""}"
                        onclick="playEpisode(${current.season}, ${ep})">
                        <img src="${thumb}" onerror="this.style.display='none'">
                        S${current.season}E${ep}
                    </div>
                `;
            }).join("")}
        </div>
    `;

    document.getElementById("episodes").innerHTML = html;
}

/* CHANGE SEASON */
function changeSeason(id, season) {
    current.season = parseInt(season);
    current.episode = 1;

    const s = seriesList.find(x => x.id === id);
    renderEpisodes(s);
}

/* PLAY EPISODE */
function playEpisode(season, episode) {
    current.season = season;
    current.episode = episode;

    const s = seriesList.find(x => x.id === current.id);

    localStorage.setItem(current.id, JSON.stringify(current));

    renderEpisodes(s);

    // FIXED WORKING URL
    const url = `https://vidsrc.cc/v2/embed/tv?tmdb=${s.tmdb_id}&season=${season}&episode=${episode}`;

    document.getElementById("player").innerHTML = `
        <iframe src="${url}" allowfullscreen></iframe>
    `;

    document.getElementById("player").scrollIntoView({ behavior: "smooth" });
}

/* INIT */
showSeries();

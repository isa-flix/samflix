let current = {
    provider: "vidsrc" // default provider
};

/* PROVIDER URL BUILDER */
function getProviderURL(s, season, episode) {
    switch (current.provider) {

        case "vidsrc":
            return `https://vidsrc.cc/v2/embed/tv?tmdb=${s.tmdb_id}&season=${season}&episode=${episode}`;

        case "smashy":
            return `https://player.smashy.stream/tv/${s.tmdb_id}/${season}/${episode}`;

        case "vidbinge":
            return `https://vidbinge.dev/embed/tv?tmdb=${s.tmdb_id}&season=${season}&episode=${episode}`;

        case "moviehab":
            return `https://moviehab.com/embed/tv?tmdb=${s.tmdb_id}&season=${season}&episode=${episode}`;

        default:
            return "";
    }
}

/* AUTO FALLBACK */
function autoFallback() {
    const providers = ["vidsrc", "smashy", "vidbinge", "moviehab"];
    let index = providers.indexOf(current.provider);

    if (index < providers.length - 1) {
        current.provider = providers[index + 1];
        playEpisode(current.season, current.episode);
    }
}

/* CHANGE PROVIDER */
function changeProvider(p) {
    current.provider = p;
    playEpisode(current.season, current.episode);
}

/* HOME */
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

    current.id = id;
    current.season = 1;
    current.episode = 1;

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

        <div class="controls">
            Provider:
            <select onchange="changeProvider(this.value)">
                <option value="vidsrc">Vidsrc</option>
                <option value="smashy">Smashy</option>
                <option value="vidbinge">Vidbinge</option>
                <option value="moviehab">MovieHab</option>
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

    const url = getProviderURL(s, season, episode);

    document.getElementById("player").innerHTML = `
        <iframe src="${url}" allowfullscreen onerror="autoFallback()"></iframe>
    `;

    document.getElementById("player").scrollIntoView({ behavior: "smooth" });
}

/* INIT */
showSeries();

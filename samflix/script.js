let movies = [];
let series = [];

fetch('data.json')
  .then(res => res.json())
  .then(data => {
    movies = data.movies;
    series = data.series;
    displayAll();
  });

// Display content
function displayAll(filter = '') {
    const container = document.getElementById("mainContainer");
    container.innerHTML = "";

    // Filter function
    const filterFunc = (item) => item.title.toLowerCase().includes(filter.toLowerCase());

    // Movies
    const filteredMovies = movies.filter(filterFunc);
    const moviesTitle = document.createElement("h2");
    moviesTitle.innerText = "Movies";
    container.appendChild(moviesTitle);

    const movieGrid = document.createElement("div");
    movieGrid.classList.add("grid");
    filteredMovies.forEach(m => movieGrid.appendChild(createCard(m, false)));
    container.appendChild(movieGrid);

    // Series
    const filteredSeries = series.filter(filterFunc);
    const seriesTitle = document.createElement("h2");
    seriesTitle.innerText = "Series";
    container.appendChild(seriesTitle);

    const seriesGrid = document.createElement("div");
    seriesGrid.classList.add("grid");
    filteredSeries.forEach(s => seriesGrid.appendChild(createCard(s, true)));
    container.appendChild(seriesGrid);
}

// Create card
function createCard(item, isSeries) {
    const div = document.createElement("div");
    div.classList.add("movie");
    div.innerHTML = `<img src="${item.img}"><div class="title">${item.title}</div>`;
    div.onclick = () => isSeries ? openSelector(item) : playMovie(item.id);
    return div;
}

// Play movie
function playMovie(id) {
    showPlayer(`https://www.2embed.cc/embed/${id}`);
}

// Series selector
function openSelector(show) {
    const player = document.getElementById("player");
    player.style.display = "flex";

    const oldUI = document.getElementById("selectorUI");
    if (oldUI) oldUI.remove();

    const selectorUI = document.createElement("div");
    selectorUI.id = "selectorUI";
    selectorUI.innerHTML = `
        <h3>${show.title}</h3>
        <label>Season:</label><select id="season"></select>
        <br><br>
        <label>Episode:</label><select id="episode"></select>
        <br><br>
        <button id="playBtn">▶ Play</button>
    `;
    document.body.appendChild(selectorUI);

    const seasonSelect = document.getElementById("season");
    const episodeSelect = document.getElementById("episode");
    const playBtn = document.getElementById("playBtn");

    show.seasons.forEach(s => seasonSelect.innerHTML += `<option value="${s.number}">Season ${s.number}</option>`);

    updateEpisodes(show, show.seasons[0].number);

    seasonSelect.onchange = () => updateEpisodes(show, parseInt(seasonSelect.value));

    playBtn.onclick = () => {
        const season = seasonSelect.value;
        const episode = episodeSelect.value;
        selectorUI.remove();
        showPlayer(`https://www.2embed.cc/embed/tv?id=${show.id}&s=${season}&e=${episode}`);
    };
}

// Update episodes
function updateEpisodes(show, seasonNumber) {
    const epSelect = document.getElementById("episode");
    epSelect.innerHTML = "";
    const season = show.seasons.find(s => s.number === seasonNumber);
    for (let i = 1; i <= season.episodes; i++) {
        epSelect.innerHTML += `<option value="${i}">Episode ${i}</option>`;
    }
}

// Show player
function showPlayer(src) {
    const player = document.getElementById("player");
    const frame = document.getElementById("frame");
    frame.src = src;
    player.style.display = "flex";
}

// Close player
function closePlayer() {
    document.getElementById("player").style.display = "none";
    document.getElementById("frame").src = "";
    const ui = document.getElementById("selectorUI");
    if (ui) ui.remove();
}

// 🔍 Search functionality
const searchInput = document.getElementById("search");
searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim();
    displayAll(query);
});
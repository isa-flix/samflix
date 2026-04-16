let movies = [];

fetch("data.json")
.then(res => res.json())
.then(data => {
    movies = data.filter(m=> m.disabled !=== true);
    displayAll();
});

/* ---------------- UI ---------------- */

function displayAll() {
    const container = document.getElementById("mainContainer");
    container.innerHTML = "";

    const categories = [...new Set(movies.map(m => m.category))];

    categories.forEach(cat => {

        const section = document.createElement("div");
        section.innerHTML = `<h2>${cat}</h2>`;

        const grid = document.createElement("div");
        grid.className = "grid";

        movies.filter(m => m.category === cat)
        .forEach(m => grid.appendChild(createCard(m)));

        section.appendChild(grid);
        container.appendChild(section);
    });
}

/* ---------------- CARD ---------------- */

function createCard(movie) {
    const div = document.createElement("div");
    div.className = "movie";

    div.innerHTML = `
        <img src="${movie.img}">
        <div class="title">${movie.title}</div>
    `;

    div.onclick = () => playMovie(movie);
    return div;
}

/* ---------------- PLAYER ---------------- */

function playMovie(movie) {
    const video = document.getElementById("videoPlayer");
    const frame = document.getElementById("frame");

    video.pause();
    video.src = "";
    frame.src = "";

    video.style.display = "none";
    frame.style.display = "none";

    if (movie.video) {

        if (movie.video.endsWith(".mp4")) {
            video.src = movie.video;
            video.style.display = "block";
            video.play();
        }

        else if (movie.video.endsWith(".m3u8")) {
            video.style.display = "block";

            if (Hls.isSupported()) {
                const hls = new Hls();
                hls.loadSource(movie.video);
                hls.attachMedia(video);
            } else {
                video.src = movie.video;
            }
        }

    } else {
        frame.src = `https://www.2embed.cc/embed/${movie.id}`;
        frame.style.display = "block";
    }

    document.getElementById("player").style.display = "flex";
}

/* ---------------- CLOSE ---------------- */

function closePlayer() {
    const video = document.getElementById("videoPlayer");
    const frame = document.getElementById("frame");

    video.pause();
    video.src = "";
    frame.src = "";

    document.getElementById("player").style.display = "none";
}

/* ---------------- SEARCH ---------------- */

document.getElementById("search").addEventListener("input", function () {
    const val = this.value.toLowerCase();

    const filtered = movies.filter(m =>
        (m.title || "").toLowerCase().includes(val)
    );

    const container = document.getElementById("mainContainer");
    container.innerHTML = "<h2>Search Results</h2>";

    const grid = document.createElement("div");
    grid.className = "grid";

    filtered.forEach(m => grid.appendChild(createCard(m)));

    container.appendChild(grid);
});

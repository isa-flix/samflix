let movies = [];
let hlsInstance = null;

/* ---------------- LOAD DATA ---------------- */

fetch("https://isa-flix.github.io/samflix/newsam/data.json")
.then(res => {
    if (!res.ok) {
        throw new Error("Failed to load JSON: " + res.status);
    }
    return res.json();
})
.then(data => {
    movies = data.filter(m => m.disabled !== true);
    displayAll();
})
.catch(err => {
    console.error("DATA LOAD ERROR:", err);
    document.getElementById("mainContainer").innerHTML =
        "<h2 style='color:red'>Failed to load data.json</h2>";
});


/* ---------------- DISPLAY ALL ---------------- */

function displayAll() {
    const container = document.getElementById("mainContainer");
    container.innerHTML = "";

    const categories = [...new Set(movies.map(m => m.category))];

    categories.forEach(cat => {
        const section = document.createElement("div");

        section.innerHTML = `<h2>${cat}</h2>`;

        const grid = document.createElement("div");
        grid.className = "grid";

        movies
            .filter(m => m.category === cat)
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
        <img src="${movie.img || ''}" onerror="this.style.display='none'">
        <div class="title">${movie.title || "No Title"}</div>
    `;

    div.onclick = () => playMovie(movie);
    return div;
}


/* ---------------- PLAYER ---------------- */

function playMovie(movie) {
    const video = document.getElementById("videoPlayer");
    const frame = document.getElementById("frame");
    const player = document.getElementById("player");

    // reset old sources
    video.pause();
    video.removeAttribute("src");
    video.load();

    frame.src = "";
    frame.style.display = "none";
    video.style.display = "none";

    // destroy old HLS instance (IMPORTANT FIX)
    if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
    }

    if (movie.video) {

        // MP4
        if (movie.video.endsWith(".mp4")) {
            video.src = movie.video;
            video.style.display = "block";
            video.load();
            video.play().catch(() => {});
        }

        // HLS (.m3u8)
        else if (movie.video.endsWith(".m3u8")) {

            video.style.display = "block";

            if (window.Hls && Hls.isSupported()) {
                hlsInstance = new Hls();
                hlsInstance.loadSource(movie.video);
                hlsInstance.attachMedia(video);
            } else {
                // fallback (may not work on all browsers)
                video.src = movie.video;
                video.play().catch(() => {});
            }
        }

    } else if (movie.id) {
        // fallback embed
        frame.src = `https://www.2embed.cc/embed/${movie.id}`;
        frame.style.display = "block";
    }

    player.style.display = "flex";
}


/* ---------------- CLOSE PLAYER ---------------- */

function closePlayer() {
    const video = document.getElementById("videoPlayer");
    const frame = document.getElementById("frame");

    video.pause();
    video.removeAttribute("src");
    video.load();

    frame.src = "";

    if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
    }

    document.getElementById("player").style.display = "none";
}


/* ---------------- SEARCH ---------------- */

document.getElementById("search").addEventListener("input", function () {
    const val = this.value.toLowerCase().trim();

    const container = document.getElementById("mainContainer");
    container.innerHTML = "";

    if (!val) {
        displayAll();
        return;
    }

    const filtered = movies.filter(m =>
        (m.title || "").toLowerCase().includes(val)
    );

    const title = document.createElement("h2");
    title.textContent = "Search Results";
    container.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "grid";

    filtered.forEach(m => grid.appendChild(createCard(m)));

    container.appendChild(grid);
});

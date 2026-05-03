

let hlsInstance = null;

/* ---------------- INIT ---------------- */

document.addEventListener("DOMContentLoaded", () => {
    movies = movies.filter(m => m.disabled !== true);
    displayAll();
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

        if (cat === "MovieSet") {
            const sets = [...new Set(
                movies
                    .filter(m => m.category === "MovieSet")
                    .map(m => m.set)
            )];

            sets.forEach(setName => {
                const firstMovie = movies.find(m => m.set === setName);

                const card = createCard(firstMovie, () => openSet(setName));
                grid.appendChild(card);
            });

        } else {
            movies
                .filter(m => m.category === cat)
                .forEach(m => {
                    grid.appendChild(createCard(m));
                });
        }

        section.appendChild(grid);
        container.appendChild(section);
    });
}


/* ---------------- OPEN SET ---------------- */

function openSet(setName) {
    const container = document.getElementById("mainContainer");

    container.innerHTML = `
        <h2>${setName}</h2>
        <button onclick="displayAll()">⬅ Back</button>
    `;

    const grid = document.createElement("div");
    grid.className = "grid";

    movies
        .filter(m => m.set === setName)
        .forEach(m => {
            grid.appendChild(createCard(m));
        });

    container.appendChild(grid);
}


/* ---------------- CARD ---------------- */

function createCard(movie, customClick) {
    const div = document.createElement("div");
    div.className = "movie";

    div.innerHTML = `
        <img src="${movie.img || ''}" onerror="this.style.display='none'">
        <div class="title">${movie.title || "No Title"}</div>
    `;

    // ✅ FIX: allow override click (MovieSet)
    div.onclick = customClick || (() => playMovie(movie));

    return div;
}


/* ---------------- PLAYER ---------------- */

function playMovie(movie) {
    const video = document.getElementById("videoPlayer");
    const frame = document.getElementById("frame");
    const player = document.getElementById("player");

    // reset video
    video.pause();
    video.removeAttribute("src");
    video.load();

    // reset iframe
    frame.src = "";
    frame.style.display = "none";
    video.style.display = "none";

    // destroy HLS
    if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
    }

    if (movie.video) {

        video.style.display = "block";

        // MP4
        if (movie.video.endsWith(".mp4")) {
            video.src = movie.video;
            video.play().catch(() => {});
        }

        // HLS
        else if (movie.video.endsWith(".m3u8")) {
            if (window.Hls && Hls.isSupported()) {
                hlsInstance = new Hls();
                hlsInstance.loadSource(movie.video);
                hlsInstance.attachMedia(video);
            } else {
                video.src = movie.video;
                video.play().catch(() => {});
            }
        }

    } else if (movie.id) {
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

    filtered.forEach(m => {
        grid.appendChild(createCard(m));
    });

    container.appendChild(grid);
});

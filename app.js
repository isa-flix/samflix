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

                const firstMovie = movies.find(
                    m => m.category === "MovieSet" && m.set === setName
                );

                if (firstMovie) {
                    grid.appendChild(
                        createCard(firstMovie, () => openSet(setName))
                    );
                }
            });

        } else {

            movies
                .filter(m => m.category === cat)
                .forEach(movie => {
                    grid.appendChild(createCard(movie));
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
        .forEach(movie => {
            grid.appendChild(createCard(movie));
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

    div.onclick = customClick || (() => playMovie(movie));

    return div;
}


/* ---------------- PROVIDER ---------------- */

function getEmbedUrl(movies) {

    // TMDB movie id stored in movie.id
    return `https://vidlink.pro/embed/movie/${movies.id}`;
}


/* ---------------- PLAYER ---------------- */

function playMovie(movie) {

    const player = document.getElementById("player");
    const video = document.getElementById("videoPlayer");
    const frame = document.getElementById("frame");

    // cleanup old player
    cleanupPlayer();

    // VIDEO FILE
    if (movies.video) {

        video.style.display = "block";
        frame.style.display = "none";

        // MP4
        if (movies.video.includes(".mp4")) {

            video.src = movies.video;

            video.play().catch(() => {});

        }

        // HLS
        else if (
            movies.video.includes(".m3u8") ||
            movies.video.endsWith(".m3u8")
        ) {

            if (window.Hls && Hls.isSupported()) {

                hlsInstance = new Hls();

                hlsInstance.loadSource(movie.video);
                hlsInstance.attachMedia(video);

                hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
                    video.play().catch(() => {});
                });

            } else {

                video.src = movies.video;
                video.play().catch(() => {});
            }
        }

        // Fallback
        else {

            video.src = movies.video;
            video.play().catch(() => {});
        }
    }

    // TMDB EMBED
    else if (movies.id) {

        video.style.display = "none";
        frame.style.display = "block";

        frame.src = getEmbedUrl(movies);
    }

    player.style.display = "flex";
}


/* ---------------- CLEANUP ---------------- */

function cleanupPlayer() {

    const video = document.getElementById("videoPlayer");
    const frame = document.getElementById("frame");

    if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
    }

    video.pause();

    video.removeAttribute("src");
    video.load();

    frame.src = "";
}


/* ---------------- CLOSE PLAYER ---------------- */

function closePlayer() {

    cleanupPlayer();

    document.getElementById("player").style.display = "none";
}


/* ---------------- SEARCH ---------------- */

document.getElementById("search").addEventListener("input", function () {

    const search = this.value.toLowerCase().trim();

    if (!search) {
        displayAll();
        return;
    }

    const container = document.getElementById("mainContainer");
    container.innerHTML = "";

    const title = document.createElement("h2");
    title.textContent = "Search Results";
    container.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "grid";

    movies
        .filter(movies =>
            (movies.title || "")
                .toLowerCase()
                .includes(search)
        )
        .forEach(movie => {
            grid.appendChild(createCard(movie));
        });

    container.appendChild(grid);
});

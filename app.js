let hlsInstance = null;

/* ---------------- INIT ---------------- */

document.addEventListener("DOMContentLoaded", () => {
    movies = movies.filter(m => !m.disabled);
    detectFastestProvider();
    displayAll();
});

/* ---------------- PROVIDERS ---------------- */

const providers = [
    id => `https://vidsrc.to/embed/movie?tmdb=${id}`,
    id => `https://www.2embed.cc/embed/${id}`,
    id => `https://autoembed.to/movie/tmdb/${id}`,
    id => `https://smashystream.com/play/movie/${id}`,
    id => `https://vidsrc.pro/embed/movie/${id}`
];

let fastestProviderIndex = 0;

/* ---------------- AUTO-DETECT FASTEST PROVIDER ---------------- */

function detectFastestProvider() {
    const testId = 550; // TMDB ID for "Fight Club" (safe test movie)
    const testFrame = document.createElement("iframe");

    let results = [];
    let completed = 0;

    providers.forEach((providerFn, index) => {
        const url = providerFn(testId);
        const start = performance.now();

        const iframe = document.createElement("iframe");
        iframe.src = url;
        iframe.style.display = "none";

        iframe.onload = () => {
            const time = performance.now() - start;
            results[index] = time;
            completed++;
            checkDone();
        };

        iframe.onerror = () => {
            results[index] = Infinity;
            completed++;
            checkDone();
        };

        document.body.appendChild(iframe);

        function checkDone() {
            if (completed === providers.length) {
                fastestProviderIndex = results.indexOf(Math.min(...results));
                console.log("Fastest provider:", fastestProviderIndex);
                cleanup();
            }
        }

        function cleanup() {
            document.querySelectorAll("iframe").forEach(f => {
                if (f !== document.getElementById("frame")) f.remove();
            });
        }
    });
}

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
                movies.filter(m => m.category === "MovieSet").map(m => m.set)
            )];

            sets.forEach(setName => {
                const firstMovie = movies.find(m => m.set === setName);
                const card = createCard(firstMovie, () => openSet(setName));
                grid.appendChild(card);
            });

        } else {
            movies
                .filter(m => m.category === cat)
                .forEach(m => grid.appendChild(createCard(m)));
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
        .forEach(m => grid.appendChild(createCard(m)));

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

/* ---------------- PLAYER ---------------- */

function playMovie(movie) {
    const video = document.getElementById("videoPlayer");
    const frame = document.getElementById("frame");
    const player = document.getElementById("player");

    resetPlayer(video, frame);

    if (movie.video) {
        playVideo(movie.video, video);
    } else if (movie.id) {
        loadWithFallback(movie.id, frame, fastestProviderIndex);
    }

    player.style.display = "flex";
}

/* ---------------- FALLBACK SYSTEM ---------------- */

function loadWithFallback(id, frame, index) {
    if (index >= providers.length) {
        frame.style.display = "block";
        frame.src = "";
        frame.innerHTML = "<p>❌ No provider available</p>";
        return;
    }

    const url = providers[index](id);
    frame.src = url;
    frame.style.display = "block";

    setTimeout(() => {
        if (!frame.contentWindow || frame.contentWindow.length === 0) {
            console.warn(`Provider failed: ${url}`);
            loadWithFallback(id, frame, index + 1);
        }
    }, 2000);
}

/* ---------------- RESET PLAYER ---------------- */

function resetPlayer(video, frame) {
    video.pause();
    video.removeAttribute("src");
    video.load();

    frame.src = "";
    frame.style.display = "none";
    video.style.display = "none";

    if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
    }
}

/* ---------------- PLAY VIDEO ---------------- */

function playVideo(url, video) {
    video.style.display = "block";

    if (url.endsWith(".mp4")) {
        video.src = url;
        video.play().catch(() => {});
        return;
    }

    if (url.endsWith(".m3u8")) {
        if (window.Hls && Hls.isSupported()) {
            hlsInstance = new Hls();
            hlsInstance.loadSource(url);
            hlsInstance.attachMedia(video);
        } else {
            video.src = url;
            video.play().catch(() => {});
        }
    }
}

/* ---------------- CLOSE PLAYER ---------------- */

function closePlayer() {
    const video = document.getElementById("videoPlayer");
    const frame = document.getElementById("frame");

    resetPlayer(video, frame);

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

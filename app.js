let hlsInstance = null;

/* ---------------- PROVIDERS ---------------- */

const providers = [
    id => `https://vidsrc.me/embed/movie?tmdb=${id}`,
    id => `https://multiembed.mov/embed/movie?tmdb=${id}`,
    id => `https://vidsrc.xyz/embed/movie?tmdb=${id}`,
    id => `https://vidsrc.cc/embed/movie?tmdb=${id}`,
    id => `https://vidsrc.to/embed/movie?tmdb=${id}`,
    id => `https://autoembed.to/movie/tmdb/${id}`,
    id => `https://smashystream.com/play/movie/${id}`,
    id => `https://vidsrc.pro/embed/movie/${id}`
    id => `https://www.2embed.cc/embed/${id}`,
];

let fastestProviderIndex = 0;

/* ---------------- INIT ---------------- */

document.addEventListener("DOMContentLoaded", () => {
    movies = movies.filter(m => !m.disabled);
    detectFastestProvider();
    displayAll();
});

/* ---------------- AUTO-DETECT FASTEST PROVIDER ---------------- */

function detectFastestProvider() {
    const testId = 550; // sample TMDB id
    let results = new Array(providers.length).fill(Infinity);
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
                const min = Math.min(...results);
                fastestProviderIndex = results.indexOf(min);
                if (min === Infinity) fastestProviderIndex = 0;
                console.log("Fastest provider index:", fastestProviderIndex);
                cleanup();
            }
        }

        function cleanup() {
            document.querySelectorAll("iframe").forEach(f => {
                if (f.id !== "frame") f.remove();
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

    player.style.display = "flex";
    player.innerHTML = `
        <div style="
            width:100%;
            height:100%;
            display:flex;
            align-items:center;
            justify-content:center;
            background:#000;
            color:white;
            font-size:18px;
        ">
            Loading player...
        </div>
    `;

    if (movie.video) {
        player.innerHTML = "";
        player.appendChild(video.parentElement || video);
        playVideo(movie.video, video);
    } else if (movie.id) {
        player.innerHTML = "";
        player.appendChild(frame);
        loadWithFallback(movie.id, frame, fastestProviderIndex);
    }
}

/* ---------------- FALLBACK SYSTEM ---------------- */

function loadWithFallback(id, frame, index) {
    const player = document.getElementById("player");

    if (index >= providers.length) {
        player.innerHTML = `
            <div style="
                width:100%;
                height:100%;
                display:flex;
                flex-direction:column;
                align-items:center;
                justify-content:center;
                background:#0d0d0d;
                color:white;
                text-align:center;
                padding:20px;
            ">
                <div style="
                    font-size:60px;
                    animation:pulse 1.5s infinite;
                ">⚠️</div>

                <h2 style="margin-top:10px;">All Providers Failed</h2>

                <p style="max-width:400px; opacity:0.8; margin-top:10px;">
                    We couldn’t load this movie from any streaming provider.
                    This usually happens when servers are down or blocked.
                </p>

                <button onclick="retryMovie('${id}')" style="
                    margin-top:20px;
                    padding:12px 25px;
                    background:#ff4444;
                    border:none;
                    border-radius:6px;
                    color:white;
                    font-size:16px;
                    cursor:pointer;
                ">🔄 Retry</button>

                <div style="margin-top:25px; opacity:0.7;">Try a provider manually:</div>

                <div style="
                    margin-top:10px;
                    display:flex;
                    gap:10px;
                    flex-wrap:wrap;
                    justify-content:center;
                ">
                    ${providers.map((p, i) => `
                        <button onclick="manualProvider('${id}', ${i})" style="
                            padding:8px 15px;
                            background:#222;
                            border:1px solid #444;
                            border-radius:5px;
                            color:white;
                            cursor:pointer;
                        ">Provider ${i+1}</button>
                    `).join("")}
                </div>
            </div>

            <style>
                @keyframes pulse {
                    0% { transform:scale(1); opacity:1; }
                    50% { transform:scale(1.2); opacity:0.6; }
                    100% { transform:scale(1); opacity:1; }
                }
            </style>
        `;
        return;
    }

    const url = providers[index](id);
    frame.src = url;
    frame.style.display = "block";

    // simple check after delay
    setTimeout(() => {
        try {
            if (!frame.contentWindow || frame.contentWindow.length === 0) {
                console.warn(`Provider failed: ${url}`);
                loadWithFallback(id, frame, index + 1);
            }
        } catch (e) {
            console.warn(`Provider likely blocked (cross-origin): ${url}`);
            loadWithFallback(id, frame, index + 1);
        }
    }, 2000);
}

/* ---------------- RETRY & MANUAL PROVIDER ---------------- */

function retryMovie(id) {
    const frame = document.getElementById("frame");
    const player = document.getElementById("player");

    player.innerHTML = `
        <div style="
            width:100%;
            height:100%;
            display:flex;
            align-items:center;
            justify-content:center;
            background:#000;
            color:white;
            font-size:20px;
        ">
            Retrying...
        </div>
    `;

    setTimeout(() => {
        player.innerHTML = "";
        player.appendChild(frame);
        loadWithFallback(id, frame, fastestProviderIndex);
    }, 800);
}

function manualProvider(id, index) {
    const frame = document.getElementById("frame");
    const player = document.getElementById("player");

    player.innerHTML = "";
    player.appendChild(frame);

    frame.src = providers[index](id);
    frame.style.display = "block";
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
    const player = document.getElementById("player");

    resetPlayer(video, frame);
    player.style.display = "none";
    player.innerHTML = "";
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

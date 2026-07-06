let hlsInstance = null;

/* ---------------- PROVIDERS ---------------- */

const providers = [
     { name: "1 Vidsrc-emded ru", url: id => `https://vidsrc-embed.ru/embed/movie?tmdb=${id}` },
     { name: "2 Vidsrc-emded su ", url: id => `https://vidsrc-embed.su/embed/movie?tmdb=${id}` },
    { name: "3 Vidsrc.me", url: id => `https://vidsrc.me/movie?tmdb=${id}` },
    { name: "4 multiembed", url: id => `https://multiembed.mov/movie?tmdb=${id}` },
    { name: "5 Vidsrc.me/embed", url:  id => `https://vidsrc.me/embed/movie?tmdb=${id}` },
    { name: "6 Vidsrc.vip", url: id => `https://vidsrc.vip/embed/movie?tmdb=${id}` },
    { name: "7", url: id => `https://vidlink.pro/movie/${id}`},
    { name: "9", url:  id => `https://vidsrc.me/embed/movie?tmdb=${id}` },
    { name: "10", url: id => `https://vidsrc.xyz/embed/movie?tmdb=${id}`  },
    { name: "11", url: id => `https://vidsrc.vip/embed/movie?tmdb=${id}`  },
    { name: "12", url: id => `https://superembed.stream/embed/movie?tmdb=${id}`  },
    { name: "13", url: id => `https://vidsrc.cc/embed/movie?tmdb=${id}`  },
    { name: "14", url: id => `https://vidsrc.xyz/embed/movie?tmdb=${id}`  },
    { name: "15", url: id => `https://vidsrc.cc/embed/movie?tmdb=${id}`  },
{ name: "16", url:  id => `https://vidsrc.to/embed/movie?tmdb=${id}`  },
{ name: "17", url: id => `https://smashystream.com/play/movie/${id}`  },
{ name: "18", url: id => `https://www.2embed.cc/embed/${id}`  },
    
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
    const testId = 550; // Fight Club
    let results = new Array(providers.length).fill(Infinity);
    let completed = 0;

    providers.forEach((providerFn, index) => {
        const url = providerFn(testId);
        const start = performance.now();

        const iframe = document.createElement("iframe");
        iframe.src = url;
        iframe.style.display = "none";

        iframe.onload = () => {
            results[index] = performance.now() - start;
            completed++;
            checkDone();
console.log("Fastest provider detected:", providers[fastestProviderIndex].name);

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
    const closeBtn = document.getElementById("closeBtn");

    resetPlayer(video, frame);

    closeBtn.style.display = "block";
    player.style.display = "flex";

    // Loading animation
    player.innerHTML = `
        <button id="closeBtn" onclick="closePlayer()">✖</button>
        <div style="
            width:100%;
            height:100%;
            display:flex;
            align-items:center;
            justify-content:center;
            flex-direction:column;
            background:#000;
            color:white;
        ">
            <div class="loader"></div>
            <div style="margin-top:15px; opacity:0.7;">Loading...</div>
        </div>
    `;

    if (movie.video) {
        player.innerHTML = "";
        player.appendChild(closeBtn);
        player.appendChild(video);
        playVideo(movie.video, video);
    } else if (movie.id) {
        player.innerHTML = "";
        player.appendChild(closeBtn);
        player.appendChild(frame);
        loadWithFallback(movie.id, frame, fastestProviderIndex);
    }
}

/* ---------------- FALLBACK SYSTEM ---------------- */

function loadWithFallback(id, frame, index) {
    const player = document.getElementById("player");
    const closeBtn = document.getElementById("closeBtn");

    if (index >= providers.length) {
        showErrorScreen(id);
        return;
    }

    
    const url = providers[index].url(id);
console.log("Streaming from provider:", providers[index].name);
    frame.src = url;
    frame.style.display = "block";

    setTimeout(() => {
        try {
            if (!frame.contentWindow || frame.contentWindow.length === 0) {
                loadWithFallback(id, frame, index + 1);
            }
        } catch (e) {
            loadWithFallback(id, frame, index + 1);
        }
    }, 2000);
}

/* ---------------- ERROR SCREEN ---------------- */

function showErrorScreen(id) {
    const player = document.getElementById("player");

    player.innerHTML = `
        <button id="closeBtn" onclick="closePlayer()">✖</button>
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
            <div style="font-size:60px; animation:pulse 1.5s infinite;">⚠️</div>
            <h2 style="margin-top:10px;">All Providers Failed</h2>
            <p style="max-width:400px; opacity:0.8; margin-top:10px;">
                We couldn’t load this movie from any streaming provider.
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
    `;
}

/* ---------------- RETRY ---------------- */

function retryMovie(id) {
    const player = document.getElementById("player");
    const frame = document.getElementById("frame");

    player.innerHTML = `
        <button id="closeBtn" onclick="closePlayer()">✖</button>
        <div style="
            width:100%;
            height:100%;
            display:flex;
            align-items:center;
            justify-content:center;
            flex-direction:column;
            background:#000;
            color:white;
        ">
            <div class="loader"></div>
            <div style="margin-top:15px; opacity:0.7;">Retrying...</div>
        </div>
    `;

    setTimeout(() => {
        player.innerHTML = "";
        player.appendChild(document.getElementById("closeBtn"));
        player.appendChild(frame);
        loadWithFallback(id, frame, fastestProviderIndex);
    }, 800);
}

/* ---------------- MANUAL PROVIDER ---------------- */

function manualProvider(id, index) {
    console.log("Manual provider selected:", providers[index].name);
    const frame = document.getElementById("frame");
    const player = document.getElementById("player");

    player.innerHTML = "";
    player.appendChild(document.getElementById("closeBtn"));
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
    const closeBtn = document.getElementById("closeBtn");

    resetPlayer(video, frame);

    player.style.display = "none";

    // Restore original structure
    player.innerHTML = "";
    player.appendChild(closeBtn);
    player.appendChild(video);
    player.appendChild(frame);

    closeBtn.style.display = "none";
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

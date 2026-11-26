
"use strict";

let hlsInstance = null;
let currentMovie = null;
let allMovies = [];
let searchInput = null;

/* ---------------- INITIALIZATION ---------------- */

document.addEventListener("DOMContentLoaded", () => {
    if (!Array.isArray(movies)) {
        console.error("movies.js must define a movies array.");
        return;
    }

    allMovies = movies.filter(movie => movie && !movie.disabled);

    searchInput = document.getElementById("search");

    displayAll();
    setupNewAdditions();
    setupHero();
    setupSearch();
    setupPlayerEvents();
});
/* ---------------- STREAM RESOLVER ---------------- */

function resolveStreamUrl(movie) {
    if (!movie) return null;

    if (movie.video) {
        return {
            type: "video",
            src: movie.video
        };
    }

    const id = String(movie.id || "").trim();

    if (!id) return null;

    if (/^\d+$/.test(id)) {
        return {
            type: "iframe",
            src: `https://vidsrc.me/embed/movie?tmdb=${encodeURIComponent(id)}`
        };
    }

    if (/^tt\d+$/i.test(id)) {
        return {
            type: "iframe",
            src: `https://vidsrc.me/embed/movie?imdb=${encodeURIComponent(id)}`
        };
    }

    return null;
}

/* ---------------- DISPLAY COLLECTIONS ---------------- */

function displayAll() {
    const container = document.getElementById("mainContainer");
    if (!container) return;

    container.replaceChildren();

    const categories = [
        ...new Set(allMovies.map(movie => movie.category || "Other"))
    ];

    categories.forEach(category => {
        const section = document.createElement("section");

        const heading = document.createElement("h2");
        heading.textContent = category;

        const grid = document.createElement("div");
        grid.className = "grid";

        if (category === "BoxSet") {
            const sets = [
                ...new Set(
                    allMovies
                        .filter(movie => movie.category === "BoxSet")
                        .map(movie => movie.set)
                        .filter(Boolean)
                )
            ];

            sets.forEach(setName => {
                const firstMovie = allMovies.find(
                    movie => movie.category === "BoxSet" &&
                             movie.set === setName
                );

                if (firstMovie) {
                    grid.appendChild(
                        createCard(firstMovie, () => openSet(setName))
                    );
                }
            });
        } else {
            allMovies
                .filter(movie => (movie.category || "Other") === category)
                .forEach(movie => grid.appendChild(createCard(movie)));
        }

        if (grid.children.length) {
            section.append(heading, grid);
            container.appendChild(section);
        }
    });
}

/* ---------------- BOX SETS ---------------- */

function openSet(setName) {
    const container = document.getElementById("mainContainer");
    if (!container) return;

    container.replaceChildren();

    const heading = document.createElement("h2");
    heading.textContent = setName;

    const back = document.createElement("button");
    back.className = "back-btn";
    back.type = "button";
    back.textContent = "← Back to collections";
    back.addEventListener("click", displayAll);

    const grid = document.createElement("div");
    grid.className = "grid";

    allMovies
        .filter(movie => movie.set === setName)
        .forEach(movie => grid.appendChild(createCard(movie)));

    container.append(heading, back, grid);

    container.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ---------------- MOVIE CARD ---------------- */

function createCard(movie, customClick) {
    const card = document.createElement("article");
    card.className = "movie";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Play ${movie.title || "movie"}`);

    const img = document.createElement("img");
    img.src = movie.img || "";
    img.alt = movie.title || "Movie poster";
    img.loading = "lazy";

    img.onerror = () => {
        img.style.display = "none";
    };

    const title = document.createElement("div");
    title.className = "title";
    title.textContent = movie.title || "Untitled";

    card.append(img, title);

    const activate = customClick || (() => playMovie(movie));

    card.addEventListener("click", activate);

    card.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            activate();
        }
    });

    return card;
}

/* ---------------- HERO ---------------- */

function setupHero() {
    const heroMovie =
        allMovies.find(movie => movie.id === "1184918") ||
        allMovies.find(movie => movie.title?.toLowerCase().includes("wild robot")) ||
        allMovies[0];

    if (!heroMovie) return;

    const title = document.getElementById("heroTitle");
    const description = document.getElementById("heroDescription");
    const meta = document.getElementById("heroMeta");
    const background = document.getElementById("heroBackground");
    const watch = document.getElementById("heroWatch");
    const info = document.getElementById("heroInfo");

    if (title) title.textContent = heroMovie.title || "Featured Movie";

    if (description) {
        description.textContent =
            heroMovie.description ||
            "Discover your next cinematic adventure on SamFlix.";
    }

    if (background && heroMovie.img) {
        background.style.backgroundImage =
            `url("${heroMovie.img.replace(/"/g, "")}")`;
    }

    if (meta) {
        meta.replaceChildren();

        [heroMovie.year, heroMovie.category, heroMovie.genre]
            .filter(Boolean)
            .forEach(value => {
                const span = document.createElement("span");
                span.textContent = value;
                meta.appendChild(span);
            });
    }

    if (watch) {
        watch.onclick = () => playMovie(heroMovie);
    }

    if (info) {
        info.onclick = () => showMovieInfo(heroMovie);
    }
}

/* ---------------- NEW ADDITIONS CAROUSEL ---------------- */

function setupNewAdditions() {
    const mainContainer = document.getElementById("mainContainer");
    if (!mainContainer) return;

    // Only movies marked newAddition: true appear here
    const featuredMovies = allMovies.filter(
        movie => movie.newAddition === true &&
                 movie.category !== "BoxSet"
    );

    if (!featuredMovies.length) return;

    const carousel = document.createElement("section");
    carousel.className = "new-additions";

    carousel.innerHTML = `
        <div class="new-additions-heading">
            <div>
                <span class="new-additions-label">JUST ARRIVED</span>
                <h2>New Additions</h2>
            </div>

            <div class="new-additions-controls">
                <button class="addition-prev" aria-label="Previous movie">‹</button>
                <button class="addition-next" aria-label="Next movie">›</button>
            </div>
        </div>

        <div class="addition-stage">
            <img class="addition-backdrop" alt="">
            <img class="addition-poster" alt="">

            <div class="addition-content">
                <span class="addition-number"></span>
                <h3 class="addition-title"></h3>
                <p class="addition-meta"></p>
                <p class="addition-description"></p>

                <div class="addition-buttons">
                    <button class="addition-play">▶ Play Now</button>
                    <button class="addition-info">More Info</button>
                </div>
            </div>
        </div>

        <div class="addition-dots"></div>
    `;

    mainContainer.parentNode.insertBefore(carousel, mainContainer);

    const backdrop = carousel.querySelector(".addition-backdrop");
    const poster = carousel.querySelector(".addition-poster");
    const title = carousel.querySelector(".addition-title");
    const meta = carousel.querySelector(".addition-meta");
    const description = carousel.querySelector(".addition-description");
    const number = carousel.querySelector(".addition-number");
    const dots = carousel.querySelector(".addition-dots");
    const playButton = carousel.querySelector(".addition-play");
    const infoButton = carousel.querySelector(".addition-info");

    let currentIndex = 0;
    let timer = null;

    featuredMovies.forEach((movie, index) => {
        const dot = document.createElement("button");
        dot.className = "addition-dot";
        dot.setAttribute("aria-label", `Show ${movie.title}`);

        dot.addEventListener("click", () => {
            showSlide(index);
            restartTimer();
        });

        dots.appendChild(dot);
    });

    function showSlide(index) {
        currentIndex =
            (index + featuredMovies.length) % featuredMovies.length;

        const movie = featuredMovies[currentIndex];

        title.textContent = movie.title || "Featured Movie";

        meta.textContent = [
            movie.year,
            movie.category,
            movie.genre
        ].filter(Boolean).join(" • ");

        description.textContent =
            movie.description ||
            "Discover your next cinematic adventure on SamFlix.";

        number.textContent =
            `NEW ADDITION ${currentIndex + 1} / ${featuredMovies.length}`;

        // Load the movie image directly, just like your movie cards
/*
        backdrop.src = movie.img || "";
backdrop.alt = movie.title || "Featured movie";

backdrop.style.display = movie.img ? "block" : "none";

backdrop.onerror = () => {
    backdrop.style.display = "none";
*/
             const imgSrc = movie.img || "";
        const imgAlt = movie.title || "Featured movie";

        backdrop.src = imgSrc;
        backdrop.alt = "";
        backdrop.style.display = imgSrc ? "block" : "none";

        poster.src = imgSrc;
        poster.alt = imgAlt;
        poster.style.display = imgSrc ? "block" : "none";

        backdrop.onerror = () => {
            backdrop.style.display = "none";
            poster.style.display = "none";
        };
   
    

        
        dots.querySelectorAll(".addition-dot").forEach((dot, i) => {
            dot.classList.toggle("active", i === currentIndex);
        });

        playButton.onclick = () => playMovie(movie);
        infoButton.onclick = () => showMovieInfo(movie);
    }

    function nextSlide() {
        showSlide(currentIndex + 1);
    }

    function previousSlide() {
        showSlide(currentIndex - 1);
    }

    function startTimer() {
        stopTimer();
        timer = setInterval(nextSlide, 9000);
    }

    function stopTimer() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    }

    function restartTimer() {
        startTimer();
    }

    carousel.querySelector(".addition-next").onclick = () => {
        nextSlide();
        restartTimer();
    };

    carousel.querySelector(".addition-prev").onclick = () => {
        previousSlide();
        restartTimer();
    };

    carousel.addEventListener("mouseenter", stopTimer);
    carousel.addEventListener("mouseleave", startTimer);
    carousel.addEventListener("focusin", stopTimer);
    carousel.addEventListener("focusout", startTimer);

    showSlide(0);
    startTimer();
}


/* ---------------- MOVIE INFORMATION ---------------- */

function showMovieInfo(movie) {
    const oldModal = document.querySelector(".movie-info-modal");
    if (oldModal) oldModal.remove();

    const modal = document.createElement("div");
    modal.className = "movie-info-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", movie.title || "Movie information");

    const content = document.createElement("div");
    content.className = "movie-info-content";

    const close = document.createElement("button");
    close.className = "movie-info-close";
    close.type = "button";
    close.textContent = "✕";
    close.setAttribute("aria-label", "Close information");

    close.onclick = () => modal.remove();

    const heading = document.createElement("h2");
    heading.textContent = movie.title || "Movie";

    const description = document.createElement("p");
    description.textContent =
        movie.description ||
        "Movie information is not available.";

    const watch = document.createElement("button");
    watch.className = "watch-btn";
    watch.type = "button";
    watch.textContent = "▶ WATCH NOW";
    watch.onclick = () => {
        modal.remove();
        playMovie(movie);
    };

    content.append(close, heading, description, watch);
    modal.appendChild(content);

    modal.addEventListener("click", event => {
        if (event.target === modal) modal.remove();
    });

    document.body.appendChild(modal);
    close.focus();
}

/* ---------------- PLAYER ---------------- */

function playMovie(movie) {
    const player = document.getElementById("player");
    const video = document.getElementById("videoPlayer");
    const frame = document.getElementById("frame");

    if (!player || !video || !frame) return;

    currentMovie = movie;
    resetPlayer(video, frame);

    video.style.display = "none";
    frame.style.display = "none";

    player.style.display = "flex";

    const stream = resolveStreamUrl(movie);

    if (!stream) {
        showPlayerMessage("No playable source is available for this title.");
        return;
    }

    if (stream.type === "video") {
        video.style.display = "block";
        playVideo(stream.src, video);
        return;
    }

    frame.style.display = "block";
    frame.src = stream.src;
}

/* ---------------- VIDEO PLAYBACK ---------------- */

function playVideo(url, video) {
    video.style.display = "block";

    const source = String(url || "");
    const isHls = /\.m3u8($|\?)/i.test(source);

    if (isHls) {
        if (window.Hls && Hls.isSupported()) {
            hlsInstance = new Hls();

            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);

            hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch(() => {});
            });

            hlsInstance.on(Hls.Events.ERROR, (_, data) => {
                if (data.fatal) {
                    showPlayerMessage("This stream could not be played.");
                }
            });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            video.play().catch(() => {});
        } else {
            showPlayerMessage("HLS playback is not supported by this browser.");
        }

        return;
    }

    video.src = source;
    video.play().catch(() => {});
}

/* ---------------- PLAYER MESSAGE ---------------- */

function showPlayerMessage(message) {
    const player = document.getElementById("player");
    if (!player) return;

    let messageBox = player.querySelector(".player-error");

    if (!messageBox) {
        messageBox = document.createElement("div");
        messageBox.className = "player-error";
        player.appendChild(messageBox);
    }

    messageBox.textContent = message;
}

/* ---------------- PLAYER RESET ---------------- */

function resetPlayer(video, frame) {
    if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
    }

    if (video) {
        video.pause();
        video.removeAttribute("src");
        video.load();
    }

    if (frame) {
        frame.src = "about:blank";
        frame.removeAttribute("src");
    }

    const message = document.querySelector(".player-error");
    if (message) message.remove();
}

/* ---------------- CLOSE PLAYER ---------------- */

function closePlayer() {
    const player = document.getElementById("player");
    const video = document.getElementById("videoPlayer");
    const frame = document.getElementById("frame");

    resetPlayer(video, frame);

    if (player) player.style.display = "none";

    currentMovie = null;
}

function setupPlayerEvents() {
    const player = document.getElementById("player");
    const closeButton = document.getElementById("closeBtn");

    if (closeButton) {
        closeButton.addEventListener("click", closePlayer);
    }

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && player?.style.display === "flex") {
            closePlayer();
        }
    });
}

/* ---------------- SEARCH ---------------- */

function setupSearch() {
    if (!searchInput) return;

    searchInput.addEventListener("input", () => {
        const query = searchInput.value.trim().toLowerCase();

        if (!query) {
            displayAll();
            return;
        }

        const results = allMovies.filter(movie => {
            const searchable = [
                movie.title,
                movie.category,
                movie.set,
                movie.genre
            ].filter(Boolean).join(" ").toLowerCase();

            return searchable.includes(query);
        });

        displaySearchResults(results);
    });
}

function displaySearchResults(results) {
    const container = document.getElementById("mainContainer");
    if (!container) return;

    container.replaceChildren();

    const heading = document.createElement("h2");
    heading.textContent = `Search Results (${results.length})`;

    const grid = document.createElement("div");
    grid.className = "grid";

    results.forEach(movie => grid.appendChild(createCard(movie)));

    container.appendChild(heading);

    if (results.length) {
        container.appendChild(grid);
    } else {
        const empty = document.createElement("p");
        empty.className = "empty-message";
        empty.textContent = "No movies found. Try another search.";
        container.appendChild(empty);
    }
}

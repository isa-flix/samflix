/* SamFlix Upgrade — drop-in app.js
 * Keeps movies.js untouched and supports its existing title/img/category/id/video/set fields.
 */
(() => {
  "use strict";

  const STORE = {
    favorites: "samflix_favorites_v1",
    history: "samflix_watch_history_v1"
  };
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const safeRead = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  };
  const safeWrite = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  };
  const text = value => String(value ?? "").trim();
  const slug = value => text(value).toLowerCase().replace(/[^a-z0-9]+/g, "-");

  let catalog = [];
  let favorites = new Set(safeRead(STORE.favorites, []));
  let history = safeRead(STORE.history, {});
  let activeMovie = null;
  let hlsInstance = null;
  let currentFilter = "all";
  let searchTerm = "";

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    if (!Array.isArray(window.movies)) {
      console.error("SamFlix: movies.js must define a global movies array.");
      return;
    }
    catalog = window.movies.filter(movie => movie && !movie.disabled);
    wireSearch();
    wirePlayer();
    renderHero();
    renderCatalog();
    injectUpgradeUI();
    renderContinueWatching();
    renderFavorites();
    updateYear();
  }

  function movieKey(movie) {
    return text(movie.id || movie.title);
  }

  function getMovieType(movie) {
    const category = text(movie.category).toLowerCase();
    return category.includes("boxset") || text(movie.set) ? "boxset" :
      category.includes("live") || category.includes("channel") ? "live" : "movie";
  }

  function poster(movie) {
    return text(movie.img || movie.poster || movie.image);
  }

  function getStream(movie) {
    const raw = text(movie.video || movie.url || movie.stream);
    if (raw) return { kind: "url", url: raw };
    const id = text(movie.id);
    if (/^tt\d+$/.test(id)) return { kind: "iframe", url: `https://vidsrc.xyz/embed/movie?imdb=${encodeURIComponent(id)}` };
    if (/^\d+$/.test(id)) return { kind: "iframe", url: `https://vidsrc.xyz/embed/movie?tmdb=${encodeURIComponent(id)}` };
    return null;
  }

  function makeCard(movie, compact = false) {
    const card = document.createElement("article");
    card.className = `movie sam-card${compact ? " sam-compact" : ""}`;
    card.dataset.movieId = movieKey(movie);
    card.tabIndex = 0;
    card.setAttribute("aria-label", `Open ${text(movie.title)}`);

    const image = document.createElement("img");
    image.src = poster(movie);
    image.alt = text(movie.title);
    image.loading = "lazy";
    image.decoding = "async";
    image.onerror = () => { image.style.visibility = "hidden"; };
    card.append(image);

    const details = document.createElement("div");
    details.className = "sam-card-caption";
    const title = document.createElement("div");
    title.className = "sam-card-title";
    title.textContent = text(movie.title);
    details.append(title);

    const type = document.createElement("small");
    type.textContent = text(movie.set || movie.category || "Movie");
    details.append(type);
    card.append(details);

    const fav = document.createElement("button");
    fav.className = "sam-fav";
    fav.type = "button";
    fav.setAttribute("aria-label", favorites.has(movieKey(movie)) ? "Remove from My List" : "Add to My List");
    fav.textContent = favorites.has(movieKey(movie)) ? "♥" : "＋";
    fav.addEventListener("click", event => {
      event.stopPropagation();
      toggleFavorite(movie);
      fav.textContent = favorites.has(movieKey(movie)) ? "♥" : "＋";
      fav.setAttribute("aria-label", favorites.has(movieKey(movie)) ? "Remove from My List" : "Add to My List");
    });
    card.append(fav);

    const progress = history[movieKey(movie)]?.progress;
    if (progress > 0 && progress < 95) {
      const track = document.createElement("div");
      track.className = "sam-progress";
      const bar = document.createElement("span");
      bar.style.width = `${Math.min(100, progress)}%`;
      track.append(bar);
      card.append(track);
    }

    const open = () => showDetails(movie);
    card.addEventListener("click", open);
    card.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault(); open();
      }
    });
    return card;
  }

  function renderCatalog() {
    const container = $("#mainContainer");
    if (!container) return;
    container.replaceChildren();

    const matches = catalog.filter(movie => {
      const haystack = [movie.title, movie.category, movie.set, movie.genre, movie.year].join(" ").toLowerCase();
      const matchesSearch = !searchTerm || haystack.includes(searchTerm);
      const matchesFilter = currentFilter === "all" ||
        (currentFilter === "favorites" && favorites.has(movieKey(movie))) ||
        (currentFilter === "boxset" && getMovieType(movie) === "boxset") ||
        (currentFilter === "live" && getMovieType(movie) === "live") ||
        (currentFilter === "movies" && getMovieType(movie) === "movie");
      return matchesSearch && matchesFilter;
    });

    if (searchTerm || currentFilter !== "all") {
      const section = makeSection(searchTerm ? "Search Results" : filterLabel(currentFilter), matches.length);
      const grid = document.createElement("div");
      grid.className = "sam-grid";
      matches.forEach(movie => grid.append(makeCard(movie)));
      if (!matches.length) grid.innerHTML = '<p class="sam-empty">Nothing found. Try another title or category.</p>';
      section.append(grid);
      container.append(section);
      return;
    }

    const groups = new Map();
    catalog.forEach(movie => {
      const category = text(movie.category || "More to Explore");
      if (getMovieType(movie) === "boxset") return;
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category).push(movie);
    });

    groups.forEach((items, category) => {
      const section = makeSection(category, items.length);
      const row = document.createElement("div");
      row.className = "sam-row";
      const rail = document.createElement("div");
      rail.className = "sam-rail";
      items.forEach(movie => rail.append(makeCard(movie, true)));
      row.append(rail);
      section.append(row);
      container.append(section);
    });

    const sets = catalog.filter(movie => getMovieType(movie) === "boxset");
    if (sets.length) {
      const section = makeSection("Collections & Box Sets", sets.length);
      const grid = document.createElement("div");
      grid.className = "sam-grid";
      sets.forEach(movie => grid.append(makeCard(movie)));
      section.append(grid);
      container.append(section);
    }
  }

  function makeSection(name, count) {
    const section = document.createElement("section");
    section.className = "sam-section";
    const heading = document.createElement("h2");
    heading.textContent = name;
    const counter = document.createElement("span");
    counter.className = "sam-count";
    counter.textContent = count;
    heading.append(counter);
    section.append(heading);
    return section;
  }

  function filterLabel(filter) {
    return ({ favorites: "My List", boxset: "Collections", live: "Live TV", movies: "Movies" })[filter] || "All Titles";
  }

  function wireSearch() {
    const input = $("#search");
    if (!input) return;
    input.addEventListener("input", () => {
      searchTerm = input.value.trim().toLowerCase();
      renderCatalog();
    });
  }

  function injectUpgradeUI() {
    const nav = $(".navbar");
    if (nav && !$("#samflixMyList")) {
      const button = document.createElement("button");
      button.id = "samflixMyList";
      button.className = "sam-nav-action";
      button.type = "button";
      button.textContent = "♥ My List";
      button.addEventListener("click", () => {
        currentFilter = currentFilter === "favorites" ? "all" : "favorites";
        renderCatalog();
        $("#mainContainer")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      nav.append(button);
    }

    const container = $("#mainContainer");
    if (container && !$("#samflixContinue")) {
      const section = document.createElement("section");
      section.id = "samflixContinue";
      section.className = "sam-section sam-continue-section";
      section.hidden = true;
      section.innerHTML = '<h2>Continue Watching <span class="sam-count">Resume</span></h2><div class="sam-row"><div class="sam-rail"></div></div>';
      container.before(section);
    }

    if (!$("#samflixToast")) {
      const toast = document.createElement("div");
      toast.id = "samflixToast";
      toast.className = "sam-toast";
      toast.setAttribute("role", "status");
      document.body.append(toast);
    }
  }

  function toggleFavorite(movie) {
    const key = movieKey(movie);
    if (favorites.has(key)) {
      favorites.delete(key);
      toast("Removed from My List");
    } else {
      favorites.add(key);
      toast("Added to My List");
    }
    safeWrite(STORE.favorites, [...favorites]);
    renderFavorites();
  }

  function renderFavorites() {
    const navButton = $("#samflixMyList");
    if (navButton) navButton.textContent = `♥ My List${favorites.size ? ` (${favorites.size})` : ""}`;
  }

  function renderContinueWatching() {
    const section = $("#samflixContinue");
    const rail = $(".sam-rail", section);
    if (!section || !rail) return;
    const entries = Object.entries(history)
      .filter(([, item]) => item && item.progress > 0 && item.progress < 95)
      .sort((a, b) => (b[1].updated || 0) - (a[1].updated || 0));
    rail.replaceChildren();
    entries.forEach(([key]) => {
      const movie = catalog.find(item => movieKey(item) === key);
      if (movie) rail.append(makeCard(movie, true));
    });
    section.hidden = !rail.children.length;
  }

  function showDetails(movie) {
    closeDetails();
    const modal = document.createElement("div");
    modal.className = "sam-modal";
    modal.id = "samflixDetails";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", text(movie.title));

    const panel = document.createElement("div");
    panel.className = "sam-modal-panel";
    const close = document.createElement("button");
    close.className = "sam-modal-close";
    close.type = "button";
    close.textContent = "×";
    close.setAttribute("aria-label", "Close details");
    close.onclick = closeDetails;

    const backdrop = document.createElement("div");
    backdrop.className = "sam-modal-backdrop";
    if (poster(movie)) backdrop.style.backgroundImage = `linear-gradient(0deg,#101018 8%,rgba(16,16,24,.4) 100%),url("${poster(movie).replace(/["\\]/g, "")}")`;

    const content = document.createElement("div");
    content.className = "sam-modal-content";
    const title = document.createElement("h2");
    title.textContent = text(movie.title);
    const metadata = document.createElement("p");
    metadata.className = "sam-modal-meta";
    metadata.textContent = [movie.year, movie.category, movie.set].filter(Boolean).join(" • ");
    const description = document.createElement("p");
    description.textContent = text(movie.description || movie.overview || "Choose Watch Now to start streaming.");
    const actions = document.createElement("div");
    actions.className = "sam-modal-actions";

    const watch = document.createElement("button");
    watch.className = "sam-primary";
    watch.type = "button";
    watch.textContent = "▶ Watch Now";
    watch.onclick = () => { closeDetails(); playMovie(movie); };

    const save = document.createElement("button");
    save.className = "sam-secondary";
    save.type = "button";
    save.textContent = favorites.has(movieKey(movie)) ? "♥ In My List" : "＋ My List";
    save.onclick = () => {
      toggleFavorite(movie);
      save.textContent = favorites.has(movieKey(movie)) ? "♥ In My List" : "＋ My List";
    };

    actions.append(watch, save);
    content.append(title, metadata, description, actions);
    panel.append(close, backdrop, content);
    modal.append(panel);
    modal.addEventListener("click", event => { if (event.target === modal) closeDetails(); });
    document.body.append(modal);
    document.body.classList.add("sam-modal-open");
    close.focus();
  }

  function closeDetails() {
    $("#samflixDetails")?.remove();
    document.body.classList.remove("sam-modal-open");
  }

  function wirePlayer() {
    $("#closeBtn")?.addEventListener("click", closePlayer);
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        closeDetails();
        if ($("#player")?.style.display === "flex") closePlayer();
      }
    });
  }

  function playMovie(movie) {
    const player = $("#player");
    if (!player) return toast("Player element was not found.");
    activeMovie = movie;
    resetPlayer();
    player.style.display = "flex";
    document.body.classList.add("sam-player-open");

    const stream = getStream(movie);
    if (!stream) {
      showPlayerMessage("No stream is configured for this title yet.");
      return;
    }
    if (stream.kind === "iframe") {
      const frame = $("#frame");
      if (!frame) return showPlayerMessage("Iframe player is missing from index.html.");
      frame.src = stream.url;
      frame.style.display = "block";
      recordWatch(movie, 0, false);
      return;
    }

    const url = stream.url;
    const video = $("#videoPlayer");
    if (!video) return showPlayerMessage("Video element is missing from index.html.");
    video.style.display = "block";
    video.controls = true;
    video.playsInline = true;
    video.preload = "metadata";

    if (/\.m3u8(?:$|[?#])/i.test(url)) {
      if (window.Hls && Hls.isSupported()) {
        hlsInstance = new Hls();
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
        hlsInstance.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) showPlayerMessage("This stream could not be loaded. Try another source.");
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        video.play().catch(() => {});
      } else {
        showPlayerMessage("HLS playback is not supported in this browser.");
      }
    } else {
      video.src = url;
      video.play().catch(() => {});
    }

    video.ontimeupdate = () => {
      if (!video.duration || !Number.isFinite(video.duration)) return;
      recordWatch(movie, Math.round(video.currentTime / video.duration * 100), true);
    };
    video.onended = () => {
      delete history[movieKey(movie)];
      safeWrite(STORE.history, history);
      renderContinueWatching();
    };
    recordWatch(movie, 0, true);
  }

  function recordWatch(movie, progress, nativeVideo) {
    history[movieKey(movie)] = {
      title: text(movie.title),
      progress: Math.max(0, Math.min(99, progress)),
      updated: Date.now(),
      nativeVideo
    };
    safeWrite(STORE.history, history);
    renderContinueWatching();
  }

  function showPlayerMessage(message) {
    const player = $("#player");
    if (!player) return;
    const notice = document.createElement("div");
    notice.className = "sam-player-message";
    notice.textContent = message;
    player.append(notice);
  }

  function resetPlayer() {
    if (hlsInstance) {
      try { hlsInstance.destroy(); } catch {}
      hlsInstance = null;
    }
    const video = $("#videoPlayer");
    if (video) {
      video.pause();
      video.removeAttribute("src");
      video.load();
      video.style.display = "none";
      video.ontimeupdate = null;
      video.onended = null;
    }
    const frame = $("#frame");
    if (frame) {
      frame.src = "about:blank";
      frame.style.display = "none";
    }
    $$(".sam-player-message").forEach(node => node.remove());
  }

  function closePlayer() {
    resetPlayer();
    const player = $("#player");
    if (player) player.style.display = "none";
    document.body.classList.remove("sam-player-open");
    activeMovie = null;
  }

  function renderHero() {
    const hero = $("#heroBackground");
    if (!hero) return;
    const featured = catalog.find(movie => /wild robot/i.test(text(movie.title))) || catalog.find(movie => poster(movie));
    if (!featured) return;
    if (poster(featured)) hero.style.backgroundImage = `linear-gradient(90deg,rgba(8,8,13,.94),rgba(8,8,13,.5),rgba(8,8,13,.15)),linear-gradient(0deg,#101018,transparent 55%),url("${poster(featured).replace(/["\\]/g, "")}")`;
    setText("#heroCategory", featured.category || "Featured");
    setText("#heroTitle", featured.title);
    setText("#heroMeta", [featured.year, featured.category].filter(Boolean).join(" • "));
    setText("#heroDescription", featured.description || featured.overview || "Discover your next favorite on SamFlix.");
    $("#heroWatch")?.addEventListener("click", () => playMovie(featured));
    $("#heroInfo")?.addEventListener("click", () => showDetails(featured));
  }

  function setText(selector, value) {
    const node = $(selector);
    if (node) node.textContent = text(value);
  }

  function toast(message) {
    const node = $("#samflixToast");
    if (!node) return;
    node.textContent = message;
    node.classList.add("is-visible");
    clearTimeout(node._hideTimer);
    node._hideTimer = setTimeout(() => node.classList.remove("is-visible"), 1800);
  }

  function updateYear() {
    const year = $("#year");
    if (year) year.textContent = new Date().getFullYear();
  }

  // Retain compatibility with the inline closePlayer() in the existing HTML.
  window.closePlayer = closePlayer;
  window.playMovie = playMovie;
  window.openSet = function openSet(setName) {
    currentFilter = "all";
    searchTerm = text(setName).toLowerCase();
    const input = $("#search");
    if (input) input.value = setName;
    renderCatalog();
    $("#mainContainer")?.scrollIntoView({ behavior: "smooth" });
  };
})();

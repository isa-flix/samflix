const app = document.getElementById("app");
const playerScreen = document.getElementById("playerScreen");
const player = document.getElementById("player");

/* Group movies by category */
function groupByCategory(data) {
  const map = {};
  data.forEach(movie => {
    if (!map[movie.category]) {
      map[movie.category] = [];
    }
    map[movie.category].push(movie);
  });
  return map;
}

/* Create row */
function createRow(title, movies) {
  const row = document.createElement("div");
  row.className = "row";

  const heading = document.createElement("h2");
  heading.innerText = title;

  const container = document.createElement("div");
  container.className = "row-container";

  movies.forEach(movie => {
    const card = document.createElement("div");
    card.className = "card";
    card.tabIndex = 0;

    const img = document.createElement("img");
    img.src = movie.img;

    card.appendChild(img);

    card.onclick = () => playMovie(movie.video);

    card.addEventListener("keydown", e => {
      if (e.key === "Enter") playMovie(movie.video);
    });

    container.appendChild(card);
  });

  row.appendChild(heading);
  row.appendChild(container);

  return row;
}

/* Play movie */
function playMovie(src) {
  player.src = src;
  playerScreen.style.display = "flex";
  player.focus();
}

/* Navigation */
function setupNavigation() {
  document.addEventListener("keydown", e => {
    const cards = Array.from(document.querySelectorAll(".card"));
    const index = cards.indexOf(document.activeElement);

    if (e.key === "ArrowRight") cards[index + 1]?.focus();
    if (e.key === "ArrowLeft") cards[index - 1]?.focus();
    if (e.key === "ArrowDown") cards[index + 5]?.focus();
    if (e.key === "ArrowUp") cards[index - 5]?.focus();

    if (e.key === "Escape") {
      player.pause();
      playerScreen.style.display = "none";
    }
  });
}

/* Init */
function init() {
  const grouped = groupByCategory(MOVIES);

  Object.keys(grouped).forEach(category => {
    app.appendChild(createRow(category, grouped[category]));
  });

  setupNavigation();

  setTimeout(() => {
    document.querySelector(".card")?.focus();
  }, 300);
}

init();

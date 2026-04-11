const movieGrid = document.getElementById("movieGrid");
const loadMoreBtn = document.getElementById("loadMoreBtn");

const modal = document.getElementById("playerModal");
const player = document.getElementById("player");
const closePlayer = document.getElementById("closePlayer");

let visibleCount = 12;

function renderMovies() {
  movieGrid.innerHTML = "";

  movies.slice(0, visibleCount).forEach(movie => {
    const card = document.createElement("div");
    card.classList.add("movie-card");

    card.innerHTML = `
      <img src="${movie.image}" />
      <video src="${movie.video}" muted loop playsinline></video>
      <div class="movie-title">${movie.title}</div>
    `;

    const video = card.querySelector("video");

    // Hover preview
    card.addEventListener("mouseenter", () => {
      video.play().catch(() => {});
    });

    card.addEventListener("mouseleave", () => {
      video.pause();
      video.currentTime = 0;
    });

    // Click to open player
    card.addEventListener("click", () => {
      modal.style.display = "block";
      player.src = movie.video;
      player.play();
    });

    movieGrid.appendChild(card);
  });

  if (visibleCount >= movies.length) {
    loadMoreBtn.style.display = "none";
  }
}

loadMoreBtn.addEventListener("click", () => {
  visibleCount += 12;
  renderMovies();
});

closePlayer.onclick = () => {
  modal.style.display = "none";
  player.pause();
  player.src = "";
};

renderMovies();

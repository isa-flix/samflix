let movies = [
  {
    "id": "mp4_test",
    "title": "MP4 Test Video",
    "img": "https://peach.blender.org/wp-content/uploads/title_anouncement.jpg",
    "category": "Movies test",
    "video": "https://www.w3schools.com/html/mov_bbb.mp4"
  },
  {
    "id": "hls_test",
    "title": "HLS Test Stream",
    "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Big_Buck_Bunny_full_movie_cover.png/800px-Big_Buck_Bunny_full_movie_cover.png",
    "category": "Movies test",
    "video": "https://fl1.moveonjoy.com/STARZ_ENCORE_CLASSIC/index.m3u8"
  },

  { "id": "tt27613895", "title": "GOAT", "img": "https://www.themoviedb.org/t/p/w600_and_h900_face/wfuqMlaExcoYiUEvKfVpUTt1v4u.jpg", "category": "Cartoons" },
  { "id": "tt15678738", "title": "David", "img": "https://www.themoviedb.org/t/p/w600_and_h900_face/7lFG1WrCwAxBfyGK8ahlBVzXno7.jpg", "category": "Cartoons" },
  { "id": "tt26443616", "title": "Hoppers", "img": "https://www.themoviedb.org/t/p/w600_and_h900_face/xjtWQ2CL1mpmMNwuU5HeS4Iuwuu.jpg", "category": "Cartoons" },

  { "id": "tt15398776", "title": "Oppenheimer", "img": "https://www.themoviedb.org/t/p/w600_and_h900_face/2y48XTa483LRFIb5fDKOwr8DHWz.jpg", "category": "Movie" },
  { "id": "tt12042730", "title": "Project Hail Mary", "img": "https://www.themoviedb.org/t/p/w600_and_h900_face/wXmoUdNvLx8Iiplgbuc1svl3b2d.jpg", "category": "Movie" },
  { "id": "tt1375666", "title": "Inception", "img": "https://www.themoviedb.org/t/p/w600_and_h900_face/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg", "category": "Movie" },

  // Movie Sets
  { "id": "tt0114709", "title": "Toy Story", "img": "https://www.themoviedb.org/t/p/w1280/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg", "category": "MovieSet", "set": "Toy Story" },
  { "id": "tt0120363", "title": "Toy Story 2", "img": "https://www.themoviedb.org/t/p/w1280/4rbcp3ng8n1MKHjpeqW0L7Fnpzz.jpg", "category": "MovieSet", "set": "Toy Story" },
  { "id": "tt0435761", "title": "Toy Story 3", "img": "https://www.themoviedb.org/t/p/w1280/AbbXspMOwdvwWZgVN0nabZq03Ec.jpg", "category": "MovieSet", "set": "Toy Story" },

  { "id": "tt3794354", "title": "Sonic the Hedgehog", "img": "https://www.themoviedb.org/t/p/w600_and_h900_face/bljXY2zZSD6poD4dOPwIxQkFTUB.jpg", "category": "MovieSet", "set": "Sonic" },
  { "id": "tt12412888", "title": "Sonic 2", "img": "https://www.themoviedb.org/t/p/w600_and_h900_face/8E7mIpEpSATxX5JEuw55GYx9hfk.jpg", "category": "MovieSet", "set": "Sonic" }
];

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

        // 🔥 handle MovieSet grouping
        if (cat === "MovieSet") {
            const sets = [...new Set(movies.filter(m => m.category === cat).map(m => m.set))];

            sets.forEach(setName => {
                const firstMovie = movies.find(m => m.set === setName);
                const card = createCard(firstMovie);

                card.onclick = () => openSet(setName);

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
    container.innerHTML = `<h2>${setName}</h2>`;

    const grid = document.createElement("div");
    grid.className = "grid";

    movies
        .filter(m => m.set === setName)
        .forEach(m => grid.appendChild(createCard(m)));

    container.appendChild(grid);
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

    if (movie.video) {

        if (movie.video.endsWith(".mp4")) {
            video.src = movie.video;
            video.style.display = "block";
            video.play().catch(() => {});
        }

        else if (movie.video.endsWith(".m3u8")) {
            video.style.display = "block";

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

    filtered.forEach(m => grid.appendChild(createCard(m)));

    container.appendChild(grid);
});

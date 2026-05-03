let seriesList = [
    
    

    {
        id: "stranger_things",
        title: "Stranger Things",
        img: "https://www.themoviedb.org/t/p/w600_and_h900_face/cVxVGwHce6xnW8UaVUggaPXbmoE.jpg",
        tmdb_id: "66732",
        seasons: [
            { season: 1, episodes: 8 },
            { season: 2, episodes: 9 },
            { season: 3, episodes: 8 },
            { season: 4, episodes: 9 },
            { season: 5, episodes: 9 }
        ]
    },
    
    {
        id: "breaking_bad",
        title: "Breaking Bad",
        img: "https://www.themoviedb.org/t/p/w600_and_h900_face/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg",
        tmdb_id: "1396",
        seasons: [
            { season: 1, episodes: 7 },
            { season: 2, episodes: 13 },
            { season: 3, episodes: 13 },
            { season: 4, episodes: 13 },
            { season: 5, episodes: 16 }
        ]
    },

{
        id: "house_of-the-dragon",
        title: "House of the Dragon",
        img: "https://www.themoviedb.org/t/p/w600_and_h900_face/1awMFhtgWiucCJyCVkgbyJjfnJH.jpg",
        tmdb_id: "94997",
        seasons: [
            { season: 1, episodes: 10 },
            { season: 2, episodes: 8 },
            { season: 3, episodes: 0 }
        ]
    },
    
    {
        id: "the_flash",
        title: "The Flash",
        img: "https://www.themoviedb.org/t/p/w600_and_h900_face/yZevl2vHQgmosfwUdVNzviIfaWS.jpg",
        tmdb_id: "60735",
        seasons: [
            { season: 1, episodes: 23 },
            { season: 2, episodes: 23 },
            { season: 3, episodes: 23 },
            { season: 4, episodes: 23 },
            { season: 5, episodes: 22 },
            { season: 6, episodes: 19 },
            { season: 7, episodes: 18 },
            { season: 8, episodes: 20 },
            { season: 9, episodes: 13 }
        ]
    },

    {
        id: "avatar_the_last_airbender",
        title: "Avatar: The Last Airbender",
        img: "https://www.themoviedb.org/t/p/w600_and_h900_face/lzZpWEaqzP0qVA5nkCc5ASbNcSy.jpg",
        tmdb_id: "82452",
        seasons: [
            { season: 1, episodes: 10 },
            { season: 2, episodes: 7 }            
        ]
    },
    
    {
        id: "Wednesday",
        title: "Wednesday",
        img: "https://www.themoviedb.org/t/p/w600_and_h900_face/36xXlhEpQqVVPuiZhfoQuaY4OlA.jpg",
        tmdb_id: "119051",
        seasons: [
            { season: 1, episodes: 8 },
            { season: 2, episodes: 8 },
            { season: 3, episodes: 1 }
            
        ]
    }
];

let current = {};

/* HOME */
function showSeries() {
    let html = '<div class="grid">';
    seriesList.forEach(s => {
        html += `
            <div class="card" onclick="openSeries('${s.id}')">
                <img src="${s.img}">
                <p>${s.title}</p>
            </div>
        `;
    });
    html += '</div>';

    document.getElementById("app").innerHTML = html;
}

/* OPEN SERIES */
function openSeries(id) {
    let s = seriesList.find(x => x.id === id);

    current = { id: id, season: 1, episode: 1 };

    let saved = JSON.parse(localStorage.getItem(id));
    if (saved) current = saved;

    let html = `
        <button onclick="showSeries()">⬅ Back</button>
        <h2>${s.title}</h2>

        <div class="controls">
            Season:
            <select onchange="changeSeason('${id}', this.value)">
    `;

    s.seasons.forEach(se => {
        html += `<option value="${se.season}" ${se.season == current.season ? "selected":""}>
            Season ${se.season}
        </option>`;
    });

    html += `</select></div>`;
    html += `<div id="episodes"></div><div id="player"></div>`;

    document.getElementById("app").innerHTML = html;

    renderEpisodes(s);
    playEpisode(current.season, current.episode);
}

/* EPISODES */
function renderEpisodes(s) {
    let seasonData = s.seasons.find(x => x.season == current.season);

    let html = `<div class="episode-grid">`;

    for (let ep = 1; ep <= seasonData.episodes; ep++) {
        let thumb = `https://image.tmdb.org/t/p/w300/${s.tmdb_id}_S${current.season}_E${ep}.jpg`;

        html += `
            <div class="ep-btn ${ep == current.episode ? "active":""}"
            onclick="playEpisode(${current.season}, ${ep})">
                <img src="${thumb}" onerror="this.style.display='none'">
                S${current.season}E${ep}
            </div>
        `;
    }

    html += `</div>`;
    document.getElementById("episodes").innerHTML = html;
}

/* CHANGE SEASON */
function changeSeason(id, season) {
    current.season = parseInt(season);
    current.episode = 1;

    let s = seriesList.find(x => x.id === id);
    renderEpisodes(s);
}

/* PLAY EPISODE */
function playEpisode(season, episode) {
    current.season = season;
    current.episode = episode;

    let s = seriesList.find(x => x.id === current.id);

    localStorage.setItem(current.id, JSON.stringify(current));

    renderEpisodes(s);

    let url = `https://www.2embed.cc/embedtv/${s.tmdb_id}&s=${season}&e=${episode}`;

    document.getElementById("player").innerHTML = `
        <iframe src="${url}" allowfullscreen></iframe>
    `;

    document.getElementById("player").scrollIntoView({ behavior: "smooth" });
}

/* INIT */
showSeries();

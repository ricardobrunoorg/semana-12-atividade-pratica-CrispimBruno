
const API_KEY = "9afcb24d307bf92cca506161a769a1be";

const BASE_URL   = "https://api.themoviedb.org/3";
const IMG_BASE   = "https://image.tmdb.org/t/p/w500";


let currentEndpoint = "popular";
let isSearchMode = false;


const movieList = document.getElementById("movie-list");
const messageEl = document.getElementById("message");
const searchInput = document.getElementById("search");
const btnSearch  = document.getElementById("btnSearch");
const btnClear   = document.getElementById("btnClear");
const tabs       = document.querySelectorAll(".tab");

async function fetchMovies(query = "") {
  let url;

  if (query.trim()) {
    url = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(query)}&page=1`;
    isSearchMode = true;
  } else {
    url = `${BASE_URL}/movie/${currentEndpoint}?api_key=${API_KEY}&language=pt-BR&page=1`;
    isSearchMode = false;
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.results; // array de filmes
}

function createMovieCard(movie) {
  const card = document.createElement("div");
  card.classList.add("card");

  const posterWrap = document.createElement("div");
  posterWrap.classList.add("card__poster-wrap");

  if (movie.poster_path) {
    const img = document.createElement("img");
    img.classList.add("card__poster");
    img.src     = `${IMG_BASE}${movie.poster_path}`;
    img.alt     = movie.title;
    img.loading = "lazy";
    posterWrap.appendChild(img);
  } else {
    const noImg = document.createElement("div");
    noImg.classList.add("card__no-poster");
    noImg.textContent = "🎬";
    posterWrap.appendChild(noImg);
  }

  if (movie.vote_average) {
    const rating = document.createElement("span");
    rating.classList.add("card__rating");
    rating.textContent = movie.vote_average.toFixed(1);
    posterWrap.appendChild(rating);
  }

  card.appendChild(posterWrap);

  const body = document.createElement("div");
  body.classList.add("card__body");

  const title = document.createElement("h2");
  title.classList.add("card__title");
  title.textContent = movie.title;
  body.appendChild(title);

  const year = document.createElement("p");
  year.classList.add("card__year");
  year.textContent = movie.release_date
    ? movie.release_date.slice(0, 4)
    : "Ano desconhecido";
  body.appendChild(year);

  if (movie.overview) {
    const overview = document.createElement("p");
    overview.classList.add("card__overview");
    overview.textContent = movie.overview.length > 180
      ? movie.overview.slice(0, 180) + "…"
      : movie.overview;
    body.appendChild(overview);
  }

  card.appendChild(body);
  return card;
}

function renderMovies(movies) {
  movieList.innerHTML = "";

  if (!movies || movies.length === 0) {
    showMessage("Nenhum filme encontrado para esta busca.");
    return;
  }

  showMessage(""); // limpa mensagem anterior

  movies.forEach((movie, index) => {
    const card = createMovieCard(movie);
    // Escalonamento da animação fadeUp
    card.style.animationDelay = `${index * 40}ms`;
    movieList.appendChild(card);
  });
}

function showMessage(text) {
  messageEl.textContent = text;
}

function showSkeletons(count = 12) {
  movieList.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const sk = document.createElement("div");
    sk.classList.add("skeleton");
    sk.innerHTML = `
      <div class="skeleton__poster"></div>
      <div class="skeleton__body">
        <div class="skeleton__line skeleton__line--medium"></div>
        <div class="skeleton__line skeleton__line--short"></div>
        <div class="skeleton__line"></div>
        <div class="skeleton__line skeleton__line--medium"></div>
      </div>`;
    movieList.appendChild(sk);
  }
}

async function init() {
  showMessage("Carregando filmes…");
  showSkeletons();

  try {
    const movies = await fetchMovies();
    renderMovies(movies);
  } catch (error) {
    showMessage("Erro ao carregar filmes. Verifique sua API Key e tente novamente.");
    movieList.innerHTML = "";
    console.error("Erro ao buscar filmes:", error);
  }
}

async function runSearch() {
  const query = searchInput.value.trim();
  showSkeletons();
  showMessage(query ? `Buscando por "${query}"…` : "Carregando filmes…");

  btnClear.classList.toggle("visible", query.length > 0);

  try {
    const movies = await fetchMovies(query);
    renderMovies(movies);
  } catch (error) {
    showMessage("Erro ao buscar filmes. Verifique sua API Key e tente novamente.");
    movieList.innerHTML = "";
    console.error("Erro ao buscar filmes:", error);
  }
}

btnSearch.addEventListener("click", runSearch);

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") runSearch();
});

btnClear.addEventListener("click", () => {
  searchInput.value = "";
  btnClear.classList.remove("visible");
  init();
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    currentEndpoint = tab.dataset.endpoint;
    searchInput.value = "";
    btnClear.classList.remove("visible");
    init();
  });
});

init();

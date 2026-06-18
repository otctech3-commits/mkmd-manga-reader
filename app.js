const MDX = 'https://api.mangadex.org';
let currentPage = 0;
let currentFilter = 'popular';

async function loadManga(filter = 'popular', offset = 0) {
  document.getElementById('loading').style.display = 'block';
  
  let url = `${MDX}/manga?limit=20&offset=${offset}&includes[]=cover_art&contentRating[]=safe&contentRating[]=suggestive`;
  
  if (filter === 'popular') url += '&order[followedCount]=desc';
  if (filter === 'latest') url += '&order[latestUploadedChapter]=desc';
  if (filter === 'rating') url += '&order[rating]=desc';
  if (filter === 'completed') url += '&status[]=completed';
  
  const res = await fetch(url);
  const data = await res.json();
  
  document.getElementById('loading').style.display = 'none';
  renderManga(data.data, offset > 0);
}

function renderManga(mangaList, append = false) {
  const grid = document.getElementById('mangaGrid');
  if (!append) grid.innerHTML = '';
  
  mangaList.forEach(manga => {
    const cover = manga.relationships.find(r => r.type === 'cover_art');
    const coverUrl = cover? `https://uploads.mangadex.org/covers/${manga.id}/${cover.attributes.fileName}.256.jpg` : '';
    const title = manga.attributes.title.en || Object.values(manga.attributes.title)[0];
    
    const card = document.createElement('div');
    card.className = 'manga-card';
    card.onclick = () => window.location.href = `reader.html?id=${manga.id}`;
    card.innerHTML = `
      <img src="${coverUrl}" alt="${title}" loading="lazy">
      <div class="manga-info">
        <h3>${title}</h3>
        <div class="meta">
          <span class="status-badge">${manga.attributes.status}</span>
          <span><i class="fa-solid fa-star"></i> ${manga.attributes.rating?.average || 'N/A'}</span>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// Search
let searchTimeout;
document.getElementById('searchInput').addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  const query = e.target.value.trim();
  if (query.length < 2) return loadManga(currentFilter);
  
  searchTimeout = setTimeout(async () => {
    const res = await fetch(`${MDX}/manga?title=${encodeURIComponent(query)}&limit=20&includes[]=cover_art`);
    const data = await res.json();
    renderManga(data.data);
  }, 500);
});

// Filters
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    currentPage = 0;
    loadManga(currentFilter);
  });
});

// Init
loadManga();

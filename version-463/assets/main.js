(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  const slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
    let index = 0;

    const showSlide = function (nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        const nextIndex = Number(dot.getAttribute('data-hero-dot') || 0);
        showSlide(nextIndex);
      });
    });

    window.setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  const searchData = window.MOVIE_SEARCH_DATA || [];
  const searchInput = document.querySelector('[data-search-input]');
  const searchResults = document.querySelector('[data-search-results]');
  const searchSummary = document.querySelector('[data-search-summary]');
  const chips = Array.from(document.querySelectorAll('[data-filter]'));
  let activeFilter = 'all';

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';

  if (searchInput && initialQuery) {
    searchInput.value = initialQuery;
  }

  const createCard = function (movie) {
    const article = document.createElement('article');
    article.className = 'movie-card';
    article.innerHTML = [
      '<a class="poster-link" href="' + movie.url + '">',
      '<span class="poster-shell">',
      '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.style.display=\'none\'">',
      '<span class="poster-badge">' + escapeHtml(movie.categoryLabel) + '</span>',
      '</span>',
      '</a>',
      '<div class="card-content">',
      '<a href="' + movie.url + '" class="movie-title">' + escapeHtml(movie.title) + '</a>',
      '<div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '</div>'
    ].join('');
    return article;
  };

  const escapeHtml = function (value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  const renderSearch = function () {
    if (!searchResults || !searchSummary) {
      return;
    }

    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const matched = searchData.filter(function (movie) {
      const filterMatched = activeFilter === 'all' || movie.category === activeFilter;
      const text = [movie.title, movie.region, movie.year, movie.genre, movie.type, movie.tags].join(' ').toLowerCase();
      const queryMatched = !query || text.indexOf(query) !== -1;
      return filterMatched && queryMatched;
    }).slice(0, 120);

    searchResults.innerHTML = '';
    matched.forEach(function (movie) {
      searchResults.appendChild(createCard(movie));
    });

    if (matched.length) {
      searchSummary.textContent = '已显示匹配影片';
    } else {
      searchSummary.textContent = '没有找到匹配影片';
    }
  };

  if (searchResults) {
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        activeFilter = chip.getAttribute('data-filter') || 'all';
        chips.forEach(function (item) {
          item.classList.toggle('is-active', item === chip);
        });
        renderSearch();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', renderSearch);
    }

    renderSearch();
  }
})();

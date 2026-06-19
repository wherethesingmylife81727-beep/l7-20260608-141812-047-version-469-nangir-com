(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  document.addEventListener('error', function (event) {
    var target = event.target;
    if (target && target.tagName === 'IMG') {
      var frame = target.closest('.poster-frame');
      if (frame) {
        frame.classList.add('no-image');
      }
      var hero = target.closest('.hero-slide');
      if (hero) {
        target.style.display = 'none';
      }
    }
  }, true);

  var menuButton = document.querySelector('[data-mobile-menu]');
  var mobileNav = document.querySelector('.mobile-nav');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = selectAll('.hero-slide', hero);
    var dots = selectAll('.hero-dot', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function preparePlayer(player) {
    var video = player.querySelector('video');
    var trigger = player.querySelector('.player-trigger');
    var errorBox = player.querySelector('.player-error');
    var hlsInstance = null;

    if (!video) {
      return;
    }

    function setError(message) {
      if (errorBox) {
        errorBox.textContent = message || '';
      }
    }

    function attachSource() {
      var source = video.getAttribute('data-src');
      if (!source || video.getAttribute('data-ready') === 'true') {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setError('视频暂时无法载入，请稍后再试');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
      video.setAttribute('data-ready', 'true');
    }

    function togglePlay() {
      attachSource();
      if (video.paused) {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            setError('点击播放按钮后即可观看');
          });
        }
      } else {
        video.pause();
      }
    }

    attachSource();

    if (trigger) {
      trigger.addEventListener('click', togglePlay);
    }
    video.addEventListener('click', togglePlay);
    video.addEventListener('play', function () {
      player.classList.add('is-playing');
      setError('');
    });
    video.addEventListener('pause', function () {
      player.classList.remove('is-playing');
    });
    video.addEventListener('error', function () {
      setError('视频暂时无法载入，请稍后再试');
    });
    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  }

  selectAll('.player-box').forEach(preparePlayer);

  var searchRoot = document.querySelector('[data-search-page]');
  if (searchRoot && window.SiteSearchData) {
    var keyword = searchRoot.querySelector('[name="q"]');
    var region = searchRoot.querySelector('[name="region"]');
    var type = searchRoot.querySelector('[name="type"]');
    var results = searchRoot.querySelector('[data-search-results]');
    var empty = searchRoot.querySelector('[data-search-empty]');
    var params = new URLSearchParams(window.location.search);

    if (keyword && params.get('q')) {
      keyword.value = params.get('q');
    }

    function card(item) {
      return [
        '<a class="movie-card" href="' + item.url + '">',
        '<div class="poster-frame" data-title="' + escapeHtml(item.title) + '">',
        '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '<div class="poster-shade"></div>',
        '<div class="card-labels"><span class="badge">' + escapeHtml(item.region) + '</span><span class="badge">' + escapeHtml(item.year) + '</span></div>',
        '</div>',
        '<div class="movie-body">',
        '<h2 class="movie-title">' + escapeHtml(item.title) + '</h2>',
        '<div class="movie-meta"><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.genre) + '</span></div>',
        '<p class="movie-desc">' + escapeHtml(item.oneLine) + '</p>',
        '</div>',
        '</a>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function update() {
      var q = keyword ? keyword.value.trim().toLowerCase() : '';
      var regionValue = region ? region.value : '';
      var typeValue = type ? type.value : '';
      var list = window.SiteSearchData.filter(function (item) {
        var text = [item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine].join(' ').toLowerCase();
        var matchKeyword = !q || text.indexOf(q) !== -1;
        var matchRegion = !regionValue || item.region === regionValue;
        var matchType = !typeValue || item.type === typeValue;
        return matchKeyword && matchRegion && matchType;
      }).slice(0, 96);

      if (results) {
        results.innerHTML = list.map(card).join('');
      }
      if (empty) {
        empty.style.display = list.length ? 'none' : 'block';
      }
    }

    [keyword, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', update);
        control.addEventListener('change', update);
      }
    });
    update();
  }
})();

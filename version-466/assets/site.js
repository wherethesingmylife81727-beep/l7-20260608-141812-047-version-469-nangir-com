(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var button = $('[data-menu-toggle]');
        var menu = $('[data-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = $('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = $all('[data-hero-slide]', hero);
        var dots = $all('[data-hero-dot]', hero);
        var prev = $('[data-hero-prev]', hero);
        var next = $('[data-hero-next]', hero);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initLocalFilters() {
        $all('[data-filter-input]').forEach(function (input) {
            var section = input.closest('section') || document;
            var cards = $all('.movie-card', section);
            input.addEventListener('input', function () {
                var keyword = input.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute('data-title') || '',
                        card.getAttribute('data-genre') || '',
                        card.getAttribute('data-region') || '',
                        card.getAttribute('data-year') || '',
                        card.getAttribute('data-type') || '',
                        card.textContent || ''
                    ].join(' ').toLowerCase();
                    card.classList.toggle('is-hidden-card', keyword && text.indexOf(keyword) === -1);
                });
            });
        });
    }

    function movieCardHtml(movie) {
        return [
            '<article class="movie-card movie-card-compact">',
            '<a class="movie-cover" href="./' + movie.file + '" aria-label="观看' + escapeHtml(movie.title) + '">',
            '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '<span class="cover-shade"></span>',
            '<span class="cover-play">▶</span>',
            '<span class="cover-badge">' + escapeHtml(movie.type) + '</span>',
            '<span class="cover-year">' + escapeHtml(movie.year) + '</span>',
            '</a>',
            '<div class="movie-card-body">',
            '<a class="movie-title" href="./' + movie.file + '">' + escapeHtml(movie.title) + '</a>',
            '<p>' + escapeHtml(movie.desc) + '</p>',
            '<div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
            '</div>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"]/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[char];
        });
    }

    function initSearchPage() {
        var input = $('#search-keyword');
        var box = $('[data-search-results]');
        var title = $('[data-search-title]');
        if (!input || !box || !window.SEARCH_MOVIES) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        input.value = initial;

        function render() {
            var keyword = input.value.trim().toLowerCase();
            var source = window.SEARCH_MOVIES || [];
            var items = source.filter(function (movie) {
                if (!keyword) {
                    return movie.hot;
                }
                return movie.search.indexOf(keyword) !== -1;
            }).slice(0, 80);
            if (title) {
                title.textContent = keyword ? '为你找到相关影片' : '为你推荐相关影片';
            }
            box.innerHTML = items.map(movieCardHtml).join('');
            if (!items.length) {
                box.innerHTML = '<div class="detail-box"><h2>暂无匹配结果</h2><p>可以尝试影片名、地区、类型、年份或标签关键词。</p></div>';
            }
        }

        input.addEventListener('input', render);
        render();
    }

    function initPlayer() {
        var shell = $('[data-player]');
        if (!shell || !window.currentVideoStream) {
            return;
        }
        var video = $('video', shell);
        var cover = $('[data-play-action]', shell);
        var ready = false;
        var hls = null;

        function loadStream() {
            if (ready || !video) {
                return;
            }
            var streamUrl = window.currentVideoStream;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
            ready = true;
        }

        function playVideo(event) {
            if (event) {
                event.preventDefault();
            }
            loadStream();
            if (cover) {
                cover.classList.add('is-hidden');
            }
            video.setAttribute('controls', 'controls');
            var playPromise = video.play();
            if (playPromise && playPromise.catch) {
                playPromise.catch(function () {
                    video.setAttribute('controls', 'controls');
                });
            }
        }

        function toggleVideo(event) {
            if (!ready || video.paused) {
                playVideo(event);
            } else {
                video.pause();
            }
        }

        if (cover) {
            cover.addEventListener('click', playVideo);
        }
        video.addEventListener('click', toggleVideo);
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initLocalFilters();
        initSearchPage();
        initPlayer();
    });
})();
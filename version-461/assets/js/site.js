
(function () {
    'use strict';

    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
            return;
        }
        document.addEventListener('DOMContentLoaded', callback);
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function uniqueValues(movies, key) {
        return Array.from(new Set(movies.map(function (movie) {
            return movie[key];
        }).filter(Boolean))).sort(function (a, b) {
            return String(b).localeCompare(String(a), 'zh-CN');
        });
    }

    function createMovieCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return '' +
            '<article class="movie-card">' +
                '<a class="movie-poster" href="' + escapeHtml(movie.url) + '">' +
                    '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                    '<span class="poster-overlay">立即观看</span>' +
                '</a>' +
                '<div class="movie-info">' +
                    '<div class="movie-meta-line">' +
                        '<span>' + escapeHtml(movie.region) + '</span>' +
                        '<span>' + escapeHtml(movie.year) + '</span>' +
                        '<span>' + escapeHtml(movie.type) + '</span>' +
                    '</div>' +
                    '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
                    '<p>' + escapeHtml(movie.oneLine || '') + '</p>' +
                    '<div class="tag-row">' + tags + '</div>' +
                '</div>' +
            '</article>';
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    ready(function () {
        bindMobileNavigation();
        bindHeroCarousel();
        bindLocalFilters();
        bindGlobalSearchSuggest();
        bindSearchPage();
    });

    function bindMobileNavigation() {
        var button = document.querySelector('[data-mobile-toggle]');
        var nav = document.querySelector('[data-main-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function bindHeroCarousel() {
        var carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        var slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function play() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                play();
            });
        });

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', play);
        show(0);
        play();
    }

    function bindLocalFilters() {
        var panel = document.querySelector('[data-filter-panel]');
        var list = document.querySelector('[data-card-list]');
        if (!panel || !list) {
            return;
        }
        var keyword = panel.querySelector('[data-filter-keyword]');
        var type = panel.querySelector('[data-filter-type]');
        var region = panel.querySelector('[data-filter-region]');
        var year = panel.querySelector('[data-filter-year]');
        var reset = panel.querySelector('[data-filter-reset]');
        var counter = document.querySelector('[data-filter-count]');
        var cards = Array.from(list.querySelectorAll('[data-movie-card]'));

        function apply() {
            var q = normalize(keyword && keyword.value);
            var selectedType = normalize(type && type.value);
            var selectedRegion = normalize(region && region.value);
            var selectedYear = normalize(year && year.value);
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute('data-search'));
                var cardType = normalize(card.getAttribute('data-type'));
                var cardRegion = normalize(card.getAttribute('data-region'));
                var cardYear = normalize(card.getAttribute('data-year'));
                var matched = true;

                if (q && haystack.indexOf(q) === -1) {
                    matched = false;
                }
                if (selectedType && cardType !== selectedType) {
                    matched = false;
                }
                if (selectedRegion && cardRegion !== selectedRegion) {
                    matched = false;
                }
                if (selectedYear && cardYear !== selectedYear) {
                    matched = false;
                }

                card.classList.toggle('is-hidden', !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (counter) {
                counter.textContent = '当前显示 ' + visible + ' 部';
            }
        }

        [keyword, type, region, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });

        if (reset) {
            reset.addEventListener('click', function () {
                [keyword, type, region, year].forEach(function (control) {
                    if (control) {
                        control.value = '';
                    }
                });
                apply();
            });
        }
    }

    function bindGlobalSearchSuggest() {
        var forms = Array.from(document.querySelectorAll('[data-global-search]'));
        if (!forms.length || !window.SITE_MOVIES) {
            return;
        }

        forms.forEach(function (form) {
            var input = form.querySelector('.global-search-input');
            var suggest = form.querySelector('[data-search-suggest]');
            if (!input || !suggest) {
                return;
            }

            input.addEventListener('input', function () {
                var q = normalize(input.value);
                if (!q) {
                    suggest.classList.remove('is-open');
                    suggest.innerHTML = '';
                    return;
                }

                var results = window.SITE_MOVIES.filter(function (movie) {
                    var haystack = normalize([
                        movie.title,
                        movie.region,
                        movie.type,
                        movie.year,
                        movie.genre,
                        (movie.tags || []).join(' ')
                    ].join(' '));
                    return haystack.indexOf(q) !== -1;
                }).slice(0, 8);

                suggest.innerHTML = results.map(function (movie) {
                    return '' +
                        '<a href="' + escapeHtml(resolveUrl(movie.url)) + '">' +
                            '<img src="' + escapeHtml(resolveUrl(movie.cover)) + '" alt="' + escapeHtml(movie.title) + '">' +
                            '<span><strong>' + escapeHtml(movie.title) + '</strong><span>' + escapeHtml(movie.region + ' · ' + movie.year + ' · ' + movie.type) + '</span></span>' +
                        '</a>';
                }).join('');
                suggest.classList.toggle('is-open', results.length > 0);
            });

            document.addEventListener('click', function (event) {
                if (!form.contains(event.target)) {
                    suggest.classList.remove('is-open');
                }
            });
        });
    }

    function resolveUrl(url) {
        var inMovieDirectory = /\/movies\//.test(window.location.pathname);
        if (!inMovieDirectory) {
            return url;
        }
        return '../' + url.replace(/^\.\//, '');
    }

    function bindSearchPage() {
        var form = document.querySelector('[data-search-page-form]');
        var results = document.querySelector('[data-search-results]');
        var counter = document.querySelector('[data-search-count]');
        if (!form || !results || !window.SITE_MOVIES) {
            return;
        }

        var input = form.querySelector('input[name="q"]');
        var type = document.querySelector('[data-search-type]');
        var region = document.querySelector('[data-search-region]');
        var year = document.querySelector('[data-search-year]');
        var params = new URLSearchParams(window.location.search);

        fillSelect(type, uniqueValues(window.SITE_MOVIES, 'type'));
        fillSelect(region, uniqueValues(window.SITE_MOVIES, 'region'));
        fillSelect(year, uniqueValues(window.SITE_MOVIES, 'year'));

        if (params.get('q')) {
            input.value = params.get('q');
        }

        function render() {
            var q = normalize(input.value);
            var selectedType = normalize(type && type.value);
            var selectedRegion = normalize(region && region.value);
            var selectedYear = normalize(year && year.value);

            var matched = window.SITE_MOVIES.filter(function (movie) {
                var haystack = normalize([
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.oneLine,
                    (movie.tags || []).join(' ')
                ].join(' '));

                if (q && haystack.indexOf(q) === -1) {
                    return false;
                }
                if (selectedType && normalize(movie.type) !== selectedType) {
                    return false;
                }
                if (selectedRegion && normalize(movie.region) !== selectedRegion) {
                    return false;
                }
                if (selectedYear && normalize(movie.year) !== selectedYear) {
                    return false;
                }
                return q || selectedType || selectedRegion || selectedYear;
            }).slice(0, 200);

            results.innerHTML = matched.map(createMovieCard).join('');
            if (counter) {
                counter.textContent = matched.length ? '当前显示前 ' + matched.length + ' 条结果' : '暂无匹配结果，请调整关键词或筛选条件。';
            }
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var url = new URL(window.location.href);
            url.searchParams.set('q', input.value || '');
            window.history.replaceState({}, '', url);
            render();
        });

        [input, type, region, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', render);
                control.addEventListener('change', render);
            }
        });

        render();
    }

    function fillSelect(select, values) {
        if (!select) {
            return;
        }
        values.forEach(function (value) {
            var option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }
}());

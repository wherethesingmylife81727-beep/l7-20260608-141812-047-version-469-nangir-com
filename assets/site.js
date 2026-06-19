(function () {
    var navButton = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.site-nav');
    if (navButton && nav) {
        navButton.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function play() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                play();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                play();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                play();
            });
        });
        show(0);
        play();
    });

    document.querySelectorAll('.js-filter-root').forEach(function (root) {
        var input = root.querySelector('.js-search-input');
        var cards = Array.prototype.slice.call(root.querySelectorAll('.js-card'));
        var empty = root.querySelector('.js-empty-state');
        var filters = {};

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilters() {
            var query = normalize(input ? input.value : '');
            var visible = 0;
            cards.forEach(function (card) {
                var matchesText = !query || normalize(card.getAttribute('data-text')).indexOf(query) !== -1;
                var matchesFilters = Object.keys(filters).every(function (field) {
                    var value = filters[field];
                    return value === 'all' || card.getAttribute('data-' + field) === value;
                });
                var isVisible = matchesText && matchesFilters;
                card.style.display = isVisible ? '' : 'none';
                if (isVisible) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        }

        root.querySelectorAll('[data-filter-field]').forEach(function (button) {
            button.addEventListener('click', function () {
                var field = button.getAttribute('data-filter-field');
                var value = button.getAttribute('data-filter-value');
                filters[field] = value;
                root.querySelectorAll('[data-filter-field="' + field + '"]').forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                applyFilters();
            });
        });

        if (input) {
            input.addEventListener('input', applyFilters);
        }
        applyFilters();
    });
})();

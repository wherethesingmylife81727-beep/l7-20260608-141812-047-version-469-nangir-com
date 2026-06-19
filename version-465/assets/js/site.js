(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var navigation = document.querySelector('.site-nav');

    if (menuButton && navigation) {
        menuButton.addEventListener('click', function () {
            navigation.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    }

    function restartTimer() {
        if (timer) {
            window.clearInterval(timer);
        }
        if (slides.length > 1) {
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 6500);
        }
    }

    if (slides.length) {
        showSlide(0);
        restartTimer();
    }

    if (prev) {
        prev.addEventListener('click', function () {
            showSlide(current - 1);
            restartTimer();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            showSlide(current + 1);
            restartTimer();
        });
    }

    dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
            showSlide(dotIndex);
            restartTimer();
        });
    });

    var simpleFilterInput = document.querySelector('[data-card-filter]');
    var simpleFilterContainer = document.querySelector('[data-card-container]');
    var simpleEmpty = document.querySelector('[data-no-result]');

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function filterCards(cards, predicate, emptyNode) {
        var visibleCount = 0;
        cards.forEach(function (card) {
            var visible = predicate(card);
            card.hidden = !visible;
            if (visible) {
                visibleCount += 1;
            }
        });
        if (emptyNode) {
            emptyNode.hidden = visibleCount !== 0;
        }
    }

    if (simpleFilterInput && simpleFilterContainer) {
        var simpleCards = Array.prototype.slice.call(simpleFilterContainer.querySelectorAll('.movie-card'));
        simpleFilterInput.addEventListener('input', function () {
            var keyword = normalize(simpleFilterInput.value);
            filterCards(simpleCards, function (card) {
                return !keyword || normalize(card.getAttribute('data-keywords')).indexOf(keyword) !== -1;
            }, simpleEmpty);
        });
    }

    var searchContainer = document.querySelector('[data-search-container]');
    if (searchContainer) {
        var cards = Array.prototype.slice.call(searchContainer.querySelectorAll('.movie-card'));
        var input = document.querySelector('[data-search-input]');
        var region = document.querySelector('[data-search-region]');
        var type = document.querySelector('[data-search-type]');
        var year = document.querySelector('[data-search-year]');
        var reset = document.querySelector('[data-search-reset]');
        var empty = document.querySelector('[data-search-empty]');

        function runSearch() {
            var keyword = normalize(input && input.value);
            var regionValue = normalize(region && region.value);
            var typeValue = normalize(type && type.value);
            var yearValue = normalize(year && year.value);

            filterCards(cards, function (card) {
                var keywords = normalize(card.getAttribute('data-keywords'));
                var cardRegion = normalize(card.getAttribute('data-region'));
                var cardType = normalize(card.getAttribute('data-type'));
                var cardYear = normalize(card.getAttribute('data-year'));

                return (!keyword || keywords.indexOf(keyword) !== -1) &&
                    (!regionValue || cardRegion === regionValue) &&
                    (!typeValue || cardType === typeValue) &&
                    (!yearValue || cardYear === yearValue);
            }, empty);
        }

        [input, region, type, year].forEach(function (node) {
            if (node) {
                node.addEventListener('input', runSearch);
                node.addEventListener('change', runSearch);
            }
        });

        if (reset) {
            reset.addEventListener('click', function () {
                if (input) {
                    input.value = '';
                }
                if (region) {
                    region.value = '';
                }
                if (type) {
                    type.value = '';
                }
                if (year) {
                    year.value = '';
                }
                runSearch();
            });
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query && input) {
            input.value = query;
            runSearch();
        }
    }
})();

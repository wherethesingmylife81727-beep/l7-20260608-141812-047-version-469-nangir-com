(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var button = qs("[data-menu-toggle]");
        var menu = qs("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initHero() {
        var slider = qs("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = qsa("[data-hero-slide]", slider);
        var dots = qsa("[data-hero-dot]", slider);
        var previous = qs("[data-hero-prev]", slider);
        var next = qs("[data-hero-next]", slider);
        var index = 0;
        var timer;

        function show(target) {
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function restart() {
            window.clearInterval(timer);
            start();
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                restart();
            });
        });

        if (previous) {
            previous.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }

        start();
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initFilters() {
        var scopes = qsa("[data-filter-scope]");
        scopes.forEach(function (scope) {
            var page = scope.closest("main") || document;
            var input = qs("[data-filter-input]", page);
            var yearSelect = qs("[data-filter-year]", page);
            var categoryButtons = qsa("[data-filter-category]", page);
            var empty = qs("[data-empty-state]", page);
            var activeCategory = "all";
            var cards = qsa("[data-movie-card]", scope);

            function apply() {
                var keyword = normalize(input ? input.value : "");
                var year = yearSelect ? yearSelect.value : "all";
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute("data-search"));
                    var cardCategory = card.getAttribute("data-category") || "";
                    var cardYear = card.getAttribute("data-year") || "";
                    var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchCategory = activeCategory === "all" || cardCategory === activeCategory;
                    var matchYear = year === "all" || cardYear === year;
                    var matched = matchKeyword && matchCategory && matchYear;
                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            if (input) {
                input.addEventListener("input", apply);
                var params = new URLSearchParams(window.location.search);
                var q = params.get("q");
                if (q) {
                    input.value = q;
                }
            }

            if (yearSelect) {
                yearSelect.addEventListener("change", apply);
            }

            categoryButtons.forEach(function (button) {
                button.addEventListener("click", function () {
                    activeCategory = button.getAttribute("data-filter-category") || "all";
                    categoryButtons.forEach(function (item) {
                        item.classList.toggle("is-active", item === button);
                    });
                    apply();
                });
            });

            apply();
        });
    }

    window.setupMoviePlayer = function (source) {
        var video = qs("[data-player-video]");
        var overlay = qs("[data-player-overlay]");
        var hlsInstance = null;
        var loaded = false;

        function load() {
            if (!video || loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function play() {
            if (!video) {
                return;
            }
            load();
            video.setAttribute("controls", "controls");
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }

        if (video) {
            video.addEventListener("click", function () {
                if (!loaded || video.paused) {
                    play();
                }
            });
            video.addEventListener("ended", function () {
                if (hlsInstance && typeof hlsInstance.stopLoad === "function") {
                    hlsInstance.stopLoad();
                }
            });
        }
    };

    document.addEventListener("DOMContentLoaded", function () {
        initMenu();
        initHero();
        initFilters();
    });
})();

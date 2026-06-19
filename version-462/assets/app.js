(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      panel.hidden = expanded;
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    start();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, "");
  }

  function initSearchAndFilters() {
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var localInputs = Array.prototype.slice.call(document.querySelectorAll("[data-local-search]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-list] .movie-card"));
    var chips = Array.prototype.slice.call(document.querySelectorAll(".filter-chip"));
    var activeFilter = "";

    localInputs.forEach(function (input) {
      input.value = query;
      input.addEventListener("input", function () {
        query = input.value;
        applyFilter();
      });
    });

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (item) {
          item.classList.remove("is-active");
        });
        chip.classList.add("is-active");
        activeFilter = chip.getAttribute("data-filter") || "";
        applyFilter();
      });
    });

    function applyFilter() {
      if (!cards.length) {
        return;
      }
      var key = normalize(query);
      var filter = normalize(activeFilter);
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-category"),
          card.textContent
        ].join(" "));
        var matchedQuery = !key || haystack.indexOf(key) !== -1;
        var matchedFilter = !filter || haystack.indexOf(filter) !== -1;
        card.classList.toggle("is-hidden", !(matchedQuery && matchedFilter));
      });
    }

    applyFilter();
  }

  function initImages() {
    var images = Array.prototype.slice.call(document.querySelectorAll(".cover-img"));
    images.forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("is-missing");
        image.removeAttribute("src");
      }, { once: true });
    });
  }

  window.initPlayer = function (source) {
    var box = document.querySelector(".player-box");
    if (!box) {
      return;
    }
    var video = box.querySelector("[data-player]");
    var overlay = box.querySelector(".player-overlay");
    if (!video || !overlay || !source) {
      return;
    }

    function attach() {
      if (video.getAttribute("data-loaded") === "1") {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
        hls.loadSource(source);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        video.src = source;
      }
      video.setAttribute("data-loaded", "1");
    }

    function play() {
      attach();
      overlay.classList.add("is-hidden");
      video.controls = true;
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    overlay.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.getAttribute("data-loaded") !== "1") {
        play();
      }
    });
  };

  ready(function () {
    initMenu();
    initHero();
    initSearchAndFilters();
    initImages();
  });
})();

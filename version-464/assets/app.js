(function() {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (toggle && panel) {
      toggle.addEventListener("click", function() {
        panel.classList.toggle("open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function(slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach(function(dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === current);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function() {
          show(current + 1);
        }, 5600);
      }

      if (prev) {
        prev.addEventListener("click", function() {
          show(current - 1);
          restart();
        });
      }
      if (next) {
        next.addEventListener("click", function() {
          show(current + 1);
          restart();
        });
      }
      dots.forEach(function(dot, index) {
        dot.addEventListener("click", function() {
          show(index);
          restart();
        });
      });
      show(0);
      restart();
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-global-form]")).forEach(function(form) {
      form.addEventListener("submit", function(event) {
        event.preventDefault();
        var input = form.querySelector("input");
        var query = input ? input.value.trim() : "";
        var url = "search.html";
        if (query) {
          url += "?q=" + encodeURIComponent(query);
        }
        window.location.href = url;
      });
    });

    var params = new URLSearchParams(window.location.search);
    var keywordFromUrl = params.get("q") || "";

    Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]")).forEach(function(form) {
      var keyword = form.querySelector("[data-filter-keyword]");
      var type = form.querySelector("[data-filter-type]");
      var year = form.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
      var empty = document.querySelector("[data-empty]");

      if (keyword && keywordFromUrl) {
        keyword.value = keywordFromUrl;
      }

      function runFilter() {
        var term = keyword ? keyword.value.trim().toLowerCase() : "";
        var typeValue = type ? type.value : "";
        var yearValue = year ? year.value : "";
        var visible = 0;

        cards.forEach(function(card) {
          var text = (card.getAttribute("data-title") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-genre") + " " + card.getAttribute("data-tags")).toLowerCase();
          var matchTerm = !term || text.indexOf(term) !== -1;
          var matchType = !typeValue || card.getAttribute("data-type") === typeValue;
          var matchYear = !yearValue || card.getAttribute("data-year") === yearValue;
          var showCard = matchTerm && matchType && matchYear;
          card.style.display = showCard ? "" : "none";
          if (showCard) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }

      [keyword, type, year].forEach(function(field) {
        if (field) {
          field.addEventListener("input", runFilter);
          field.addEventListener("change", runFilter);
        }
      });

      form.addEventListener("submit", function(event) {
        event.preventDefault();
        runFilter();
      });

      runFilter();
    });
  });
})();

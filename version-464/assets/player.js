(function() {
  function attachPlayer(shell) {
    var video = shell.querySelector("video");
    var button = shell.querySelector(".play-mask");
    if (!video || !button) {
      return;
    }
    var stream = video.getAttribute("data-stream");
    var hlsInstance = null;

    function bindStream() {
      if (!stream) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        if (!video.getAttribute("src")) {
          video.setAttribute("src", stream);
        }
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        }
        return;
      }
      if (!video.getAttribute("src")) {
        video.setAttribute("src", stream);
      }
    }

    function play() {
      bindStream();
      shell.classList.add("is-playing");
      var action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function() {
          shell.classList.remove("is-playing");
        });
      }
    }

    button.addEventListener("click", play);
    video.addEventListener("click", function() {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function() {
      shell.classList.add("is-playing");
    });
    video.addEventListener("pause", function() {
      if (!video.ended) {
        shell.classList.remove("is-playing");
      }
    });
    video.addEventListener("ended", function() {
      shell.classList.remove("is-playing");
    });
  }

  if (document.readyState !== "loading") {
    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(attachPlayer);
  } else {
    document.addEventListener("DOMContentLoaded", function() {
      Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(attachPlayer);
    });
  }
})();

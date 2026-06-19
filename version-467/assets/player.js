(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        Array.prototype.slice.call(document.querySelectorAll(".player-frame")).forEach(function (frame) {
            var video = frame.querySelector("video");
            var button = frame.querySelector(".play-overlay");
            if (!video || !button) {
                return;
            }
            var url = video.getAttribute("data-url");
            var loaded = false;
            var hls = null;

            function begin() {
                if (!url) {
                    return;
                }
                frame.classList.add("is-playing");
                if (!loaded) {
                    if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.src = url;
                        video.play().catch(function () {});
                    } else if (window.Hls && window.Hls.isSupported()) {
                        hls = new window.Hls({
                            maxBufferLength: 30
                        });
                        hls.loadSource(url);
                        hls.attachMedia(video);
                        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            video.play().catch(function () {});
                        });
                    } else {
                        video.src = url;
                        video.play().catch(function () {});
                    }
                    loaded = true;
                } else {
                    video.play().catch(function () {});
                }
            }

            button.addEventListener("click", begin);
            video.addEventListener("click", function () {
                if (video.paused) {
                    begin();
                }
            });
            window.addEventListener("pagehide", function () {
                if (hls) {
                    hls.destroy();
                    hls = null;
                }
            });
        });
    });
}());

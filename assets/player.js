(function () {
    window.initMoviePlayer = function (streamUrl) {
        var video = document.getElementById('movie-player');
        var overlay = document.getElementById('player-overlay');
        if (!video || !streamUrl) {
            return;
        }

        var attached = false;

        function attachStream() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function startPlayback() {
            attachStream();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var action = video.play();
            if (action && typeof action.catch === 'function') {
                action.catch(function () {});
            }
        }

        attachStream();
        if (overlay) {
            overlay.addEventListener('click', startPlayback);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                startPlayback();
            }
        });
        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });
    };
})();

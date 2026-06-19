(function () {
    function loadHls(callback) {
        if (window.Hls) {
            callback();
            return;
        }

        var existing = document.querySelector('script[data-hls-loader]');
        if (existing) {
            existing.addEventListener('load', callback, { once: true });
            return;
        }

        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
        script.async = true;
        script.setAttribute('data-hls-loader', 'true');
        script.addEventListener('load', callback, { once: true });
        document.head.appendChild(script);
    }

    function setMessage(box, text) {
        var message = box.querySelector('[data-player-message]');
        if (message) {
            message.textContent = text;
        }
    }

    function attachSource(box, video, source, done) {
        if (!source) {
            setMessage(box, '未找到播放地址');
            return;
        }

        if (video.dataset.ready === 'true') {
            done();
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.dataset.ready = 'true';
            done();
            return;
        }

        loadHls(function () {
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hls.loadSource(source);
                hls.attachMedia(video);
                video._hls = hls;
                video.dataset.ready = 'true';

                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    done();
                });

                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setMessage(box, '播放加载失败，请刷新后重试');
                    }
                });
            } else {
                video.src = source;
                video.dataset.ready = 'true';
                done();
            }
        });
    }

    function initPlayer(box) {
        var video = box.querySelector('video[data-src]');
        var button = box.querySelector('[data-play-button]');

        if (!video || !button) {
            return;
        }

        var source = video.getAttribute('data-src');

        function startPlayback() {
            setMessage(box, '正在加载播放源');
            attachSource(box, video, source, function () {
                var playPromise = video.play();
                box.classList.add('is-playing');

                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        box.classList.remove('is-playing');
                        setMessage(box, '浏览器阻止了自动播放，请再次点击播放');
                    });
                }
            });
        }

        button.addEventListener('click', startPlayback);

        video.addEventListener('click', function () {
            if (video.paused) {
                startPlayback();
            } else {
                video.pause();
            }
        });

        video.addEventListener('play', function () {
            box.classList.add('is-playing');
        });

        video.addEventListener('pause', function () {
            if (!video.ended) {
                box.classList.remove('is-playing');
                setMessage(box, '已暂停，点击继续播放');
            }
        });

        video.addEventListener('ended', function () {
            box.classList.remove('is-playing');
            setMessage(box, '播放结束，可重新播放');
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initPlayer);
})();

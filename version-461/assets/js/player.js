
(function () {
    'use strict';

    var hlsPromise = null;
    var hlsCdn = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';

    function loadHls() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        if (hlsPromise) {
            return hlsPromise;
        }
        hlsPromise = new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.src = hlsCdn;
            script.async = true;
            script.onload = function () {
                if (window.Hls) {
                    resolve(window.Hls);
                } else {
                    reject(new Error('HLS library did not load.'));
                }
            };
            script.onerror = function () {
                reject(new Error('Unable to load HLS library.'));
            };
            document.head.appendChild(script);
        });
        return hlsPromise;
    }

    function setStatus(box, message) {
        var status = box.querySelector('[data-player-status]');
        if (status) {
            status.textContent = message;
        }
    }

    function startVideo(box) {
        var video = box.querySelector('video[data-src]');
        if (!video) {
            return;
        }
        var source = video.getAttribute('data-src');
        if (!source) {
            setStatus(box, '未找到播放源。');
            return;
        }

        box.classList.add('is-playing');
        setStatus(box, '正在初始化播放源，请稍候。');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.play().then(function () {
                setStatus(box, '正在播放。');
            }).catch(function () {
                setStatus(box, '浏览器阻止了自动播放，请再次点击播放器。');
                box.classList.remove('is-playing');
            });
            return;
        }

        loadHls().then(function (Hls) {
            if (!Hls.isSupported()) {
                video.src = source;
                return video.play();
            }
            var hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                video.play().then(function () {
                    setStatus(box, '正在播放。');
                }).catch(function () {
                    setStatus(box, '浏览器阻止了自动播放，请再次点击播放器。');
                    box.classList.remove('is-playing');
                });
            });
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    setStatus(box, '播放源加载失败，请刷新页面或稍后再试。');
                    box.classList.remove('is-playing');
                    hls.destroy();
                }
            });
        }).catch(function () {
            video.src = source;
            video.play().then(function () {
                setStatus(box, '正在播放。');
            }).catch(function () {
                setStatus(box, '当前浏览器无法加载 HLS 播放源，请使用 Safari、Chrome 或 Edge 最新版本。');
                box.classList.remove('is-playing');
            });
        });
    }

    document.addEventListener('click', function (event) {
        var button = event.target.closest('[data-play-button]');
        if (!button) {
            return;
        }
        var box = button.closest('[data-player-box]');
        if (box) {
            startVideo(box);
        }
    });
}());

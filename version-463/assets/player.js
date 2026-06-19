import { H as Hls } from './hls-vendor.js';

const players = document.querySelectorAll('[data-player]');

players.forEach(function (player) {
  const video = player.querySelector('video');
  const overlay = player.querySelector('[data-play-overlay]');
  const playToggle = player.querySelector('[data-play-toggle]');
  const muteToggle = player.querySelector('[data-mute-toggle]');
  const fullscreen = player.querySelector('[data-fullscreen]');
  const loading = player.querySelector('[data-player-loading]');
  const status = player.querySelector('[data-player-status]');
  const source = video ? video.getAttribute('data-src') : '';
  let hls = null;

  const setStatus = function (message) {
    if (status) {
      status.textContent = message || '';
    }
  };

  const hideLoading = function () {
    if (loading) {
      loading.classList.add('is-hidden');
    }
  };

  const showOverlay = function (show) {
    if (overlay) {
      overlay.classList.toggle('is-hidden', !show);
    }
  };

  const updatePlayState = function () {
    const isPlaying = video && !video.paused;
    player.classList.toggle('is-playing', Boolean(isPlaying));
    showOverlay(!isPlaying);
    if (playToggle) {
      playToggle.textContent = isPlaying ? '暂停' : '播放';
    }
  };

  const startPlayback = function () {
    if (!video) {
      return;
    }

    const playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        setStatus('点击播放按钮开始播放');
      });
    }
  };

  if (video && source) {
    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        hideLoading();
        setStatus('');
      });
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          setStatus('网络连接异常，正在重新加载');
          hls.startLoad();
          return;
        }

        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          setStatus('媒体加载异常，正在恢复播放');
          hls.recoverMediaError();
          return;
        }

        setStatus('当前视频暂时无法播放');
        hls.destroy();
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', hideLoading, { once: true });
    } else {
      hideLoading();
      setStatus('当前浏览器暂不支持此视频播放');
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      } else {
        video.pause();
      }
    });
    video.addEventListener('play', updatePlayState);
    video.addEventListener('pause', updatePlayState);
    video.addEventListener('waiting', function () {
      if (loading) {
        loading.classList.remove('is-hidden');
      }
    });
    video.addEventListener('playing', hideLoading);
  }

  if (overlay) {
    overlay.addEventListener('click', startPlayback);
  }

  if (playToggle) {
    playToggle.addEventListener('click', function () {
      if (!video) {
        return;
      }

      if (video.paused) {
        startPlayback();
      } else {
        video.pause();
      }
    });
  }

  if (muteToggle) {
    muteToggle.addEventListener('click', function () {
      if (!video) {
        return;
      }

      video.muted = !video.muted;
      muteToggle.textContent = video.muted ? '取消静音' : '静音';
    });
  }

  if (fullscreen) {
    fullscreen.addEventListener('click', function () {
      if (!video) {
        return;
      }

      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (video.requestFullscreen) {
        video.requestFullscreen();
      }
    });
  }

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
});

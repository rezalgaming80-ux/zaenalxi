document.addEventListener("DOMContentLoaded", () => {
  const intro = document.querySelector(".intro-screen");
  if (intro) {
    window.setTimeout(() => intro.classList.add("is-hidden"), 5200);
    intro.addEventListener(
      "transitionend",
      () => {
        if (intro.classList.contains("is-hidden")) intro.remove();
      },
      { once: true },
    );
  }

  const widget = document.querySelector(".music-widget");
  if (!widget) return;
  const audio = widget.querySelector("audio");
  const cover = widget.querySelector(".music-cover");
  const title = widget.querySelector(".music-title");
  const artist = widget.querySelector(".music-artist");
  const play = widget.querySelector(".play-btn");
  const toggle = widget.querySelector(".music-toggle");
  const progress = widget.querySelector(".music-progress");
  const progressBar = widget.querySelector(".music-progress i");
  const list = widget.querySelector(".music-list");
  const folderInput = widget.querySelector("#audio-folder");
  let tracks = [];
  let current = 0;

  const setPlayingState = (playing) => {
    widget.classList.toggle("is-playing", playing);
    play.querySelector("span").textContent = playing ? "PAUSE" : "PLAY";
  };

  const slugToTitle = (filename) =>
    filename
      .replace(/\.mp3$/i, "")
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  const getCover = (filename) =>
    /gray|raven|pgr|punishing/i.test(filename)
      ? "assets/pgr-roster.jpg"
      : "assets/wuthering-rover.jpeg";
  const getArtist = (filename) =>
    /gray|raven|pgr|punishing/i.test(filename)
      ? "Punishing: Gray Raven"
      : /wuthering|wave|rover/i.test(filename)
        ? "Wuthering Waves"
        : "Resonance Protocol";

  const openMusicDB = () =>
    new Promise((resolve, reject) => {
      const request = indexedDB.open("resonance-music", 1);
      request.onupgradeneeded = () =>
        request.result.createObjectStore("tracks", { keyPath: "name" });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

  const saveLocalFiles = async (files) => {
    try {
      const db = await openMusicDB();
      const transaction = db.transaction("tracks", "readwrite");
      files.forEach((file) =>
        transaction
          .objectStore("tracks")
          .put({ name: file.name, type: file.type, buffer: file }),
      );
    } catch (error) {
      console.warn("Playlist tidak dapat disimpan di browser ini.", error);
    }
  };

  const restoreLocalFiles = async () => {
    try {
      const db = await openMusicDB();
      const files = await new Promise((resolve, reject) => {
        const request = db
          .transaction("tracks", "readonly")
          .objectStore("tracks")
          .getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      if (files.length)
        renderLocalFiles(
          files.map(
            (item) =>
              new File([item.buffer], item.name, {
                type: item.type || "audio/mpeg",
              }),
          ),
        );
    } catch (error) {
      console.warn("Playlist tersimpan belum dapat dipulihkan.", error);
    }
  };

  const renderTracks = (files) => {
    list.innerHTML = "";
    tracks = files.map((src, index) => {
      const filename = decodeURIComponent(src.split("/").pop());
      const track = {
        src,
        title: slugToTitle(filename),
        artist: getArtist(filename),
        cover: getCover(filename),
      };
      const item = document.createElement("div");
      item.className = "music-track";
      item.dataset.src = track.src;
      item.dataset.title = track.title;
      item.dataset.artist = track.artist;
      item.dataset.cover = track.cover;
      item.innerHTML = `<img src="${track.cover}" alt="" /><span>${track.title}</span><small>${String(index + 1).padStart(2, "0")}</small>`;
      item.addEventListener("click", () => loadTrack(index, true));
      list.appendChild(item);
      return track;
    });
    if (tracks.length) loadTrack(0);
  };

  const renderLocalFiles = (files) => {
    const existingTracks = [...tracks];
    const existingNames = new Set(
      existingTracks.map((track) => track.title.toLowerCase()),
    );
    const newTracks = files
      .filter(
        (file) => !existingNames.has(slugToTitle(file.name).toLowerCase()),
      )
      .map((file) => {
        const isPgr = /gray|raven|pgr|punishing/i.test(file.name);
        return {
          src: URL.createObjectURL(file),
          title: slugToTitle(file.name),
          artist: isPgr ? "Punishing: Gray Raven" : getArtist(file.name),
          cover: isPgr
            ? "assets/pgr-roster.jpg"
            : "assets/wuthering-rover.jpeg",
        };
      });
    tracks = [...existingTracks, ...newTracks];
    list.innerHTML = "";
    tracks.forEach((track, index) => {
      const item = document.createElement("div");
      item.className = "music-track";
      item.innerHTML = `<img src="${track.cover}" alt="" /><span>${track.title}</span><small>${String(index + 1).padStart(2, "0")}</small>`;
      item.addEventListener("click", () => loadTrack(index, true));
      list.appendChild(item);
    });
    loadTrack(current);
  };

  const loadTrack = (index, autoplay = false) => {
    if (!tracks.length) return;
    current = (index + tracks.length) % tracks.length;
    const track = tracks[current];
    audio.src = track.src;
    title.textContent = track.title;
    artist.textContent = track.artist;
    cover.src = track.cover;
    [...list.children].forEach((item, i) =>
      item.classList.toggle("active", i === current),
    );
    if (autoplay) audio.play().catch(() => {});
    setPlayingState(autoplay);
  };

  const discoverMp3 = async () => {
    try {
      const response = await fetch("assets/audio/");
      if (!response.ok) throw new Error("Audio directory unavailable");
      const html = await response.text();
      const files = [
        ...new DOMParser()
          .parseFromString(html, "text/html")
          .querySelectorAll("a[href]"),
      ]
        .map((link) => link.getAttribute("href"))
        .filter((href) => href && /\.mp3$/i.test(href))
        .map(
          (href) => `assets/audio/${decodeURIComponent(href.split("/").pop())}`,
        );
      if (files.length) renderTracks([...new Set(files)].sort());
    } catch (error) {
      tracks = [...list.querySelectorAll(".music-track")].map((item) => ({
        src: item.dataset.src,
        title: item.dataset.title,
        artist: item.dataset.artist,
        cover: item.dataset.cover,
      }));
      tracks.forEach((track, index) =>
        list.children[index]?.addEventListener("click", () =>
          loadTrack(index, true),
        ),
      );
      loadTrack(0);
    }
  };

  play.addEventListener("click", (event) => {
    event.stopPropagation();
    if (audio.paused) {
      audio.play().catch(() => {});
      setPlayingState(true);
    } else {
      audio.pause();
      setPlayingState(false);
    }
  });
  audio.addEventListener("play", () => setPlayingState(true));
  audio.addEventListener("pause", () => setPlayingState(false));
  widget
    .querySelector(".previous-btn")
    .addEventListener("click", () => loadTrack(current - 1, true));
  widget
    .querySelector(".next-btn")
    .addEventListener("click", () => loadTrack(current + 1, true));
  audio.addEventListener("ended", () => loadTrack(current + 1, true));
  audio.addEventListener("timeupdate", () => {
    if (audio.duration)
      progressBar.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
  });
  progress.addEventListener("click", (event) => {
    if (audio.duration)
      audio.currentTime =
        (event.offsetX / progress.clientWidth) * audio.duration;
  });
  folderInput?.addEventListener("change", (event) => {
    const files = [...event.target.files].filter(
      (file) => file.type === "audio/mpeg" || /\.mp3$/i.test(file.name),
    );
    if (files.length) {
      saveLocalFiles(files);
      renderLocalFiles(files);
    }
  });
  list.addEventListener("wheel", (event) => event.stopPropagation(), {
    passive: true,
  });
  const setWidgetState = (collapsed) => {
    const body = widget.querySelector(".music-body");
    const currentHeight = body.getBoundingClientRect().height;
    widget.classList.toggle("is-collapsed", collapsed);
    if (collapsed) {
      body.style.height = `${currentHeight}px`;
      requestAnimationFrame(() => {
        body.style.height = "0px";
      });
    } else {
      body.style.height = "0px";
      requestAnimationFrame(() => {
        body.style.height = `${body.scrollHeight}px`;
      });
      body.addEventListener(
        "transitionend",
        () => {
          if (!widget.classList.contains("is-collapsed"))
            body.style.height = "auto";
        },
        { once: true },
      );
    }
    toggle.textContent = collapsed ? "⌄" : "⌃";
    toggle.setAttribute(
      "aria-label",
      collapsed ? "Buka pemutar musik" : "Tutup pemutar musik",
    );
  };
  widget
    .querySelector(".music-head")
    .addEventListener("click", () =>
      setWidgetState(!widget.classList.contains("is-collapsed")),
    );
  discoverMp3().then(() => restoreLocalFiles());
});

/* Scroll reveal animation for the complete site package */
document.addEventListener("DOMContentLoaded", () => {
  const revealItems = document.querySelectorAll(
    ".section, .card, .photo-card, .game-card, .character-card, .creator-copy, .actions, .page-hero > .wrap",
  );
  revealItems.forEach((item, index) => {
    item.classList.add("scroll-reveal");
    item.classList.add(
      index % 3 === 1
        ? "reveal-left"
        : index % 3 === 2
          ? "reveal-right"
          : "reveal-up",
    );
    item.style.setProperty(
      "--reveal-delay",
      `${Math.min(index % 4, 3) * 70}ms`,
    );
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            currentObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -45px 0px" },
    );
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }
});

const audio = document.querySelector("#audio");
const fileInput = document.querySelector("#fileInput");
const dropZone = document.querySelector("#dropZone");
const fileName = document.querySelector("#fileName");
const statusText = document.querySelector("#statusText");
const playButton = document.querySelector("#playButton");
const backButton = document.querySelector("#backButton");
const forwardButton = document.querySelector("#forwardButton");
const currentTimeText = document.querySelector("#currentTime");
const durationTimeText = document.querySelector("#durationTime");
const timeline = document.querySelector("#timeline");
const seekSlider = document.querySelector("#seekSlider");
const setAButton = document.querySelector("#setAButton");
const setBButton = document.querySelector("#setBButton");
const clearButton = document.querySelector("#clearButton");
const loopButton = document.querySelector("#loopButton");
const aTime = document.querySelector("#aTime");
const bTime = document.querySelector("#bTime");
const speedSlider = document.querySelector("#speedSlider");
const speedValue = document.querySelector("#speedValue");
const slowerButton = document.querySelector("#slowerButton");
const fasterButton = document.querySelector("#fasterButton");
const presetButtons = [...document.querySelectorAll("[data-speed]")];

const lang = document.body.dataset.lang || document.documentElement.lang.slice(0, 2) || "en";
const copy = {
  zh: {
    unset: "未设置",
    play: "播放",
    pause: "暂停",
    loopOnLabel: "AB 循环开",
    loopOffLabel: "AB 循环关",
    chooseMp3: "请选择 MP3 音频文件",
    audioLoaded: "音频已载入",
    ready: "可以开始播放并锁定 A/B 段",
    playBlocked: "浏览器暂时没有开始播放，请再点一次播放",
    aLocked: "A 点已锁定",
    bLocked: "B 点已锁定",
    bAfterA: "B 点需要在 A 点之后",
    needSegment: "请先锁定 A 点和 B 点",
    loopEnabled: "AB 循环已开启",
    loopDisabled: "AB 循环已关闭",
    cleared: "A/B 已清除",
    audioError: "这个音频无法播放，请换一个 MP3 文件",
  },
  en: {
    unset: "Not set",
    play: "Play",
    pause: "Pause",
    loopOnLabel: "AB Loop On",
    loopOffLabel: "AB Loop Off",
    chooseMp3: "Please choose an MP3 audio file",
    audioLoaded: "Audio loaded",
    ready: "Ready to play and set A/B points",
    playBlocked: "The browser did not start playback. Please tap Play again.",
    aLocked: "Point A set",
    bLocked: "Point B set",
    bAfterA: "Point B must be after point A",
    needSegment: "Set both A and B first",
    loopEnabled: "AB loop is on",
    loopDisabled: "AB loop is off",
    cleared: "A/B cleared",
    audioError: "This audio cannot be played. Please choose another MP3 file.",
  },
  es: {
    unset: "Sin fijar",
    play: "Reproducir",
    pause: "Pausar",
    loopOnLabel: "Bucle AB encendido",
    loopOffLabel: "Bucle AB apagado",
    chooseMp3: "Elige un archivo de audio MP3",
    audioLoaded: "Audio cargado",
    ready: "Listo para reproducir y fijar A/B",
    playBlocked: "El navegador no inició la reproducción. Toca Reproducir otra vez.",
    aLocked: "Punto A fijado",
    bLocked: "Punto B fijado",
    bAfterA: "El punto B debe estar después del punto A",
    needSegment: "Primero fija los puntos A y B",
    loopEnabled: "Bucle AB encendido",
    loopDisabled: "Bucle AB apagado",
    cleared: "A/B borrado",
    audioError: "Este audio no se puede reproducir. Elige otro archivo MP3.",
  },
  ja: {
    unset: "未設定",
    play: "再生",
    pause: "一時停止",
    loopOnLabel: "ABループ オン",
    loopOffLabel: "ABループ オフ",
    chooseMp3: "MP3音声ファイルを選択してください",
    audioLoaded: "音声を読み込みました",
    ready: "再生してA/B地点を設定できます",
    playBlocked: "ブラウザが再生を開始できませんでした。もう一度再生を押してください。",
    aLocked: "A地点を設定しました",
    bLocked: "B地点を設定しました",
    bAfterA: "B地点はA地点より後にしてください",
    needSegment: "先にA地点とB地点を設定してください",
    loopEnabled: "ABループをオンにしました",
    loopDisabled: "ABループをオフにしました",
    cleared: "A/Bをクリアしました",
    audioError: "この音声は再生できません。別のMP3ファイルを選択してください。",
  },
};
const t = copy[lang] || copy.en;

const state = {
  a: null,
  b: null,
  loop: false,
  objectUrl: null,
  rafId: null,
};

function formatTime(value) {
  if (!Number.isFinite(value) || value < 0) {
    return "00:00.0";
  }

  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  const tenths = Math.floor((value % 1) * 10);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${tenths}`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function hasAudio() {
  return Number.isFinite(audio.duration) && audio.duration > 0;
}

function hasSegment() {
  return state.a !== null && state.b !== null && state.b > state.a;
}

function setControlsEnabled(enabled) {
  [
    playButton,
    backButton,
    forwardButton,
    seekSlider,
    setAButton,
    setBButton,
    clearButton,
    speedSlider,
    slowerButton,
    fasterButton,
    ...presetButtons,
  ].forEach((control) => {
    control.disabled = !enabled;
  });
  loopButton.disabled = !enabled || !hasSegment();
}

function updateSpeedButtons() {
  const current = Number(audio.playbackRate.toFixed(2));
  presetButtons.forEach((button) => {
    const preset = Number(button.dataset.speed);
    button.classList.toggle("is-active", Math.abs(preset - current) < 0.01);
  });
}

function setSpeed(nextSpeed) {
  const speed = clamp(Number(nextSpeed), 0.25, 4);
  audio.playbackRate = speed;
  audio.preservesPitch = true;
  audio.mozPreservesPitch = true;
  audio.webkitPreservesPitch = true;
  speedSlider.value = String(speed);
  speedValue.textContent = `${speed.toFixed(2)}x`;
  updateSpeedButtons();
}

function setLoopActive(active) {
  state.loop = active;
  loopButton.classList.toggle("is-on", active);
  loopButton.textContent = active ? t.loopOnLabel : t.loopOffLabel;
  loopButton.setAttribute("aria-pressed", String(active));
}

function resetMarkers() {
  state.a = null;
  state.b = null;
  setLoopActive(false);
  updateUi();
}

function updateUi() {
  const duration = hasAudio() ? audio.duration : 0;
  const current = hasAudio() ? audio.currentTime : 0;
  const progress = duration ? (current / duration) * 100 : 0;

  currentTimeText.textContent = formatTime(current);
  durationTimeText.textContent = formatTime(duration);
  seekSlider.max = String(duration);
  seekSlider.value = String(current);
  timeline.style.setProperty("--progress", `${clamp(progress, 0, 100)}%`);

  aTime.textContent = state.a === null ? t.unset : formatTime(state.a);
  bTime.textContent = state.b === null ? t.unset : formatTime(state.b);

  if (hasSegment() && duration) {
    const left = (state.a / duration) * 100;
    const width = ((state.b - state.a) / duration) * 100;
    timeline.style.setProperty("--segment-left", `${clamp(left, 0, 100)}%`);
    timeline.style.setProperty("--segment-width", `${clamp(width, 0, 100)}%`);
  } else {
    timeline.style.setProperty("--segment-left", "0%");
    timeline.style.setProperty("--segment-width", "0%");
  }

  loopButton.disabled = !hasAudio() || !hasSegment();
  if (!hasSegment() && state.loop) {
    setLoopActive(false);
  }
}

function showMessage(message) {
  statusText.textContent = message;
}

function loadFile(file) {
  if (!file) {
    return;
  }

  const isAudio = file.type.startsWith("audio/");
  const isMp3 = file.name.toLowerCase().endsWith(".mp3");
  if (!isAudio && !isMp3) {
    showMessage(t.chooseMp3);
    return;
  }

  if (state.objectUrl) {
    URL.revokeObjectURL(state.objectUrl);
  }

  state.objectUrl = URL.createObjectURL(file);
  audio.src = state.objectUrl;
  audio.load();
  fileName.textContent = file.name;
  showMessage(t.audioLoaded);
  resetMarkers();
  setControlsEnabled(false);
}

function jumpBy(delta) {
  if (!hasAudio()) {
    return;
  }
  audio.currentTime = clamp(audio.currentTime + delta, 0, audio.duration);
  updateUi();
}

async function togglePlay() {
  if (!hasAudio()) {
    return;
  }

  if (audio.paused) {
    if (state.loop && hasSegment() && (audio.currentTime < state.a || audio.currentTime >= state.b)) {
      audio.currentTime = state.a;
    }

    try {
      await audio.play();
    } catch {
      showMessage(t.playBlocked);
    }
  } else {
    audio.pause();
  }
}

function setMarkerA() {
  if (!hasAudio()) {
    return;
  }

  state.a = clamp(audio.currentTime, 0, audio.duration);
  if (state.b !== null && state.b <= state.a) {
    state.b = null;
    setLoopActive(false);
  }
  showMessage(t.aLocked);
  updateUi();
}

function setMarkerB() {
  if (!hasAudio()) {
    return;
  }

  const current = clamp(audio.currentTime, 0, audio.duration);
  if (state.a === null) {
    state.a = 0;
  }

  if (current <= state.a + 0.1) {
    showMessage(t.bAfterA);
    updateUi();
    return;
  }

  state.b = current;
  showMessage(t.bLocked);
  updateUi();
}

function toggleLoop() {
  if (!hasSegment()) {
    showMessage(t.needSegment);
    updateUi();
    return;
  }

  setLoopActive(!state.loop);
  showMessage(state.loop ? t.loopEnabled : t.loopDisabled);

  if (state.loop && (audio.currentTime < state.a || audio.currentTime >= state.b)) {
    audio.currentTime = state.a;
  }
  updateUi();
}

function monitorLoop() {
  if (hasAudio()) {
    if (state.loop && hasSegment() && audio.currentTime >= state.b) {
      audio.currentTime = state.a;
    }
    updateUi();
  }
  state.rafId = requestAnimationFrame(monitorLoop);
}

fileInput.addEventListener("change", (event) => {
  loadFile(event.target.files[0]);
});

dropZone.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropZone.classList.add("is-dragging");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("is-dragging");
});

dropZone.addEventListener("drop", (event) => {
  event.preventDefault();
  dropZone.classList.remove("is-dragging");
  loadFile(event.dataTransfer.files[0]);
});

audio.addEventListener("loadedmetadata", () => {
  setControlsEnabled(true);
  setSpeed(speedSlider.value);
  showMessage(t.ready);
  updateUi();
});

audio.addEventListener("play", () => {
  playButton.textContent = t.pause;
});

audio.addEventListener("pause", () => {
  playButton.textContent = t.play;
});

audio.addEventListener("ended", () => {
  playButton.textContent = t.play;
  if (state.loop && hasSegment()) {
    audio.currentTime = state.a;
    audio.play();
  }
});

audio.addEventListener("error", () => {
  showMessage(t.audioError);
  setControlsEnabled(false);
});

seekSlider.addEventListener("input", () => {
  audio.currentTime = Number(seekSlider.value);
  updateUi();
});

playButton.addEventListener("click", togglePlay);
backButton.addEventListener("click", () => jumpBy(-5));
forwardButton.addEventListener("click", () => jumpBy(5));
setAButton.addEventListener("click", setMarkerA);
setBButton.addEventListener("click", setMarkerB);
clearButton.addEventListener("click", () => {
  resetMarkers();
  showMessage(t.cleared);
});
loopButton.addEventListener("click", toggleLoop);

speedSlider.addEventListener("input", () => {
  setSpeed(speedSlider.value);
});

slowerButton.addEventListener("click", () => {
  setSpeed(audio.playbackRate - 0.25);
});

fasterButton.addEventListener("click", () => {
  setSpeed(audio.playbackRate + 0.25);
});

presetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setSpeed(button.dataset.speed);
  });
});

setLoopActive(false);
setSpeed(1);
updateUi();
monitorLoop();

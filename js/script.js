// js/script.js

// 37 個注音符號
const ZHUYIN_LIST = [
  "ㄅ", "ㄆ", "ㄇ", "ㄈ",
  "ㄉ", "ㄊ", "ㄋ", "ㄌ",
  "ㄍ", "ㄎ", "ㄏ",
  "ㄐ", "ㄑ", "ㄒ",
  "ㄓ", "ㄔ", "ㄕ", "ㄖ",
  "ㄗ", "ㄘ", "ㄙ",
  "ㄧ", "ㄨ", "ㄩ",
  "ㄚ", "ㄛ", "ㄜ", "ㄝ",
  "ㄞ", "ㄟ", "ㄠ", "ㄡ",
  "ㄢ", "ㄣ", "ㄤ", "ㄥ",
  "ㄦ"
];

const PREPARE_FLASH_MS = 3000;      // 綠框閃爍時間（毫秒）
const COUNTDOWN_SECONDS = 12;       // 倒數秒數
const RETRY_DELAY_MS = 8000;        // 爆炸後再試一次延遲（毫秒）
const TITLE_DEFAULT = "我會 ㄅ ㄆ ㄇ";
const TITLE_TIMEOUT = "喔喔！沒有答對！";
const TITLE_CONFIRM_EXIT = "確定要關閉嗎？";

// DOM 物件
const symbolArea = document.querySelector(".symbol-area");
const symbolTextEl = document.getElementById("symbolText");
const explosionImgEl = document.getElementById("explosionImage");
const day21ImgEl = document.getElementById("day21Image");
const timerValueEl = document.getElementById("timerValue");
const actionButton = document.getElementById("actionButton");
const actionButtonText = document.querySelector("#actionButton .action-box__text");
const titleTextEl = document.getElementById("page-title");

const closeButton = document.getElementById("closeButton");
const mainControlRow = document.getElementById("mainControlRow");
const confirmControlRow = document.getElementById("confirmControlRow");
const cancelExitButton = document.getElementById("cancelExitButton");
const confirmExitButton = document.getElementById("confirmExitButton");

// 狀態管理：idle / preparing / counting / confirm-exit
let gameState = "idle";
let prepareTimeoutId = null;
let countdownIntervalId = null;
let retryTimeoutId = null;
let remainingSeconds = COUNTDOWN_SECONDS;

// ---------- 顯示文字的小工具 ----------

function showMessageText(text) {
  symbolTextEl.style.display = "inline";
  symbolTextEl.textContent = text;
  symbolTextEl.classList.remove("symbol-area__char--zhuyin");
}

function showZhuyinChar(char) {
  symbolTextEl.style.display = "inline";
  symbolTextEl.textContent = char;
  symbolTextEl.classList.add("symbol-area__char--zhuyin");
}

// ---------- 其他工具函式 ----------

function getRandomZhuyin() {
  const index = Math.floor(Math.random() * ZHUYIN_LIST.length);
  return ZHUYIN_LIST[index];
}

function clearTimers() {
  if (prepareTimeoutId !== null) {
    clearTimeout(prepareTimeoutId);
    prepareTimeoutId = null;
  }
  if (countdownIntervalId !== null) {
    clearInterval(countdownIntervalId);
    countdownIntervalId = null;
  }
  if (retryTimeoutId !== null) {
    clearTimeout(retryTimeoutId);
    retryTimeoutId = null;
  }
}

function hideAllImages() {
  explosionImgEl.classList.remove("symbol-area__explosion--show");
  explosionImgEl.setAttribute("aria-hidden", "true");

  day21ImgEl.classList.remove("symbol-area__day21--show");
  day21ImgEl.setAttribute("aria-hidden", "true");
}

function resetViewToIdle() {
  clearTimers();
  gameState = "idle";
  actionButton.disabled = false;
  actionButtonText.textContent = "開始";

  symbolArea.classList.remove("symbol-area--flashing");
  symbolArea.classList.remove("symbol-area--no-frame");

  hideAllImages();

  showMessageText("準備好了嗎？");

  remainingSeconds = COUNTDOWN_SECONDS;
  timerValueEl.textContent = remainingSeconds.toString();

  mainControlRow.style.display = "flex";
  confirmControlRow.style.display = "none";

  titleTextEl.textContent = TITLE_DEFAULT;
}

// ---------- 遊戲流程 ----------

function startPreparePhase() {
  gameState = "preparing";
  actionButton.disabled = true;
  actionButtonText.textContent = "準備中…";

  titleTextEl.textContent = TITLE_DEFAULT;

  hideAllImages();
  symbolArea.classList.remove("symbol-area--no-frame");

  showMessageText("看好了喔～");

  symbolArea.classList.add("symbol-area--flashing");

  prepareTimeoutId = setTimeout(() => {
    const randomChar = getRandomZhuyin();
    showZhuyinChar(randomChar);

    symbolArea.classList.remove("symbol-area--flashing");

    startCountdownPhase();
  }, PREPARE_FLASH_MS);
}

function startCountdownPhase() {
  gameState = "counting";
  actionButton.disabled = false;
  actionButtonText.textContent = "完成";

  remainingSeconds = COUNTDOWN_SECONDS;
  timerValueEl.textContent = remainingSeconds.toString();

  countdownIntervalId = setInterval(() => {
    remainingSeconds -= 1;
    timerValueEl.textContent = remainingSeconds.toString();

    if (remainingSeconds <= 0) {
      clearInterval(countdownIntervalId);
      countdownIntervalId = null;
      handleTimeout();
    }
  }, 1000);
}

// 時間到（沒有按完成）
function handleTimeout() {
  gameState = "idle";
  actionButtonText.textContent = "開始";

  titleTextEl.textContent = TITLE_TIMEOUT;

  symbolTextEl.style.display = "none";
  hideAllImages();

  explosionImgEl.classList.add("symbol-area__explosion--show");
  explosionImgEl.setAttribute("aria-hidden", "false");

  symbolArea.classList.add("symbol-area--no-frame");

  retryTimeoutId = setTimeout(() => {
    symbolArea.classList.remove("symbol-area--no-frame");
    hideAllImages();
    showMessageText("再試一次？你可以的💪💪💪");
  }, RETRY_DELAY_MS);
}

// 在倒數中按下「完成」
function handleCompleteInTime() {
  clearInterval(countdownIntervalId);
  countdownIntervalId = null;

  gameState = "idle";
  actionButtonText.textContent = "開始";

  hideAllImages();
  symbolArea.classList.remove("symbol-area--no-frame");

  showMessageText("太棒了！答對囉～再來一題？");
  titleTextEl.textContent = TITLE_DEFAULT;
}

// ---------- 關閉確認模式 ----------

function enterConfirmExitMode() {
  if (gameState === "confirm-exit") return;

  clearTimers();
  gameState = "confirm-exit";

  titleTextEl.textContent = TITLE_CONFIRM_EXIT;

  symbolTextEl.style.display = "none";
  hideAllImages();

  symbolArea.classList.add("symbol-area--no-frame");
  day21ImgEl.classList.add("symbol-area__day21--show");
  day21ImgEl.setAttribute("aria-hidden", "false");

  mainControlRow.style.display = "none";
  confirmControlRow.style.display = "flex";
}

function cancelExitAndContinue() {
  resetViewToIdle();
}

function confirmExit() {
  window.close();
}

// ---------- 事件監聽 ----------

actionButton.addEventListener("click", () => {
  if (gameState === "idle") {
    clearTimers();
    startPreparePhase();
  } else if (gameState === "counting") {
    handleCompleteInTime();
  }
});

closeButton.addEventListener("click", () => {
  enterConfirmExitMode();
});

cancelExitButton.addEventListener("click", () => {
  cancelExitAndContinue();
});

confirmExitButton.addEventListener("click", () => {
  confirmExit();
});

// 初始畫面
resetViewToIdle();

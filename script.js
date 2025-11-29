const gridEl = document.getElementById('grid');
const editorEl = document.getElementById('editor');
const bufferEl = document.getElementById('editor-buffer');
const modeBadge = document.getElementById('editor-mode');
const commandLine = document.getElementById('command-line');
const commandInput = document.getElementById('command-input');
const logEl = document.getElementById('log');
const levelTitle = document.getElementById('level-title');
const levelGenre = document.getElementById('level-genre');
const levelObjective = document.getElementById('level-objective');
const progressFill = document.getElementById('progressFill');
const progressLabel = document.getElementById('progressLabel');
const completeButton = document.getElementById('completeButton');
const resetButton = document.getElementById('resetLevel');
const nextButton = document.getElementById('nextLevel');
const prevButton = document.getElementById('prevLevel');
const startButton = document.getElementById('startButton');
const escapeButton = document.getElementById('escapeButton');

let currentLevelIndex = 0;
let levels = [];

function addLog(message) {
  const p = document.createElement('p');
  p.textContent = message;
  logEl.prepend(p);
}

function updateProgress() {
  const completed = levels.filter((lvl) => lvl.completed).length;
  progressFill.style.width = `${(completed / levels.length) * 100}%`;
  progressLabel.textContent = `${completed} / ${levels.length}`;
}

function renderLevel() {
  const level = levels[currentLevelIndex];
  levelTitle.textContent = level.title;
  levelGenre.textContent = level.genre;
  levelObjective.textContent = level.objective;
  completeButton.hidden = !level.completed;
  gridEl.hidden = level.type !== 'grid';
  editorEl.hidden = level.type === 'grid' ? true : false;
  commandLine.hidden = true;
  addLog(`--- ${level.title} を開始しました ---`);
  level.setup();
  updateProgress();
}

function handleKeyDown(event) {
  const targetTag = event.target.tagName;
  if (targetTag === 'INPUT' || targetTag === 'TEXTAREA') return;
  const level = levels[currentLevelIndex];
  if (level && typeof level.handleKey === 'function') {
    level.handleKey(event);
  }
}

function setMode(badge, mode) {
  badge.textContent = mode.toUpperCase();
  badge.dataset.mode = mode;
}

function createMovementLevel() {
  const width = 7;
  const height = 5;
  const start = { x: 0, y: 4 };
  const exit = { x: 6, y: 0 };
  let player = { ...start };
  let completed = false;

  function drawGrid() {
    gridEl.innerHTML = '';
    gridEl.style.gridTemplateColumns = `repeat(${width}, 1fr)`;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        if (x === player.x && y === player.y) {
          tile.classList.add('player');
          tile.textContent = '@';
        } else if (x === exit.x && y === exit.y) {
          tile.classList.add('exit');
          tile.textContent = 'EXIT';
        } else if (y === start.y && x <= start.x) {
          tile.classList.add('path');
        }
        gridEl.appendChild(tile);
      }
    }
  }

  function finish() {
    addLog('出口に到達！次のステージで挿入モードを覚えましょう。');
    completed = true;
    completeButton.hidden = false;
    updateProgress();
  }

  return {
    title: 'ステージ 1: ダンジョン移動',
    genre: 'ローグライク移動',
    objective: 'h / j / k / l でプレイヤーを出口まで動かしましょう。Vim のカーソル移動の基本です。',
    type: 'grid',
    setup() {
      player = { ...start };
      completed = false;
      drawGrid();
      completeButton.hidden = true;
      addLog('h=左 j=下 k=上 l=右 で移動します。');
    },
    handleKey(event) {
      const key = event.key;
      if (completed) return;
      const delta = { x: 0, y: 0 };
      if (key === 'h') delta.x = -1;
      if (key === 'l') delta.x = 1;
      if (key === 'k') delta.y = -1;
      if (key === 'j') delta.y = 1;
      if (delta.x !== 0 || delta.y !== 0) {
        event.preventDefault();
        player.x = Math.max(0, Math.min(width - 1, player.x + delta.x));
        player.y = Math.max(0, Math.min(height - 1, player.y + delta.y));
        addLog(`(${player.x}, ${player.y}) へ移動`);
        drawGrid();
        if (player.x === exit.x && player.y === exit.y) finish();
      }
    },
    get completed() {
      return completed;
    }
  };
}

function createInsertLevel() {
  const startText = 'The dungeon awaits…';
  const targetText = 'The dungeon awaits… Vim is powerful!';
  let buffer = startText;
  let mode = 'normal';
  let completed = false;

  function updateBuffer() {
    bufferEl.textContent = buffer + (mode === 'insert' ? '▌' : '');
    setMode(modeBadge, mode);
  }

  function exitInsertMode() {
    if (mode === 'insert') {
      mode = 'normal';
      updateBuffer();
      addLog('ノーマルモードに戻りました。');
      if (buffer === targetText) finish();
    }
  }

  function finish() {
    completed = true;
    addLog('Esc でノーマルモードに戻りました！保存コマンドに進みましょう。');
    completeButton.hidden = false;
    updateProgress();
  }

  return {
    title: 'ステージ 2: 挿入モード',
    genre: 'テキスト編集',
    objective: 'i で挿入モードに入り、" Vim is powerful!" を末尾に打ち込み Esc で戻りましょう。',
    type: 'editor',
    setup() {
      buffer = startText;
      mode = 'normal';
      completed = false;
      bufferEl.textContent = buffer;
      setMode(modeBadge, mode);
      commandLine.hidden = true;
      completeButton.hidden = true;
      addLog('i で挿入、Esc でノーマルに戻ります。Backspace も使えます。');
    },
    handleKey(event) {
      if (completed) return;
      const key = event.key;
      if (mode === 'normal') {
        if (key === 'i') {
          mode = 'insert';
          addLog('挿入モードに入りました。テキストをタイプしてください。');
          updateBuffer();
          event.preventDefault();
        }
        return;
      }

      if (mode === 'insert') {
        if (key === 'Escape') {
          exitInsertMode();
          return;
        }
        if (key.length === 1 && !event.metaKey && !event.ctrlKey) {
          buffer += key;
          updateBuffer();
        }
        if (key === 'Backspace') {
          buffer = buffer.slice(0, -1);
          updateBuffer();
          event.preventDefault();
        }
      }
    },
    get completed() {
      return completed;
    },
    onEscape() {
      exitInsertMode();
    }
  };
}

function createCommandLevel() {
  const startText = 'Write and quit with :wq';
  let buffer = startText;
  let mode = 'normal';
  let completed = false;

  function openCommandLine() {
    commandLine.hidden = false;
    commandInput.value = '';
    commandInput.focus();
    addLog(': を押しました。保存コマンドを入力して Enter。');
  }

  function closeCommandLine() {
    commandLine.hidden = true;
    commandInput.blur();
  }

  function finish() {
    completed = true;
    addLog(':wq で保存して終了しました！');
    completeButton.hidden = false;
    updateProgress();
  }

  return {
    title: 'ステージ 3: コマンドライン',
    genre: 'セーブ & クイット',
    objective: ': を押してコマンドラインを開き、wq を入力して Enter で完了です。',
    type: 'editor',
    setup() {
      buffer = startText;
      mode = 'normal';
      completed = false;
      bufferEl.textContent = buffer;
      setMode(modeBadge, mode);
      commandLine.hidden = true;
      completeButton.hidden = true;
      addLog(': でコマンドライン、u でアンドゥのような操作を体験できます。');
    },
    handleKey(event) {
      if (completed) return;
      if (event.target === commandInput) return;
      const key = event.key;

      if (mode === 'normal') {
        if (key === ':') {
          openCommandLine();
          event.preventDefault();
          return;
        }
        if (key === 'u') {
          buffer = startText;
          bufferEl.textContent = buffer;
          addLog('u: 変更を元に戻しました (シミュレーション)');
          return;
        }
      }
    },
    get completed() {
      return completed;
    },
    onCommandSubmit(value) {
      const trimmed = value.trim();
      if (trimmed === 'wq' || trimmed === 'x') {
        finish();
      } else if (trimmed === 'w') {
        addLog('保存しましたがまだ終了していません。もう一度 :wq を試してください。');
      } else {
        addLog(`${trimmed} はこのステージでは無効です。:wq を使いましょう。`);
      }
      closeCommandLine();
    },
    onEscape() {
      if (!commandLine.hidden) {
        closeCommandLine();
        addLog('Esc: コマンドラインを閉じました。');
      }
    }
  };
}

function handleEscapeAction() {
  const level = levels[currentLevelIndex];
  if (!level) return;
  if (!commandLine.hidden) {
    commandLine.hidden = true;
    commandInput.blur();
    addLog('Esc: コマンドラインを閉じました。');
    return;
  }
  if (typeof level.onEscape === 'function') {
    level.onEscape();
  }
}

function setupGame() {
  levels = [createMovementLevel(), createInsertLevel(), createCommandLevel()];
  renderLevel();
}

startButton.addEventListener('click', () => {
  document.getElementById('levels').scrollIntoView({ behavior: 'smooth' });
});

nextButton.addEventListener('click', () => {
  currentLevelIndex = (currentLevelIndex + 1) % levels.length;
  renderLevel();
});

prevButton.addEventListener('click', () => {
  currentLevelIndex = (currentLevelIndex - 1 + levels.length) % levels.length;
  renderLevel();
});

resetButton.addEventListener('click', () => {
  renderLevel();
});

completeButton.addEventListener('click', () => {
  currentLevelIndex = Math.min(currentLevelIndex + 1, levels.length - 1);
  renderLevel();
});

commandInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    const level = levels[currentLevelIndex];
    if (level && typeof level.onCommandSubmit === 'function') {
      level.onCommandSubmit(commandInput.value);
    }
  }
  if (event.key === 'Escape') {
    event.preventDefault();
    handleEscapeAction();
  }
});

escapeButton?.addEventListener('click', handleEscapeAction);
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('DOMContentLoaded', setupGame);

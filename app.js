// ----- State -----
let arr = [];
let size = 30;
let speed = 200; // ms
let paused = false;
let running = false;
let activeRunId = 0;

// ----- DOM -----
const barsEl = document.getElementById('bars');
const generateBtn = document.getElementById('generateBtn');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const sizeRange = document.getElementById('sizeRange');
const speedRange = document.getElementById('speedRange');
const algoSelect = document.getElementById('algoSelect');

// ----- Utils -----
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function renderBars({active = [], compare = [], sortedEnd = 0} = {}) {
  barsEl.innerHTML = "";
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    const bar = document.createElement('div');
    bar.className = 'bar';
    const h = arr[i]; // value 10..100
    bar.style.height = `${h}%`;
    if (active.includes(i)) bar.classList.add('active');
    if (compare.includes(i)) bar.classList.add('compare');
    if (i >= n - sortedEnd) bar.classList.add('sorted');
    barsEl.appendChild(bar);
  }
}

async function waitWithPause(runId) {
  while (paused) {
    if (runId !== activeRunId) return false; // aborted
    await sleep(50);
  }
  if (runId !== activeRunId) return false;
  await sleep(speed);
  return runId === activeRunId;
}

function generateArray() {
  size = +sizeRange.value;
  arr = Array.from({ length: size }, () => Math.floor(Math.random() * 91) + 10); // 10..100
  renderBars();
}

function lockUI(lock) {
  generateBtn.disabled = lock;
  startBtn.disabled = lock;
  sizeRange.disabled = lock;
  algoSelect.disabled = lock;
}

// ----- Algorithms -----
async function bubbleSort(runId) {
  const n = arr.length;
  let sortedEnd = 0;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      renderBars({ compare: [j, j + 1], sortedEnd });
      if (!(await waitWithPause(runId))) return; // abort
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
        renderBars({ active: [j, j + 1], sortedEnd });
        if (!(await waitWithPause(runId))) return;
      }
    }
    sortedEnd++;
    renderBars({ sortedEnd });
    if (!swapped) break;
  }
  renderBars({ sortedEnd: n });
}

async function insertionSort(runId) {
  const n = arr.length;
  for (let i = 1; i < n; i++) {
    let key = arr[i];
    let j = i - 1;
    renderBars({ active: [i] });
    if (!(await waitWithPause(runId))) return;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
      renderBars({ compare: [j, j + 1] });
      if (!(await waitWithPause(runId))) return;
    }
    arr[j + 1] = key;
    renderBars({ active: [j + 1] });
    if (!(await waitWithPause(runId))) return;
  }
  renderBars({ sortedEnd: n });
}

// ----- Events -----
generateBtn.addEventListener('click', generateArray);
resetBtn.addEventListener('click', () => {
  activeRunId++; // cancel any run
  paused = false;
  pauseBtn.textContent = '⏸ Pause';
  generateArray();
  running = false;
  lockUI(false);
});
startBtn.addEventListener('click', async () => {
  if (running) return;
  running = true;
  paused = false;
  pauseBtn.textContent = '⏸ Pause';
  lockUI(true);
  const runId = ++activeRunId;
  const algo = algoSelect.value;
  try {
    if (algo === 'bubble') await bubbleSort(runId);
    else await insertionSort(runId);
  } finally {
    if (runId === activeRunId) {
      running = false;
      lockUI(false);
    }
  }
});
pauseBtn.addEventListener('click', () => {
  if (!running) return;
  paused = !paused;
  pauseBtn.textContent = paused ? '▶ Resume' : '⏸ Pause';
});
sizeRange.addEventListener('input', () => { if (!running) generateArray(); });
speedRange.addEventListener('input', (e) => { speed = +e.target.value; });

// ----- Init -----
generateArray();

namespace(function() {
  
String.prototype.hashCode = function() {
    var hash = 0, i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
      chr   = this.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

let puzzles;
let code;
let currentPanel, panelNo = 0;
let solsWrapper, perfectWrapper;
let sols;
let perfectActivated = false;
let solsPerfect;
let open = [false, false, false];
let ends;

window.onload = function() {
  solsWrapper = document.getElementById('solsWrapper')
  perfectWrapper = document.getElementById('perfectWrapper')
  let toLoad = (new URL(window.location.href).hash);
  code = toLoad.hashCode();
  if (toLoad) {
    puzzles = importSequence(decodeURIComponent(toLoad.slice(1))).map(e => window.deserializePuzzle(e));
    if (!localStorage[code]?.length) localStorage[code] = '\0';
    currentPanel = Math.min(localStorage[code].length, puzzles.length) - 1;
    reloadPanel();
  } else window.location.replace('prodzpod.github.io/witness');
}

window.checkProgress = function(hash) {
  let progress = localStorage.getItem(hash);
  if (localStorage.getItem('puzzleProgress_' + hash)) {
    let temp = '';
    for (let i = 0; i < Number(localStorage.getItem('puzzleProgress_' + hash)); i++) {
      localStorage.setItem(hash + '_' + i, localStorage.getItem('puzzleProgress_' + hash + '_' + i))
      localStorage.removeItem('puzzleProgress_' + hash + '_' + i)
      temp += String.fromCharCode(i);
    }
    localStorage.removeItem('puzzleProgress_' + hash);
    if (temp?.length) temp = '\0';
    localStorage.setItem(hash, temp);
    progress = temp;
  }
  if (!progress) return -1;
  return progress.charCodeAt(progress.length - 1);
}

function sol(id) {
  return document.createRange().createContextualFragment(
    `<div class='sols${(!puzzle.optional && !isNewPanel()) ? ' active' : ''}${typeof(id) == 'string' ? ' perfect' : ''}' id='sols-${id}'></div>`);
}

function isNewPanel() {
  return currentPanel === (localStorage[code].length - 1);
}

function isLastPanel(type=0) {
  return puzzles.length <= endDest(type);
}

window.reloadSymbolTheme = function() {
  draw(window.puzzle)
}

function reloadPanel() {
  while (solsWrapper.firstChild) solsWrapper.removeChild(solsWrapper.firstChild);
  while (perfectWrapper.firstChild) perfectWrapper.removeChild(perfectWrapper.firstChild);
  panelNo = localStorage[code].charCodeAt(currentPanel);
  window.puzzle = puzzles[panelNo];
  if (puzzle.sols > 1) {
    sols = new Set();
    for (let i = 0; i < puzzle.sols; i++) solsWrapper.appendChild(sol(i+1));
  }
  perfectActivated = false;
  if (puzzle.sols == 0) {
    let kinds = Array.from(new Set(puzzle.grid.flat().filter(x => x?.type == 'vtriangle').map(x => x.color)));
    while (kinds.length < 3) kinds.push(-1);
    if (kinds.length == 3) {
      perfectActivated = true;
      solsPerfect = [[kinds[0], kinds[1], kinds[2]], [kinds[0], kinds[2], kinds[1]], [kinds[1], kinds[0], kinds[2]], [kinds[1], kinds[2], kinds[0]], [kinds[2], kinds[0], kinds[1]], [kinds[2], kinds[1], kinds[0]]];
      solsPerfect = Array.from(new Set(solsPerfect.map(x => x.join('-'))));
      for (let o of solsPerfect) document.getElementById('perfectWrapper').appendChild(sol(o));
    }
  }
  open = [false, false, false];
  ends = new Set();
  if (puzzle.optional) levelUp();
  for (let i = 0; i < 3; i++) if (endDest(i) === localStorage[code].charCodeAt(currentPanel + 1)) levelUp(i);
  // apply
  let svg = document.getElementById('puzzle')
  while (svg.firstChild) svg.removeChild(svg.firstChild)
  draw(window.puzzle)
  window.clearAnimations();
  applyTheme(puzzle);
  applyImage(puzzle);
  if (localStorage[`${code}_${currentPanel}`])
    window.setPath(window.puzzle, localStorage[`${code}_${currentPanel}`]);
  updateArrows();
}

window.onSolvedPuzzle = function(paths) {
  let dir = pathsToDir(puzzle.path);
  if (puzzle.optional || isNewPanel()) {
    if (puzzle.sols > 1) {
      sols.add(dir);
      document.getElementById('sols-' + sols.size).classList.add('active');
    }
    let vr = puzzle.vtriangleResult?.join('-');
    if (perfectActivated && solsPerfect.includes(vr)) {
      solsPerfect.splice(solsPerfect.indexOf(vr), 1);
      document.getElementById('sols-' + vr).classList.add('active');
    }
    ends.add((puzzle.getCell(puzzle.endPoint.x, puzzle.endPoint.y).endType) ?? 0)
    if (((sols?.size ?? 1) >= puzzle.sols) && (!perfectActivated || !solsPerfect.length)) for (let o of Array.from(ends)) levelUp(o);
  } else levelUp(puzzle.getCell(puzzle.endPoint.x, puzzle.endPoint.y).endType ?? 0);
  localStorage[`${code}_${currentPanel}`] = dir;
}

function levelUp(type=-1) {
  if (type === -1) { levelUp(0); levelUp(1); levelUp(2); return; }
  if (isNewPanel() && !isLastPanel(type)) {
    localStorage[code] += String.fromCharCode(endDest(type));
  }
  if (!isLastPanel(type)) {
    open[type] = true;
    for (let i = 0; i < type; i++) if (endDest(type) === endDest(i)) open[type] = false;
  }
  updateArrows();
}

function endDest(type) {
  return (puzzle.endDest[type] === 0) ? (panelNo + 1) : (puzzle.endDest[type] - 1);
}

function updateArrows() {
  if (currentPanel == 0) document.getElementById('prev').setAttribute('style', 'opacity: 0;');
  else document.getElementById('prev').setAttribute('style', 'opacity: 1;');

  const ids = ['next', 'nextB', 'nextC']
  for (let i = 0; i < 3; i++) {
    if (open[i]) document.getElementById(ids[i]).setAttribute('style', 'opacity: 1;');
    else document.getElementById(ids[i]).setAttribute('style', 'opacity: 0;');
  }
}

window.getNext = function(type=0) {
  if (!open[type]) return;
  if (endDest(type) !== localStorage[code].charCodeAt(currentPanel + 1))
    localStorage[code] = localStorage[code].slice(0, currentPanel + 1) + String.fromCharCode(endDest(type));
  currentPanel++;
  reloadPanel();
}

window.getPrev = function() {
  if (currentPanel == 0) return;
  currentPanel--;
  reloadPanel();
}

});
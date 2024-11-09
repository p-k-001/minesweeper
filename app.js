let numberOfRevealed = 0;
let numberOfFlags = 0;
let endOfGame = false;
let result = '';

const Levels = {
  BEGINNER: {
    rows: 10,
    columns: 10,
    numberOfMines: 10,
    gridClass: 'grid-beginner',
  },
  INTERMEDIATE: {
    rows: 16,
    columns: 16,
    numberOfMines: 40,
    gridClass: 'grid-intermediate',
  },
};

const createBoard = (level) => {
  const grid = document.querySelector(`.${level.gridClass}`);
  for (let i = 0; i < level.rows; i++) {
    for (let j = 0; j < level.columns; j++) {
      const square = document.createElement('div');

      square.classList.add('square');

      square.setAttribute('row', i);
      square.setAttribute('column', j);
      square.setAttribute('isMine', 'false');
      square.setAttribute('isRevealed', 'false');
      square.setAttribute('isMarked', 'false');
      square.setAttribute('counts', 0);
      square.setAttribute('isFlag', 'false');

      square.addEventListener('contextmenu', (e) => {
        e.preventDefault();
      });
      square.addEventListener('mousedown', (e) => {
        handleClick(e, level);
      });

      square.addEventListener('touchstart', (e) =>
        handleTouchStart(e.currentTarget)
      );
      square.addEventListener('touchend', handleTouchEnd);

      grid.appendChild(square);
    }
  }
};

const setRandomMines = (level) => {
  let count = 0;
  while (count < level.numberOfMines) {
    const i = Math.floor(Math.random() * level.rows);
    const j = Math.floor(Math.random() * level.columns);
    const squareMine = document.querySelector(`[row="${i}"][column="${j}"]`);
    if (squareMine.getAttribute('isMine') === 'false') {
      squareMine.setAttribute('isMine', 'true');
      count++;
    }
  }
};

const calculateCounts = (level) => {
  for (let i = 0; i < level.rows; i++) {
    for (let j = 0; j < level.columns; j++) {
      const currentSquare = document.querySelector(
        `[row="${i}"][column="${j}"]`
      );

      if (currentSquare.getAttribute('isMine') === 'true') {
        for (let dx = i - 1; dx <= i + 1; dx++) {
          for (let dy = j - 1; dy <= j + 1; dy++) {
            if (dx >= 0 && dx < level.rows && dy >= 0 && dy < level.columns) {
              const countedSquare = document.querySelector(
                `[row="${dx}"][column="${dy}"]`
              );
              if (countedSquare.getAttribute('isMine') != 'true') {
                countedSquare.setAttribute(
                  'counts',
                  parseInt(countedSquare.getAttribute('counts')) + 1
                );
                countedSquare.innerHTML = `<span class='count'>${countedSquare.getAttribute(
                  'counts'
                )}<span/>`;
              }
            }
          }
        }
      }
    }
  }
};

const revealSquare = (i, j, level) => {
  const currentSquare = document.querySelector(`[row="${i}"][column="${j}"]`);
  if (isMine(i, j)) {
    // console.log('case 1.1 - isMine');
    return;
  }

  if (currentSquare.getAttribute('isRevealed') === 'true') {
    // console.log('case 1.2 - isRevealed');
    return;
  }

  if (currentSquare.getAttribute('isRevealed') === 'false') {
    currentSquare.setAttribute('isRevealed', 'true');
    numberOfRevealed++;
    if (currentSquare.getAttribute('isFlag') === 'true') {
      currentSquare.setAttribute('isFlag', 'false');
      numberOfFlags--;
    }
  }

  if (currentSquare.getAttribute('counts') != '0') {
    // console.log('case 2 - counts is not 0');
    return;
  } else {
    // console.log('case 3 - counts is 0');
    for (let dx = i - 1; dx <= i + 1; dx++) {
      for (let dy = j - 1; dy <= j + 1; dy++) {
        if (dx >= 0 && dx < level.rows && dy >= 0 && dy < level.columns) {
          revealSquare(dx, dy, level);
        }
      }
    }
  }
};

const handleClick = (e, level) => {
  if (endOfGame) return;
  if (e.currentTarget.getAttribute('isRevealed') === 'true') return;
  if (e.button === 0) {
    if (e.currentTarget.getAttribute('isMine') === 'true') {
      e.target.setAttribute('isRevealed', 'true');
      result = 'GAME OVER';
      endOfGame = true;
    } else {
      revealSquare(
        parseInt(e.currentTarget.getAttribute('row')),
        parseInt(e.currentTarget.getAttribute('column')),
        level
      );
      if (
        numberOfRevealed ===
        level.rows * level.columns - level.numberOfMines
      ) {
        result = 'You win';
        endOfGame = true;
      }
    }
  }
  if (e.button === 2) {
    flagTheSquare(e.currentTarget);
  }
  getLegend(level);
};

let longPressTimer;

function handleTouchStart(square, level) {
  longPressTimer = setTimeout(() => {
    if (endOfGame) return;
    if (square.getAttribute('isRevealed') === 'true') return;
    flagTheSquare(square);
    getLegend(level);
  }, 300);
}

function handleTouchEnd() {
  clearTimeout(longPressTimer);
}

const flagTheSquare = (square) => {
  if (square.getAttribute('isFlag') === 'false') {
    square.setAttribute('isFlag', 'true');
    numberOfFlags++;
  } else {
    square.setAttribute('isFlag', 'false');
    numberOfFlags--;
  }
};

const isMine = (i, j) => {
  if (
    document
      .querySelector(`[row="${i}"][column="${j}"]`)
      .getAttribute('isMine') === 'true'
  ) {
    return true;
  }
};

const getLegend = (level) => {
  document.getElementById('mines').innerHTML =
    level.numberOfMines - numberOfFlags;
  document.getElementById('result').innerHTML = result;
};

const initiateStartButtons = () => {
  const beginnerButton = document.getElementById('beginner-start-button');
  beginnerButton.addEventListener('click', () => startNewGame(Levels.BEGINNER));

  const intermediateButton = document.getElementById(
    'intermediate-start-button'
  );
  intermediateButton.addEventListener('click', () =>
    startNewGame(Levels.INTERMEDIATE)
  );
};

const startNewGame = (level) => {
  const container = document.querySelector('.container');
  const grid = document.querySelector('.grid');
  grid.remove();

  const legend = document.querySelector('.legend');
  const newGrid = document.createElement('div');
  newGrid.setAttribute('class', 'grid');
  container.insertBefore(newGrid, legend);

  const levelSpecificGrid = document.createElement('div');
  levelSpecificGrid.setAttribute('class', level.gridClass);
  newGrid.appendChild(levelSpecificGrid);

  numberOfRevealed = 0;
  numberOfFlags = 0;
  endOfGame = false;
  result = '';

  initiateGame(level);
};

const initiateGame = (level) => {
  createBoard(level);
  getLegend(level);
  setRandomMines(level);
  calculateCounts(level);
  initiateStartButtons();
};

document.addEventListener('DOMContentLoaded', () => {
  startNewGame(Levels.BEGINNER);
});

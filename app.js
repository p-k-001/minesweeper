const rows = 10;
const columns = 10;
const numberOfMines = 10;
let numberOfRevealed = 0;
let numberOfFlags = 0;
let endOfGame = false;
let result = '';

const createBoard = (rows, columns) => {
  const grid = document.querySelector('.grid');
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
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
      square.addEventListener('mousedown', handleClick);

      square.addEventListener('touchstart', (e) => handleTouchStart(e.target));
      square.addEventListener('touchend', handleTouchEnd);

      grid.appendChild(square);
    }
  }
};

let longPressTimer;

function handleTouchStart(square) {
  longPressTimer = setTimeout(() => {
    if (square.getAttribute('isFlag') === 'false') {
      square.setAttribute('isFlag', 'true');
      numberOfFlags++;
    } else {
      square.setAttribute('isFlag', 'false');
      numberOfFlags--;
    }
    getLegend();
  }, 300);
}

function handleTouchEnd() {
  clearTimeout(longPressTimer);
}

const setRandomMines = (numberOfMines, rows, columns) => {
  let count = 0;
  while (count < numberOfMines) {
    const i = Math.floor(Math.random() * rows);
    const j = Math.floor(Math.random() * columns);
    const squareMine = document.querySelector(`[row="${i}"][column="${j}"]`);
    if (squareMine.getAttribute('isMine') === 'false') {
      squareMine.setAttribute('isMine', 'true');
      count++;
    }
  }
};

const calculateCounts = (rows, columns) => {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
      const currentSquare = document.querySelector(
        `[row="${i}"][column="${j}"]`
      );

      if (currentSquare.getAttribute('isMine') === 'true') {
        for (let dx = i - 1; dx <= i + 1; dx++) {
          for (let dy = j - 1; dy <= j + 1; dy++) {
            if (dx >= 0 && dx < rows && dy >= 0 && dy < columns) {
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

const revealSquare = (i, j, rows, columns) => {
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
        if (dx >= 0 && dx < rows && dy >= 0 && dy < columns) {
          revealSquare(dx, dy, rows, columns);
        }
      }
    }
  }
};

const handleClick = (e) => {
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
        rows,
        columns
      );
      if (numberOfRevealed === 90) {
        result = 'You win';
        endOfGame = true;
      }
    }
  }
  if (e.button === 2) {
    if (e.target.getAttribute('isFlag') === 'false') {
      e.target.setAttribute('isFlag', 'true');
      numberOfFlags++;
    } else {
      e.target.setAttribute('isFlag', 'false');
      numberOfFlags--;
    }
  }
  getLegend();
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

const getLegend = () => {
  document.getElementById('mines').innerHTML = numberOfMines - numberOfFlags;
  document.getElementById('result').innerHTML = result;
};

const startNewGame = () => {
  const container = document.querySelector('.container');
  const grid = document.querySelector('.grid');
  grid.remove();

  const legend = document.querySelector('.legend');
  const newGrid = document.createElement('div');
  newGrid.setAttribute('class', 'grid');
  container.insertBefore(newGrid, legend);

  numberOfRevealed = 0;
  numberOfFlags = 0;
  endOfGame = false;
  result = '';

  createBoard(rows, columns);
  getLegend();
  setRandomMines(numberOfMines, rows, columns);
  calculateCounts(rows, columns);
};

addEventListener('DOMContentLoaded', () => {
  createBoard(rows, columns);
  getLegend();
  setRandomMines(numberOfMines, rows, columns);
  calculateCounts(rows, columns);
});

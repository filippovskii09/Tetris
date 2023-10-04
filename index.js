// Основні змінні
const ROWS = 20, // Кількість рядків
	   COLUMNS = 10, // Кількість стовпців
	   BLOCK_SIZE = 30, // Розмір блоку
	   EMPTY_BLOCK = 0, // Порожній блок
	   colors = ["#000", "#f00", "#0f0", "#00f", "#f0f", "#ff0", "#0ff", "#888"]; // Кольори для тетраміно

let   lastMoveTime = 0,
		board = [], // Головна ігрова дошка
		currentTetromino = null, // Поточний тетраміно
		currentPosition = { row: 0, col: 4 }, // Початкова позиція тетраміно
		score = 0, // Рахунок гравця
		gameActive = false,
		gameOver = false;

// Основні типи тетраміно (I, J, L, O, S, T, Z)
const TETROMINOS = {
    I: [[1, 1, 1, 1]],
    J: [[1, 1, 1], [0, 0, 1]],
    L: [[1, 1, 1], [1, 0, 0]],
    O: [[1, 1], [1, 1]],
    S: [[0, 1, 1], [1, 1, 0]],
    T: [[1, 1, 1], [0, 1, 0]],
    Z: [[1, 1, 0], [0, 1, 1]]
};

document.addEventListener('keydown', (event) => {
	if (gameActive && currentTetromino) {
		 if (event.key === 'ArrowLeft') {
			  moveLeft();
		 } else if (event.key === 'ArrowRight') {
			  moveRight();
		 } else if (event.key === 'ArrowDown') {
			  moveDown();
		 } else if (event.key === 'ArrowUp') {
			  rotateTetromino();
		 }
	}
});

// Генерація порожньої дошки
function createBoard() {
    for (let row = 0; row < ROWS; row++) {
        board[row] = [];
        for (let col = 0; col < COLUMNS; col++) {
            board[row][col] = EMPTY_BLOCK;
        }
    }
}

function startGame() {
	createBoard();
	createTetromino();
	drawGame();
	gameActive = true; // Позначаємо, що гра активна
	gameLoop(); // Запускаємо ігровий цикл
}

function gameLoop(currentTime) {
	if (gameActive && !gameOver) {
		 if (!lastMoveTime) {
			  lastMoveTime = currentTime;
		 }

		 const timeSinceLastMove = currentTime - lastMoveTime;

		 // Визначте час між кроками руху фігури (у мілісекундах)
		 const moveInterval = 500; // Наприклад, кожні 500 мс

		 if (timeSinceLastMove > moveInterval) {
			  moveDown(); // Рухаємо фігуру вниз
			  lastMoveTime = currentTime;
		 }
		 if (collides()) {
			gameActive = false;
			gameOver = true;
			drawGameOver(); // Функція для відображення "GAME OVER" та кількості очок
	  }

		 // Додайте додаткову логіку тут, якщо необхідно

		 drawGame(); // Відображаємо стан гри
		 requestAnimationFrame(gameLoop); // Плануємо наступну ітерацію ігрового циклу
	}
}

// Функція для створення нового тетраміно
function createTetromino() {
    const tetrominoTypes = Object.keys(TETROMINOS);
    const randomType = tetrominoTypes[Math.floor(Math.random() * tetrominoTypes.length)];
    currentTetromino = {
        type: randomType,
        shape: TETROMINOS[randomType],
        row: 0,
        col: Math.floor(Math.random() * (COLUMNS - TETROMINOS[randomType][0].length + 1))
    };

    // Перевірка, чи зіткнеться нове тетраміно з вже встановленими блоками
    if (collides()) {
        // Гра закінчена
        resetGame();
    }
}

// Функція для руху тетраміно вниз
function moveDown() {
    currentTetromino.row++;
    if (collides()) {
        currentTetromino.row--;
        placeTetromino();
        createTetromino();
        if (collides()) {
            // Гра закінчена
            resetGame();
        }
    }
    drawGame();
}

// Функція для руху тетраміно вліво
function moveLeft() {
	currentTetromino.col--;
	if (collides()) {
		 currentTetromino.col++;
	}
	drawGame();
}

// Функція для руху тетраміно вправо
function moveRight() {
	currentTetromino.col++;
	if (collides()) {
		 currentTetromino.col--;
	}
	drawGame();
}

// Функція для обробки зіткнень тетраміно
function collides() {
    const { shape, row, col } = currentTetromino;
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[0].length; c++) {
            if (shape[r][c] && (board[row + r] && board[row + r][col + c]) !== EMPTY_BLOCK) {
                return true;
            }
        }
    }
    return false;
}

// Функція для вставки тетраміно в дошку
function placeTetromino() {
    const { shape, row, col } = currentTetromino;
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[0].length; c++) {
            if (shape[r][c]) {
                board[row + r][col + c] = currentTetromino.type;
            }
        }
    }
    clearRows();
}

// Функція для видалення заповнених рядків і підрахунку очок
function clearRows() {
    for (let row = ROWS - 1; row >= 0; row--) {
        if (board[row].every(block => block !== EMPTY_BLOCK)) {
            // Заповнений рядок
            board.splice(row, 1);
            board.unshift(Array(COLUMNS).fill(EMPTY_BLOCK));
            score += 100; // Додайте свої правила для підрахунку очок
            document.getElementById('score').innerHTML = score;
        }
    }
}

// Функція для відображення гри
function drawGame() {
    const gameBoard = document.querySelector(".game-board");
    gameBoard.innerHTML = "";

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLUMNS; col++) {
            const block = document.createElement("div");
            block.className = `block ${board[row][col]}`;
            block.style.top = `${row * BLOCK_SIZE}px`;
            block.style.left = `${col * BLOCK_SIZE}px`;
            gameBoard.appendChild(block);
        }
    }

    if (currentTetromino) {
        const { shape, row, col } = currentTetromino;
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[0].length; c++) {
                if (shape[r][c]) {
                    const block = document.createElement("div");
                    block.className = `block ${currentTetromino.type}`;
                    block.style.top = `${(row + r) * BLOCK_SIZE}px`;
                    block.style.left = `${(col + c) * BLOCK_SIZE}px`;
                    gameBoard.appendChild(block);
                }
            }
        }
    }
}

// Функція для обертання тетраміно

function rotateTetromino() {
	const { shape } = currentTetromino;
	const numRows = shape.length;
	const numCols = shape[0].length;

	// Створюємо копію поточної форми тетраміно
	const newShape = Array(numCols)
		.fill()
		.map(() => Array(numRows).fill(0));

	// Обертаємо тетраміно за годинниковою стрілкою
	for (let row = 0; row < numRows; row++) {
		for (let col = 0; col < numCols; col++) {
			newShape[col][numRows - 1 - row] = shape[row][col];
		}
	}

	// Зберігаємо поточну позицію
	const prevRow = currentTetromino.row;
	const prevCol = currentTetromino.col;

	// Оновлюємо форму тетраміно та перевіряємо на зіткнення
	currentTetromino.shape = newShape;
	if (collides()) {
		// Повертаємо фігуру назад
		currentTetromino.shape = shape;
		currentTetromino.row = prevRow;
		currentTetromino.col = prevCol;
	}

	drawGame();
}




// Функція для запуску гри
function startGame() {
	createBoard();
	createTetromino();
	drawGame();
	gameActive = true; // Позначаємо, що гра активна
	gameLoop(); // Запускаємо ігровий цикл
}

// Функція для очищення гри та оновлення сторінки
function resetGame() {
	gameActive = false;
	gameOver = false;
	board = [];
	currentTetromino = null;
	currentPosition = null;
	score = 0;
	document.getElementById('score').innerHTML = score;
	createBoard();
	// createTetromino();
	drawGame();
}



// Обробка натискання клавіш


// Обробка кліку на кнопку "Start Game"
document.getElementById('start-button').addEventListener('click', () => {
    startGame();
});


document.getElementById('reset-button').addEventListener('click', () => {
	resetGame();
})


// Запуск гри при завантаженні сторінки
window.onload = resetGame;
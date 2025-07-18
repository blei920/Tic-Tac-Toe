document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('board');
    const resultMessageElement = document.getElementById('result-message');
    const endgameScreen = document.getElementById('end-game-screen');
    const modeSelectionScreen = document.getElementById('mode-selection');
    const retryButton = document.getElementById('retry-button');
    const changeModeButton = document.getElementById('change-mode-button');
    const difficultyDisplay = document.getElementById('difficulty-display');
    const gameContainer = document.querySelector('.game-container');
    
    const player = 'X';
    const ai = 'O';
    let boardState = Array(9).fill(null);
    let isGameActive = false;
    let difficulty = 'normal';

    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    
    const logoX = `
        <svg viewBox="0 0 100 100">
            <line class="shape" x1="15" y1="15" x2="85" y2="85"/>
            <line class="shape" x1="85" y1="15" x2="15" y2="85"/>
        </svg>
    `;
    const logoO = `
        <svg viewBox="0 0 100 100">
            <circle class="shape" cx="50" cy="50" r="35"/>
        </svg>
    `;

    const startGame = (selectedDifficulty) => {
        difficulty = selectedDifficulty;
        difficultyDisplay.textContent = `${difficulty} Mode`;
        isGameActive = true;
        boardState.fill(null);
        boardElement.innerHTML = '';
        createBoard();
        modeSelectionScreen.classList.remove('active');
        endgameScreen.classList.remove('active');
        gameContainer.style.display = 'flex';
    };

    const createBoard = () => {
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.index = i;
            cell.addEventListener('click', handleCellClick, { once: true });
            boardElement.appendChild(cell);
        }
    };
    
    const handleCellClick = (e) => {
        const cell = e.target.closest('.cell');
        if (!cell || !isGameActive || boardState[cell.dataset.index]) return;
        
        placeMark(cell.dataset.index, player);
        if (checkEndCondition()) return;
        
        isGameActive = false;
        setTimeout(aiMove, 600);
    };

    const placeMark = (index, currentPlayer) => {
        boardState[index] = currentPlayer;
        const cell = boardElement.children[index];
        cell.innerHTML = currentPlayer === player ? logoX : logoO;
        cell.classList.add(currentPlayer.toLowerCase());
        cell.removeEventListener('click', handleCellClick);
    };

    const checkWinner = (currentBoard, p) => {
        for (const combination of winningCombinations) {
            if (combination.every(index => currentBoard[index] === p)) {
                return true;
            }
        }
        return false;
    };

    const isBoardFull = () => boardState.every(cell => cell);
    
    const checkEndCondition = () => {
        if (checkWinner(boardState, player)) {
            endGame("You Win!");
            return true;
        }
        if (checkWinner(boardState, ai)) {
            endGame("You Lose!");
            return true;
        }
        if (isBoardFull()) {
            endGame("It's a Draw!");
            return true;
        }
        return false;
    };
    
    const endGame = (message) => {
        isGameActive = false;
        resultMessageElement.textContent = message;
        endgameScreen.classList.add('active');
    };
    
    const resetGame = () => {
        startGame(difficulty);
    };

    const showModeSelection = () => {
        isGameActive = false;
        gameContainer.style.display = 'none';
        endgameScreen.classList.remove('active');
        modeSelectionScreen.classList.add('active');
    };

    const aiMove = () => {
        if (checkEndCondition()) return;

        let bestMove;
        if (difficulty === 'hard') {
            bestMove = minimax(boardState, ai).index;
        } else if (difficulty === 'normal') {
            bestMove = findNormalMove();
        } else {
            bestMove = findEasyMove();
        }
        
        if (bestMove !== undefined) {
            placeMark(bestMove, ai);
        }
        
        isGameActive = true;
        checkEndCondition();
    };
    
    const getAvailableMoves = (board) => {
        const moves = [];
        board.forEach((cell, index) => {
            if (!cell) moves.push(index);
        });
        return moves;
    }
    
    const findEasyMove = () => {
        for (const move of getAvailableMoves(boardState)) {
            const tempBoard = [...boardState];
            tempBoard[move] = ai;
            if (checkWinner(tempBoard, ai)) return move;
        }
        return getAvailableMoves(boardState)[0];
    };

    const findNormalMove = () => {
        for (const move of getAvailableMoves(boardState)) {
            const tempBoard = [...boardState];
            tempBoard[move] = ai;
            if (checkWinner(tempBoard, ai)) return move;
        }
        for (const move of getAvailableMoves(boardState)) {
            const tempBoard = [...boardState];
            tempBoard[move] = player;
            if (checkWinner(tempBoard, player)) return move;
        }
        if (boardState[4] === null) return 4;
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(c => boardState[c] === null);
        if(availableCorners.length > 0) return availableCorners[Math.floor(Math.random() * availableCorners.length)];

        return getAvailableMoves(boardState)[0];
    };
    
    const minimax = (newBoard, currentTurn) => {
        const availableSpots = getAvailableMoves(newBoard);
        
        if (checkWinner(newBoard, player)) {
            return { score: -10 };
        } else if (checkWinner(newBoard, ai)) {
            return { score: 10 };
        } else if (availableSpots.length === 0) {
            return { score: 0 };
        }
        
        const moves = [];
        for (let i = 0; i < availableSpots.length; i++) {
            const move = {};
            move.index = availableSpots[i];
            newBoard[availableSpots[i]] = currentTurn;
            
            if (currentTurn === ai) {
                const result = minimax(newBoard, player);
                move.score = result.score;
            } else {
                const result = minimax(newBoard, ai);
                move.score = result.score;
            }
            newBoard[availableSpots[i]] = null;
            moves.push(move);
        }

        let bestMove;
        if (currentTurn === ai) {
            let bestScore = -10000;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score > bestScore) {
                    bestScore = moves[i].score;
                    bestMove = moves[i];
                }
            }
        } else {
            let bestScore = 10000;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score < bestScore) {
                    bestScore = moves[i].score;
                    bestMove = moves[i];
                }
            }
        }
        return bestMove;
    };

    retryButton.addEventListener('click', resetGame);
    changeModeButton.addEventListener('click', showModeSelection);

    document.getElementById('easy-mode').addEventListener('click', () => startGame('easy'));
    document.getElementById('normal-mode').addEventListener('click', () => startGame('normal'));
    document.getElementById('hard-mode').addEventListener('click', () => startGame('hard'));
});
const board = document.getElementById("game-board");
const keyboard = document.getElementById("keyboard");
const solutionInput = document.getElementById("solution-input");
const setSolutionBtn = document.getElementById("set-solution");
const setupMessage = document.getElementById("setup-message");
const messageEl = document.getElementById("message");

let solution = "";
let currentRow = 0;
let guesses = [];

const MAX_TRIES = 6;
const WORD_LENGTH = 5;

setSolutionBtn.addEventListener("click", () => {
    const word = solutionInput.value.toLowerCase();
    if (word.length !== 5 || !VALID_WORDS.includes(word)) {
        setupMessage.textContent = "Invalid solution word.";
        return;
    }
    solution = word;
    document.getElementById("setup").classList.add("hidden");
    board.classList.remove("hidden");
    keyboard.classList.remove("hidden");
    initBoard();
    initKeyboard();
});

function initBoard() {
    board.innerHTML = "";
    for (let i = 0; i < MAX_TRIES; i++) {
        const row = document.createElement("div");
        row.classList.add("row");
        for (let j = 0; j < WORD_LENGTH; j++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            row.appendChild(cell);
        }
        board.appendChild(row);
    }
    document.addEventListener("keydown", handleKeyPress);
}

function initKeyboard() {
    const rows = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
    keyboard.innerHTML = "";
    rows.forEach((rowLetters) => {
        const row = document.createElement("div");
        row.classList.add("kb-row");
        for (let letter of rowLetters) {
            const key = document.createElement("button");
            key.textContent = letter;
            key.addEventListener("click", () => handleKey(letter));
            row.appendChild(key);
        }
        keyboard.appendChild(row);
    });

    const enter = document.createElement("button");
    enter.textContent = "Enter";
    enter.addEventListener("click", submitGuess);
    const back = document.createElement("button");
    back.textContent = "←";
    back.addEventListener("click", deleteLetter);
    keyboard.appendChild(enter);
    keyboard.appendChild(back);
}

let currentGuess = "";

function handleKeyPress(e) {
    if (/^[a-zA-Z]$/.test(e.key)) handleKey(e.key.toLowerCase());
    else if (e.key === "Enter") submitGuess();
    else if (e.key === "Backspace") deleteLetter();
}

function handleKey(letter) {
    if (currentGuess.length < WORD_LENGTH) {
        currentGuess += letter;
        updateBoard();
    }
}

function deleteLetter() {
    currentGuess = currentGuess.slice(0, -1);
    updateBoard();
}

function updateBoard() {
    const row = board.children[currentRow];
    for (let i = 0; i < WORD_LENGTH; i++) {
        row.children[i].textContent = currentGuess[i] || "";
    }
}

function submitGuess() {
    if (currentGuess.length !== WORD_LENGTH) return;
    if (!ALLOWED_GUESSES.includes(currentGuess) && !VALID_WORDS.includes(currentGuess)) {
        messageEl.textContent = "Not in word list.";
        return;
    }

    const row = board.children[currentRow];
    const delay = 300;

    [...currentGuess].forEach((letter, i) => {
        const cell = row.children[i];
        setTimeout(() => {
            cell.classList.add("flip");
            const correct = solution[i] === letter;
            const present = solution.includes(letter) && !correct;

            if (correct) {
                cell.classList.add("correct");
                updateKeyboardKey(letter, "correct");
            } else if (present) {
                cell.classList.add("present");
                updateKeyboardKey(letter, "present");
            } else {
                cell.classList.add("absent");
                updateKeyboardKey(letter, "absent");
            }
        }, i * delay);
    });

    setTimeout(() => {
        if (currentGuess === solution) {
            messageEl.textContent = "You guessed it!";
            document.removeEventListener("keydown", handleKeyPress);
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.1 }
            });

        } else {
            currentRow++;
            if (currentRow === MAX_TRIES) {
                messageEl.textContent = `Out of tries! The word was "${solution.toUpperCase()}".`;
                document.removeEventListener("keydown", handleKeyPress);
            } else {
                currentGuess = "";
            }
        }
    }, WORD_LENGTH * delay);
}

function updateKeyboardKey(letter, status) {
    const keys = keyboard.querySelectorAll("button");
    keys.forEach((key) => {
        if (key.textContent === letter) {
            const current = key.className;
            if (
                status === "correct" ||
                (status === "present" && !current.includes("key-correct")) ||
                (status === "absent" && !current.includes("key-correct") && !current.includes("key-present"))
            ) {
                key.className = "";
                key.classList.add(`key-${status}`);
            }
        }
    });
}


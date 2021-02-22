// Pages
const gamePage = document.getElementById('game-page');
const scorePage = document.getElementById('score-page');
const splashPage = document.getElementById('splash-page');
const countdownPage = document.getElementById('countdown-page');
// Splash Page
const startForm = document.getElementById('start-form');
const radioContainers = document.querySelectorAll('.radio-container');
const radioInputs = document.querySelectorAll('input');
const bestScores = document.querySelectorAll('.best-score-value');
// Countdown Page
const countdown = document.querySelector('.countdown');
// Game Page
const itemContainer = document.querySelector('.item-container');
// Score Page
const finalTimeEl = document.querySelector('.final-time');
const baseTimeEl = document.querySelector('.base-time');
const penaltyTimeEl = document.querySelector('.penalty-time');
const playAgainBtn = document.querySelector('.play-again');

// Equations
let radioButtonValue = 0;
let equationsArray = [];
let playerGuessArray = [];
let bestSavedScores = [];

// Game Page
let firstNumber = 0;
let secondNumber = 0;
let equationObject = {};
const wrongFormat = [];
let questionCount;

// Time
let timer;
let timePlayed = 0;
let penaltyTime = 0;
let finalTime = 0;
let finalDisplayTime = '0.0';

//update best score array
function updateBestScoreArray() {
  bestSavedScores.forEach((score, index) => {
    if (score.questions == questionCount) {
      const bestSavedScore = Number(bestSavedScores[index].bestScore);

      if (bestSavedScore == 0 || bestSavedScore > finalDisplayTime) {
        bestSavedScores[index].bestScore = finalDisplayTime;
        sessionStorage.setItem('bestScore', JSON.stringify(bestSavedScores));
      }
    }
  });
  bestScoreToDom();
}

//bestScoresToDOM
function bestScoreToDom() {
  bestScores.forEach((bestScoreEl, index) => {
    bestScoreEl.textContent = `${bestSavedScores[index].bestScore}s`;
  });
}

//get best saved scores
function getBestSavedScores() {
  if (sessionStorage.getItem('bestScore')) {
    bestSavedScores = JSON.parse(sessionStorage.bestScore);
  } else {
    bestSavedScores = [
      { questions: 10, bestScore: finalDisplayTime },
      { questions: 25, bestScore: finalDisplayTime },
      { questions: 50, bestScore: finalDisplayTime },
      { questions: 99, bestScore: finalDisplayTime },
    ];
    sessionStorage.setItem('bestScore', JSON.stringify(bestSavedScores));
  }
  bestScoreToDom();
}
//start timer
function startTimer() {
  timePlayed = 0;
  penaltyTime = 0;

  gamePage.removeEventListener('click', startTimer);
  timer = setInterval(addTime, 100);
}

//check timer, stop timer if the questions are finished
function addTime() {
  timePlayed += 0.1;
  checkTimer();
}

//check if we finished the question then stop the timer, then calculate the penalty time
function checkTimer() {
  if (questionCount == playerGuessArray.length) {
    clearInterval(timer);

    //add 0.5 penalty time for each wrong answer
    equationsArray.forEach((equation, index) => {
      if (equation.evaluated !== playerGuessArray[index]) {
        penaltyTime += 0.5;
      }
    });

    finalTime = timePlayed + penaltyTime;
    scoresToDOM();
  }
}

//show score page
function showScorePage() {
  gamePage.hidden = true;
  scorePage.hidden = false;
  setTimeout(() => {
    playAgainBtn.hidden = false;
  }, 1000);
}

//display time to DOM
function scoresToDOM() {
  let baseTime = timePlayed.toFixed(1);
  finalDisplayTime = finalTime.toFixed(1);
  penaltyTime = penaltyTime.toFixed(1);
  finalTimeEl.textContent = `${finalDisplayTime}s`;
  baseTimeEl.textContent = `Base Time: ${baseTime}s`;
  penaltyTimeEl.textContent = `Penalty Time: +${penaltyTime}s`;
  //scroll to top, go to score page
  itemContainer.scrollTo({ top: 0, behavior: 'instant' });
  showScorePage();
  updateBestScoreArray();
}


//reset game
function playAgain() {
  gamePage.addEventListener('click', startTimer);
  equationsArray = [];
  playerGuessArray = [];
  scorePage.hidden = true;
  splashPage.hidden = false;
  valueY = 0;
  playAgainBtn.hidden = true;
}


// Scroll
let valueY = 0;
//generate a random number
function generateRandomNumber(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

//scroll, store user selection in array
function select(guess) {
  valueY += 80;
  itemContainer.scroll(0, valueY);
  guess ? playerGuessArray.push('true') : playerGuessArray.push('false');
}


function showGamePage() {
  countdownPage.hidden = true;
  gamePage.hidden = false;
}

// Create Correct/Incorrect Random Equations
function createEquations() {
  // Randomly choose how many correct equations there should be
  const correctEquations = generateRandomNumber(questionCount);
  // Set amount of wrong equations
  const wrongEquations = questionCount - correctEquations;

  // Loop through, multiply random numbers up to 9, push to array
  for (let x = 0; x < correctEquations; x++) {
    firstNumber = generateRandomNumber(9);
    secondNumber = generateRandomNumber(9);
    let equationValue = firstNumber * secondNumber;
    let equation = `${firstNumber} * ${secondNumber} = ${equationValue}`;
    equationObject = { equation: equation, evaluated: 'true' };
    equationsArray.push(equationObject);
  }

  // Loop through, mess with the equation results, push to array
  for (let y = 0; y < wrongEquations; y++) {
    firstNumber = generateRandomNumber(9);
    secondNumber = generateRandomNumber(9);
    let equationValue = firstNumber + secondNumber;
    wrongFormat[0] = `${firstNumber} + ${secondNumber + 1} = ${equationValue}`;
    wrongFormat[1] = `${firstNumber - 1} + ${secondNumber} = ${equationValue}`;
    wrongFormat[2] = `${firstNumber} * ${secondNumber} = ${equationValue * 2}`;
    let formatIndex = generateRandomNumber(3);
    let equation = wrongFormat[formatIndex];
    let equationObject = { equation: equation, evaluated: 'false' };
    equationsArray.push(equationObject);
  }
  shuffleArray(equationsArray);
}

function equationsToDOM() {
  equationsArray.forEach((equationEl) => {
    const item = document.createElement('div');
    item.classList.add('item');

    const itemText = document.createElement('h1');
    itemText.textContent = equationEl.equation;

    item.appendChild(itemText);
    itemContainer.appendChild(item);
  })
}

// Dynamically adding correct/incorrect equations
function populateGamePage() {
  // Reset DOM, Set Blank Space Above
  itemContainer.textContent = '';
  // Spacer
  const topSpacer = document.createElement('div');
  topSpacer.classList.add('height-240');
  // Selected Item
  const selectedItem = document.createElement('div');
  selectedItem.classList.add('selected-item');
  // Append
  itemContainer.append(topSpacer, selectedItem);

  // Create Equations, Build Elements in DOM
  createEquations();
  equationsToDOM();

  // Set Blank Space Below
  const bottomSpacer = document.createElement('div');
  bottomSpacer.classList.add('height-500');
  itemContainer.appendChild(bottomSpacer);
}

// print 3, 2, 1, Go!
function startCountdown() {
  let countdownValue = 3;
  countdown.textContent = countdownValue;
  let interval = setInterval(() => {
    countdownValue--;
    if (countdownValue == 0) {
      countdown.textContent = 'GO!';
    } else if (countdownValue == -1) {
      clearInterval(interval);
      showGamePage();
    } else {
      countdown.textContent = countdownValue;
    }
  }, 1000);
}


//show count down page
function showCountdown() {
  splashPage.setAttribute('hidden', true);
  countdownPage.removeAttribute('hidden');
  startCountdown();
}

//get input value
function getRadioValue() {
  let radioValue;
  radioInputs.forEach((radioButtonEl) => {
    if (radioButtonEl.checked) {
      radioValue = radioButtonEl.value;
    }
  });
  return radioValue;
}

//get questions count
function getQuestionsCount(event) {
  event.preventDefault();
  questionCount = getRadioValue();
  if (questionCount) {
    showCountdown();
    populateGamePage();
  }
}


//form click handler
startForm.addEventListener('click', () => {
  radioContainers.forEach((radioContainerEl) => {
    radioContainerEl.classList.remove('selected-label');
    if (radioContainerEl.children[1].checked) {
      radioContainerEl.classList.add('selected-label');
    }
  });
});

startForm.addEventListener('submit', getQuestionsCount);
gamePage.addEventListener('click', startTimer);
getBestSavedScores();

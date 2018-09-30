var game = {
    wordChoices: ['Khaleesi', 'Arya'],
    wordHidden: "",
    wordGuess: "",
    guessCount: 0,
    guessLetters: [],
    randomGuesses: 0,
    wins: 0,
    losses: 0,
    gameover: false,
    gamemsg: false,

    randomWord: function () {
        this.wordGuess = this.wordChoices[Math.floor(Math.random() * this.wordChoices.length)];
        this.wordHidden = this.wordGuess.replace(/./g, '_')
    },

    startGame: function () {
        // Reset Parameters
        this.randomizeGuesses();
        this.randomWord();
        this.guessCount = 0;
        this.guessLetters = [];
        this.gameover = false;
        this.gamemsg = false;

        document.getElementById("wordplay").innerHTML = "Press a key to start";
        document.getElementById("gamestatus").innerHTML = "";
        document.getElementById("guesses").innerHTML = this.guessLetters;
        document.getElementById("guessed").innerHTML = this.guessLetters.length;
        document.getElementById("left").innerHTML = (this.randomGuesses - this.guessLetters.length);
    },

    endGame: function (status) {
        if(status === 'win') {
            this.wins++;

            var audio = new Audio('assets/audio/game_of_thrones.mp3');

            audio.play();
            audio.addEventListener("canplaythrough", function () {
                setTimeout(function(){
                    audio.pause();
                },
                8000);
            }, false); 
        } else if (status === 'loss') {
            this.losses++;
        } else {
            console.log("How'd you get here...?")
        }
        document.getElementById("wins").innerHTML = this.wins;
        document.getElementById("loss").innerHTML = this.losses;
        document.getElementById("gamestatus").innerHTML = "Press enter to start a new game";
        this.gameover = true;
    },

    checkLetter: function (choice) {
        console.log(choice);
        // Run some basic validation before anything else
        // 1) Check to see if any key has been hit to trigger the word
        // 2) Check to see if the input is a letter
        // 3) Check to see if the letter has been guessed
        if (this.gamemsg === false) {
            document.getElementById("wordplay").innerHTML = this.wordHidden;
            this.gamemsg = true;
        } else {
            if (isLetter(choice) && this.guessLetters.indexOf(choice) === -1 && !this.gameover) {
                // Declare variables
                var pos = 0;
                var i = -1;

                // Increment Values
                this.guessCount++;
                this.guessLetters.push(choice);

                // Search the string and return the locations of the letter (if they exist)
                while (pos != -1) {
                    pos = this.wordGuess.toLowerCase().indexOf(choice, i + 1);
                    i = pos;

                    if (pos != -1) {
                        this.wordHidden = this.wordHidden.replaceAt(pos, choice.toLowerCase());
                    }
                }

                document.getElementById("wordplay").innerHTML = this.wordHidden;
                document.getElementById("guesses").innerHTML = this.guessLetters;
                document.getElementById("guessed").innerHTML = this.guessLetters.length;
                document.getElementById("left").innerHTML = (this.randomGuesses - this.guessLetters.length);

                // Check if player won
                if ((this.wordHidden.toLowerCase().indexOf('_')) === -1) {
                    this.endGame('win');
                // Check if player loss
                } else if (this.guessCount === this.randomGuesses) {
                    this.endGame('loss');
                }
            } else if (choice == "Enter") {
                console.log("here");
                this.startGame();
            }
        }
    },

    randomizeGuesses: function () {
        this.randomGuesses = Math.floor(Math.random() * 5) + 10;
    },

    guess: function () {
        this.guessCount++;
    },

    gameWin: function () {
        this.wins++;
    },

    gameLoss: function () {
        this.losses++;
    }
};

// Grabbed this bit of code from:
// https://stackoverflow.com/questions/1431094/how-do-i-replace-a-character-at-a-particular-index-in-javascript
//
// Needed a way to replace characters at a specific position, and this 
// function was leveraged in a few examples I saw.
String.prototype.replaceAt = function (index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

// Grabbed this bit of code from:
// https://stackoverflow.com/questions/9862761/how-to-check-if-character-is-a-letter-in-javascript
//
// Checking to see if a character input is valid
function isLetter(str) {
    return str.toLowerCase() != str.toUpperCase();
}
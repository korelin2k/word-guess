/**
 * Game object for word-guess - contains all the parameters and functions 
 * needed to support the game. 
 */
var game = {

    // Defining the word options available
    wordChoices: [
        ['Daenerys Targaryen', 'daenerys.jpg'],
        ['Arya Stark', 'arya.jpg'],
        ['Jon Snow', 'snow.jpg'],
        ['Cersei Lannister', 'cersei.jpg'],
        ['Tyrion Lannister', 'tyrion.jpg'],
        ['Sansa Stark', 'sansa.jpg'],
        ['Dragon', 'dragon.jpg'],
        ['Robert Baratheon', 'robert-baratheon.jpg'],
        ['Joffrey Baratheon', 'joffrey.jpg'],
        ['Oberyn Martell', 'oberyn.jpg'],
        ['Margaery Tyrell', 'margaery.jpg']
    ],

    // Defining the word hidden (basically will be wordGuess with _ 
    // replacing characters until guessed)
    wordHidden: "",

    // One of the first functions called randomizes this word based on the word
    // choices above
    wordGuess: "",

    // Keeps track of how many times a user has incorrectly guessed the letter
    guessCount: 0,

    // Array to keep track of the actual letters guessed
    guessLetters: [],

    // How many guesses are available for a user
    randomGuesses: 0,

    // Keeps track of the number of wins
    wins: 0,

    // Keeps track of the number of losses
    losses: 0,

    // Needed to keep track for "enter" to start a fresh new game
    gameover: false,

    // Custom message only being delivered in a new game scenario
    gamemsg: false,

    /**
     * Selects a random word from wordChoices and then obfuscates wordHidden
     */
    randomWord: function () {
        this.wordGuess = this.wordChoices[Math.floor(Math.random() * this.wordChoices.length)];
        this.wordHidden = this.wordGuess[0].replace(/\w/g, '_')
    },

    /**
     * Triggers the start of the game - either a fresh or "reset" on variables as well
     * DOM elements:
     * @wordplay
     * @gamestatus
     */
    startGame: function () {
        // Set & Reset Parameters
        this.randomizeGuesses();
        this.randomWord();
        this.guessCount = 0;
        this.guessLetters = [];
        this.gameover = false;
        this.gamemsg = false;

        document.getElementById("wordplay").innerHTML = "Press a key to start";
        document.getElementById("gamestatus").innerHTML = "";
        this.updateHTML();
    },

    /**
     * Triggers the end of the game with an associated audio clip and game increments (win/loss)
     * DOM elements:
     * @custom-container (background-image)
     * @gamestatus
     * @satatus-msg
     * @wordplay
     */
    endGame: function (status) {
        if (status === 'win') {
            var imagePath = 'assets/images/' + this.wordGuess[1];

            this.gameWin();
            this.playAudio();
            this.wordHidden = "";
            this.characterStats(this.wordGuess[0]);
            document.getElementById("status-msg").innerText = "Winner! Hodor Lives!";
            document.getElementsByClassName("custom-container")[0].style.backgroundImage = "url("+imagePath+")";
        } else if (status === 'loss') {
            this.gameLoss();
            document.getElementById("status-msg").innerText = "Hodor Died!";
        } else {
            console.log("How'd you get here...?");
        }

        this.guessLetters = [];
        document.getElementById("wordplay").innerHTML = "";
        document.getElementById("gamestatus").innerHTML = "Press enter to start a new game";
        this.gameover = true;
        this.updateHTML();
    },

    /**
     * Critical function for gameplay - does three checks first:
     * 1) Check to see if any key has been hit to trigger the word
     * 2) Check to see if the input is a letter
     * 3) Check to see if the letter has been guessed
     * 
     * After that and assuming it does not meet those requirements, it checks if the letter
     * in the word.
     * - If it does: removes the abstraction (wordHidden) letters
     * - If it doesn't: increments the guessLetters variable
     * 
     * At the end of this, it will check to see if the game is over (win or loss)
     * 
     * Parameters:
     * @choice - key letter passed in
     * 
     * DOM elements:
     * @wordplay
     */
    checkLetter: function (choice) {
        if (this.gamemsg === false) {
            document.getElementById("wordplay").innerHTML = this.wordHidden;
            this.gamemsg = true;
        } else if (choice == "Enter") {
            this.startGame();
            document.getElementById("status-msg").innerText = "";
        } else {
            choice = choice.toLowerCase();
            if (isLetter(choice) && this.guessLetters.indexOf(choice) === -1 && !this.gameover) {
                // Declare variables
                var pos = 0;
                var i = -1;
                var letterFound = false;

                // Increment Values
                this.guessLetters.push(choice);

                // Search the string and return the locations of the letter (if they exist)
                while (pos != -1) {
                    pos = this.wordGuess[0].toLowerCase().indexOf(choice, i + 1);
                    i = pos;

                    if (pos != -1) {
                        this.wordHidden = this.wordHidden.replaceAt(pos, choice.toLowerCase());
                        letterFound = true;
                    }
                }

                if(!letterFound) {
                    this.guess();
                }

                this.updateHTML();
                document.getElementById("wordplay").innerHTML = this.wordHidden;

                // Check if player won
                if ((this.wordHidden.toLowerCase().indexOf('_')) === -1) {
                    this.endGame('win');
                    // Check if player loss
                } else if (this.guessCount === this.randomGuesses) {
                    this.endGame('loss');
                }
            }
        }
    },

    /**
     * Primary function that updates individual selectors in the html
     * DOM elements:
     * @wins
     * @losses
     * @guesses
     * @guessed
     * @left
     */
    updateHTML: function() {
        document.getElementById("wins").innerHTML = this.wins;
        document.getElementById("loss").innerHTML = this.losses;
        document.getElementById("guesses").innerHTML = this.guessLetters.join(" ");
        document.getElementById("guessed").innerHTML = this.guessLetters.length;
        document.getElementById("left").innerHTML = (this.randomGuesses - this.guessCount);
    },

     /**
     * Plays some smooth jazz.
     */
    playAudio: function() {
        var audio = new Audio('assets/audio/got.mp3');

        audio.play();
        audio.addEventListener("canplaythrough", function () {
            setTimeout(function () {
                audio.pause();
            },
                3000);
        }, false);
    },

    /**
     * Turns out, there's a fantastic API for Game of Thrones... couldn't help but
     * leverage it and populate some character facts.
     * 
     * DOM elements:
     * @dob
     * @gender
     * @culture
     * @house
     * 
     * Parameters:
     * @name - Character to search for
     */
    characterStats: function(name) {
        var restCall = 'https://api.got.show/api/characters/' + name.replace(/ /g, "%20");
        var gender = "";
        var dob = "";
        var culture = "";
        var house = "";

        $.ajax({
            url: restCall
        }).then(function(info) {
            var gender = "";
            if( info.data.male === true ) {
                gender = "male";
            } else {
                gender = "female";
            }

            if (typeof info.data.dateOfBirth === 'undefined') {
                dob = 'Not Available';
            } else {
                dob = info.data.dateOfBirth;
            }

            if (typeof info.data.culture === 'undefined') {
                culture = 'Not Available';
            } else {
                culture = info.data.culture;
            }

            if (typeof info.data.house === 'undefined') {
                house = 'Not Available';
            } else {
                house = info.data.house;
            }

            $('#character-name').text(name);
            $('#dob').text('DOB: ' + dob);
            $('#gender').text('Gender: ' + gender);
            $('#culture').text('Culture: ' + culture);
            $('#house').text('House: ' + house);
        });
    },

    /**
     * Randomize the number of guesses the user has left. This is hard mode!
     * Modify if you're a weak person.
     */
    randomizeGuesses: function () {
        this.randomGuesses = Math.floor(Math.random() * 5) + 5;
    },

     /**
     * Simple incrementer for the number of guesses
     */   
    guess: function () {
        this.guessCount++;
    },

    /**
     * Simple incrementer for the gameWin
     */   
    gameWin: function () {
        this.wins++;
    },

    /**
     * Simple incrementer for the gameLoss
     */   
    gameLoss: function () {
        this.losses++;
    }
};


// Load the javascript when the page starts up
// Learned this before the jQuery ease of use demo that was shown... :)
window.onload = function() {
    // Basics in the html - the rest of the "goodies" are in game.js
    game.startGame();

    document.onkeyup = function(event) {
        var userGuess = event.key;
        game.checkLetter(userGuess);
    }
}

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
    return str.length === 1 && str.match(/[a-z]/i);
}
document.addEventListener('alpine:init', () => {
    Alpine.data('wordle', () => ({
        exact_letters: {}, //green
        good_letters: {}, //yellow
        entered_letters: {},
        suggestions: ['Results'],
        words: [],
        dev:true,
        init() {

            for (r=1;r<=6;r++) {
                this.entered_letters[r] = {};
                for (c=1;c<=5;c++) {
                    this.entered_letters[r][c] = '';
                }
            }
            fetch("wordlist.txt").then(response => response.text()).then(data => {
                let word_temp = data.replace("\r","");
                let words = word_temp.split("\n");
                this.words = words.map((word) => {
                    return word.split("");
                });
            })
        },
        click(r, c) {
            if (this.entered_letters[r][c]) {
                let letter = this.entered_letters[r][c];
                if (this.exact_letters[c] == letter) {
                    delete this.exact_letters[c]; //set white
                } else if (this.good_letters[letter] && this.good_letters[letter].indexOf(c) > -1) {
                    let index = this.good_letters[letter].indexOf(c);
                    this.good_letters[letter].splice(index, 1);
                    this.exact_letters[c] = letter;
                    if (this.good_letters[letter].length == 0) {
                        delete this.good_letters[letter];
                    }
                } else {
                    if (!this.good_letters[letter]) {
                        this.good_letters[letter] = [];
                    }
                    this.good_letters[letter].push(c);
                }
                this.suggest();
            }
        },
        colour(r, c) {
            let letter = this.entered_letters[r][c];

            if (this.exact_letters[c] && this.exact_letters[c] == letter) {
                return 'bg-success';
            }
            if (this.good_letters[letter] && this.good_letters[letter].indexOf(c) > -1) {
                return 'bg-warning';
            }
            return 'bg-white';
        },
        keyup(event) {
            //find the next empty box
            let c = 1;
            let r = 1;
            let prev_c = false;
            let prev_r = false;
            while (this.entered_letters[r][c]) {
                prev_c = c;
                prev_r = r;
                c++;
                if (c > 5) {
                    r++;
                    c = 1;
                }
            }

            if (event.key == 'Delete' || event.key == 'Backspace') {
                //loop over exact letters and good letters and remove them if not in entered letters
                let deleting_letter = this.entered_letters[prev_r][prev_c];

                if (this.exact_letters[prev_c]) {
                    delete this.exact_letters[prev_c];
                }

                if (this.good_letters[deleting_letter]) {
                    let index = this.good_letters[deleting_letter].indexOf(prev_c);
                    if (index > -1) {
                        this.good_letters[deleting_letter].splice(index, 1);
                    }
                    if (this.good_letters[deleting_letter].length == 0) {
                        delete this.good_letters[deleting_letter];
                    }
                }

                this.entered_letters[prev_r][prev_c] = '';
                this.suggest();
                return;
            }

            if (c > 5) {
                return false;
            }


            if (event.key.length != 1) {
                return false;
            }
            let code = event.key.charCodeAt(0);

            if (!(code > 64 && code < 91) && // upper alpha (A-Z)
                !(code > 96 && code < 123)) { // lower alpha (a-z)
                return false;
            }

            let letter = event.key.toLowerCase();

            this.entered_letters[r][c] = letter;

            if (this.good_letters[letter] && !this.exact_letters[c]) {
                //default to yellow if already yellow

                this.good_letters[letter].push(c.toString());
            }
            this.suggest();
        },
        suggest() {
            let bad_letters_array = [];
            let exact_letters_array = Object.values(this.exact_letters);

            for (let r =1;r <=6;r++) {
                for (let c = 1; c <= 5; c++) {
                    let letter = this.entered_letters[r][c];
                    if (letter) {
                        if (exact_letters_array.indexOf(letter) === -1 && !this.good_letters[letter]) {
                            bad_letters_array.push(letter);
                        }
                    }
                }
            }

            this.suggestions = [];

            wordLoop: for (const word of this.words) {
                let good_letters_needing_matching = Object.keys(this.good_letters);
                letterLoop: for (let i = 0;i<5;i++) {
                    let letter = word[i];
                    if (this.exact_letters[i+1]) {
                        if (this.exact_letters[i + 1] === letter) {
                            //remove letter from needing matching array
                            const i = good_letters_needing_matching.indexOf(letter);
                            if (i !== -1) good_letters_needing_matching.splice(i, 1);
                            continue letterLoop;
                        } else {
                            continue wordLoop;
                        }
                    }
                    if (bad_letters_array.indexOf(letter) !== -1) {
                        continue wordLoop;
                    }
                    if(this.good_letters[letter]) {
                        if (this.good_letters[letter].includes(i+1)) {
                            console.log('exact place issue');
                            //letter in exact place
                            continue wordLoop;
                        } else {
                            console.log('remove matching');
                            //remove letter from needing matching array
                            const i = good_letters_needing_matching.indexOf(letter);
                            if (i !== -1) good_letters_needing_matching.splice(i, 1);

                        }
                    }

                }
                if (good_letters_needing_matching.length > 0) {
                    continue;
                }
                this.suggestions.push(word.join(""));
                if (this.suggestions.length > 255) {
                    break;
                };
            }

        },
        save() {
            //save to local storage
            localStorage.setItem('wordle_entered_letters', JSON.stringify(this.entered_letters));
            localStorage.setItem('wordle_exact_letters', JSON.stringify(this.exact_letters));
            localStorage.setItem('wordle_good_letters', JSON.stringify(this.good_letters));
        },
        load() {
            this.entered_letters = JSON.parse(localStorage.getItem('wordle_entered_letters'));
            this.exact_letters = JSON.parse(localStorage.getItem('wordle_exact_letters'));
            this.good_letters = JSON.parse(localStorage.getItem('wordle_good_letters'));

            //console.log(JSON.parse(localStorage.getItem('wordle_entered_letters')));
        }
    }))

})

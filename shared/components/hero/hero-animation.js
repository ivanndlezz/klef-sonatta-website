// ============================================================================
// HERO ANIMATION - Rotating Words Animation
// ============================================================================

(function() {
    'use strict';

    function initHeroAnimation() {
        const words = document.getElementsByClassName('word');
        if (words.length === 0) return;

        const wordArray = [];
        let currentWord = 0;

        words[currentWord].style.opacity = 1;

        for (let i = 0; i < words.length; i++) {
            splitLetters(words[i]);
        }

        function changeWord() {
            const cw = wordArray[currentWord];
            const nw = currentWord == words.length - 1 ? wordArray[0] : wordArray[currentWord + 1];

            for (let i = 0; i < cw.length; i++) {
                animateLetterOut(cw, i);
            }

            for (let i = 0; i < nw.length; i++) {
                nw[i].className = 'letter behind';
                nw[0].parentElement.style.opacity = 1;
                animateLetterIn(nw, i);
            }

            currentWord = (currentWord == words.length - 1) ? 0 : currentWord + 1;
        }

        function animateLetterOut(cw, i) {
            setTimeout(function () {
                cw[i].className = 'letter out';
            }, i * 80);
        }

        function animateLetterIn(nw, i) {
            setTimeout(function () {
                nw[i].className = 'letter in';
            }, 340 + (i * 80));
        }

        function splitLetters(word) {
            const content = word.innerHTML;
            word.innerHTML = '';
            const letters = [];

            for (let i = 0; i < content.length; i++) {
                const letter = document.createElement('span');
                letter.className = 'letter';

                if (content.charAt(i) === '¨') {
                    letter.innerHTML = '&nbsp;';
                    letter.style.opacity = '0';
                } else {
                    letter.innerHTML = content.charAt(i);
                }

                word.appendChild(letter);
                letters.push(letter);
            }

            wordArray.push(letters);
        }

        changeWord();
        setInterval(changeWord, 4000);
    }

    // Search input focus handler
    function initSearchContainerFocus() {
        const searchContainer = document.querySelector('.search-container');
        if (searchContainer) {
            searchContainer.addEventListener('click', function (event) {
                const isFilterButton = event.target.closest('.filter-toggle');
                if (!isFilterButton) {
                    const searchInput = document.getElementById('is-search-input-10380') || 
                                      document.getElementById('klef-search');
                    if (searchInput) {
                        searchInput.focus();
                    }
                }
            });
        }
    }

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initHeroAnimation();
            initSearchContainerFocus();
        });
    } else {
        initHeroAnimation();
        initSearchContainerFocus();
    }
})();

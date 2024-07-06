window.onload = function() {
    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');
    const status = document.getElementById('status');
    const output = document.getElementById('output');
    const copyBtn = document.getElementById('textco');
    const copyMessage = document.getElementById('copy-message');
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history-btn');

    let recognition;
    let isRecognizing = false;
    let finalTranscript = '';

    try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = function() {
            isRecognizing = true;
            status.textContent = "Listening...";
        };

        recognition.onend = function() {
            isRecognizing = false;
            status.textContent = "Click 'Start' to begin speech recognition.";
        };

        recognition.onerror = function(event) {
            console.error('Recognition error: ', event.error);
            status.textContent = "Error occurred in recognition: " + event.error;
        };

        recognition.onresult = function(event) {
            let interimTranscript = '';
            finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            output.value = finalTranscript + interimTranscript;

            // Store final transcript to local storage only when it is complete
            if (finalTranscript) {
                storeInHistory(finalTranscript);
            }
        };
    } catch (error) {
        console.error('Speech recognition not supported', error);
        status.textContent = 'Speech recognition not supported in this browser.';
    }

    startBtn.addEventListener('click', function() {
        if (!isRecognizing && recognition) {
            recognition.start();
        }
    });

    stopBtn.addEventListener('click', function() {
        if (isRecognizing && recognition) {
            recognition.stop();
        }
    });

    copyBtn.addEventListener('click', function() {
        output.select();
        document.execCommand('copy');
        copyMessage.style.display = 'block';
        copyMessage.textContent = 'Copied to clipboard';
        setTimeout(() => {
            copyMessage.style.display = 'none';
        }, 2000);
    });

    clearHistoryBtn.addEventListener('click', function() {
        localStorage.removeItem('speechToTextHistory');
        renderHistory();
    });

    function storeInHistory(text) {
        let history = JSON.parse(localStorage.getItem('speechToTextHistory')) || [];
        history.push(text);
        localStorage.setItem('speechToTextHistory', JSON.stringify(history));
        renderHistory();
    }

    function renderHistory() {
        let history = JSON.parse(localStorage.getItem('speechToTextHistory')) || [];
        historyList.innerHTML = ''; // Clear the existing history list
        history.forEach((item, index) => {
            const li = document.createElement('li');
            li.textContent = item;
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', () => {
                deleteFromHistory(index);
            });
            li.appendChild(deleteBtn);
            historyList.appendChild(li);
        });
    }

    function deleteFromHistory(index) {
        let history = JSON.parse(localStorage.getItem('speechToTextHistory')) || [];
        history.splice(index, 1);
        localStorage.setItem('speechToTextHistory', JSON.stringify(history));
        renderHistory();
    }

    // Initial render of history
    renderHistory();
};

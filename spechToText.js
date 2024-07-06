// Initialize speech recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continuous = true;
recognition.interimResults = true;

let recognizing = false;
let interimTranscript = ''; // To store interim results
let lastTranscriptUpdateTime = 0; // To track time of last transcript update

// Start speech recognition
document.getElementById('start-btn').addEventListener('click', () => {
    if (recognizing) {
        recognition.stop();
        recognizing = false;
        return;
    }
    recognition.start();
    recognizing = true;
    interimTranscript = ''; // Clear interim transcript
    lastTranscriptUpdateTime = 0;
    document.getElementById('status').textContent = 'Listening...';
});

// Stop speech recognition
document.getElementById('stop-btn').addEventListener('click', () => {
    if (recognizing) {
        recognition.stop();
        recognizing = false;
    }
    document.getElementById('status').textContent = 'Stopped.';
});

// Handle speech recognition results
recognition.onresult = (event) => {
    let transcript = document.getElementById('output').value; // Accumulate existing transcript
    for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
        } else {
            let interimResult = event.results[i][0].transcript.trim();
            if (interimResult !== '' && Date.now() - lastTranscriptUpdateTime > 500) {
                interimTranscript += interimResult + ' ';
                lastTranscriptUpdateTime = Date.now();
            }
        }
    }
    document.getElementById('output').value = transcript;
};

// Handle speech recognition end
recognition.onend = () => {
    recognizing = false;
    document.getElementById('status').textContent = 'Stopped.';
    let finalTranscript = document.getElementById('output').value.trim();
    saveToHistory(finalTranscript); // Save final transcript to history
};

// Handle speech recognition errors
recognition.onerror = (event) => {
    console.error('Speech recognition error detected: ' + event.error);
    document.getElementById('status').textContent = 'Error occurred: ' + event.error;
};

// Save to history in local storage
function saveToHistory(text) {
    let history = JSON.parse(localStorage.getItem('speechToTextHistory')) || [];
    if (text !== '') {
        history.push(text);
        localStorage.setItem('speechToTextHistory', JSON.stringify(history));
        displayHistory();
    }
}

function displayHistory() {
    let history = JSON.parse(localStorage.getItem('speechToTextHistory')) || [];
    let historyList = document.getElementById('history-list');
    historyList.innerHTML = '';
    history.forEach((item) => {
        let li = document.createElement('li');
        li.textContent = item;
        historyList.appendChild(li);
    });
}

document.addEventListener('DOMContentLoaded', displayHistory);

document.getElementById('clear-history-btn').addEventListener('click', () => {
    localStorage.removeItem('speechToTextHistory');
    displayHistory();
});

document.getElementById('textco').addEventListener('click', () => {
    let output = document.getElementById('output');
    output.select();
    document.execCommand('copy');

    showCopyMessage();
});

// Function to show copy message in a div
function showCopyMessage() {
    let copyMessageDiv = document.getElementById('copy-message');
    if (!copyMessageDiv) {
        copyMessageDiv = document.createElement('div');
        copyMessageDiv.id = 'copy-message';
        copyMessageDiv.textContent = 'Text copied to clipboard!';
        copyMessageDiv.style.backgroundColor = '#4CAF50';
        copyMessageDiv.style.color = 'white';
        copyMessageDiv.style.padding = '10px';
        copyMessageDiv.style.position = 'fixed';
        copyMessageDiv.style.bottom = '20px';
        copyMessageDiv.style.left = '50%';
        copyMessageDiv.style.transform = 'translateX(-50%)';
        copyMessageDiv.style.borderRadius = '5px';
        copyMessageDiv.style.zIndex = '1000';
        document.body.appendChild(copyMessageDiv);

        // Automatically remove the message after a few seconds
        setTimeout(() => {
            copyMessageDiv.remove();
        }, 3000); // Remove after 3 seconds
    }
}
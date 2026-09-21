document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('toggleRecordingBtn');
    const userCam = document.getElementById('userCam');
    const camPlaceholder = document.getElementById('camPlaceholder');
    const confidenceBar = document.getElementById('confidenceBar');
    const wpmValue = document.getElementById('wpmValue');
    const activeTranscriptBox = document.getElementById('activeTranscriptBox');
    const activeTranscriptText = document.getElementById('activeTranscriptText');
    
    let isRecording = false;
    let mockInterval;
    let stream = null;

    toggleBtn.addEventListener('click', async () => {
        if (!isRecording) {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                userCam.srcObject = stream;
                userCam.style.display = 'block';
                camPlaceholder.style.display = 'none';
            } catch (err) {
                console.warn("Kamera tidak tersedia:", err);
                camPlaceholder.innerText = "Camera Active (No WebCam Found)";
            }

            isRecording = true;
            toggleBtn.innerHTML = '<i class="fa-solid fa-stop"></i> Finish Speaking';
            toggleBtn.classList.add('recording');
            
            activeTranscriptBox.style.display = 'block';
            activeTranscriptText.innerText = "Listening...";
            
            let words = ["I", "think", "the", "key", "was", "clear", "communication."];
            let wordIndex = 0;
            let currentText = "";

            mockInterval = setInterval(() => {
                confidenceBar.style.width = Math.floor(Math.random() * (95 - 70 + 1) + 70) + '%';
                wpmValue.innerText = Math.floor(Math.random() * (150 - 120 + 1) + 120);

                if (wordIndex < words.length) {
                    currentText += words[wordIndex] + " ";
                    activeTranscriptText.innerText = `"${currentText.trim()}..."`;
                    activeTranscriptText.style.color = '#333';
                    activeTranscriptText.style.fontStyle = 'normal';
                    wordIndex++;
                }

            }, 1000);

        } else {
            isRecording = false;
            clearInterval(mockInterval);
            
            // Matikan Kamera
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                userCam.style.display = 'none';
                camPlaceholder.style.display = 'flex';
                camPlaceholder.innerText = "User Webcam Placeholder";
            }

            toggleBtn.innerHTML = '<i class="fa-solid fa-microphone"></i> Start Speaking';
            toggleBtn.classList.remove('recording');
            activeTranscriptBox.style.display = 'none';
            
            confidenceBar.style.width = '75%';
            wpmValue.innerText = '140';
        }
    });
});
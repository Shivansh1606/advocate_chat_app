// File: static/js/video.js (COMPLETE UPDATED CODE)

class WhatsAppStyleVideoCall {
    constructor() {
        this.localStream = null;
        this.isMicOn = true;
        this.isCameraOn = true;
        this.isScreenSharing = false;
        this.callStartTime = null;
        this.callTimerInterval = null;
        this.advocateId = this.getUrlParameter('advocate'); // ✅ Advocate ID URL se nikala

        // DOM elements
        this.elements = {
            localVideo: document.getElementById('local-video'),
            remoteVideo: document.getElementById('remote-video'),
            statusOverlay: document.getElementById('status-overlay'),
            statusText: document.getElementById('status-text'),
            statusSubtext: document.getElementById('status-subtext'),
            timerDisplay: document.getElementById('call-timer-display'),
            selfVideoContainer: document.getElementById('self-video-container'),
            advocateName: document.getElementById('advocate-name'), // ✅ Advocate naam ke liye element
            toggleMicBtn: document.getElementById('toggle-mic-btn'),
            toggleCameraBtn: document.getElementById('toggle-camera-btn'),
            endCallBtn: document.getElementById('end-call-btn'),
            flipCameraBtn: document.getElementById('flip-camera-btn'),
            shareScreenBtn: document.getElementById('share-screen-btn')
        };
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.loadAdvocateInfo(); // ✅ Advocate info load karne ka function call
        try {
            await this.startMedia();
            // In a real app, you would now connect to a signaling server
            this.simulateConnection();
        } catch (error) {
            this.elements.statusText.textContent = "Error";
            this.elements.statusSubtext.textContent = "Could not access camera or microphone.";
            console.error("Error starting media:", error);
        }
    }

    // ✅ NEW FUNCTION: Advocate ka naam load karne ke liye
    async loadAdvocateInfo() {
        if (!this.advocateId) return;
        try {
            const response = await fetch('/api/advocates');
            const data = await response.json();
            const advocate = data.advocates.find(adv => adv.id === this.advocateId);
            if (advocate) {
                this.elements.advocateName.textContent = advocate.name;
            }
        } catch (error) {
            console.error('Failed to load advocate info:', error);
            this.elements.advocateName.textContent = 'Advocate';
        }
    }

    getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    async startMedia() {
        this.localStream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user'
            },
            audio: true
        });
        this.elements.localVideo.srcObject = this.localStream;
    }
    
    simulateConnection() {
        // Simulate a delay for connection
        setTimeout(() => {
            this.elements.statusOverlay.style.opacity = '0';
            this.elements.statusOverlay.style.pointerEvents = 'none';
            this.startCallTimer();
            // In a real app, you'd get the remote stream here
            // this.elements.remoteVideo.srcObject = this.remoteStream;
            
            // For demo purposes, mirroring local stream to remote view
            this.elements.remoteVideo.srcObject = this.localStream; 
        }, 3000);
    }

    startCallTimer() {
        this.callStartTime = Date.now();
        this.callTimerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.callStartTime) / 1000);
            const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
            const seconds = String(elapsed % 60).padStart(2, '0');
            this.elements.timerDisplay.textContent = `${minutes}:${seconds}`;
        }, 1000);
    }

    setupEventListeners() {
        this.elements.toggleMicBtn.addEventListener('click', () => this.toggleMic());
        this.elements.toggleCameraBtn.addEventListener('click', () => this.toggleCamera());
        this.elements.endCallBtn.addEventListener('click', () => this.endCall());
        this.elements.flipCameraBtn.addEventListener('click', () => this.flipCamera());
        this.elements.shareScreenBtn.addEventListener('click', () => this.toggleScreenShare());
        
        let isDragging = false;
        let offset = { x: 0, y: 0 };
        const container = this.elements.selfVideoContainer;

        container.addEventListener('mousedown', (e) => {
            isDragging = true;
            offset.x = e.clientX - container.offsetLeft;
            offset.y = e.clientY - container.offsetTop;
            container.style.transition = 'none';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            container.style.left = `${e.clientX - offset.x}px`;
            container.style.top = `${e.clientY - offset.y}px`;
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
            container.style.transition = 'all 0.3s ease';
        });
    }

    toggleMic() {
        this.isMicOn = !this.isMicOn;
        this.localStream.getAudioTracks()[0].enabled = this.isMicOn;
        this.elements.toggleMicBtn.classList.toggle('active', !this.isMicOn);
        this.elements.toggleMicBtn.querySelector('i').className = this.isMicOn ? 'fas fa-microphone' : 'fas fa-microphone-slash';
    }

    toggleCamera() {
        this.isCameraOn = !this.isCameraOn;
        this.localStream.getVideoTracks()[0].enabled = this.isCameraOn;
        this.elements.toggleCameraBtn.classList.toggle('active', !this.isCameraOn);
        this.elements.toggleCameraBtn.querySelector('i').className = this.isCameraOn ? 'fas fa-video' : 'fas fa-video-slash';
    }
    
    async flipCamera() {
        // Stop current video track to release the camera
        this.localStream.getVideoTracks().forEach(track => track.stop());

        // Get current facing mode
        const currentFacingMode = this.localStream.getVideoTracks()[0]?.getSettings().facingMode;
        const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
        
        try {
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: newFacingMode }
            });
            const newVideoTrack = newStream.getVideoTracks()[0];
            
            // Replace the old track with the new one
            this.localStream.removeTrack(this.localStream.getVideoTracks()[0]);
            this.localStream.addTrack(newVideoTrack);
            
            this.elements.localVideo.srcObject = null; // Reset srcObject
            this.elements.localVideo.srcObject = this.localStream;
            
        } catch (error) {
            console.error("Error flipping camera:", error);
        }
    }

    async toggleScreenShare() {
        // Screen sharing logic remains complex and is best-effort
        alert("Screen sharing is a complex feature and is for demonstration purposes.");
    }

    endCall() {
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
        }
        clearInterval(this.callTimerInterval);
        
        this.elements.statusText.textContent = "Call Ended";
        this.elements.statusSubtext.textContent = "Closing window...";
        this.elements.statusOverlay.style.opacity = '1';
        this.elements.statusOverlay.style.pointerEvents = 'auto';

        // ✅ CHANGE: Window ko turant close karne ki koshish
        // Timeout hataya gaya hai
        window.close();
        
        // Agar window close nahi hoti hai (e.g., security restrictions),
        // to user ko batane ke liye 1 sec baad fallback message
        setTimeout(() => {
            this.elements.statusSubtext.textContent = "You can now close this tab.";
        }, 1000);
    }
}

// Initialize the call
window.onload = () => {
    new WhatsAppStyleVideoCall();
};

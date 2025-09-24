// ===== LEGAL CHAT SYSTEM - WEBRTC IMPLEMENTATION =====
// Version: 2.0.0 - Professional Video Consultation

console.log('🎥 WebRTC Manager Loading...');

class WebRTCManager {
    constructor(roomId, userId, userName) {
        this.roomId = roomId;
        this.userId = userId;
        this.userName = userName;
        
        this.localStream = null;
        this.remoteStreams = new Map();
        this.peerConnections = new Map();
        this.isCallActive = false;
        this.isMuted = false;
        this.isVideoOff = false;
        
        // WebRTC Configuration
        this.rtcConfig = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' }
            ]
        };
        
        // Polling intervals
        this.signalingInterval = null;
        this.pollDelay = 2000; // 2 seconds
        
        console.log(`🎥 WebRTC Manager initialized: ${userName} in room ${roomId}`);
    }
    
    async startCall() {
        try {
            console.log('🚀 Starting video call...');
            
            // Get user media
            await this.initializeMedia();
            
            // Join room
            await this.joinRoom();
            
            // Start signaling
            this.startSignaling();
            
            // Update UI
            this.updateUI();
            
            this.isCallActive = true;
            
            console.log('✅ Video call started successfully');
            
            // Callback for main page
            if (typeof window.onWebRTCReady === 'function') {
                window.onWebRTCReady();
            }
            
        } catch (error) {
            console.error('❌ Failed to start call:', error);
            this.showError('Failed to start call. Please check your camera/microphone permissions.');
        }
    }
    
    async initializeMedia() {
        try {
            console.log('📹 Initializing camera and microphone...');
            
            const constraints = {
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            };
            
            this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
            
            // Display local video
            const localVideo = document.getElementById('main-video');
            if (localVideo) {
                localVideo.srcObject = this.localStream;
                localVideo.muted = true; // Prevent echo
            }
            
            console.log('✅ Media initialized successfully');
            
            // Callback for local stream
            if (typeof window.onLocalStreamReady === 'function') {
                window.onLocalStreamReady(this.localStream);
            }
            
        } catch (error) {
            console.error('❌ Media initialization failed:', error);
            throw new Error('Camera/microphone access denied. Please allow permissions and try again.');
        }
    }
    
    async joinRoom() {
        try {
            console.log(`🚪 Joining room: ${this.roomId}`);
            
            const response = await fetch(`/api/webrtc/join/${this.roomId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: this.userName
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.status === 'success') {
                console.log(`✅ Joined room successfully. Users: ${data.user_count}`);
                
                // Update participants list
                if (data.users && data.users.length > 0) {
                    data.users.forEach(user => {
                        if (user.id !== this.userId && typeof window.onParticipantJoined === 'function') {
                            window.onParticipantJoined(user.id, user.username);
                        }
                    });
                }
            } else {
                throw new Error(data.message || 'Failed to join room');
            }
            
        } catch (error) {
            console.error('❌ Room join failed:', error);
            throw error;
        }
    }
    
    startSignaling() {
        console.log('📡 Starting signaling loop...');
        
        this.signalingInterval = setInterval(async () => {
            try {
                await this.pollSignals();
            } catch (error) {
                console.error('⚠️ Signaling poll error:', error);
            }
        }, this.pollDelay);
    }
    
    async pollSignals() {
        try {
            const response = await fetch(`/api/webrtc/signals/${this.roomId}`);
            
            if (!response.ok) {
                console.warn(`⚠️ Signaling poll failed: ${response.status}`);
                return;
            }
            
            const data = await response.json();
            
            if (data.status === 'success') {
                // Process new signals
                if (data.signals && data.signals.length > 0) {
                    data.signals.forEach(signal => this.handleSignal(signal));
                }
                
                // Update user count
                if (data.users) {
                    this.updateParticipantsList(data.users);
                }
            }
            
        } catch (error) {
            console.error('❌ Signal polling error:', error);
        }
    }
    
    async sendSignal(type, targetUserId, data) {
        try {
            const signal = {
                from: this.userId,
                to: targetUserId,
                type: type,
                data: data
            };
            
            const response = await fetch(`/api/webrtc/signal/${this.roomId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(signal)
            });
            
            if (response.ok) {
                console.log(`📡 Signal sent: ${type} to ${targetUserId || 'all'}`);
            } else {
                console.error(`❌ Signal send failed: ${response.status}`);
            }
            
        } catch (error) {
            console.error('❌ Send signal error:', error);
        }
    }
    
    handleSignal(signal) {
        // Skip own signals
        if (signal.from === this.userId) {
            return;
        }
        
        console.log(`📥 Received signal: ${signal.type} from ${signal.from}`);
        
        switch (signal.type) {
            case 'user-joined':
                this.handleUserJoined(signal);
                break;
                
            case 'user-left':
                this.handleUserLeft(signal);
                break;
                
            case 'offer':
                this.handleOffer(signal);
                break;
                
            case 'answer':
                this.handleAnswer(signal);
                break;
                
            case 'ice-candidate':
                this.handleIceCandidate(signal);
                break;
                
            default:
                console.log(`❓ Unknown signal type: ${signal.type}`);
        }
    }
    
    handleUserJoined(signal) {
        const userId = signal.from;
        const userData = signal.data;
        
        console.log(`👤 User joined: ${userData?.username || userId}`);
        
        if (typeof window.onParticipantJoined === 'function') {
            window.onParticipantJoined(userId, userData?.username || 'Unknown');
        }
        
        // Create peer connection for new user
        this.createPeerConnection(userId);
    }
    
    handleUserLeft(signal) {
        const userId = signal.data?.user_id || signal.from;
        
        console.log(`👋 User left: ${userId}`);
        
        // Clean up peer connection
        if (this.peerConnections.has(userId)) {
            this.peerConnections.get(userId).close();
            this.peerConnections.delete(userId);
        }
        
        // Remove remote stream
        if (this.remoteStreams.has(userId)) {
            this.remoteStreams.delete(userId);
        }
        
        if (typeof window.onParticipantLeft === 'function') {
            window.onParticipantLeft(userId);
        }
    }
    
    async handleOffer(signal) {
        try {
            const pc = this.createPeerConnection(signal.from);
            
            await pc.setRemoteDescription(new RTCSessionDescription(signal.data));
            
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            
            await this.sendSignal('answer', signal.from, answer);
            
            console.log(`✅ Answer sent to ${signal.from}`);
            
        } catch (error) {
            console.error('❌ Handle offer error:', error);
        }
    }
    
    async handleAnswer(signal) {
        try {
            const pc = this.peerConnections.get(signal.from);
            if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(signal.data));
                console.log(`✅ Answer received from ${signal.from}`);
            }
        } catch (error) {
            console.error('❌ Handle answer error:', error);
        }
    }
    
    async handleIceCandidate(signal) {
        try {
            const pc = this.peerConnections.get(signal.from);
            if (pc) {
                await pc.addIceCandidate(new RTCIceCandidate(signal.data));
                console.log(`🧊 ICE candidate added from ${signal.from}`);
            }
        } catch (error) {
            console.error('❌ Handle ICE candidate error:', error);
        }
    }
    
    createPeerConnection(userId) {
        if (this.peerConnections.has(userId)) {
            return this.peerConnections.get(userId);
        }
        
        console.log(`🔗 Creating peer connection for: ${userId}`);
        
        const pc = new RTCPeerConnection(this.rtcConfig);
        
        // Add local stream
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                pc.addTrack(track, this.localStream);
            });
        }
        
        // Handle remote stream
        pc.ontrack = (event) => {
            console.log(`📹 Remote stream received from: ${userId}`);
            this.remoteStreams.set(userId, event.streams[0]);
            this.displayRemoteStream(userId, event.streams[0]);
        };
        
        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                this.sendSignal('ice-candidate', userId, event.candidate);
            }
        };
        
        // Connection state monitoring
        pc.onconnectionstatechange = () => {
            console.log(`🔗 Connection state with ${userId}: ${pc.connectionState}`);
        };
        
        this.peerConnections.set(userId, pc);
        return pc;
    }
    
    displayRemoteStream(userId, stream) {
        // Try to find participant video element
        const participantVideo = document.querySelector(`#participant-${userId} video`);
        if (participantVideo) {
            participantVideo.srcObject = stream;
            console.log(`✅ Remote stream displayed for: ${userId}`);
        } else {
            console.warn(`⚠️ Video element not found for: ${userId}`);
        }
    }
    
    updateParticipantsList(users) {
        // Update participant count
        const countElement = document.getElementById('participants-count');
        if (countElement) {
            const activeUsers = users.filter(u => u.id !== this.userId);
            const countSpan = countElement.querySelector('span');
            if (countSpan) {
                countSpan.textContent = `${activeUsers.length} participants`;
            }
        }
    }
    
    toggleMicrophone() {
        if (this.localStream) {
            const audioTrack = this.localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                this.isMuted = !audioTrack.enabled;
                
                console.log(`🎤 Microphone ${this.isMuted ? 'muted' : 'unmuted'}`);
                
                // Send signal to other participants
                this.sendSignal('audio-toggle', null, { 
                    muted: this.isMuted,
                    userId: this.userId
                });
                
                return this.isMuted;
            }
        }
        return false;
    }
    
    toggleCamera() {
        if (this.localStream) {
            const videoTrack = this.localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                this.isVideoOff = !videoTrack.enabled;
                
                console.log(`📹 Camera ${this.isVideoOff ? 'disabled' : 'enabled'}`);
                
                // Send signal to other participants
                this.sendSignal('video-toggle', null, { 
                    videoOff: this.isVideoOff,
                    userId: this.userId
                });
                
                return this.isVideoOff;
            }
        }
        return false;
    }
    
    async shareScreen() {
        try {
            console.log('🖥️ Starting screen share...');
            
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true
            });
            
            // Replace video track in all peer connections
            const videoTrack = screenStream.getVideoTracks()[0];
            
            this.peerConnections.forEach(async (pc, userId) => {
                const sender = pc.getSenders().find(s => 
                    s.track && s.track.kind === 'video'
                );
                
                if (sender) {
                    await sender.replaceTrack(videoTrack);
                }
            });
            
            // Update local video
            const localVideo = document.getElementById('main-video');
            if (localVideo) {
                localVideo.srcObject = screenStream;
            }
            
            // Handle screen share end
            videoTrack.onended = () => {
                this.stopScreenShare();
            };
            
            console.log('✅ Screen sharing started');
            
            // Send signal
            this.sendSignal('screen-share-start', null, {
                userId: this.userId
            });
            
        } catch (error) {
            console.error('❌ Screen share failed:', error);
            this.showError('Screen sharing failed. Please try again.');
        }
    }
    
    async stopScreenShare() {
        try {
            console.log('🖥️ Stopping screen share...');
            
            // Get camera stream again
            const cameraStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            
            // Replace screen track with camera track
            const videoTrack = cameraStream.getVideoTracks()[0];
            
            this.peerConnections.forEach(async (pc, userId) => {
                const sender = pc.getSenders().find(s => 
                    s.track && s.track.kind === 'video'
                );
                
                if (sender) {
                    await sender.replaceTrack(videoTrack);
                }
            });
            
            // Update local video
            const localVideo = document.getElementById('main-video');
            if (localVideo) {
                localVideo.srcObject = cameraStream;
            }
            
            this.localStream = cameraStream;
            
            console.log('✅ Screen sharing stopped');
            
            // Send signal
            this.sendSignal('screen-share-stop', null, {
                userId: this.userId
            });
            
        } catch (error) {
            console.error('❌ Stop screen share failed:', error);
        }
    }
    
    async endCall() {
        try {
            console.log('📞 Ending call...');
            
            // Send leave signal
            await this.leaveRoom();
            
            // Stop signaling
            if (this.signalingInterval) {
                clearInterval(this.signalingInterval);
                this.signalingInterval = null;
            }
            
            // Close all peer connections
            this.peerConnections.forEach(pc => pc.close());
            this.peerConnections.clear();
            
            // Stop local stream
            if (this.localStream) {
                this.localStream.getTracks().forEach(track => track.stop());
                this.localStream = null;
            }
            
            // Clear remote streams
            this.remoteStreams.clear();
            
            this.isCallActive = false;
            
            console.log('✅ Call ended successfully');
            
        } catch (error) {
            console.error('❌ End call error:', error);
        }
    }
    
    async leaveRoom() {
        try {
            const response = await fetch(`/api/webrtc/leave/${this.roomId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: this.userId
                })
            });
            
            if (response.ok) {
                console.log('✅ Left room successfully');
            } else {
                console.warn(`⚠️ Leave room failed: ${response.status}`);
            }
            
        } catch (error) {
            console.error('❌ Leave room error:', error);
        }
    }
    
    updateUI() {
        // Hide welcome screen
        const welcomeScreen = document.getElementById('welcome-screen');
        if (welcomeScreen) {
            welcomeScreen.style.display = 'none';
        }
        
        // Show call controls
        const controls = document.getElementById('call-controls');
        if (controls) {
            controls.style.display = 'flex';
        }
        
        // Show video overlay
        const overlay = document.getElementById('video-overlay');
        if (overlay) {
            overlay.style.display = 'block';
        }
        
        console.log('✅ UI updated for active call');
    }
    
    showError(message) {
        console.error('📢 Error:', message);
        
        if (typeof window.ChatUtils !== 'undefined' && window.ChatUtils.showNotification) {
            window.ChatUtils.showNotification(message, 'error', 5000);
        } else {
            alert(message);
        }
    }
}

// ===== GLOBAL WEBRTC UTILITIES =====
window.WebRTCManager = WebRTCManager;

console.log('✅ WebRTC Manager loaded successfully');

// File: static/js/chat.js (FINAL UPDATED AND BUG-FREE CODE)
/*
class AdvocateChat {
    constructor() {
        this.currentUser = localStorage.getItem('clientName') || 'Client';
        this.advocateId = this.getUrlParameter('advocate') || 'adv1';
        
        // ✅ BUG FIX: Har advocate ke liye alag chat history
        // 'chatMessages' ki jagah `chatMessages_${this.advocateId}` use kiya gaya hai
        this.storageKey = `chatMessages_${this.advocateId}`; 
        this.messages = JSON.parse(localStorage.getItem(this.storageKey) || '[]');

        this.init();
    }

    init() {
        this.loadAdvocateInfo();
        this.loadMessages();
        this.setupEventListeners();
    }

    async loadAdvocateInfo() {
        try {
            const response = await fetch('/api/advocates');
            const data = await response.json();
            const advocate = data.advocates.find(adv => adv.id === this.advocateId);
            
            if (advocate) {
                document.getElementById('advocate-name').textContent = advocate.name;
                document.getElementById('advocate-specialty').textContent = advocate.specialty;
            }
        } catch (error) {
            console.error('Error loading advocate info:', error);
        }
    }

    sendMessage() {
        const input = document.getElementById('message-input');
        const text = input.value.trim();
        
        if (text) {
            const message = {
                id: Date.now(),
                sender: this.currentUser,
                text: text,
                timestamp: new Date().toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                type: 'text'
            };
            
            this.addMessage(message);
            input.value = '';
            
            // Simulate advocate response (Demo purpose)
            setTimeout(() => this.simulateAdvocateResponse(), 1000);
        }
    }

    sendVideoLink() {
        const roomId = 'room_' + Math.random().toString(36).substr(2, 9);
        const videoUrl = `/video-call/${roomId}?advocate=${this.advocateId}`;
        
        const message = {
            id: Date.now(),
            sender: this.currentUser,
            text: `🎥 Video Call Started`,
            videoLink: videoUrl,
            timestamp: new Date().toLocaleTimeString('en-IN', {
                hour: '2-digit', 
                minute: '2-digit'
            }),
            type: 'video'
        };
        
        this.addMessage(message);
        
        window.open(videoUrl, '_blank', 'width=1000,height=700');
    }

    addMessage(message) {
        this.messages.push(message);
        this.saveMessages();
        this.displayMessage(message);
        this.scrollToBottom();
    }

    displayMessage(message) {
        const messagesDiv = document.getElementById('messages');
        const messageElement = document.createElement('div');
        const isOwnMessage = message.sender === this.currentUser;
        
        messageElement.className = `message ${isOwnMessage ? 'own' : 'other'}`;
        
        if (message.type === 'video') {
            messageElement.innerHTML = `
                <div class="message-content video-message">
                    <div class="video-link-container">
                        <i class="fas fa-video"></i>
                        <span>${message.text}</span>
                        <a href="${message.videoLink}" target="_blank" class="join-video-btn">
                            Join Call
                        </a>
                    </div>
                    <div class="message-time">${message.timestamp}</div>
                </div>
            `;
        } else {
            messageElement.innerHTML = `
                <div class="message-content">
                    <div class="message-text">${message.text}</div>
                    <div class="message-time">${message.timestamp}</div>
                </div>
            `;
        }
        
        messagesDiv.appendChild(messageElement);
    }

    simulateAdvocateResponse() {
        const responses = [
            "I understand your concern. Let me help you with this matter.",
            "Based on legal provisions, I would suggest...",
            "This is a common issue. Here's what we can do...",
            "Let me review the details and get back to you.",
            "Would you like to schedule a detailed video consultation?"
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const message = {
            id: Date.now(),
            sender: 'Advocate',
            text: randomResponse,
            timestamp: new Date().toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit'
            }),
            type: 'text'
        };
        
        this.addMessage(message);
    }

    loadMessages() {
        // Clear any previous messages before loading new ones
        document.getElementById('messages').innerHTML = '';
        this.messages.forEach(message => this.displayMessage(message));
        this.scrollToBottom();
    }

    saveMessages() {
        // ✅ BUG FIX: Ab specific key mein save hoga
        localStorage.setItem(this.storageKey, JSON.stringify(this.messages));
    }

    scrollToBottom() {
        const messagesDiv = document.getElementById('messages');
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    setupEventListeners() {
        document.getElementById('message-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }
}

// Initialize chat when page loads
let chat;
window.addEventListener('DOMContentLoaded', () => {
    chat = new AdvocateChat();
});

// Global functions for HTML onclick events
function sendMessage() {
    if (chat) chat.sendMessage();
}

function sendVideoLink() {
    if (chat) chat.sendVideoLink();
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}
*/
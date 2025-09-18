// Main JavaScript utilities for Advocate Chat System

// Global utility functions
window.utils = {
    // Format time function
    formatTime: function(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Generate random ID
    generateId: function() {
        return Math.random().toString(36).substr(2, 9);
    },

    // Show notification
    showNotification: function(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation' : 'info'}-circle"></i>
            <span>${message}</span>
        `;

        // Add styles if not exists
        if (!document.getElementById('notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    padding: 15px 20px;
                    border-radius: 10px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    z-index: 9999;
                    animation: slideIn 0.3s ease;
                    max-width: 300px;
                }
                .notification.success { border-left: 4px solid #4CAF50; }
                .notification.error { border-left: 4px solid #f44336; }
                .notification.info { border-left: 4px solid #2196F3; }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideIn 0.3s ease reverse';
                setTimeout(() => {
                    if (notification.parentNode) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }
        }, 3000);
    },

    // Validate form
    validateForm: function(formElement) {
        const inputs = formElement.querySelectorAll('input[required], textarea[required]');
        let isValid = true;

        inputs.forEach(input => {
            const value = input.value.trim();
            if (!value) {
                input.style.borderColor = '#f44336';
                input.style.boxShadow = '0 0 0 2px rgba(244, 67, 54, 0.2)';
                isValid = false;
            } else {
                input.style.borderColor = '#e0e0e0';
                input.style.boxShadow = 'none';
            }
        });

        return isValid;
    },

    // Loading spinner
    showLoader: function() {
        if (document.getElementById('global-loader')) return;

        const loader = document.createElement('div');
        loader.id = 'global-loader';
        loader.innerHTML = `
            <div class="loader-backdrop">
                <div class="loader-content">
                    <div class="loader-spinner">
                        <i class="fas fa-spinner fa-spin"></i>
                    </div>
                    <p>Loading...</p>
                </div>
            </div>
        `;

        // Add loader styles
        const styles = document.createElement('style');
        styles.textContent = `
            #global-loader {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
            }
            .loader-backdrop {
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .loader-content {
                background: white;
                padding: 30px;
                border-radius: 15px;
                text-align: center;
                color: #333;
            }
            .loader-spinner i {
                font-size: 2rem;
                color: #667eea;
                margin-bottom: 15px;
            }
        `;
        loader.appendChild(styles);

        document.body.appendChild(loader);
    },

    hideLoader: function() {
        const loader = document.getElementById('global-loader');
        if (loader) {
            document.body.removeChild(loader);
        }
    },

    // Local storage helpers
    storage: {
        set: function(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                console.error('Storage error:', e);
                return false;
            }
        },

        get: function(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                console.error('Storage error:', e);
                return defaultValue;
            }
        },

        remove: function(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                console.error('Storage error:', e);
                return false;
            }
        }
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Advocate Chat System - Main utilities loaded');

    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add click animation to buttons
    document.addEventListener('click', function(e) {
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
            const button = e.target.tagName === 'BUTTON' ? e.target : e.target.closest('button');
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 150);
        }
    });

    // Handle form inputs focus
    document.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('focus', function() {
            this.style.borderColor = '#667eea';
            this.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
        });

        input.addEventListener('blur', function() {
            if (!this.value.trim() && this.hasAttribute('required')) {
                this.style.borderColor = '#f44336';
                this.style.boxShadow = '0 0 0 2px rgba(244, 67, 54, 0.1)';
            } else {
                this.style.borderColor = '#e0e0e0';
                this.style.boxShadow = 'none';
            }
        });
    });

    // Auto-resize textareas
    document.querySelectorAll('textarea').forEach(textarea => {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
    });
});

// Handle errors globally
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    utils.showNotification('An error occurred. Please refresh the page.', 'error');
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    utils.showNotification('Network error. Please check your connection.', 'error');
});

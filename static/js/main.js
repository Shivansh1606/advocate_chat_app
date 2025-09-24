// ===== LEGAL CHAT SYSTEM - MAIN UTILITIES =====
// Version: 2.0.0 - Production Ready

console.log('%cLegal Chat System v2.0', 'color: #4a5de8; font-size: 18px; font-weight: bold;');
console.log('%c⚖️ Professional Legal Consultation Platform', 'color: #666; font-size: 14px;');

// ===== GLOBAL UTILITIES =====
window.ChatUtils = {
    
    // Enhanced notification system
    showNotification: function(message, type = 'info', duration = 4000) {
        console.log(`🔔 Notification: ${type.toUpperCase()} - ${message}`);
        
        const container = document.getElementById('notification-container') || this.createNotificationContainer();
        
        const notification = document.createElement('div');
        notification.className = `notification ${type} slide-up`;
        notification.style.cssText = `
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            margin-bottom: 12px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 600;
            min-width: 300px;
            max-width: 400px;
            position: relative;
            overflow: hidden;
            cursor: pointer;
            pointer-events: all;
            border: 2px solid rgba(255,255,255,0.3);
            backdrop-filter: blur(10px);
            animation: slideInRight 0.4s ease-out;
        `;
        
        const icon = this.getNotificationIcon(type);
        notification.innerHTML = `
            <div style="font-size: 1.2rem; flex-shrink: 0;">${icon}</div>
            <div style="flex: 1; line-height: 1.4;">${message}</div>
            <div style="cursor: pointer; opacity: 0.8; hover-opacity: 1; font-size: 1.1rem; flex-shrink: 0;">✕</div>
        `;
        
        // Close button functionality
        const closeBtn = notification.querySelector('div:last-child');
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeNotification(notification);
        });
        
        // Click to dismiss
        notification.addEventListener('click', () => {
            this.removeNotification(notification);
        });
        
        container.appendChild(notification);
        
        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                this.removeNotification(notification);
            }, duration);
        }
        
        return notification;
    },
    
    createNotificationContainer: function() {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            pointer-events: none;
        `;
        document.body.appendChild(container);
        return container;
    },
    
    removeNotification: function(notification) {
        notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    },
    
    getNotificationColor: function(type) {
        const colors = {
            'success': 'linear-gradient(135deg, #10b981, #059669)',
            'error': 'linear-gradient(135deg, #ef4444, #dc2626)', 
            'warning': 'linear-gradient(135deg, #f59e0b, #d97706)',
            'info': 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            'primary': 'linear-gradient(135deg, #4a5de8, #6b46c1)'
        };
        return colors[type] || colors.info;
    },
    
    getNotificationIcon: function(type) {
        const icons = {
            'success': '✅',
            'error': '❌', 
            'warning': '⚠️',
            'info': 'ℹ️',
            'primary': '🔔'
        };
        return icons[type] || icons.info;
    },
    
    // Loading overlay
    showLoading: function(message = 'Loading...') {
        console.log('⏳ Loading started:', message);
        
        let overlay = document.getElementById('global-loading-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'global-loading-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(8px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9998;
                animation: fadeIn 0.3s ease;
            `;
            
            overlay.innerHTML = `
                <div style="text-align: center; padding: 40px; background: white; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); border: 2px solid rgba(74, 93, 232, 0.1);">
                    <div style="width: 50px; height: 50px; border: 4px solid rgba(74, 93, 232, 0.1); border-top: 4px solid #4a5de8; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                    <p style="color: #374151; font-weight: 600; font-size: 16px; margin: 0;" id="loading-message">${message}</p>
                </div>
            `;
            
            document.body.appendChild(overlay);
        } else {
            overlay.style.display = 'flex';
            const messageEl = overlay.querySelector('#loading-message');
            if (messageEl) messageEl.textContent = message;
        }
    },
    
    hideLoading: function() {
        console.log('✅ Loading finished');
        const overlay = document.getElementById('global-loading-overlay');
        if (overlay) {
            overlay.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 300);
        }
    },
    
    // Form validation helpers
    validateEmail: function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    validatePhone: function(phone) {
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    },
    
    validateRequired: function(value) {
        return value && value.toString().trim().length > 0;
    },
    
    // API helpers
    makeRequest: async function(url, options = {}) {
        console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
        
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };
        
        const config = { ...defaultOptions, ...options };
        
        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }
        
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }
            
            console.log(`✅ API Response: ${url}`, data);
            return data;
            
        } catch (error) {
            console.error(`❌ API Error: ${url}`, error);
            throw error;
        }
    },
    
    // Local storage helpers
    saveToStorage: function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            console.log(`💾 Saved to storage: ${key}`);
        } catch (error) {
            console.error('❌ Storage save error:', error);
        }
    },
    
    loadFromStorage: function(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('❌ Storage load error:', error);
            return defaultValue;
        }
    },
    
    // Form auto-save
    enableAutoSave: function(formId, intervalMs = 30000) {
        const form = document.getElementById(formId);
        if (!form) {
            console.warn(`⚠️ Form not found: ${formId}`);
            return;
        }
        
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            // Save on change
            input.addEventListener('input', () => {
                const key = `autosave_${formId}_${input.name || input.id}`;
                this.saveToStorage(key, input.value);
            });
            
            // Restore on load
            const key = `autosave_${formId}_${input.name || input.id}`;
            const saved = this.loadFromStorage(key);
            if (saved && !input.value) {
                input.value = saved;
                console.log(`🔄 Restored: ${input.name || input.id}`);
            }
        });
        
        console.log(`💾 Auto-save enabled for form: ${formId}`);
    },
    
    // Clear auto-saved data
    clearAutoSave: function(formId) {
        const form = document.getElementById(formId);
        if (!form) return;
        
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            const key = `autosave_${formId}_${input.name || input.id}`;
            localStorage.removeItem(key);
        });
        
        console.log(`🧹 Auto-save data cleared for: ${formId}`);
    },
    
    // Copy to clipboard
    copyToClipboard: async function(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showNotification('Copied to clipboard!', 'success', 2000);
            return true;
        } catch (error) {
            console.error('❌ Clipboard error:', error);
            this.showNotification('Failed to copy to clipboard', 'error');
            return false;
        }
    },
    
    // Format helpers
    formatDate: function(dateString) {
        try {
            return new Date(dateString).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'Invalid date';
        }
    },
    
    formatTime: function(timeString) {
        try {
            const [hours, minutes] = timeString.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            return `${displayHour}:${minutes} ${ampm}`;
        } catch (error) {
            return 'Invalid time';
        }
    },
    
    // Device detection
    isMobile: function() {
        return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    
    isTablet: function() {
        return window.innerWidth > 768 && window.innerWidth <= 1024;
    },
    
    isDesktop: function() {
        return window.innerWidth > 1024;
    }
};

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', function(e) {
    // ESC to close modals
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal.active, .overlay.active');
        modals.forEach(modal => {
            if (typeof closeModal === 'function') {
                closeModal();
            } else {
                modal.classList.remove('active');
            }
        });
    }
    
    // Ctrl+/ for help
    if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        window.ChatUtils.showNotification('Keyboard shortcuts: ESC (close), Ctrl+/ (help)', 'info', 5000);
    }
});

// ===== ENHANCED FORM HANDLING =====
window.FormHelpers = {
    
    validateForm: function(formId) {
        const form = document.getElementById(formId);
        if (!form) return false;
        
        let isValid = true;
        const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    },
    
    validateField: function(field) {
        const value = field.value.trim();
        const type = field.type;
        let isValid = true;
        let message = '';
        
        // Reset styles
        field.style.borderColor = '';
        field.classList.remove('invalid', 'valid');
        
        // Required validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            message = 'This field is required';
        }
        // Type-specific validation
        else if (value) {
            switch (type) {
                case 'email':
                    if (!window.ChatUtils.validateEmail(value)) {
                        isValid = false;
                        message = 'Please enter a valid email address';
                    }
                    break;
                case 'tel':
                    if (!window.ChatUtils.validatePhone(value)) {
                        isValid = false;
                        message = 'Please enter a valid phone number';
                    }
                    break;
                case 'date':
                    if (new Date(value) < new Date()) {
                        isValid = false;
                        message = 'Date cannot be in the past';
                    }
                    break;
            }
        }
        
        // Apply validation feedback
        this.showFieldFeedback(field, isValid, message);
        
        return isValid;
    },
    
    showFieldFeedback: function(field, isValid, message) {
        let feedback = field.parentNode.querySelector('.field-feedback');
        
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.className = 'field-feedback';
            feedback.style.cssText = `
                margin-top: 6px;
                font-size: 14px;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 6px;
                min-height: 20px;
            `;
            field.parentNode.appendChild(feedback);
        }
        
        if (!isValid) {
            field.style.borderColor = '#ef4444';
            field.classList.add('invalid');
            feedback.style.color = '#ef4444';
            feedback.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        } else if (field.value.trim()) {
            field.style.borderColor = '#10b981';
            field.classList.add('valid');
            feedback.style.color = '#10b981';
            feedback.innerHTML = `<i class="fas fa-check-circle"></i> Looks good!`;
        } else {
            feedback.innerHTML = '';
        }
    }
};

// ===== AUTO-INIT ON DOM READY =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 ChatUtils initialized');
    
    // Add real-time validation to forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                window.FormHelpers.validateField(this);
            });
            
            input.addEventListener('input', function() {
                if (this.classList.contains('invalid')) {
                    window.FormHelpers.validateField(this);
                }
            });
        });
    });
    
    // Auto-save forms with class 'auto-save'
    const autoSaveForms = document.querySelectorAll('form.auto-save');
    autoSaveForms.forEach(form => {
        if (form.id) {
            window.ChatUtils.enableAutoSave(form.id);
        }
    });
    
    // Performance monitoring
    if ('performance' in window) {
        window.addEventListener('load', function() {
            const loadTime = performance.now();
            console.log(`⚡ Page loaded in ${Math.round(loadTime)}ms`);
        });
    }
});

// ===== ANIMATIONS ===== 
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

console.log('✅ Main.js loaded successfully');

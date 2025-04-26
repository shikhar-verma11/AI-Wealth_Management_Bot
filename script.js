/**
 * Wealth Management Chatbot JavaScript
 * Enhanced with professional features, glassmorphism effects, and optimized scrolling
 */

// Initialize elements
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const voiceBtn = document.getElementById('voice-btn');
const themeBtn = document.getElementById('theme-btn');
const financeForm = document.getElementById('finance-form');
const submitFinance = document.getElementById('submit-finance');
const portfolioChartCanvas = document.getElementById('portfolio-chart');
const chatBackground = document.getElementById('chat-background');
const notificationBtn = document.getElementById('notifications-btn');
const notificationPanel = document.getElementById('notification-panel');
const quickButtons = document.querySelectorAll('.action-btn');
const blurOverlay = document.querySelector('.blur-overlay');
const contextMenu = document.getElementById('context-menu');
const insightsPanel = document.getElementById('insights-panel');
const closeInsights = document.getElementById('close-insights');
const emojiBtn = document.getElementById('emoji-btn');
const emojiPicker = document.getElementById('emoji-picker');

// API Key (Note: Store securely in production)
const GEMINI_API_KEY = 'AIzaSyByy3iiM7JBTM7sFjC2KvlJvpMR3snNebI';

// Initialize Web Speech API
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
const synth = window.speechSynthesis;

// State variables
let portfolioChart;
let conversationHistory = [];
let userProfile = {};
let notifications = [
    { id: 1, text: "Market update: S&P 500 up 1.2% today", time: "10 mins ago", icon: "chart-line" },
    { id: 2, text: "New investment opportunity in tech sector", time: "1 hour ago", icon: "lightbulb" },
    { id: 3, text: "Reminder: Portfolio review scheduled", time: "3 hours ago", icon: "calendar" }
];
let notificationCounter = notifications.length;
let isDraggingWidget = false;

// Emoji data
const emojis = {
    '😀': ['😀', '😊', '😂', '😍', '🥳'],
    '❤️': ['❤️', '💖', '💕', '💓', '💞'],
    '🌍': ['🌍', '🌎', '🌏', '🗺️', '🌐'],
    '🍔': ['🍔', '🍕', '🍟', '🥐', '🍣'],
    '⚽': ['⚽', '🏀', '🏈', '🎾', '🏐'],
    '💡': ['💡', '💸', '📈', '📉', '💰']
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadThemePreference();
    loadUserProfile();
    initializeDashboardWidgets();
    initializeNotificationSystem();
    initializeEmojiPicker();
    initializeChartInteractions();
    initializeFinanceHub();
    setupScrollEffects();
    setupKeyboardShortcuts();
    updateNotificationCounter();
});

// Theme toggle with enhanced animation
themeBtn.addEventListener('click', () => {
    const isDark = !document.body.classList.contains('dark');
    document.body.classList.toggle('dark', isDark);
    const sunIcon = themeBtn.querySelector('.fa-sun');
    const moonIcon = themeBtn.querySelector('.fa-moon');
    
    document.body.style.transition = "background 0.5s ease";
    
    if (isDark) {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
        localStorage.setItem('theme', 'dark');
    } else {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
        localStorage.setItem('theme', 'light');
    }
    
    createRipple({
        currentTarget: themeBtn,
        clientX: themeBtn.getBoundingClientRect().left + themeBtn.offsetWidth / 2,
        clientY: themeBtn.getBoundingClientRect().top + themeBtn.offsetHeight / 2
    });
});

// Load saved theme preference
function loadThemePreference() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
        themeBtn.querySelector('.fa-sun').style.display = 'none';
        themeBtn.querySelector('.fa-moon').style.display = 'block';
    }
}

// Enhanced ripple effect
function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    
    const diameter = Math.max(button.clientWidth, button.clientHeight) * 2;
    const radius = diameter / 2;
    
    ripple.style.width = ripple.style.height = `${diameter}px`;
    ripple.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
    ripple.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;
    
    const existingRipple = button.querySelector('.ripple');
    if (existingRipple) existingRipple.remove();
    
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
}

// Add ripple effect to buttons
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', createRipple);
});

// Glassmorphism and Scroll Effects
function setupScrollEffects() {
    const inputContainer = document.querySelector('.input-container');
    chatMessages.addEventListener('scroll', () => {
        const scrollTop = chatMessages.scrollTop;
        const scrollHeight = chatMessages.scrollHeight;
        const clientHeight = chatMessages.clientHeight;
        const scrollPercent = scrollTop / (scrollHeight - clientHeight);
        
        const maxBlur = 20;
        const minBlur = 12;
        const blurValue = minBlur + (maxBlur - minBlur) * scrollPercent;
        inputContainer.style.backdropFilter = `blur(${blurValue}px)`;
        inputContainer.style.webkitBackdropFilter = `blur(${blurValue}px)`;
        
        if (!CSS.supports('backdrop-filter', 'blur(12px)')) {
            inputContainer.style.background = `rgba(255, 255, 255, ${0.15 + 0.05 * scrollPercent})`;
        }
        
        const scrollDown = document.getElementById('scroll-down');
        scrollDown.classList.toggle('visible', scrollTop < scrollHeight - clientHeight - 10);
    });
    
    document.getElementById('scroll-down').addEventListener('click', () => {
        scrollChatToBottom();
    });
}

// Typing indicator
function showTypingIndicator() {
    const typingIndicator = document.querySelector('.typing-indicator') || createTypingIndicator();
    typingIndicator.style.display = 'flex';
}

function hideTypingIndicator() {
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) typingIndicator.style.display = 'none';
}

function createTypingIndicator() {
    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('typing-indicator');
    typingIndicator.innerHTML = `
        <div class="bot-avatar"><i class="fas fa-robot"></i></div>
        <span>Thinking</span>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    chatMessages.appendChild(typingIndicator);
    return typingIndicator;
}

// Send message
function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    userInput.value = '';
    showTypingIndicator();
    scrollChatToBottom();
    
    processMessage(message).catch(error => {
        hideTypingIndicator();
        console.error('Process error:', error);
        addMessage('Sorry, I encountered an error. Please try again.', 'bot');
    });
}

// Event listeners for input
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

sendBtn.addEventListener('click', sendMessage);
voiceBtn.addEventListener('click', startVoiceInput);

// Typing effect for bot messages
function typeMessage(messageText, text, callback) {
    let index = 0;
    const plainText = text.replace(/<[^>]*>?/gm, ''); // Remove HTML tags for typing simulation
    const typingSpeed = 30; // Milliseconds per character

    function applyFormatting() {
        messageText.innerHTML = text; // Apply the formatted text (with HTML) at the end
        if (callback) callback();
    }

    function type() {
        if (index < plainText.length) {
            messageText.textContent = plainText.slice(0, index + 1);
            index++;
            setTimeout(type, typingSpeed);
        } else {
            applyFormatting();
        }
    }

    type();
}

// Add message with fade-in and typing effect
function addMessage(text, type) {
    hideTypingIndicator();
    
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${type}-message`, 'fade-in');
    
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    let displayText = text;
    let isTruncated = false;
    if (text.length > 200) {
        displayText = text.slice(0, 200) + '...';
        isTruncated = true;
    }
    
    if (type === 'bot') {
        messageDiv.innerHTML = `
            <div class="bot-message-content">
                <div class="bot-avatar"><i class="fas fa-robot"></i></div>
                <div class="message-text"></div>
            </div>
            ${isTruncated ? '<button class="read-more-btn" style="display: none;">Read More</button>' : ''}
            <div class="message-actions" style="display: none;">
                <button class="message-action-btn speak-btn" title="Listen"><i class="fas fa-volume-up"></i></button>
                <button class="message-action-btn copy-btn" title="Copy"><i class="fas fa-copy"></i></button>
                <button class="message-action-btn favorite-btn" title="Favorite"><i class="far fa-star"></i></button>
                <button class="message-action-btn react-btn" title="React"><i class="far fa-thumbs-up"></i></button>
            </div>
            <div class="message-timestamp">${timestamp}</div>
        `;

        if (text.includes('portfolio')) {
            const quickAction = document.createElement('button');
            quickAction.classList.add('quick-action-btn');
            quickAction.innerHTML = '<i class="fas fa-chart-pie"></i> Update Portfolio';
            quickAction.addEventListener('click', showPortfolioChart);
            messageDiv.querySelector('.message-actions').appendChild(quickAction);
        }

        chatMessages.appendChild(messageDiv);
        scrollChatToBottom();

        // Start typing effect after fade-in transition
        setTimeout(() => {
            const messageText = messageDiv.querySelector('.message-text');
            typeMessage(messageText, displayText, () => {
                if (isTruncated) {
                    const readMoreBtn = messageDiv.querySelector('.read-more-btn');
                    readMoreBtn.style.display = 'block';
                    readMoreBtn.addEventListener('click', () => {
                        messageDiv.querySelector('.message-text').innerHTML = text;
                        readMoreBtn.remove();
                        scrollChatToBottom();
                    });
                }

                const actions = messageDiv.querySelector('.message-actions');
                actions.style.display = 'flex';

                messageDiv.querySelector('.speak-btn').addEventListener('click', () => speak(text));
                messageDiv.querySelector('.copy-btn').addEventListener('click', () => copyToClipboard(text));
                messageDiv.querySelector('.favorite-btn').addEventListener('click', () => toggleFavorite(messageDiv));
                messageDiv.querySelector('.react-btn').addEventListener('click', () => addReaction(messageDiv));
            });
        }, 300); // Delay matches the fade-in duration (0.3s in styles.css)
    } else {
        messageDiv.innerHTML = `
            <div class="message-text">${displayText}</div>
            ${isTruncated ? '<button class="read-more-btn">Read More</button>' : ''}
            <div class="message-actions">
                <button class="message-action-btn edit-btn" title="Edit"><i class="fas fa-edit"></i></button>
            </div>
            <div class="message-timestamp">${timestamp}</div>
        `;

        chatMessages.appendChild(messageDiv);

        if (isTruncated) {
            messageDiv.querySelector('.read-more-btn').addEventListener('click', () => {
                messageDiv.querySelector('.message-text').innerHTML = text;
                messageDiv.querySelector('.read-more-btn').remove();
                scrollChatToBottom();
            });
        }

        messageDiv.querySelector('.edit-btn').addEventListener('click', () => editMessage(messageDiv, text));
    }

    messageDiv.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showContextMenu(e, text, messageDiv);
    });

    conversationHistory.push({ 
        user: type === 'user' ? text : null, 
        bot: type === 'bot' ? text : null,
        timestamp: new Date().toISOString()
    });

    saveConversation();
    scrollChatToBottom();
}

// Context menu for messages
function showContextMenu(event, text, messageDiv) {
    contextMenu.style.display = 'block';
    contextMenu.style.left = `${event.pageX}px`;
    contextMenu.style.top = `${event.pageY}px`;
    
    contextMenu.innerHTML = `
        <div class="context-menu-item" data-action="copy"><i class="fas fa-copy"></i>Copy</div>
        <div class="context-menu-item" data-action="save"><i class="fas fa-bookmark"></i>Save</div>
        <div class="context-menu-item" data-action="share"><i class="fas fa-share-alt"></i>Share</div>
        <div class="context-menu-item" data-action="react"><i class="far fa-thumbs-up"></i>React</div>
    `;
    
    contextMenu.querySelectorAll('.context-menu-item').forEach(item => {
        item.addEventListener('click', () => {
            const action = item.dataset.action;
            if (action === 'copy') copyToClipboard(text);
            else if (action === 'save') saveMessage(text);
            else if (action === 'share') shareMessage(text);
            else if (action === 'react') addReaction(messageDiv);
            contextMenu.style.display = 'none';
        });
    });
    
    document.addEventListener('click', hideContextMenu, { once: true });
}

function hideContextMenu() {
    contextMenu.style.display = 'none';
}

// Message actions
function copyToClipboard(text) {
    navigator.clipboard.writeText(text.replace(/<[^>]*>?/gm, ''));
    showToast('Message copied to clipboard', 'success');
}

function saveMessage(text) {
    const savedMessages = JSON.parse(localStorage.getItem('savedMessages') || '[]');
    savedMessages.push({ text, timestamp: new Date().toISOString() });
    localStorage.setItem('savedMessages', JSON.stringify(savedMessages));
    showToast('Message saved', 'success');
}

function shareMessage(text) {
    if (navigator.share) {
        navigator.share({
            title: 'Wealth Management Advice',
            text: text.replace(/<[^>]*>?/gm, '')
        });
    } else {
        showToast('Share not supported on this device', 'error');
    }
}

function toggleFavorite(messageDiv) {
    const favoriteBtn = messageDiv.querySelector('.favorite-btn i');
    favoriteBtn.classList.toggle('far');
    favoriteBtn.classList.toggle('fas');
    showToast(favoriteBtn.classList.contains('fas') ? 'Added to favorites' : 'Removed from favorites', 'success');
}

function addReaction(messageDiv) {
    const reaction = document.createElement('span');
    reaction.classList.add('reaction');
    reaction.textContent = '👍';
    messageDiv.querySelector('.message-actions').appendChild(reaction);
    setTimeout(() => reaction.remove(), 3000);
}

function editMessage(messageDiv, text) {
    userInput.value = text;
    messageDiv.remove();
    conversationHistory = conversationHistory.filter(entry => entry.user !== text);
    saveConversation();
}

// Smooth scroll
function scrollChatToBottom() {
    chatBackground.style.backdropFilter = 'blur(20px)';
    chatBackground.style.webkitBackdropFilter = 'blur(20px)';
    
    chatMessages.scrollTo({
        top: chatMessages.scrollHeight,
        behavior: 'smooth'
    });
    
    setTimeout(() => {
        chatBackground.style.backdropFilter = 'blur(12px)';
        chatBackground.style.webkitBackdropFilter = 'blur(12px)';
    }, 500);
}

// Process user message
async function processMessage(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('portfolio')) {
        showPortfolioChart();
        addMessage('Here’s your portfolio allocation chart. Use the filters to explore or ask for adjustment suggestions.', 'bot');
    } else if (lowerMessage.includes('advice')) {
        showFinanceForm();
        addMessage('Please fill out the financial profile form for personalized advice.', 'bot');
    } else if (lowerMessage.includes('clear') && lowerMessage.includes('chat')) {
        clearChat();
        addMessage('Chat history cleared. How can I assist you now?', 'bot');
    } else if (['hi', 'hello', 'hey', 'greetings'].includes(lowerMessage)) {
        addMessage(`Hello${userProfile.name ? ', ' + userProfile.name : ''}! I'm your wealth management assistant. Try asking about your portfolio, financial advice, or market updates.`, 'bot');
    } else {
        const response = await getGeminiResponse(message, conversationHistory);
        hideTypingIndicator();
        addMessage(response, 'bot');
    }
}

// Gemini API response
async function getGeminiResponse(message, history) {
    try {
        const recentHistory = history.slice(-10);
        const context = recentHistory.map(entry => {
            if (entry.user) return `User: ${entry.user}`;
            if (entry.bot) return `Assistant: ${entry.bot}`;
            return null;
        }).filter(Boolean).join('\n');
        
        const systemPrompt = `You are a professional wealth management assistant. Provide concise, helpful financial advice. 
                             Format important numbers with bold tags and use bullet points for lists.
                             Current user profile: ${JSON.stringify(userProfile)}`;
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `${systemPrompt}\n\nConversation history:\n${context}\n\nUser: ${message}\nAssistant:`
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1024
                }
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API failed: ${errorText}`);
        }
        
        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I received an empty response. Please try again.';
        return formatResponse(reply);
    } catch (error) {
        console.error('Gemini API error:', error);
        return 'Sorry, I couldn’t process your request. Try again later.';
    }
}

// Format AI response
function formatResponse(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/- (.*?)(?:\n|$)/g, '• $1<br>')
        .replace(/\n/g, '<br>');
}

// Voice input
function startVoiceInput() {
    voiceBtn.classList.add('active');
    userInput.placeholder = "Listening...";
    
    const rippleAnimation = setInterval(() => {
        createRipple({
            currentTarget: voiceBtn,
            clientX: voiceBtn.getBoundingClientRect().left + voiceBtn.offsetWidth / 2,
            clientY: voiceBtn.getBoundingClientRect().top + voiceBtn.offsetHeight / 2
        });
    }, 800);
    
    recognition.start();
    
    recognition.onend = () => {
        voiceBtn.classList.remove('active');
        userInput.placeholder = "Ask about budgeting, investments, or try quick actions above...";
        clearInterval(rippleAnimation);
    };
    
    recognition.onresult = (event) => {
        userInput.value = event.results[0][0].transcript;
        sendMessage();
    };
    
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        voiceBtn.classList.remove('active');
        userInput.placeholder = "Ask about budgeting, investments, or try quick actions above...";
        addMessage('Sorry, I couldn’t understand your voice input. Please try again or type your message.', 'bot');
    };
}

// Voice output
function speak(text) {
    synth.cancel();
    const plainText = text.replace(/<[^>]*>?/gm, '');
    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.lang = 'en-US';
    synth.speak(utterance);
}

// Feature 1: Advanced Dashboard Widgets
function initializeDashboardWidgets() {
    const dashboard = insightsPanel.querySelector('.dashboard');
    const widgetData = [
        {
            id: 'assets',
            title: 'Total Assets',
            icon: 'wallet',
            value: '$256,890',
            label: '+4.5% this month',
            chartType: 'line',
            chartData: [200000, 210000, 230000, 245000, 256890]
        },
        {
            id: 'performance',
            title: 'Investment Performance',
            icon: 'chart-line',
            value: '7.2%',
            label: 'Annualized return',
            chartType: 'bar',
            chartData: [5.5, 6.8, 7.2, 6.9, 7.0]
        },
        {
            id: 'budget',
            title: 'Budget Tracking',
            icon: 'piggy-bank',
            value: '$1,200',
            label: 'Remaining this month',
            chartType: 'doughnut',
            chartData: [1200, 800]
        }
    ];
    
    widgetData.forEach(widget => {
        const panel = document.createElement('div');
        panel.classList.add('panel', 'collapsible', 'collapsed');
        panel.dataset.widgetId = widget.id;
        panel.innerHTML = `
            <div class="panel-header">
                <div class="panel-title">${widget.title}</div>
                <div class="panel-icon"><i class="fas fa-${widget.icon}"></i></div>
                <button class="toggle-widget"><i class="fas fa-chevron-down"></i></button>
            </div>
            <div class="panel-content">
                <div class="panel-value">${widget.value}</div>
                <div class="panel-label">${widget.label}</div>
                <canvas class="widget-chart" id="chart-${widget.id}"></canvas>
            </div>
        `;
        dashboard.appendChild(panel);
        
        panel.querySelector('.panel-content').style.maxHeight = '0';
        
        try {
            new Chart(document.getElementById(`chart-${widget.id}`), {
                type: widget.chartType,
                data: {
                    labels: widget.chartType === 'doughnut' ? ['Spent', 'Remaining'] : ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
                    datasets: [{
                        data: widget.chartData,
                        backgroundColor: widget.chartType === 'doughnut' ? ['#ef4444', '#10b981'] : '#3b82f6',
                        borderColor: '#ffffff',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    animation: { duration: 1000, easing: 'easeOutQuart' }
                }
            });
        } catch (error) {
            console.error(`Error rendering chart for widget ${widget.id}:`, error);
            panel.querySelector('.panel-content').innerHTML += '<p>Error loading chart.</p>';
        }
        
        panel.querySelector('.toggle-widget').addEventListener('click', () => {
            panel.classList.toggle('collapsed');
            const content = panel.querySelector('.panel-content');
            content.style.maxHeight = panel.classList.contains('collapsed') ? '0' : '300px';
        });
        
        panel.setAttribute('draggable', true);
        panel.addEventListener('dragstart', () => {
            isDraggingWidget = true;
            panel.classList.add('dragging');
        });
        panel.addEventListener('dragend', () => {
            isDraggingWidget = false;
            panel.classList.remove('dragging');
        });
        panel.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        panel.addEventListener('drop', (e) => {
            e.preventDefault();
            const dragged = document.querySelector('.dragging');
            if (dragged !== panel) {
                const allPanels = Array.from(dashboard.querySelectorAll('.panel'));
                const draggedIndex = allPanels.indexOf(dragged);
                const dropIndex = allPanels.indexOf(panel);
                if (draggedIndex < dropIndex) {
                    dashboard.insertBefore(dragged, panel.nextSibling);
                } else {
                    dashboard.insertBefore(dragged, panel);
                }
            }
        });
    });
    
    closeInsights.addEventListener('click', () => {
        insightsPanel.classList.add('hidden');
        blurOverlay.classList.remove('active');
    });
}

// Feature 2: Smart Notifications System
function initializeNotificationSystem() {
    updateNotificationList();
    
    notificationBtn.addEventListener('click', () => {
        notificationPanel.classList.toggle('active');
        blurOverlay.classList.toggle('active', notificationPanel.classList.contains('active'));
        notificationCounter = 0;
        updateNotificationCounter();
    });
    
    notificationPanel.querySelector('.notification-close').addEventListener('click', () => {
        notificationPanel.classList.remove('active');
        blurOverlay.classList.remove('active');
    });
    
    setInterval(() => {
        const marketUpdates = [
            'Market update: NASDAQ up 0.8% today',
            'Stock alert: TSLA gains 2.5%',
            'Reminder: Review your monthly budget'
        ];
        addNotification(marketUpdates[Math.floor(Math.random() * marketUpdates.length)], 'chart-line');
    }, 30000);
    
    const settingsBtn = document.getElementById('settings-btn');
    settingsBtn.addEventListener('click', () => {
        showToast('Notification preferences: Toggle market updates in settings (coming soon)', 'info');
    });
}

function addNotification(text, icon) {
    notifications.push({
        id: Date.now(),
        text,
        time: 'Just now',
        icon
    });
    notificationCounter++;
    updateNotificationList();
    updateNotificationCounter();
}

function updateNotificationList() {
    const notificationList = notificationPanel.querySelector('.notification-list');
    notificationList.innerHTML = notifications.map(notification => `
        <div class="notification-item">
            <div class="notification-icon"><i class="fas fa-${notification.icon}"></i></div>
            <div class="notification-content">
                <div class="notification-text">${notification.text}</div>
                <div class="notification-time">${notification.time}</div>
            </div>
        </div>
    `).join('');
}

function updateNotificationCounter() {
    notificationBtn.style.position = 'relative';
    if (notificationCounter > 0) {
        const counter = document.createElement('span');
        counter.classList.add('notification-counter');
        counter.textContent = notificationCounter;
        counter.style.cssText = `
            position: absolute;
            top: -5px;
            right: -5px;
            background: #ef4444;
            color: white;
            border-radius: 50%;
            padding: 2px 6px;
            font-size: 0.7rem;
        `;
        notificationBtn.appendChild(counter);
    } else {
        const existingCounter = notificationBtn.querySelector('.notification-counter');
        if (existingCounter) existingCounter.remove();
    }
}

// Feature 3: Enhanced Chart Interactions
function initializeChartInteractions() {
    if (!window.Chart) {
        console.error('Chart.js not loaded');
        addMessage('Error: Chart.js failed to load. Please check your internet connection.', 'bot');
        return;
    }

    const filterContainer = document.createElement('div');
    filterContainer.classList.add('chart-filters');
    filterContainer.innerHTML = `
        <select id="chart-period">
            <option value="1m">1 Month</option>
            <option value="3m">3 Months</option>
            <option value="1y">1 Year</option>
        </select>
        <select id="chart-type">
            <option value="pie">Pie</option>
            <option value="bar">Bar</option>
        </select>
    `;

    const chartContainer = document.querySelector('.chart-container');
    if (!chartContainer) {
        console.error('Chart container not found in the DOM');
        addMessage('Error: Chart container element is missing. Please check the HTML structure.', 'bot');
        return;
    }

    chartContainer.insertAdjacentElement('beforebegin', filterContainer);
    filterContainer.querySelector('#chart-period').addEventListener('change', updateChartData);
    filterContainer.querySelector('#chart-type').addEventListener('change', updateChartData);

    showPortfolioChart();
}

function showPortfolioChart() {
    const chartContainer = document.querySelector('.chart-container');
    if (!chartContainer) {
        console.error('Chart container not found in the DOM');
        addMessage('Error: Chart container element is missing. Please check the HTML structure.', 'bot');
        return;
    }

    chartContainer.classList.remove('hidden');
    chartContainer.classList.add('fade-in');
    updateChartData();
}

function updateChartData() {
    const period = document.getElementById('chart-period')?.value || '1m';
    const chartType = document.getElementById('chart-type')?.value || 'pie';
    
    const baseData = {
        '1m': [40, 25, 20, 10, 5],
        '3m': [42, 23, 22, 8, 5],
        '1y': [45, 20, 23, 7, 5]
    };
    
    if (portfolioChart) {
        portfolioChart.destroy();
    }
    
    if (!window.Chart) {
        console.error('Chart.js not loaded');
        addMessage('Error: Unable to load the portfolio chart. Please ensure Chart.js is properly included.', 'bot');
        return;
    }

    if (typeof ChartZoom !== 'undefined') {
        Chart.register(ChartZoom);
    } else {
        console.warn('Chart.js Zoom plugin not loaded. Zoom and pan features will be disabled.');
    }

    try {
        portfolioChart = new Chart(portfolioChartCanvas, {
            type: chartType,
            data: {
                labels: ['Stocks', 'Bonds', 'Real Estate', 'Cash', 'Commodities'],
                datasets: [{
                    data: baseData[period],
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(139, 92, 246, 0.8)'
                    ],
                    borderColor: 'rgba(255, 255, 255, 0.8)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: { size: 14 },
                            color: '#ffffff'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.label}: ${context.raw}%`
                        }
                    }
                    // Zoom disabled until plugin loads reliably
                    // zoom: typeof ChartZoom !== 'undefined' ? {
                    //     zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'xy' },
                    //     pan: { enabled: true, mode: 'xy' }
                    // } : undefined
                },
                animation: { duration: 1000, easing: 'easeOutQuart' }
            }
        });
    } catch (error) {
        console.error('Error initializing chart:', error);
        addMessage('Error: Failed to render the portfolio chart. Please try again later.', 'bot');
        const chartContainer = document.querySelector('.chart-container');
        if (chartContainer) chartContainer.classList.add('hidden');
    }
    
    scrollChatToBottom();
}

// Feature 4: Personalized Finance Hub
function initializeFinanceHub() {
    const summaryContent = insightsPanel.querySelector('.insights-content[data-content="summary"]');
    const profileSection = document.createElement('div');
    profileSection.classList.add('panel');
    profileSection.innerHTML = `
        <div class="panel-header">
            <div class="panel-title">Financial Health</div>
            <div class="panel-icon"><i class="fas fa-heart"></i></div>
        </div>
        <div class="panel-content">
            <div class="panel-value">${calculateFinancialHealthScore()}%</div>
            <div class="panel-label">Financial Health Score</div>
            <div class="recommendations">
                <p><strong>Recommendations:</strong></p>
                <ul>
                    <li>Increase emergency fund to 6 months of expenses</li>
                    <li>Diversify investments across sectors</li>
                    <li>Review insurance coverage</li>
                </ul>
            </div>
        </div>
    `;
    summaryContent.appendChild(profileSection);
    
    const newsFeed = document.createElement('div');
    newsFeed.classList.add('panel');
    newsFeed.innerHTML = `
        <div class="panel-header">
            <div class="panel-title">Market News</div>
            <div class="panel-icon"><i class="fas fa-newspaper"></i></div>
        </div>
        <div class="panel-content">
            <ul class="news-list">
                <li>Tech sector rallies as AI stocks soar</li>
                <li>Fed signals potential rate cut in Q2</li>
                <li>Real estate market stabilizes</li>
            </ul>
        </div>
    `;
    summaryContent.appendChild(newsFeed);
}

function calculateFinancialHealthScore() {
    let score = 50;
    if (userProfile.income > 50000) score += 20;
    if (userProfile.age < 50) score += 10;
    if (userProfile.riskProfile === 'medium' || userProfile.riskProfile === 'high') score += 10;
    return Math.min(score, 100);
}

// Feature 5: Finance Form Enhancements
function showFinanceForm() {
    financeForm.classList.remove('hidden');
    financeForm.classList.add('fade-in');
    blurOverlay.classList.add('active');
    
    financeForm.scrollIntoView({ behavior: 'smooth' });
}

function submitFinanceForm() {
    const income = document.getElementById('income').value;
    const age = document.getElementById('age').value;
    const riskProfile = document.getElementById('risk-profile').value;
    const goals = document.getElementById('goals').value;

    if (!income || !age || !riskProfile) {
        showToast('Please fill out all required fields.', 'error');
        return;
    }

    userProfile = { income, age, riskProfile, goals };
    localStorage.setItem('userProfile', JSON.stringify(userProfile));

    let advice = `<strong>Financial Analysis</strong><br><br>`;
    if (riskProfile === 'low') {
        advice += `Based on your <strong>conservative risk profile</strong>:<br>`;
        advice += `• <strong>60%</strong> in bonds<br>`;
        advice += `• <strong>25%</strong> in blue-chip stocks<br>`;
        advice += `• <strong>15%</strong> in cash<br>`;
    } else if (riskProfile === 'medium') {
        advice += `Based on your <strong>balanced risk profile</strong>:<br>`;
        advice += `• <strong>50%</strong> in diversified stocks<br>`;
        advice += `• <strong>30%</strong> in bonds<br>`;
        advice += `• <strong>20%</strong> in real estate<br>`;
    } else {
        advice += `Based on your <strong>aggressive risk profile</strong>:<br>`;
        advice += `• <strong>70%</strong> in growth stocks<br>`;
        advice += `• <strong>20%</strong> in emerging markets<br>`;
        advice += `• <strong>10%</strong> in bonds<br>`;
    }

    addMessage(advice, 'bot');
    updatePortfolioChartBasedOnProfile(riskProfile);
    addNotification('Financial profile updated', 'user-edit');
    hideFinanceForm();
}

function hideFinanceForm() {
    financeForm.classList.add('hidden');
    blurOverlay.classList.remove('active');
}

// Emoji Picker
function initializeEmojiPicker() {
    const emojiBtn = document.getElementById('emoji-btn');
    const emojiPicker = document.getElementById('emoji-picker');
    const blurOverlay = document.querySelector('.blur-overlay');

    if (!emojiBtn || !emojiPicker || !blurOverlay) {
        console.error('Emoji feature elements not found:', { emojiBtn, emojiPicker, blurOverlay });
        return;
    }

    emojiBtn.addEventListener('click', () => {
        emojiPicker.classList.toggle('open');
        blurOverlay.classList.toggle('active', emojiPicker.classList.contains('open'));
        console.log('Emoji picker toggled, open:', emojiPicker.classList.contains('open'));
    });

    const categories = emojiPicker.querySelectorAll('.emoji-category');
    const emojiList = emojiPicker.querySelector('.emoji-list');

    if (categories.length === 0 || !emojiList) {
        console.error('No emoji categories or list found:', { categories, emojiList });
        return;
    }

    categories.forEach(category => {
        console.log('Setting up click listener for category:', category.textContent.trim()); // Debug: Confirm category setup
        category.addEventListener('click', () => {
            categories.forEach(c => c.classList.remove('active'));
            category.classList.add('active');

            const emojiSet = emojis[category.textContent.trim()];
            console.log('Selected category:', category.textContent.trim(), 'Emoji set:', emojiSet); // Debug: Log category and emoji set

            if (!emojiSet || emojiSet.length === 0) {
                console.error('No emojis found for category:', category.textContent.trim());
                emojiList.innerHTML = '<div class="emoji-item">No emojis available</div>';
                return;
            }

            emojiList.innerHTML = emojiSet.map(emoji => {
                console.log('Rendering emoji:', emoji); // Debug: Log each emoji being rendered
                return `<div class="emoji-item">${emoji}</div>`;
            }).join('');

            // Debug: Log the final innerHTML of emojiList
            console.log('Emoji list innerHTML:', emojiList.innerHTML);

            emojiList.querySelectorAll('.emoji-item').forEach(item => {
                console.log('Adding click listener to emoji item:', item.textContent); // Debug: Confirm click listener setup
                item.addEventListener('click', () => {
                    const userInput = document.getElementById('user-input');
                    if (userInput) {
                        userInput.value += item.textContent;
                        emojiPicker.classList.remove('open');
                        blurOverlay.classList.remove('active');
                        console.log('Emoji added:', item.textContent);
                    } else {
                        console.error('userInput element not found');
                    }
                });
            });
        });
    });

    // Debug: Manually trigger the first category click and log
    console.log('Triggering first category click');
    if (categories[0]) {
        categories[0].click();
    } else {
        console.error('No categories found to trigger initial click');
    }
}

// Quick action buttons
quickButtons.forEach(button => {
    button.addEventListener('click', () => {
        const action = button.dataset.action;
        if (action === 'portfolio') {
            showPortfolioChart();
        } else if (action === 'advice') {
            showFinanceForm();
        } else if (action === 'market') {
            userInput.value = "What's happening in the market today?";
            sendMessage();
        } else if (action === 'goals') {
            insightsPanel.classList.remove('hidden');
            blurOverlay.classList.add('active');
        } else if (action === 'retirement') {
            userInput.value = "How should I plan for retirement?";
            sendMessage();
        }
    });
});

// Save and load conversation (load functionality to be added later)
function saveConversation() {
    try {
        localStorage.setItem('chatHistory', JSON.stringify(conversationHistory.slice(-100)));
    } catch (error) {
        console.error('Error saving conversation history:', error);
        showToast('Failed to save chat history. It might be too large.', 'error');
    }
}

function loadConversation() {
    // Placeholder for future implementation
    try {
        const savedChat = localStorage.getItem('chatHistory');
        if (savedChat) {
            conversationHistory = JSON.parse(savedChat);
            chatMessages.innerHTML = '';
            conversationHistory.slice(-10).forEach(entry => {
                if (entry.user) addMessage(entry.user, 'user');
                if (entry.bot) addMessage(entry.bot, 'bot');
            });
        }
    } catch (error) {
        console.error('Error loading conversation history:', error);
        localStorage.removeItem('chatHistory');
        conversationHistory = [];
        addMessage('Previous chats couldn’t be loaded due to an error. Starting fresh!', 'bot');
    }
}

function loadUserProfile() {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) userProfile = JSON.parse(savedProfile);
}

// Clear chat
function clearChat() {
    chatMessages.innerHTML = '';
    conversationHistory = [];
    saveConversation();
}

// Toast notifications
function showToast(message, type) {
    const toast = document.createElement('div');
    toast.classList.add('toast', `toast-${type}`);
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 10px 20px;
        border-radius: 8px;
        color: white;
        background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
        z-index: 200;
        animation: fadeIn 0.5s, fadeOut 0.5s 2.5s;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') sendMessage();
        if (e.ctrlKey && e.key === 'p') showPortfolioChart();
        if (e.ctrlKey && e.key === 'a') showFinanceForm();
    });
}

// Format numbers
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Update portfolio chart based on profile
function updatePortfolioChartBasedOnProfile(riskProfile) {
    let data;
    if (riskProfile === 'low') {
        data = [25, 60, 5, 10, 0];
    } else if (riskProfile === 'medium') {
        data = [50, 30, 15, 5, 0];
    } else {
        data = [70, 5, 10, 5, 10];
    }
    
    portfolioChartCanvas.classList.remove('hidden');
    if (portfolioChart) portfolioChart.destroy();
    
    portfolioChart = new Chart(portfolioChartCanvas, {
        type: document.getElementById('chart-type')?.value || 'pie',
        data: {
            labels: ['Stocks', 'Bonds', 'Real Estate', 'Cash', 'Alternatives'],
            datasets: [{
                data,
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(139, 92, 246, 0.8)'
                ],
                borderColor: 'rgba(255, 255, 255, 0.8)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.label}: ${context.raw}%`
                    }
                }
            },
            animation: { duration: 1000, easing: 'easeOutQuart' }
        }
    });
}
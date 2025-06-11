// Finance Tracker JavaScript
class FinanceTracker {
    constructor() {
        this.transactions = [];
        this.balance = 0;
        this.totalIncome = 0;
        this.totalExpenses = 0;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initCustomCursor();
        this.initChartAnimations();
        this.loadSampleData();
        this.updateDashboard();
        this.animateOnScroll();
    }

    setupEventListeners() {
        // Form submission
        const form = document.getElementById('transactionForm');
        form.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Chart period buttons
        const chartBtns = document.querySelectorAll('.chart-btn');
        chartBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleChartPeriodChange(e));
        });

        // Chart segment hover effects
        const chartSegments = document.querySelectorAll('.chart-segment');
        chartSegments.forEach(segment => {
            segment.addEventListener('mouseenter', (e) => this.handleChartHover(e));
            segment.addEventListener('mouseleave', (e) => this.handleChartLeave(e));
        });

        // Navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigation(e));
        });
    }

    initCustomCursor() {
        const cursor = document.querySelector('.cursor');
        const cursorDot = document.querySelector('.cursor-dot');
        
        if (window.innerWidth > 768) {
            document.addEventListener('mousemove', (e) => {
                cursor.style.left = e.clientX + 'px';
                cursor.style.top = e.clientY + 'px';
                
                cursorDot.style.left = e.clientX + 'px';
                cursorDot.style.top = e.clientY + 'px';
            });

            // Cursor hover effects
            const hoverElements = document.querySelectorAll('button, a, .balance-card, .chart-segment, .transaction-item');
            hoverElements.forEach(el => {
                el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
                el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
            });
        }
    }

    initChartAnimations() {
        // Animate chart segments on load
        const segments = document.querySelectorAll('.chart-segment');
        segments.forEach((segment, index) => {
            setTimeout(() => {
                segment.style.transform = 'scale(1) rotate(0deg)';
                segment.style.opacity = '1';
            }, index * 200);
        });

        // Animate liquid progress bars
        setTimeout(() => {
            const liquidWaves = document.querySelectorAll('.liquid-wave');
            liquidWaves.forEach(wave => {
                const progress = wave.style.getPropertyValue('--progress');
                wave.style.height = progress;
            });
        }, 1000);
    }

    loadSampleData() {
        // Sample transactions for demonstration
        const sampleTransactions = [
            { id: 1, amount: 2500, description: 'Salary', category: 'income', type: 'income', date: new Date() },
            { id: 2, amount: -150, description: 'Grocery Shopping', category: 'food', type: 'expense', date: new Date() },
            { id: 3, amount: -80, description: 'Gas Station', category: 'transport', type: 'expense', date: new Date() },
            { id: 4, amount: -45, description: 'Netflix Subscription', category: 'entertainment', type: 'expense', date: new Date() },
            { id: 5, amount: -200, description: 'New Shoes', category: 'shopping', type: 'expense', date: new Date() }
        ];

        this.transactions = sampleTransactions;
        this.calculateTotals();
        this.renderTransactions();
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const amount = parseFloat(formData.get('amount'));
        const description = formData.get('description');
        const category = formData.get('category');
        const type = formData.get('type');

        if (!amount || !description || !category) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        const transaction = {
            id: Date.now(),
            amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
            description,
            category,
            type,
            date: new Date()
        };

        this.addTransaction(transaction);
        e.target.reset();
        this.showNotification('Transaction added successfully!', 'success');
    }

    addTransaction(transaction) {
        this.transactions.unshift(transaction);
        this.calculateTotals();
        this.updateDashboard();
        this.renderTransactions();
        this.animateNewTransaction();
    }

    calculateTotals() {
        this.totalIncome = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        this.totalExpenses = Math.abs(this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0));
        
        this.balance = this.totalIncome - this.totalExpenses;
    }

    updateDashboard() {
        // Update balance cards with animation
        this.animateValue('totalBalance', this.balance, '$');
        this.animateValue('totalIncome', this.totalIncome, '$');
        this.animateValue('totalExpenses', this.totalExpenses, '$');

        // Update liquid fill animation
        const liquidFill = document.getElementById('liquidFill');
        const fillPercentage = Math.min((this.balance / 5000) * 100, 100);
        liquidFill.style.height = fillPercentage + '%';

        // Update chart data
        this.updateChartData();
    }

    animateValue(elementId, finalValue, prefix = '') {
        const element = document.getElementById(elementId);
        const startValue = 0;
        const duration = 1500;
        const startTime = Date.now();

        const animate = () => {
            const currentTime = Date.now();
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = startValue + (finalValue - startValue) * easeOutQuart;

            element.textContent = prefix + currentValue.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    updateChartData() {
        const categoryTotals = {};
        
        this.transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                const category = t.category;
                categoryTotals[category] = (categoryTotals[category] || 0) + Math.abs(t.amount);
            });

        // Update chart segments
        Object.keys(categoryTotals).forEach(category => {
            const segment = document.querySelector(`.chart-segment.${category}`);
            if (segment) {
                const amount = segment.querySelector('.segment-amount');
                if (amount) {
                    amount.textContent = '$' + categoryTotals[category].toFixed(0);
                }
            }
        });
    }

    renderTransactions() {
        const container = document.getElementById('transactionsList');
        container.innerHTML = '';

        this.transactions.slice(0, 10).forEach(transaction => {
            const transactionEl = this.createTransactionElement(transaction);
            container.appendChild(transactionEl);
        });
    }

    createTransactionElement(transaction) {
        const div = document.createElement('div');
        div.className = `transaction-item ${transaction.type}`;
        
        const iconMap = {
            food: '🍔',
            transport: '🚗',
            entertainment: '🎬',
            shopping: '🛍️',
            bills: '💡',
            income: '💰'
        };

        div.innerHTML = `
            <div class="transaction-info">
                <div class="transaction-icon ${transaction.category}">
                    ${iconMap[transaction.category] || '💳'}
                </div>
                <div class="transaction-details">
                    <h4>${transaction.description}</h4>
                    <span>${this.formatDate(transaction.date)} • ${this.capitalizeFirst(transaction.category)}</span>
                </div>
            </div>
            <div class="transaction-amount ${transaction.type}">
                ${transaction.amount >= 0 ? '+' : ''}$${Math.abs(transaction.amount).toFixed(2)}
            </div>
        `;

        return div;
    }

    animateNewTransaction() {
        const firstTransaction = document.querySelector('.transaction-item');
        if (firstTransaction) {
            firstTransaction.style.animation = 'none';
            firstTransaction.offsetHeight; // Trigger reflow
            firstTransaction.style.animation = 'slideIn 0.5s ease';
        }
    }

    handleChartPeriodChange(e) {
        // Remove active class from all buttons
        document.querySelectorAll('.chart-btn').forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        e.target.classList.add('active');

        // Animate chart segments
        const segments = document.querySelectorAll('.chart-segment');
        segments.forEach((segment, index) => {
            segment.style.transform = 'scale(0) rotate(180deg)';
            setTimeout(() => {
                segment.style.transform = 'scale(1) rotate(0deg)';
            }, index * 100);
        });
    }

    handleChartHover(e) {
        const segment = e.target;
        const category = segment.dataset.category;
        
        // Dim other segments
        document.querySelectorAll('.chart-segment').forEach(s => {
            if (s !== segment) {
                s.style.opacity = '0.3';
            }
        });

        // Show tooltip effect
        segment.style.filter = 'brightness(1.2)';
    }

    handleChartLeave(e) {
        // Restore all segments
        document.querySelectorAll('.chart-segment').forEach(s => {
            s.style.opacity = '1';
            s.style.filter = 'none';
        });
    }

    handleNavigation(e) {
        e.preventDefault();
        
        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        
        // Add active class to clicked link
        e.target.classList.add('active');

        // Smooth scroll effect (placeholder for actual navigation)
        const targetSection = e.target.getAttribute('href');
        if (targetSection !== '#') {
            // In a real app, you would implement section switching here
            console.log('Navigating to:', targetSection);
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = 'success-animation';
        notification.textContent = message;
        
        if (type === 'error') {
            notification.style.background = 'rgba(239, 68, 68, 0.9)';
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            document.body.removeChild(notification);
        }, 2000);
    }

    animateOnScroll() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'slideIn 0.6s ease forwards';
                }
            });
        }, observerOptions);

        // Observe all major sections
        document.querySelectorAll('.balance-card, .chart-container, .goals-container, .form-container, .transactions-list').forEach(el => {
            observer.observe(el);
        });
    }

    formatDate(date) {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Advanced features for demonstration
    exportData() {
        const data = {
            transactions: this.transactions,
            balance: this.balance,
            totalIncome: this.totalIncome,
            totalExpenses: this.totalExpenses,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'finance-data.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    generateReport() {
        const report = {
            summary: {
                totalTransactions: this.transactions.length,
                balance: this.balance,
                income: this.totalIncome,
                expenses: this.totalExpenses,
                savingsRate: ((this.totalIncome - this.totalExpenses) / this.totalIncome * 100).toFixed(1) + '%'
            },
            categoryBreakdown: this.getCategoryBreakdown(),
            trends: this.getTrends()
        };

        console.log('Financial Report:', report);
        return report;
    }

    getCategoryBreakdown() {
        const breakdown = {};
        this.transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                breakdown[t.category] = (breakdown[t.category] || 0) + Math.abs(t.amount);
            });
        return breakdown;
    }

    getTrends() {
        // Simple trend analysis
        const last30Days = this.transactions.filter(t => {
            const daysDiff = (new Date() - t.date) / (1000 * 60 * 60 * 24);
            return daysDiff <= 30;
        });

        return {
            recentTransactions: last30Days.length,
            averageDaily: (last30Days.reduce((sum, t) => sum + Math.abs(t.amount), 0) / 30).toFixed(2),
            mostFrequentCategory: this.getMostFrequentCategory(last30Days)
        };
    }

    getMostFrequentCategory(transactions) {
        const categoryCount = {};
        transactions.forEach(t => {
            categoryCount[t.category] = (categoryCount[t.category] || 0) + 1;
        });

        return Object.keys(categoryCount).reduce((a, b) => 
            categoryCount[a] > categoryCount[b] ? a : b
        );
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const financeTracker = new FinanceTracker();
    
    // Make it globally available for console testing
    window.financeTracker = financeTracker;
    
    // Add some keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'e':
                    e.preventDefault();
                    financeTracker.exportData();
                    break;
                case 'r':
                    e.preventDefault();
                    financeTracker.generateReport();
                    break;
            }
        }
    });

    console.log('💰 FinanceFlow loaded successfully!');
    console.log('💡 Try Ctrl+E to export data or Ctrl+R to generate report');
});

// Additional utility functions for enhanced UX
function createRippleEffect(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Add ripple effect to buttons
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('button, .chart-btn');
    buttons.forEach(button => {
        button.addEventListener('click', createRippleEffect);
    });
});

// Performance monitoring
const perfObserver = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
        if (entry.entryType === 'paint') {
            console.log(`${entry.name}: ${entry.startTime.toFixed(2)}ms`);
        }
    });
});

if ('PerformanceObserver' in window) {
    perfObserver.observe({ entryTypes: ['paint'] });
}
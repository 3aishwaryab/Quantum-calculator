// Quantum Calculator - Advanced JavaScript Functionality

class QuantumCalculator {
    constructor() {
        this.currentInput = '0';
        this.previousInput = '';
        this.operator = null;
        this.shouldResetDisplay = false;
        this.memory = 0;
        this.history = [];
        this.soundEnabled = true;
        this.currentTheme = 'neon';
        this.currentMode = 'basic';
        this.expression = '';
        
        this.initializeElements();
        this.initializeEventListeners();
        this.initializeAudio();
        this.loadSettings();
        this.updateConverter();
    }

    initializeElements() {
        this.mainDisplay = document.getElementById('mainDisplay');
        this.expressionDisplay = document.getElementById('expressionDisplay');
        this.unitDisplay = document.getElementById('unitDisplay');
        this.memoryValue = document.getElementById('memoryValue');
        this.historyContent = document.getElementById('historyContent');
        this.historyPanel = document.getElementById('historyPanel');
        this.calculatorGrid = document.querySelector('.calculator-grid');
        
        // Converter elements
        this.converterType = document.getElementById('converterType');
        this.fromValue = document.getElementById('fromValue');
        this.toValue = document.getElementById('toValue');
        this.fromUnit = document.getElementById('fromUnit');
        this.toUnit = document.getElementById('toUnit');
    }

    initializeEventListeners() {
        // Theme switcher
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTheme(e.target.dataset.theme));
        });

        // Mode switcher
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchMode(e.target.dataset.mode));
        });

        // Sound toggle
        document.getElementById('soundToggle').addEventListener('click', () => this.toggleSound());

        // History toggle
        document.getElementById('historyToggle').addEventListener('click', () => this.toggleHistory());

        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Converter inputs
        this.fromValue.addEventListener('input', () => this.performConversion());
        this.fromUnit.addEventListener('change', () => this.performConversion());
        this.toUnit.addEventListener('change', () => this.performConversion());
    }

    initializeAudio() {
        // Create audio context for sound effects
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    playSound(frequency = 440, duration = 100) {
        if (!this.soundEnabled) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration / 1000);
    }

    switchTheme(theme) {
        document.body.className = `theme-${theme}`;
        this.currentTheme = theme;
        
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-theme="${theme}"]`).classList.add('active');
        
        this.saveSettings();
        this.playSound(600, 150);
    }

    switchMode(mode) {
        this.currentMode = mode;
        
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
        
        document.querySelectorAll('.calculator-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(`${mode}Panel`).classList.add('active');
        
        this.playSound(500, 150);
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const soundBtn = document.getElementById('soundToggle');
        soundBtn.innerHTML = this.soundEnabled ? 
            '<i class="fas fa-volume-up"></i>' : 
            '<i class="fas fa-volume-mute"></i>';
        
        if (this.soundEnabled) this.playSound(800, 200);
        this.saveSettings();
    }

    toggleHistory() {
        this.historyPanel.classList.toggle('hidden');
        this.calculatorGrid.classList.toggle('full-width');
        this.playSound(400, 150);
    }

    updateDisplay() {
        this.mainDisplay.textContent = this.currentInput;
        this.expressionDisplay.textContent = this.expression;
        this.memoryValue.textContent = this.memory;
    }

    clearAll() {
        this.currentInput = '0';
        this.previousInput = '';
        this.operator = null;
        this.shouldResetDisplay = false;
        this.expression = '';
        this.updateDisplay();
        this.playSound(300, 100);
    }

    deleteLast() {
        if (this.currentInput.length > 1) {
            this.currentInput = this.currentInput.slice(0, -1);
        } else {
            this.currentInput = '0';
        }
        this.updateDisplay();
        this.playSound(350, 100);
    }

    appendNumber(number) {
        if (this.shouldResetDisplay) {
            this.currentInput = '0';
            this.shouldResetDisplay = false;
        }
        
        if (this.currentInput === '0') {
            this.currentInput = number;
        } else {
            this.currentInput += number;
        }
        this.updateDisplay();
        this.playSound(400 + parseInt(number) * 50, 80);
    }

    appendDecimal() {
        if (this.shouldResetDisplay) {
            this.currentInput = '0';
            this.shouldResetDisplay = false;
        }
        
        if (!this.currentInput.includes('.')) {
            this.currentInput += '.';
            this.updateDisplay();
            this.playSound(450, 80);
        }
    }

    appendOperator(op) {
        if (this.operator !== null && !this.shouldResetDisplay) {
            this.calculate();
        }
        
        this.previousInput = this.currentInput;
        this.operator = op;
        this.expression = `${this.previousInput} ${this.getOperatorSymbol(op)}`;
        this.shouldResetDisplay = true;
        this.updateDisplay();
        this.playSound(550, 100);
    }

    getOperatorSymbol(op) {
        const symbols = {
            '+': '+',
            '-': '−',
            '*': '×',
            '/': '÷',
            '%': '%'
        };
        return symbols[op] || op;
    }

    calculate() {
        if (this.operator === null || this.previousInput === '') {
            return;
        }
        
        let result;
        const prev = parseFloat(this.previousInput);
        const current = parseFloat(this.currentInput);
        
        switch (this.operator) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '*':
                result = prev * current;
                break;
            case '/':
                if (current === 0) {
                    this.showError('Cannot divide by zero');
                    return;
                }
                result = prev / current;
                break;
            case '%':
                result = prev % current;
                break;
            default:
                return;
        }
        
        const fullExpression = `${this.previousInput} ${this.getOperatorSymbol(this.operator)} ${this.currentInput}`;
        this.addToHistory(fullExpression, result);
        
        this.currentInput = result.toString();
        this.expression = fullExpression + ' =';
        this.operator = null;
        this.previousInput = '';
        this.shouldResetDisplay = true;
        this.updateDisplay();
        this.playSound(700, 200);
    }

    scientificFunction(func) {
        const current = parseFloat(this.currentInput);
        let result;
        
        switch (func) {
            case 'sin':
                result = Math.sin(current * Math.PI / 180);
                break;
            case 'cos':
                result = Math.cos(current * Math.PI / 180);
                break;
            case 'tan':
                result = Math.tan(current * Math.PI / 180);
                break;
            case 'log':
                result = Math.log10(current);
                break;
            case 'ln':
                result = Math.log(current);
                break;
            case 'sqrt':
                result = Math.sqrt(current);
                break;
            case 'pow2':
                result = Math.pow(current, 2);
                break;
            case 'pow3':
                result = Math.pow(current, 3);
                break;
            case 'pi':
                result = Math.PI;
                break;
            default:
                return;
        }
        
        const expression = `${func}(${current})`;
        this.addToHistory(expression, result);
        this.currentInput = result.toString();
        this.expression = expression + ' =';
        this.shouldResetDisplay = true;
        this.updateDisplay();
        this.playSound(600, 150);
    }

    // Memory functions
    memoryRecall() {
        this.currentInput = this.memory.toString();
        this.updateDisplay();
        this.playSound(500, 100);
    }

    memoryClear() {
        this.memory = 0;
        this.updateDisplay();
        this.playSound(400, 100);
    }

    memoryAdd() {
        this.memory += parseFloat(this.currentInput);
        this.updateDisplay();
        this.playSound(550, 100);
    }

    memorySubtract() {
        this.memory -= parseFloat(this.currentInput);
        this.updateDisplay();
        this.playSound(450, 100);
    }

    // History functions
    addToHistory(expression, result) {
        const historyItem = {
            expression: expression,
            result: result,
            timestamp: new Date().toLocaleTimeString()
        };
        
        this.history.unshift(historyItem);
        if (this.history.length > 50) {
            this.history.pop();
        }
        
        this.updateHistoryDisplay();
        this.saveSettings();
    }

    updateHistoryDisplay() {
        if (this.history.length === 0) {
            this.historyContent.innerHTML = '<div class="history-empty">No calculations yet</div>';
            return;
        }
        
        this.historyContent.innerHTML = this.history.map(item => `
            <div class="history-item">
                <div class="history-expression">${item.expression}</div>
                <div class="history-result">= ${item.result}</div>
            </div>
        `).join('');
    }

    clearHistory() {
        this.history = [];
        this.updateHistoryDisplay();
        this.saveSettings();
        this.playSound(300, 150);
    }

    // Converter functions
    updateConverter() {
        const type = this.converterType.value;
        const units = this.getConverterUnits(type);
        
        this.fromUnit.innerHTML = units.map(unit => 
            `<option value="${unit.value}">${unit.label}</option>`
        ).join('');
        
        this.toUnit.innerHTML = units.map(unit => 
            `<option value="${unit.value}">${unit.label}</option>`
        ).join('');
        
        // Set default selections
        if (type === 'currency') {
            this.fromUnit.value = 'USD';
            this.toUnit.value = 'EUR';
        } else {
            this.fromUnit.selectedIndex = 0;
            this.toUnit.selectedIndex = 1;
        }
    }

    getConverterUnits(type) {
        const units = {
            currency: [
                { value: 'USD', label: 'USD' },
                { value: 'EUR', label: 'EUR' },
                { value: 'GBP', label: 'GBP' },
                { value: 'JPY', label: 'JPY' },
                { value: 'INR', label: 'INR' }
            ],
            length: [
                { value: 'm', label: 'Meters' },
                { value: 'km', label: 'Kilometers' },
                { value: 'ft', label: 'Feet' },
                { value: 'in', label: 'Inches' },
                { value: 'mi', label: 'Miles' }
            ],
            weight: [
                { value: 'kg', label: 'Kilograms' },
                { value: 'g', label: 'Grams' },
                { value: 'lb', label: 'Pounds' },
                { value: 'oz', label: 'Ounces' }
            ],
            temperature: [
                { value: 'c', label: 'Celsius' },
                { value: 'f', label: 'Fahrenheit' },
                { value: 'k', label: 'Kelvin' }
            ]
        };
        return units[type] || [];
    }

    performConversion() {
        const value = parseFloat(this.fromValue);
        if (isNaN(value)) {
            this.toValue.value = '';
            return;
        }
        
        const fromUnit = this.fromUnit.value;
        const toUnit = this.toUnit.value;
        const type = this.converterType.value;
        
        let result;
        
        if (type === 'currency') {
            // Mock exchange rates (in real app, would use API)
            const rates = {
                'USD': 1,
                'EUR': 0.85,
                'GBP': 0.73,
                'JPY': 110,
                'INR': 74
            };
            result = (value / rates[fromUnit]) * rates[toUnit];
        } else if (type === 'length') {
            // Convert to meters first, then to target
            const toMeters = {
                'm': 1,
                'km': 0.001,
                'ft': 0.3048,
                'in': 0.0254,
                'mi': 0.000160934
            };
            const fromMeters = {
                'm': 1,
                'km': 1000,
                'ft': 3.28084,
                'in': 39.3701,
                'mi': 0.000621371
            };
            result = (value * toMeters[fromUnit]) * fromMeters[toUnit];
        } else if (type === 'weight') {
            // Convert to kg first, then to target
            const toKg = {
                'kg': 1,
                'g': 0.001,
                'lb': 0.453592,
                'oz': 0.0283495
            };
            const fromKg = {
                'kg': 1,
                'g': 1000,
                'lb': 2.20462,
                'oz': 35.274
            };
            result = (value * toKg[fromUnit]) * fromKg[toUnit];
        } else if (type === 'temperature') {
            result = this.convertTemperature(value, fromUnit, toUnit);
        }
        
        this.toValue.value = result ? result.toFixed(4) : '';
        if (result) this.playSound(500, 100);
    }

    convertTemperature(value, from, to) {
        // Convert to Celsius first
        let celsius;
        if (from === 'f') {
            celsius = (value - 32) * 5/9;
        } else if (from === 'k') {
            celsius = value - 273.15;
        } else {
            celsius = value;
        }
        
        // Convert from Celsius to target
        if (to === 'f') {
            return celsius * 9/5 + 32;
        } else if (to === 'k') {
            return celsius + 273.15;
        } else {
            return celsius;
        }
    }

    handleKeyboard(event) {
        const key = event.key;
        
        // Prevent default for calculator keys
        if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '+', '-', '*', '/', '=', 'Enter', 'Escape', 'Backspace', 'c', 'C'].includes(key)) {
            event.preventDefault();
        }
        
        if (key >= '0' && key <= '9') {
            this.appendNumber(key);
        } else if (key === '.') {
            this.appendDecimal();
        } else if (['+', '-', '*', '/', '%'].includes(key)) {
            this.appendOperator(key);
        } else if (key === 'Enter' || key === '=') {
            this.calculate();
        } else if (key === 'Escape' || key.toLowerCase() === 'c') {
            this.clearAll();
        } else if (key === 'Backspace') {
            this.deleteLast();
        }
    }

    showError(message) {
        this.expressionDisplay.textContent = message;
        this.playSound(200, 300);
        setTimeout(() => {
            this.expressionDisplay.textContent = this.expression;
        }, 2000);
    }

    saveSettings() {
        const settings = {
            theme: this.currentTheme,
            soundEnabled: this.soundEnabled,
            history: this.history,
            memory: this.memory
        };
        localStorage.setItem('quantumCalculatorSettings', JSON.stringify(settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('quantumCalculatorSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            this.switchTheme(settings.theme || 'neon');
            this.soundEnabled = settings.soundEnabled !== false;
            this.history = settings.history || [];
            this.memory = settings.memory || 0;
            
            if (!this.soundEnabled) {
                document.getElementById('soundToggle').innerHTML = '<i class="fas fa-volume-mute"></i>';
            }
            
            this.updateHistoryDisplay();
            this.updateDisplay();
        }
    }
}

// Global functions for HTML onclick handlers
let calculator;

function appendNumber(num) { calculator.appendNumber(num); }
function appendDecimal() { calculator.appendDecimal(); }
function appendOperator(op) { calculator.appendOperator(op); }
function calculate() { calculator.calculate(); }
function clearAll() { calculator.clearAll(); }
function deleteLast() { calculator.deleteLast(); }
function scientificFunction(func) { calculator.scientificFunction(func); }
function memoryRecall() { calculator.memoryRecall(); }
function memoryClear() { calculator.memoryClear(); }
function memoryAdd() { calculator.memoryAdd(); }
function memorySubtract() { calculator.memorySubtract(); }
function clearHistory() { calculator.clearHistory(); }
function updateConverter() { calculator.updateConverter(); }
function performConversion() { calculator.performConversion(); }

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    calculator = new QuantumCalculator();
});

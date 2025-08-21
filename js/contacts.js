// Contacts page functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeContactForm();
    initializeFAQ();
    initializePhoneMask();
    initializeContactAnimations();
});

// Contact form functionality
function initializeContactForm() {
    const form = document.getElementById('mainContactForm');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!validateForm(form)) {
            return;
        }

        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.innerHTML = `
            <span>Отправляем заявку...</span>
            <div class="loading-spinner"></div>
        `;
        
        // Simulate form submission (replace with actual API call)
        setTimeout(() => {
            // Show success message
            showSuccessMessage();
            
            // Reset form
            form.reset();
            
            // Reset button
            submitButton.disabled = false;
            submitButton.textContent = originalText;
            
            // Log form data (replace with actual API call)
            console.log('Contact form data:', data);
            
            // Track conversion
            if (typeof gtag !== 'undefined') {
                gtag('event', 'form_submit', {
                    event_category: 'contact',
                    event_label: 'main_contact_form',
                    value: 1
                });
            }
            
        }, 2500);
    });

    // Real-time validation
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                validateField(this);
            }
        });
    });
}

// Form validation
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    // Check privacy checkbox
    const privacyCheckbox = form.querySelector('input[name="privacy"]');
    if (privacyCheckbox && !privacyCheckbox.checked) {
        showFieldError(privacyCheckbox, 'Необходимо согласие с политикой конфиденциальности');
        isValid = false;
    }
    
    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Clear existing errors
    clearFieldError(field);
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'Это поле обязательно для заполнения';
    }
    
    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Введите корректный email адрес';
        }
    }
    
    // Phone validation
    if (field.type === 'tel' && value) {
        const phoneRegex = /^\+?[0-9\s\-\(\)]{10,}$/;
        if (!phoneRegex.test(value)) {
            isValid = false;
            errorMessage = 'Введите корректный номер телефона';
        }
    }
    
    // Message length validation
    if (field.name === 'message' && value && value.length < 10) {
        isValid = false;
        errorMessage = 'Сообщение должно содержать минимум 10 символов';
    }
    
    // Show error if validation failed
    if (!isValid) {
        showFieldError(field, errorMessage);
    }
    
    return isValid;
}

function showFieldError(field, message) {
    field.classList.add('error');
    
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    
    field.parentNode.appendChild(errorElement);
}

function clearFieldError(field) {
    field.classList.remove('error');
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

// Success message
function showSuccessMessage() {
    const successModal = document.createElement('div');
    successModal.className = 'success-modal';
    successModal.innerHTML = `
        <div class="success-modal__content">
            <div class="success-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <h3>Заявка отправлена!</h3>
            <p>Спасибо за ваше обращение. Мы свяжемся с вами в течение часа для обсуждения деталей проекта.</p>
            <button class="btn btn--primary" onclick="closeSuccessModal()">Понятно</button>
        </div>
    `;
    
    document.body.appendChild(successModal);
    document.body.style.overflow = 'hidden';
    
    // Animate in
    setTimeout(() => {
        successModal.classList.add('active');
    }, 10);
    
    // Auto close after 5 seconds
    setTimeout(() => {
        closeSuccessModal();
    }, 5000);
}

window.closeSuccessModal = function() {
    const modal = document.querySelector('.success-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            document.body.removeChild(modal);
            document.body.style.overflow = '';
        }, 300);
    }
};

// Phone mask
function initializePhoneMask() {
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    
    phoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length > 0) {
                if (value[0] === '8') {
                    value = '7' + value.slice(1);
                }
                if (value[0] === '7') {
                    value = value.slice(0, 11);
                    const match = value.match(/^(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})$/);
                    if (match) {
                        e.target.value = `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}-${match[5]}`;
                    } else {
                        e.target.value = '+' + value;
                    }
                } else {
                    e.target.value = '+' + value;
                }
            }
        });
        
        input.addEventListener('keydown', function(e) {
            // Allow backspace, delete, tab, escape, enter
            if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
                // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                (e.keyCode === 65 && e.ctrlKey === true) ||
                (e.keyCode === 67 && e.ctrlKey === true) ||
                (e.keyCode === 86 && e.ctrlKey === true) ||
                (e.keyCode === 88 && e.ctrlKey === true)) {
                return;
            }
            // Ensure that it is a number and stop the keypress
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                e.preventDefault();
            }
        });
    });
}

// FAQ accordion
function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const toggle = item.querySelector('.faq-toggle');
        
        question.addEventListener('click', function() {
            const isActive = item.classList.contains('active');
            
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    const otherAnswer = otherItem.querySelector('.faq-answer');
                    const otherToggle = otherItem.querySelector('.faq-toggle');
                    otherAnswer.style.maxHeight = null;
                    otherToggle.textContent = '+';
                }
            });
            
            // Toggle current item
            if (isActive) {
                item.classList.remove('active');
                answer.style.maxHeight = null;
                toggle.textContent = '+';
            } else {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
                toggle.textContent = '−';
            }
        });
    });
}

// Map functionality
window.openMap = function() {
    const address = 'Москва, ул. Примерная, 123';
    const encodedAddress = encodeURIComponent(address);
    
    // Try to open in Yandex Maps first (more popular in Russia)
    const yandexUrl = `https://yandex.ru/maps/?text=${encodedAddress}`;
    const googleUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    
    // Check if user is likely in Russia/CIS and prefer Yandex Maps
    const userLang = navigator.language || navigator.userLanguage;
    if (userLang.startsWith('ru') || userLang.startsWith('uk') || userLang.startsWith('be')) {
        window.open(yandexUrl, '_blank');
    } else {
        window.open(googleUrl, '_blank');
    }
};

// Contact animations
function initializeContactAnimations() {
    // Animate contact cards on scroll
    const contactCards = document.querySelectorAll('.contact-card');
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.transform = 'translateY(0)';
                entry.target.style.opacity = '1';
            }
        });
    }, { threshold: 0.1 });

    contactCards.forEach((card, index) => {
        card.style.transform = 'translateY(30px)';
        card.style.opacity = '0';
        card.style.transition = `all 0.6s ease ${index * 0.1}s`;
        cardObserver.observe(card);
    });

    // Animate form fields on focus
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach(group => {
        const input = group.querySelector('input, select, textarea');
        const label = group.querySelector('label');
        
        if (input && label) {
            input.addEventListener('focus', function() {
                group.classList.add('focused');
                label.style.transform = 'translateY(-5px)';
                label.style.color = 'var(--accent-green)';
            });
            
            input.addEventListener('blur', function() {
                if (!input.value) {
                    group.classList.remove('focused');
                    label.style.transform = '';
                    label.style.color = '';
                }
            });
            
            // Check if field has value on page load
            if (input.value) {
                group.classList.add('focused');
                label.style.transform = 'translateY(-5px)';
            }
        }
    });

    // Parallax effect for contact icons
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const contactIcons = document.querySelectorAll('.contact-card__icon');
        
        contactIcons.forEach((icon, index) => {
            const speed = 0.1 + (index * 0.02);
            const yPos = scrolled * speed;
            icon.style.transform = `translateY(${yPos}px)`;
        });
    });
}

// Add CSS for contacts page
const contactsStyles = document.createElement('style');
contactsStyles.textContent = `
    /* Contacts page specific styles */
    .contacts-hero {
        padding: var(--spacing-4xl) 0 var(--spacing-2xl);
        background: linear-gradient(135deg, rgba(0, 255, 133, 0.05), rgba(255, 214, 0, 0.05));
        margin-top: 80px;
        text-align: center;
    }
    
    .contacts-hero__title {
        font-size: var(--font-size-5xl);
        margin-bottom: var(--spacing-lg);
    }
    
    .contacts-hero__subtitle {
        font-size: var(--font-size-lg);
        color: var(--text-secondary);
        max-width: 600px;
        margin: 0 auto;
    }
    
    .contact-info {
        padding: var(--spacing-4xl) 0;
    }
    
    .contact-info__grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: var(--spacing-2xl);
    }
    
    .contact-card {
        display: flex;
        gap: var(--spacing-lg);
        padding: var(--spacing-2xl);
        background: var(--bg-secondary);
        border-radius: var(--border-radius-xl);
        border: 1px solid rgba(0, 255, 133, 0.1);
        transition: all var(--transition-base);
    }
    
    .contact-card:hover {
        transform: translateY(-5px);
        border-color: var(--accent-green);
        box-shadow: var(--shadow-lg);
    }
    
    .contact-card__icon {
        width: 50px;
        height: 50px;
        color: var(--accent-green);
        flex-shrink: 0;
    }
    
    .contact-card__icon svg {
        width: 100%;
        height: 100%;
    }
    
    .contact-card__content h3 {
        color: var(--text-primary);
        margin-bottom: var(--spacing-sm);
    }
    
    .contact-card__content p {
        margin-bottom: var(--spacing-xs);
    }
    
    .contact-card__content a {
        color: var(--text-secondary);
        text-decoration: none;
        transition: color var(--transition-base);
    }
    
    .contact-card__content a:hover {
        color: var(--accent-green);
    }
    
    .contact-card__content small {
        color: var(--text-secondary);
        font-size: var(--font-size-sm);
    }
    
    .contact-form-section {
        padding: var(--spacing-4xl) 0;
        background: var(--bg-secondary);
    }
    
    .contact-form-wrapper {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--spacing-4xl);
        align-items: start;
    }
    
    .contact-form-info h2 {
        margin-bottom: var(--spacing-lg);
    }
    
    .contact-form-info p {
        margin-bottom: var(--spacing-2xl);
        font-size: var(--font-size-lg);
    }
    
    .contact-benefits {
        margin-bottom: var(--spacing-2xl);
    }
    
    .benefit-item {
        display: flex;
        gap: var(--spacing-md);
        margin-bottom: var(--spacing-lg);
    }
    
    .benefit-icon {
        font-size: var(--font-size-2xl);
        width: 40px;
        flex-shrink: 0;
    }
    
    .benefit-text h4 {
        color: var(--text-primary);
        margin-bottom: var(--spacing-xs);
    }
    
    .benefit-text p {
        color: var(--text-secondary);
        margin: 0;
    }
    
    .social-links h4 {
        color: var(--text-primary);
        margin-bottom: var(--spacing-md);
    }
    
    .social-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--spacing-sm);
    }
    
    .social-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-sm);
        background: var(--bg-primary);
        border-radius: var(--border-radius-md);
        color: var(--text-secondary);
        text-decoration: none;
        transition: all var(--transition-base);
        border: 1px solid rgba(0, 255, 133, 0.1);
    }
    
    .social-item:hover {
        color: var(--accent-green);
        border-color: var(--accent-green);
        transform: translateY(-2px);
    }
    
    .social-icon {
        width: 20px;
        height: 20px;
    }
    
    .social-icon svg {
        width: 100%;
        height: 100%;
    }
    
    .contact-form-container {
        background: var(--bg-primary);
        padding: var(--spacing-2xl);
        border-radius: var(--border-radius-xl);
        border: 1px solid rgba(0, 255, 133, 0.1);
    }
    
    .main-contact-form {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--spacing-lg);
    }
    
    .form-group {
        position: relative;
    }
    
    .form-group--full {
        grid-column: 1 / -1;
    }
    
    .form-group label {
        display: block;
        margin-bottom: var(--spacing-sm);
        color: var(--text-secondary);
        font-size: var(--font-size-sm);
        font-weight: 500;
        transition: all var(--transition-base);
    }
    
    .form-group input,
    .form-group select,
    .form-group textarea {
        width: 100%;
        padding: var(--spacing-md);
        background: var(--bg-secondary);
        border: 1px solid rgba(0, 255, 133, 0.2);
        border-radius: var(--border-radius-md);
        color: var(--text-primary);
        font-size: var(--font-size-base);
        transition: all var(--transition-base);
    }
    
    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: var(--accent-green);
        box-shadow: 0 0 0 3px rgba(0, 255, 133, 0.1);
    }
    
    .form-group input.error,
    .form-group select.error,
    .form-group textarea.error {
        border-color: #ff4757;
        box-shadow: 0 0 0 3px rgba(255, 71, 87, 0.1);
    }
    
    .field-error {
        color: #ff4757;
        font-size: var(--font-size-sm);
        margin-top: var(--spacing-xs);
        position: absolute;
        bottom: -20px;
        left: 0;
    }
    
    .form-group textarea {
        resize: vertical;
        min-height: 100px;
    }
    
    .checkbox-label {
        display: flex;
        align-items: flex-start;
        gap: var(--spacing-sm);
        cursor: pointer;
        font-size: var(--font-size-sm);
        line-height: 1.4;
    }
    
    .checkbox-label input[type="checkbox"] {
        display: none;
    }
    
    .checkmark {
        width: 20px;
        height: 20px;
        border: 2px solid rgba(0, 255, 133, 0.3);
        border-radius: var(--border-radius-sm);
        position: relative;
        flex-shrink: 0;
        transition: all var(--transition-base);
    }
    
    .checkbox-label input[type="checkbox"]:checked + .checkmark {
        background: var(--accent-green);
        border-color: var(--accent-green);
    }
    
    .checkbox-label input[type="checkbox"]:checked + .checkmark::after {
        content: '✓';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: var(--text-dark);
        font-weight: bold;
        font-size: 12px;
    }
    
    .checkbox-label a {
        color: var(--accent-green);
        text-decoration: none;
    }
    
    .checkbox-label a:hover {
        text-decoration: underline;
    }
    
    .btn--large {
        padding: var(--spacing-lg) var(--spacing-2xl);
        font-size: var(--font-size-lg);
    }
    
    .loading-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255,255,255,0.3);
        border-top: 2px solid white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        display: inline-block;
        margin-left: var(--spacing-sm);
    }
    
    .success-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(5px);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
    }
    
    .success-modal.active {
        opacity: 1;
        visibility: visible;
    }
    
    .success-modal__content {
        background: var(--bg-primary);
        padding: var(--spacing-2xl);
        border-radius: var(--border-radius-xl);
        text-align: center;
        max-width: 400px;
        border: 1px solid var(--accent-green);
        transform: scale(0.7);
        transition: transform 0.3s ease;
    }
    
    .success-modal.active .success-modal__content {
        transform: scale(1);
    }
    
    .success-icon {
        width: 60px;
        height: 60px;
        color: var(--accent-green);
        margin: 0 auto var(--spacing-lg);
    }
    
    .success-icon svg {
        width: 100%;
        height: 100%;
    }
    
    .success-modal__content h3 {
        color: var(--text-primary);
        margin-bottom: var(--spacing-md);
    }
    
    .success-modal__content p {
        margin-bottom: var(--spacing-lg);
    }
    
    .map-section {
        padding: var(--spacing-4xl) 0;
    }
    
    .map-container {
        margin-top: var(--spacing-2xl);
    }
    
    .map-placeholder {
        height: 400px;
        background: var(--bg-secondary);
        border-radius: var(--border-radius-xl);
        border: 1px solid rgba(0, 255, 133, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
    }
    
    .map-placeholder::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(45deg, transparent 30%, rgba(0, 255, 133, 0.05) 50%, transparent 70%);
        animation: shimmer 3s infinite;
    }
    
    .map-content {
        text-align: center;
        z-index: 2;
        position: relative;
    }
    
    .map-icon {
        width: 60px;
        height: 60px;
        color: var(--accent-green);
        margin: 0 auto var(--spacing-lg);
    }
    
    .map-icon svg {
        width: 100%;
        height: 100%;
    }
    
    .map-content h3 {
        color: var(--text-primary);
        margin-bottom: var(--spacing-sm);
    }
    
    .map-content p {
        margin-bottom: var(--spacing-lg);
    }
    
    .map-directions {
        margin-bottom: var(--spacing-lg);
        text-align: left;
    }
    
    .map-directions p {
        color: var(--text-secondary);
        margin-bottom: var(--spacing-xs);
        font-size: var(--font-size-sm);
    }
    
    .faq-section {
        padding: var(--spacing-4xl) 0;
        background: var(--bg-secondary);
    }
    
    .faq-grid {
        display: grid;
        gap: var(--spacing-lg);
        max-width: 800px;
        margin: 0 auto;
    }
    
    .faq-item {
        background: var(--bg-primary);
        border-radius: var(--border-radius-lg);
        border: 1px solid rgba(0, 255, 133, 0.1);
        overflow: hidden;
        transition: all var(--transition-base);
    }
    
    .faq-item:hover {
        border-color: var(--accent-green);
    }
    
    .faq-question {
        padding: var(--spacing-lg);
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: all var(--transition-base);
    }
    
    .faq-question:hover {
        background: rgba(0, 255, 133, 0.05);
    }
    
    .faq-question h3 {
        color: var(--text-primary);
        margin: 0;
        font-size: var(--font-size-lg);
    }
    
    .faq-toggle {
        width: 30px;
        height: 30px;
        background: var(--accent-green);
        color: var(--text-dark);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--font-size-xl);
        font-weight: bold;
        transition: all var(--transition-base);
    }
    
    .faq-item.active .faq-toggle {
        transform: rotate(45deg);
    }
    
    .faq-answer {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease;
    }
    
    .faq-answer p {
        padding: 0 var(--spacing-lg) var(--spacing-lg);
        margin: 0;
        color: var(--text-secondary);
        line-height: 1.6;
    }
    
    @media (max-width: 768px) {
        .contacts-hero__title {
            font-size: var(--font-size-4xl);
        }
        
        .contact-info__grid {
            grid-template-columns: 1fr;
        }
        
        .contact-form-wrapper {
            grid-template-columns: 1fr;
            gap: var(--spacing-2xl);
        }
        
        .main-contact-form {
            grid-template-columns: 1fr;
        }
        
        .social-grid {
            grid-template-columns: 1fr;
        }
        
        .map-placeholder {
            height: 300px;
        }
    }
`;
document.head.appendChild(contactsStyles);
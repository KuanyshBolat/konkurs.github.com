// Services page functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeServiceTabs();
    initializeServiceForms();
    initializeServiceAnimations();
});

// Service tabs functionality
function initializeServiceTabs() {
    const tabs = document.querySelectorAll('.services-nav__tab');
    const serviceDetails = document.querySelectorAll('.service-detail');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetService = this.dataset.service;
            
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all service details
            serviceDetails.forEach(detail => {
                detail.classList.remove('active');
                detail.style.opacity = '0';
                detail.style.transform = 'translateY(20px)';
            });
            
            // Show target service detail with animation
            const targetDetail = document.getElementById(targetService);
            if (targetDetail) {
                setTimeout(() => {
                    targetDetail.classList.add('active');
                    targetDetail.style.opacity = '1';
                    targetDetail.style.transform = 'translateY(0)';
                }, 150);
                
                // Scroll to service detail
                setTimeout(() => {
                    targetDetail.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 200);
            }
        });
    });
    
    // Handle URL hash navigation
    function handleHashNavigation() {
        const hash = window.location.hash.substring(1);
        if (hash) {
            const tab = document.querySelector(`[data-service="${hash}"]`);
            if (tab) {
                tab.click();
            }
        }
    }
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashNavigation);
    handleHashNavigation(); // Handle initial hash
}

// Service forms functionality
function initializeServiceForms() {
    const forms = document.querySelectorAll('.quick-form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            // Get service type from parent section
            const serviceSection = form.closest('.service-detail');
            const serviceType = serviceSection ? serviceSection.id : 'unknown';
            data.service_type = serviceType;
            
            // Show loading state
            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Отправляем...';
            submitButton.disabled = true;
            
            // Add loading animation to button
            submitButton.style.position = 'relative';
            submitButton.innerHTML = `
                <span style="opacity: 0.7;">Отправляем...</span>
                <div style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%);">
                    <div style="width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top: 2px solid white; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                </div>
            `;
            
            // Simulate form submission
            setTimeout(() => {
                // Show success message
                showNotification(
                    `Спасибо за интерес к ${getServiceName(serviceType)}! Мы свяжемся с вами в течение часа.`,
                    'success'
                );
                
                // Reset form
                form.reset();
                
                // Reset button
                submitButton.textContent = originalText;
                submitButton.disabled = false;
                submitButton.style.position = '';
                
                // Add success animation to form
                form.style.transform = 'scale(0.98)';
                form.style.opacity = '0.8';
                
                setTimeout(() => {
                    form.style.transform = 'scale(1)';
                    form.style.opacity = '1';
                }, 200);
                
                // Log form data (replace with actual API call)
                console.log('Service form data:', data);
                
                // Track conversion (replace with actual analytics)
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'form_submit', {
                        event_category: 'services',
                        event_label: serviceType,
                        value: 1
                    });
                }
                
            }, 2000);
        });
        
        // Add real-time validation
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
    });
}

// Field validation
function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Remove existing error styles
    field.classList.remove('error');
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
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
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
        if (!phoneRegex.test(value)) {
            isValid = false;
            errorMessage = 'Введите корректный номер телефона';
        }
    }
    
    // Show error if validation failed
    if (!isValid) {
        field.classList.add('error');
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = errorMessage;
        field.parentNode.appendChild(errorElement);
    }
    
    return isValid;
}

// Service animations
function initializeServiceAnimations() {
    // Animate process timeline on scroll
    const processSteps = document.querySelectorAll('.process-step');
    const processObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('animate');
                }, index * 200);
            }
        });
    }, { threshold: 0.5 });
    
    processSteps.forEach(step => {
        processObserver.observe(step);
    });
    
    // Animate tech items
    const techItems = document.querySelectorAll('.tech-item');
    const techObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.transform = 'translateY(0)';
                    entry.target.style.opacity = '1';
                }, index * 100);
            }
        });
    }, { threshold: 0.5 });
    
    techItems.forEach((item, index) => {
        item.style.transform = 'translateY(20px)';
        item.style.opacity = '0';
        item.style.transition = 'all 0.5s ease';
        techObserver.observe(item);
    });
    
    // Parallax effect for service icons
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const serviceIcons = document.querySelectorAll('.service-detail__icon');
        
        serviceIcons.forEach((icon, index) => {
            const speed = 0.1 + (index * 0.05);
            const yPos = scrolled * speed;
            icon.style.transform = `translateY(${yPos}px) rotate(${scrolled * 0.01}deg)`;
        });
    });
}

// Utility functions
function getServiceName(serviceType) {
    const serviceNames = {
        'web': 'веб-разработке',
        'mobile': 'мобильным приложениям',
        'crm': 'CRM-системам',
        'lms': 'LMS-системам'
    };
    return serviceNames[serviceType] || 'нашим услугам';
}

// Add CSS for animations and error states
const servicesStyles = document.createElement('style');
servicesStyles.textContent = `
    /* Services page specific styles */
    .services-hero {
        padding: var(--spacing-4xl) 0 var(--spacing-2xl);
        background: linear-gradient(135deg, rgba(0, 255, 133, 0.05), rgba(255, 214, 0, 0.05));
        margin-top: 80px;
        text-align: center;
    }
    
    .services-hero__title {
        font-size: var(--font-size-5xl);
        margin-bottom: var(--spacing-lg);
    }
    
    .services-hero__subtitle {
        font-size: var(--font-size-lg);
        color: var(--text-secondary);
        max-width: 600px;
        margin: 0 auto;
    }
    
    .services-nav {
        padding: var(--spacing-2xl) 0;
        background: var(--bg-secondary);
        position: sticky;
        top: 80px;
        z-index: 100;
        border-bottom: 1px solid rgba(0, 255, 133, 0.1);
    }
    
    .services-nav__tabs {
        display: flex;
        gap: var(--spacing-md);
        justify-content: center;
        flex-wrap: wrap;
    }
    
    .services-nav__tab {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-md) var(--spacing-lg);
        background: transparent;
        border: 2px solid rgba(0, 255, 133, 0.2);
        border-radius: var(--border-radius-lg);
        color: var(--text-secondary);
        font-size: var(--font-size-base);
        font-weight: 500;
        cursor: pointer;
        transition: all var(--transition-base);
        position: relative;
        overflow: hidden;
    }
    
    .services-nav__tab::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(0, 255, 133, 0.1), transparent);
        transition: left var(--transition-slow);
    }
    
    .services-nav__tab:hover::before,
    .services-nav__tab.active::before {
        left: 100%;
    }
    
    .services-nav__tab:hover,
    .services-nav__tab.active {
        border-color: var(--accent-green);
        color: var(--text-primary);
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
    }
    
    .services-nav__tab.active {
        background: rgba(0, 255, 133, 0.1);
    }
    
    .services-nav__icon {
        font-size: var(--font-size-lg);
    }
    
    .service-detail {
        display: none;
        padding: var(--spacing-4xl) 0;
        transition: all var(--transition-base);
    }
    
    .service-detail.active {
        display: block;
    }
    
    .service-detail__header {
        display: flex;
        align-items: center;
        gap: var(--spacing-2xl);
        margin-bottom: var(--spacing-4xl);
    }
    
    .service-detail__icon {
        width: 80px;
        height: 80px;
        color: var(--accent-green);
        flex-shrink: 0;
    }
    
    .service-detail__icon svg {
        width: 100%;
        height: 100%;
    }
    
    .service-detail__title {
        margin-bottom: var(--spacing-md);
    }
    
    .service-detail__description {
        font-size: var(--font-size-lg);
        color: var(--text-secondary);
    }
    
    .feature-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: var(--spacing-2xl);
        margin-bottom: var(--spacing-4xl);
    }
    
    .feature-item {
        background: var(--bg-secondary);
        padding: var(--spacing-2xl);
        border-radius: var(--border-radius-xl);
        border: 1px solid rgba(0, 255, 133, 0.1);
        transition: all var(--transition-base);
    }
    
    .feature-item:hover {
        transform: translateY(-5px);
        border-color: var(--accent-green);
        box-shadow: var(--shadow-lg);
    }
    
    .feature-item h3 {
        color: var(--text-primary);
        margin-bottom: var(--spacing-md);
    }
    
    .feature-item p {
        margin-bottom: var(--spacing-lg);
    }
    
    .feature-list {
        list-style: none;
        padding: 0;
    }
    
    .feature-list li {
        padding: var(--spacing-xs) 0;
        color: var(--text-secondary);
        position: relative;
        padding-left: var(--spacing-lg);
    }
    
    .feature-list li::before {
        content: '✓';
        position: absolute;
        left: 0;
        color: var(--accent-green);
        font-weight: bold;
    }
    
    .process-timeline {
        display: grid;
        gap: var(--spacing-2xl);
        margin-bottom: var(--spacing-4xl);
    }
    
    .process-step {
        display: flex;
        gap: var(--spacing-lg);
        padding: var(--spacing-xl);
        background: var(--bg-secondary);
        border-radius: var(--border-radius-xl);
        border-left: 4px solid var(--accent-green);
        opacity: 0.7;
        transform: translateX(-20px);
        transition: all var(--transition-slow);
    }
    
    .process-step.animate {
        opacity: 1;
        transform: translateX(0);
    }
    
    .process-step__number {
        width: 40px;
        height: 40px;
        background: var(--accent-green);
        color: var(--text-dark);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        flex-shrink: 0;
    }
    
    .process-step__content h4 {
        color: var(--text-primary);
        margin-bottom: var(--spacing-sm);
    }
    
    .tech-grid {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-md);
        margin-bottom: var(--spacing-4xl);
    }
    
    .tech-item {
        padding: var(--spacing-sm) var(--spacing-md);
        background: rgba(0, 255, 133, 0.1);
        color: var(--accent-green);
        border-radius: var(--border-radius-md);
        font-size: var(--font-size-sm);
        font-weight: 500;
        border: 1px solid rgba(0, 255, 133, 0.2);
        transition: all var(--transition-base);
    }
    
    .tech-item:hover {
        background: var(--accent-green);
        color: var(--text-dark);
        transform: translateY(-2px);
    }
    
    .cta-card {
        background: linear-gradient(135deg, rgba(0, 255, 133, 0.1), rgba(255, 214, 0, 0.1));
        padding: var(--spacing-2xl);
        border-radius: var(--border-radius-xl);
        text-align: center;
        border: 1px solid rgba(0, 255, 133, 0.2);
    }
    
    .cta-card h3 {
        margin-bottom: var(--spacing-md);
    }
    
    .cta-card p {
        margin-bottom: var(--spacing-2xl);
        color: var(--text-secondary);
    }
    
    .quick-form {
        max-width: 500px;
        margin: 0 auto;
    }
    
    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--spacing-md);
        margin-bottom: var(--spacing-md);
    }
    
    .quick-form input,
    .quick-form select,
    .quick-form textarea {
        width: 100%;
        padding: var(--spacing-md);
        background: var(--bg-primary);
        border: 1px solid rgba(0, 255, 133, 0.2);
        border-radius: var(--border-radius-md);
        color: var(--text-primary);
        font-size: var(--font-size-base);
        transition: all var(--transition-base);
    }
    
    .quick-form input:focus,
    .quick-form select:focus,
    .quick-form textarea:focus {
        outline: none;
        border-color: var(--accent-green);
        box-shadow: 0 0 0 3px rgba(0, 255, 133, 0.1);
    }
    
    .quick-form input.error,
    .quick-form select.error,
    .quick-form textarea.error {
        border-color: #ff4757;
        box-shadow: 0 0 0 3px rgba(255, 71, 87, 0.1);
    }
    
    .field-error {
        color: #ff4757;
        font-size: var(--font-size-sm);
        margin-top: var(--spacing-xs);
    }
    
    .quick-form textarea {
        grid-column: 1 / -1;
        resize: vertical;
        min-height: 80px;
    }
    
    .quick-form button {
        grid-column: 1 / -1;
        margin-top: var(--spacing-md);
    }
    
    .nav__link--active {
        color: var(--accent-green) !important;
    }
    
    .nav__link--active::after {
        width: 100% !important;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    @media (max-width: 768px) {
        .services-hero__title {
            font-size: var(--font-size-4xl);
        }
        
        .service-detail__header {
            flex-direction: column;
            text-align: center;
            gap: var(--spacing-lg);
        }
        
        .service-detail__icon {
            width: 60px;
            height: 60px;
        }
        
        .feature-grid {
            grid-template-columns: 1fr;
        }
        
        .form-row {
            grid-template-columns: 1fr;
        }
        
        .services-nav__tabs {
            flex-direction: column;
            align-items: center;
        }
        
        .services-nav__tab {
            width: 100%;
            max-width: 300px;
            justify-content: center;
        }
    }
`;
document.head.appendChild(servicesStyles);
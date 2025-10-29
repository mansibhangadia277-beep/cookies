/**
 * E-commerce Demo Application
 * 
 * This file handles all the e-commerce functionality and integrates with the tracking system.
 * It demonstrates real-world scenarios where Google Ads conversion tracking would be used.
 * 
 * Features:
 * - Shopping cart management
 * - Product interactions
 * - Checkout process
 * - Newsletter signup
 * - Event tracking integration
 */

// ============================================================================
// E-COMMERCE APPLICATION STATE
// ============================================================================

class EcommerceApp {
    constructor() {
        this.cart = [];
        this.products = {
            'laptop': { id: 'laptop', name: 'Gaming Laptop', price: 1299.99, category: 'Computers' },
            'phone': { id: 'phone', name: 'Smartphone', price: 799.99, category: 'Mobile' },
            'headphones': { id: 'headphones', name: 'Wireless Headphones', price: 199.99, category: 'Audio' },
            'tablet': { id: 'tablet', name: 'Tablet', price: 599.99, category: 'Mobile' }
        };
        
        this.initializeApp();
    }

    /**
     * Initialize the e-commerce application
     */
    initializeApp() {
        console.log('🛍️ E-commerce app initialized');
        this.updateCartDisplay();
        this.setupEventListeners();
    }

    /**
     * Setup event listeners for the application
     */
    setupEventListeners() {
        // Add scroll indicator to the page
        this.addScrollIndicator();
        
        // Setup form validation
        this.setupFormValidation();
    }

    /**
     * Add scroll progress indicator
     */
    addScrollIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'scroll-indicator';
        indicator.style.width = '0%';
        document.body.appendChild(indicator);
    }

    /**
     * Setup form validation
     */
    setupFormValidation() {
        const forms = document.querySelectorAll('input[required]');
        forms.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
        });
    }

    /**
     * Validate form field
     */
    validateField(field) {
        if (field.value.trim() === '') {
            field.style.borderColor = '#e74c3c';
            return false;
        } else {
            field.style.borderColor = '#27ae60';
            return true;
        }
    }

    /**
     * Add item to cart
     * @param {string} productId - Product ID
     * @param {string} productName - Product name
     * @param {number} price - Product price
     */
    addToCart(productId, productName, price) {
        const product = this.products[productId];
        if (!product) {
            console.error('Product not found:', productId);
            return;
        }

        // Check if item already exists in cart
        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                id: productId,
                name: productName,
                price: price,
                category: product.category,
                quantity: 1
            });
        }

        // Track add to cart event
        window.ga4Tracker.trackAddToCart({
            id: productId,
            name: productName,
            price: price,
            category: product.category
        });

        this.updateCartDisplay();
        this.showNotification(`${productName} added to cart!`, 'success');
    }

    /**
     * Remove item from cart
     * @param {string} productId - Product ID
     */
    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.updateCartDisplay();
        this.showNotification('Item removed from cart', 'info');
    }

    /**
     * Update cart quantity
     * @param {string} productId - Product ID
     * @param {number} quantity - New quantity
     */
    updateCartQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                this.updateCartDisplay();
            }
        }
    }

    /**
     * Update cart display
     */
    updateCartDisplay() {
        const cartContainer = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        const proceedButton = document.getElementById('proceed-checkout');

        if (this.cart.length === 0) {
            cartContainer.innerHTML = '<p class="placeholder">Your cart is empty</p>';
            cartTotal.style.display = 'none';
            proceedButton.style.display = 'none';
            return;
        }

        // Show cart items
        cartContainer.innerHTML = this.cart.map(item => `
            <div class="cart-item">
                <div>
                    <h4>${item.name}</h4>
                    <p>$${item.price.toFixed(2)} each</p>
                </div>
                <div>
                    <input type="number" 
                           value="${item.quantity}" 
                           min="1" 
                           max="10"
                           onchange="ecommerceApp.updateCartQuantity('${item.id}', parseInt(this.value))"
                           style="width: 60px; margin-right: 10px;">
                    <button onclick="ecommerceApp.removeFromCart('${item.id}')" 
                            style="background: #e74c3c; color: white; padding: 5px 10px; border: none; border-radius: 3px; cursor: pointer;">
                        Remove
                    </button>
                </div>
            </div>
        `).join('');

        // Calculate and show total
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        document.getElementById('total-amount').textContent = total.toFixed(2);
        cartTotal.style.display = 'block';
        proceedButton.style.display = 'block';
    }

    /**
     * Proceed to checkout
     */
    proceedToCheckout() {
        if (this.cart.length === 0) {
            this.showNotification('Your cart is empty!', 'error');
            return;
        }

        // Track checkout initiation
        window.ga4Tracker.trackCustomEvent('begin_checkout', {
            event_category: 'ecommerce',
            event_label: 'checkout_start',
            value: this.getCartTotal(),
            currency: 'USD',
            items: this.cart
        });

        // Update checkout total
        document.getElementById('checkout-total').textContent = this.getCartTotal().toFixed(2);
        
        // Navigate to checkout
        document.getElementById('checkout').scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * Complete purchase
     */
    completePurchase() {
        // Validate form
        const requiredFields = ['customer-name', 'customer-email', 'customer-phone', 'address', 'city', 'zipcode'];
        let isValid = true;

        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        if (!isValid) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        // Track purchase event
        const purchaseData = {
            total: this.getCartTotal(),
            currency: 'USD',
            items: this.cart.map(item => ({
                item_id: item.id,
                item_name: item.name,
                item_category: item.category,
                price: item.price,
                quantity: item.quantity
            }))
        };

        window.ga4Tracker.trackPurchase(purchaseData);

        // Store order details
        const orderDetails = {
            orderId: 'ORD' + Date.now(),
            customer: {
                name: document.getElementById('customer-name').value,
                email: document.getElementById('customer-email').value,
                phone: document.getElementById('customer-phone').value
            },
            shipping: {
                address: document.getElementById('address').value,
                city: document.getElementById('city').value,
                zipcode: document.getElementById('zipcode').value
            },
            items: this.cart,
            total: this.getCartTotal(),
            timestamp: new Date().toISOString()
        };

        // Store in session storage for demo purposes
        sessionStorage.setItem('lastOrder', JSON.stringify(orderDetails));

        // Clear cart
        this.cart = [];
        this.updateCartDisplay();

        // Show order details on thank you page
        this.showOrderDetails(orderDetails);

        // Navigate to thank you page
        document.getElementById('thankyou').scrollIntoView({ behavior: 'smooth' });

        this.showNotification('Purchase completed successfully!', 'success');
    }

    /**
     * Show order details on thank you page
     */
    showOrderDetails(orderDetails) {
        const orderContainer = document.getElementById('order-details');
        orderContainer.innerHTML = `
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
            <p><strong>Customer:</strong> ${orderDetails.customer.name}</p>
            <p><strong>Email:</strong> ${orderDetails.customer.email}</p>
            <p><strong>Total:</strong> $${orderDetails.total.toFixed(2)}</p>
            <p><strong>Items:</strong> ${orderDetails.items.length}</p>
            <p><strong>Order Time:</strong> ${new Date(orderDetails.timestamp).toLocaleString()}</p>
        `;
    }

    /**
     * Subscribe to newsletter
     */
    subscribeNewsletter() {
        const email = document.getElementById('newsletter-email').value;
        
        if (!email || !this.isValidEmail(email)) {
            this.showNotification('Please enter a valid email address', 'error');
            return;
        }

        // Track newsletter signup
        window.ga4Tracker.trackNewsletterSignup(email);

        // Clear form
        document.getElementById('newsletter-email').value = '';

        this.showNotification('Successfully subscribed to newsletter!', 'success');
    }

    /**
     * Validate email address
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Get cart total
     */
    getCartTotal() {
        return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        // Set background color based on type
        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            info: '#3498db',
            warning: '#f39c12'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        // Add to page
        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// ============================================================================
// GLOBAL FUNCTIONS FOR HTML ONCLICK EVENTS
// ============================================================================

// Initialize e-commerce app
const ecommerceApp = new EcommerceApp();

// Global functions for HTML onclick events
function addToCart(productId, productName, price) {
    ecommerceApp.addToCart(productId, productName, price);
}

function proceedToCheckout() {
    ecommerceApp.proceedToCheckout();
}

function completePurchase() {
    ecommerceApp.completePurchase();
}

function subscribeNewsletter() {
    ecommerceApp.subscribeNewsletter();
}

function trackPageView(pageName, pageTitle) {
    window.ga4Tracker.trackPageView(pageName, pageTitle);
}

// ============================================================================
// DEMO FUNCTIONS FOR TRACKING DEMO SECTION
// ============================================================================

function showCookies() {
    const cookies = window.ga4Tracker.cookieManager.getAllCookies();
    const display = document.getElementById('cookieDisplay');
    
    if (Object.keys(cookies).length === 0) {
        display.textContent = 'No tracking cookies found.';
        return;
    }
    
    let html = '🍪 Tracking Cookies:\n\n';
    Object.entries(cookies).forEach(([name, value]) => {
        html += `${name}: ${value}\n`;
    });
    
    html += `\nTotal: ${Object.keys(cookies).length} cookies`;
    display.textContent = html;
}

function clearCookies() {
    if (confirm('Clear all tracking cookies?')) {
        window.ga4Tracker.cookieManager.clearAllCookies();
        document.getElementById('cookieDisplay').textContent = 'All cookies cleared!';
    }
}

function refreshDataLayer() {
    const display = document.getElementById('dataLayerDisplay');
    display.textContent = JSON.stringify(dataLayer, null, 2);
}

function simulatePageView() {
    window.ga4Tracker.trackPageView('demo_page', 'Demo Page View');
    addToEventLog('Page View', 'Simulated page view event tracked');
}

function simulateScroll() {
    window.ga4Tracker.trackScrollDepth(75);
    addToEventLog('Scroll Event', '75% scroll depth reached');
}

function simulateTimeOnSite() {
    const timeOnSite = Math.floor((Date.now() - startTime) / 1000);
    window.ga4Tracker.trackTimeOnSite(timeOnSite);
    addToEventLog('Time on Site', `${timeOnSite} seconds on site`);
}

function addToEventLog(eventType, eventData) {
    const logBox = document.getElementById('eventLog');
    
    // Remove placeholder if exists
    if (logBox.querySelector('.placeholder')) {
        logBox.innerHTML = '';
    }
    
    const time = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.textContent = `${time} - ${eventType}\n${eventData}\n\n`;
    entry.style.cssText = `
        margin-bottom: 15px;
        padding: 10px;
        background: #f8f9fa;
        border-radius: 6px;
        font-size: 0.85rem;
        border-left: 3px solid #3498db;
    `;
    
    logBox.insertBefore(entry, logBox.firstChild);
}

// ============================================================================
// INITIALIZE DEMO
// ============================================================================

// Initialize data layer display
document.addEventListener('DOMContentLoaded', function() {
    refreshDataLayer();
    
    // Add CSS for notifications
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    console.log('🛍️ E-commerce demo ready!');
});

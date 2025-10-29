/**
 * Google Tag Manager & GA4 Tracking Implementation
 * 
 * This file implements a complete tracking system that simulates:
 * 1. Google Tag Manager data layer
 * 2. GA4 event tracking
 * 3. Cookie management for user identification
 * 4. E-commerce conversion tracking
 * 5. Custom event tracking
 * 
 * Perfect for demonstrating Google Ads conversion tracking in interviews
 */

// ============================================================================
// GLOBAL DATA LAYER - The foundation of all tracking
// ============================================================================

// Initialize data layer (this is what GTM expects)
window.dataLayer = window.dataLayer || [];

// ============================================================================
// COOKIE MANAGEMENT SYSTEM
// ============================================================================

class CookieManager {
    constructor() {
        this.prefix = 'ga_'; // Google Analytics prefix
        this.sessionId = this.generateSessionId();
        console.log('🍪 Cookie Manager initialized');
    }

    /**
     * Generate a unique session ID
     * In real implementation, this would be more sophisticated
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Set a cookie with proper attributes
     * @param {string} name - Cookie name
     * @param {string} value - Cookie value
     * @param {number} days - Expiration days
     * @param {boolean} secure - HTTPS only flag
     */
    setCookie(name, value, days = 30, secure = false) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        
        let cookieString = `${this.prefix}${name}=${value}; expires=${expires.toUTCString()}; path=/`;
        
        if (secure) {
            cookieString += '; secure';
        }
        
        // Add SameSite attribute for better security
        cookieString += '; samesite=lax';
        
        document.cookie = cookieString;
        console.log(`🍪 Cookie set: ${name} = ${value} (expires in ${days} days)`);
        return true;
    }

    /**
     * Get a cookie value by name
     * @param {string} name - Cookie name
     * @returns {string|null} - Cookie value or null if not found
     */
    getCookie(name) {
        const nameEQ = this.prefix + name + "=";
        const ca = document.cookie.split(';');
        
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) {
                const value = c.substring(nameEQ.length, c.length);
                console.log(`🍪 Cookie retrieved: ${name} = ${value}`);
                return value;
            }
        }
        return null;
    }

    /**
     * Delete a cookie
     * @param {string} name - Cookie name
     */
    deleteCookie(name) {
        document.cookie = `${this.prefix}${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        console.log(`🍪 Cookie deleted: ${name}`);
    }

    /**
     * Get all cookies as an object
     * @returns {Object} - All cookies with our prefix
     */
    getAllCookies() {
        const cookies = {};
        const ca = document.cookie.split(';');
        
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i].trim();
            if (c.startsWith(this.prefix)) {
                const key = c.substring(this.prefix.length).split('=')[0];
                const value = c.substring(this.prefix.length).split('=')[1];
                cookies[key] = value;
            }
        }
        
        return cookies;
    }

    /**
     * Clear all tracking cookies
     */
    clearAllCookies() {
        const cookies = this.getAllCookies();
        Object.keys(cookies).forEach(cookieName => {
            this.deleteCookie(cookieName);
        });
        console.log('🍪 All tracking cookies cleared');
    }
}

// ============================================================================
// GA4 TRACKING SYSTEM
// ============================================================================

class GA4Tracker {
    constructor() {
        this.cookieManager = new CookieManager();
        this.userId = this.getOrCreateUserId();
        this.sessionId = this.cookieManager.sessionId;
        this.analytics = {
            pageViews: 0,
            addToCartEvents: 0,
            purchaseEvents: 0,
            newsletterEvents: 0,
            scrollEvents: 0,
            timeOnSite: 0
        };
        
        this.initializeTracking();
        console.log('🎯 GA4 Tracker initialized');
    }

    /**
     * Get existing user ID or create a new one
     * This simulates Google's client ID generation
     */
    getOrCreateUserId() {
        let userId = this.cookieManager.getCookie('client_id');
        
        if (!userId) {
            // Generate a Google-like client ID (timestamp.random)
            userId = Date.now() + '.' + Math.floor(Math.random() * 1000000000);
            this.cookieManager.setCookie('client_id', userId, 365); // 1 year
            console.log('🆕 New user detected, created client ID:', userId);
        } else {
            console.log('👤 Returning user detected, client ID:', userId);
        }
        
        return userId;
    }

    /**
     * Initialize tracking cookies and session
     * This simulates what happens when GTM loads
     */
    initializeTracking() {
        // Set session cookie
        this.cookieManager.setCookie('session_id', this.sessionId, 1); // 1 day
        
        // Set user preferences cookie
        this.cookieManager.setCookie('user_preferences', JSON.stringify({
            language: 'en',
            currency: 'USD',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            screen_resolution: `${screen.width}x${screen.height}`,
            user_agent: navigator.userAgent.substring(0, 100)
        }), 30);
        
        // Set last visit timestamp
        this.cookieManager.setCookie('last_visit', Date.now().toString(), 30);
        
        // Set campaign tracking (simulated UTM parameters)
        this.cookieManager.setCookie('utm_source', 'google', 30);
        this.cookieManager.setCookie('utm_medium', 'cpc', 30);
        this.cookieManager.setCookie('utm_campaign', 'summer_sale_2024', 30);
        this.cookieManager.setCookie('utm_content', 'banner_ad_v1', 30);
        this.cookieManager.setCookie('utm_term', 'electronics', 30);
        
        console.log('🚀 GA4 tracking initialized');
    }

    /**
     * Push event to data layer (GTM method)
     * @param {Object} eventData - Event data to push
     */
    pushToDataLayer(eventData) {
        dataLayer.push(eventData);
        console.log('📊 Event pushed to data layer:', eventData);
        console.log('📊 Current data layer length:', dataLayer.length);
        return eventData;
    }

    /**
     * Track page view (GA4 event)
     * @param {string} pageName - Page name
     * @param {string} pageTitle - Page title
     */
    trackPageView(pageName, pageTitle) {
        const event = {
            event: 'page_view',
            page_location: window.location.href,
            page_title: pageTitle,
            page: pageName,
            user_id: this.userId,
            session_id: this.sessionId,
            timestamp: new Date().toISOString(),
            gtm: {
                uniqueEventId: Math.floor(Math.random() * 1000000)
            }
        };

        this.pushToDataLayer(event);
        this.analytics.pageViews++;
        this.updateAnalyticsDisplay();
        return event;
    }

    /**
     * Track add to cart event (GA4 e-commerce)
     * @param {Object} itemData - Item information
     */
    trackAddToCart(itemData) {
        const event = {
            event: 'add_to_cart',
            currency: 'USD',
            value: itemData.price,
            items: [{
                item_id: itemData.id,
                item_name: itemData.name,
                item_category: itemData.category || 'Electronics',
                price: itemData.price,
                quantity: 1
            }],
            user_id: this.userId,
            session_id: this.sessionId,
            timestamp: new Date().toISOString(),
            gtm: {
                uniqueEventId: Math.floor(Math.random() * 1000000)
            }
        };

        this.pushToDataLayer(event);
        this.analytics.addToCartEvents++;
        this.updateAnalyticsDisplay();
        return event;
    }

    /**
     * Track purchase event (GA4 e-commerce)
     * @param {Object} purchaseData - Purchase information
     */
    trackPurchase(purchaseData) {
        const event = {
            event: 'purchase',
            transaction_id: 'T' + Date.now(),
            value: purchaseData.total,
            currency: 'USD',
            items: purchaseData.items || [],
            user_id: this.userId,
            session_id: this.sessionId,
            timestamp: new Date().toISOString(),
            gtm: {
                uniqueEventId: Math.floor(Math.random() * 1000000)
            }
        };

        this.pushToDataLayer(event);
        this.analytics.purchaseEvents++;
        this.updateAnalyticsDisplay();
        return event;
    }

    /**
     * Track newsletter signup (GA4 custom event)
     * @param {string} email - User email
     */
    trackNewsletterSignup(email) {
        const event = {
            event: 'newsletter_signup',
            event_category: 'engagement',
            event_label: 'newsletter',
            value: 1,
            user_id: this.userId,
            session_id: this.sessionId,
            timestamp: new Date().toISOString(),
            custom_parameters: {
                email_domain: email.split('@')[1]
            },
            gtm: {
                uniqueEventId: Math.floor(Math.random() * 1000000)
            }
        };

        this.pushToDataLayer(event);
        this.analytics.newsletterEvents++;
        this.updateAnalyticsDisplay();
        return event;
    }

    /**
     * Track scroll depth (GA4 engagement event)
     * @param {number} scrollPercent - Scroll percentage
     */
    trackScrollDepth(scrollPercent) {
        const event = {
            event: 'scroll',
            event_category: 'engagement',
            event_label: 'scroll_depth',
            value: scrollPercent,
            user_id: this.userId,
            session_id: this.sessionId,
            timestamp: new Date().toISOString(),
            gtm: {
                uniqueEventId: Math.floor(Math.random() * 1000000)
            }
        };

        this.pushToDataLayer(event);
        this.analytics.scrollEvents++;
        this.updateAnalyticsDisplay();
        return event;
    }

    /**
     * Track time on site (GA4 engagement event)
     * @param {number} timeInSeconds - Time spent on site
     */
    trackTimeOnSite(timeInSeconds) {
        const event = {
            event: 'time_on_site',
            event_category: 'engagement',
            event_label: 'session_duration',
            value: timeInSeconds,
            user_id: this.userId,
            session_id: this.sessionId,
            timestamp: new Date().toISOString(),
            gtm: {
                uniqueEventId: Math.floor(Math.random() * 1000000)
            }
        };

        this.pushToDataLayer(event);
        this.analytics.timeOnSite = timeInSeconds;
        this.updateAnalyticsDisplay();
        return event;
    }

    /**
     * Track custom event
     * @param {string} eventName - Event name
     * @param {Object} eventData - Event data
     */
    trackCustomEvent(eventName, eventData = {}) {
        const event = {
            event: eventName,
            ...eventData,
            user_id: this.userId,
            session_id: this.sessionId,
            timestamp: new Date().toISOString(),
            gtm: {
                uniqueEventId: Math.floor(Math.random() * 1000000)
            }
        };

        this.pushToDataLayer(event);
        console.log('🎯 Custom event tracked:', event);
        this.updateAnalyticsDisplay();
        return event;
    }

    /**
     * Update analytics display
     */
    updateAnalyticsDisplay() {
        // Update metric displays
        const elements = {
            pageViews: this.analytics.pageViews,
            addToCartEvents: this.analytics.addToCartEvents,
            purchaseEvents: this.analytics.purchaseEvents,
            newsletterEvents: this.analytics.newsletterEvents
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    /**
     * Get current analytics data
     */
    getAnalyticsData() {
        return {
            ...this.analytics,
            userId: this.userId,
            sessionId: this.sessionId,
            cookies: this.cookieManager.getAllCookies()
        };
    }
}

// ============================================================================
// SCROLL TRACKING SYSTEM
// ============================================================================

class ScrollTracker {
    constructor(tracker) {
        this.tracker = tracker;
        this.scrollPercentages = [25, 50, 75, 90];
        this.trackedPercentages = new Set();
        this.setupScrollTracking();
    }

    setupScrollTracking() {
        let ticking = false;

        const updateScrollProgress = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = Math.round((scrollTop / docHeight) * 100);

            // Update scroll indicator
            const indicator = document.querySelector('.scroll-indicator');
            if (indicator) {
                indicator.style.width = scrollPercent + '%';
            }

            // Track scroll milestones
            this.scrollPercentages.forEach(percent => {
                if (scrollPercent >= percent && !this.trackedPercentages.has(percent)) {
                    this.trackedPercentages.add(percent);
                    this.tracker.trackScrollDepth(percent);
                    console.log(`📊 Scroll milestone reached: ${percent}%`);
                }
            });

            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollProgress);
                ticking = true;
            }
        });
    }
}

// ============================================================================
// INITIALIZE TRACKING SYSTEM
// ============================================================================

// Create global tracker instance
window.ga4Tracker = new GA4Tracker();

// Initialize scroll tracking
window.scrollTracker = new ScrollTracker(window.ga4Tracker);

// Track initial page view
window.ga4Tracker.trackPageView('landing', 'E-commerce Demo Landing Page');

// Track time on site (simulate)
let startTime = Date.now();
setInterval(() => {
    const timeOnSite = Math.floor((Date.now() - startTime) / 1000);
    if (timeOnSite > 0 && timeOnSite % 30 === 0) { // Every 30 seconds
        window.ga4Tracker.trackTimeOnSite(timeOnSite);
    }
}, 1000);

console.log('🎯 Google Ads Tracking Demo Ready!');
console.log('📊 Data Layer initialized with', dataLayer.length, 'events');
console.log('👤 User ID:', window.ga4Tracker.userId);

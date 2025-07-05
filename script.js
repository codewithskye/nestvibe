// Formspree Endpoints
const FORMSPREE_RENTAL_ENDPOINT = 'https://formspree.io/f/xkgbygwp';
const FORMSPREE_CONTACT_ENDPOINT = 'https://formspree.io/f/myzjvnbq';

document.addEventListener('DOMContentLoaded', () => {
    console.log('[NestVibe] Script initialized');

    // Prevent multiple initializations
    if (window.nestVibeInitialized) {
        console.log('NestVibe already initialized, skipping...');
        return;
    }
    window.nestVibeInitialized = true;

    // Preload critical images
    const criticalImages = ['images/hero-main.jpg'];
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });

    // Global variables
    let isRentalSubmitting = false;
    let isContactSubmitting = false;
    let touchStartY = 0;
    let scrollPosition = 0;

    // DOM Elements
    const elements = {
        modeToggles: document.querySelectorAll('.mode-toggle'),
        menuOpen: document.getElementById('menu-open'),
        menuClose: document.getElementById('menu-close'),
        navLinks: document.querySelector('.links'),
        navRight: document.querySelector('.nav-right'),
        nav: document.getElementById('main-nav'),
        toast: document.querySelector('.toast'),
        rentalForm: document.getElementById('rental-form'),
        contactForm: document.getElementById('contact-form'),
        loader: document.getElementById('loader'),
        chatWidget: document.getElementById('chat-widget'),
        chatToggle: document.getElementById('chat-toggle'),
        chatContainer: document.getElementById('chat-container'),
        chatClose: document.getElementById('chat-close'),
        chatInput: document.getElementById('chat-input'),
        sendMessage: document.getElementById('send-message'),
        chatMessages: document.getElementById('chat-messages'),
        stateSelect: document.getElementById('state-select'),
        citySelect: document.getElementById('city-select'),
        propertyType: document.getElementById('property-type'),
        applyFilter: document.getElementById('apply-filter'),
        filterResults: document.getElementById('filter-results'),
        propsStateSelect: document.getElementById('props-state-select'),
        propsCitySelect: document.getElementById('props-city-select'),
        propsPropertyType: document.getElementById('props-property-type'),
        priceRange: document.getElementById('price-range'),
        applyPropsFilter: document.getElementById('apply-props-filter'),
        propertyGrid: document.getElementById('property-grid')
    };

    // City data by state
    const cityData = {
        'new-york': ['manhattan', 'brooklyn', 'queens', 'bronx', 'staten-island'],
        'texas': ['austin', 'dallas', 'houston', 'san-antonio', 'fort-worth'],
        'california': ['los-angeles', 'san-francisco', 'san-diego', 'oakland', 'sacramento'],
        'florida': ['miami', 'orlando', 'tampa', 'jacksonville', 'fort-lauderdale'],
        'illinois': ['chicago', 'naperville', 'rockford', 'peoria', 'springfield']
    };

    // Property data for filtering
    const propertyData = [
        { state: 'new-york', city: 'manhattan', type: 'studio', price: 2850, name: 'Manhattan Studio' },
        { state: 'texas', city: 'austin', type: 'house', price: 2200, name: 'Austin Family Home' },
        { state: 'florida', city: 'miami', type: 'penthouse', price: 4500, name: 'Miami Penthouse' },
        { state: 'new-york', city: 'brooklyn', type: 'apartment', price: 3200, name: 'Brooklyn Loft' },
        { state: 'texas', city: 'dallas', type: 'apartment', price: 1800, name: 'Dallas Modern Apartment' },
        { state: 'illinois', city: 'chicago', type: 'apartment', price: 2600, name: 'Chicago Cityscape' },
        { state: 'california', city: 'los-angeles', type: 'apartment', price: 3800, name: 'LA Modern Apartment' },
        { state: 'texas', city: 'houston', type: 'house', price: 2100, name: 'Houston Suburban Home' },
        { state: 'california', city: 'san-francisco', type: 'studio', price: 3500, name: 'San Francisco Studio' },
        { state: 'florida', city: 'orlando', type: 'apartment', price: 1650, name: 'Orlando Resort Living' },
        { state: 'new-york', city: 'queens', type: 'apartment', price: 2400, name: 'Queens Family Apartment' },
        { state: 'illinois', city: 'naperville', type: 'house', price: 2800, name: 'Naperville Executive Home' }
    ];

    // Chat responses database
    const chatResponses = {
        'hello': {
            triggers: ['hello', 'hey', 'hi', 'greetings', 'good morning', 'good afternoon', 'good evening'],
            response: 'Hello! Welcome to NestVibe Realty. How can I assist you with finding your perfect rental home across the United States?'
        },
        'how are you': {
            triggers: ['how are you', 'are you okay', 'hows it going', 'how you doing', 'whats up'],
            response: 'I\'m doing great, thank you! I\'m here to help you find the perfect rental property. What can I assist you with today?'
        },
        'price': {
            triggers: ['price', 'cost', 'pricing', 'rent', 'how much', 'expensive', 'cheap', 'affordable', 'budget'],
            response: 'Our properties range from $1,650/month for resort living in Orlando to $4,500/month for a Miami penthouse. We have options in New York ($2,400-$3,200), Texas ($1,800-$2,200), California ($3,500-$3,800), and more. Which location interests you?'
        },
        'availability': {
            triggers: ['availability', 'available', 'vacant', 'open', 'free', 'properties'],
            response: 'We have rentals available across the US including New York (Manhattan, Brooklyn, Queens), Texas (Austin, Dallas, Houston), California (LA, San Francisco), Florida (Miami, Orlando), and Illinois (Chicago, Naperville). Which area are you interested in?'
        },
        'application': {
            triggers: ['application', 'apply', 'form', 'rental application', 'how to apply'],
            response: 'You can apply for a rental through our online form. <button onclick="fillChatInput(\'application process\')" class="btn chat-btn">Tell me about the application process</button> or <a href="rental-application.html" class="btn chat-btn">Apply Now</a>'
        },
        'application process': {
            triggers: ['application process', 'how to apply', 'application steps'],
            response: 'Our application process is simple: 1) Fill out the online form with personal info, 2) Provide employment/income details, 3) Submit credit score and references, 4) Choose payment method. The whole process takes about 10 minutes. Need help with any specific part?'
        },
        'contact': {
            triggers: ['contact', 'reach', 'call', 'email', 'support', 'staff', 'agent'],
            response: 'You can reach us at contact@nestviberealty.com or +1 (555) 123-4567. Want to speak directly with our team? <a href="contact.html" class="btn chat-btn">Contact Our Agents</a>'
        },
        'locations': {
            triggers: ['location', 'locations', 'where', 'city', 'area', 'states'],
            response: 'We offer properties in 5 major states: New York (Manhattan, Brooklyn, Queens), Texas (Austin, Dallas, Houston), California (LA, San Francisco), Florida (Miami, Orlando), and Illinois (Chicago, Naperville). Which state interests you most?'
        },
        'new york': {
            triggers: ['new york', 'nyc', 'manhattan', 'brooklyn', 'queens'],
            response: 'Great choice! In New York, we have: Manhattan Studio ($2,850/month), Brooklyn Loft ($3,200/month), and Queens Family Apartment ($2,400/month). All feature modern amenities and convenient transportation. Which would you like to know more about?'
        },
        'texas': {
            triggers: ['texas', 'austin', 'dallas', 'houston'],
            response: 'Texas offers great value! We have: Austin Family Home ($2,200/month), Dallas Modern Apartment ($1,800/month), and Houston Suburban Home ($2,100/month). Perfect for families and professionals. Which city interests you?'
        },
        'california': {
            triggers: ['california', 'los angeles', 'san francisco', 'la', 'sf'],
            response: 'California properties include: LA Modern Apartment ($3,800/month) and San Francisco Studio ($3,500/month). Both offer premium locations with tech amenities. Which would you prefer?'
        },
        'amenities': {
            triggers: ['amenities', 'features', 'facility', 'facilities', 'perks', 'included'],
            response: 'Our properties include modern amenities like high-speed internet, parking, security, fitness centers, and more. Premium properties offer rooftop access, smart home features, and concierge services. Which property\'s amenities would you like details about?'
        },
        'pets': {
            triggers: ['pet', 'pets', 'dog', 'cat', 'animal', 'pet-friendly'],
            response: 'Most of our properties are pet-friendly! Pet policies vary by location with deposits typically ranging from $200-$500. Properties like our Austin and Houston homes are especially great for pets with yards. Do you have pets?'
        },
        'move-in': {
            triggers: ['move-in', 'move in', 'moving', 'start date', 'when can i move'],
            response: 'Move-in dates vary by property availability. Most can accommodate move-ins within 2-4 weeks. You can specify your preferred date in the application form. When are you planning to move?'
        },
        'lease': {
            triggers: ['lease', 'contract', 'term', 'duration', 'rental term', 'how long'],
            response: 'We offer flexible lease terms! Standard leases are 12 months, but we also have 6-month and month-to-month options for select properties. Longer leases often come with better rates. What term works best for you?'
        },
        'viewing': {
            triggers: ['viewing', 'tour', 'see', 'visit', 'show', 'schedule', 'look at'],
            response: 'We offer virtual tours and in-person viewings! You can schedule a tour through our contact form or by calling us. Virtual tours are available 24/7. Would you prefer virtual or in-person viewing?'
        },
        'deposit': {
            triggers: ['deposit', 'security deposit', 'bond', 'upfront', 'down payment'],
            response: 'Security deposits typically range from 1-2 months rent depending on the property and your credit score. First month\'s rent is due at signing. Some properties offer reduced deposits for excellent credit. Want specifics for a particular property?'
        },
        'maintenance': {
            triggers: ['maintenance', 'repair', 'fix', 'service', 'support', 'broken'],
            response: 'We provide 24/7 maintenance support for all properties! Report issues through our tenant portal, email, or emergency hotline. Most non-emergency repairs are completed within 48 hours. Emergency issues are handled immediately.'
        },
        'payment': {
            triggers: ['payment', 'pay', 'method', 'billing', 'transaction', 'how to pay'],
            response: 'We accept multiple payment methods: Chime, CashApp, Venmo, Apple Pay, PayPal, Zelle, Crypto, and Wire Transfer. Auto-pay discounts available. Rent is due on the 1st of each month. Which payment method do you prefer?'
        },
        'bedrooms': {
            triggers: ['bedroom', 'bedrooms', 'beds', 'how many rooms', 'studio', '1 bed', '2 bed', '3 bed', '4 bed'],
            response: 'We have options for everyone! Studios (Manhattan, San Francisco), 1-2 bedroom apartments (Brooklyn, Dallas, LA), 3 bedroom apartments (Chicago, Queens), and 4 bedroom homes (Houston, Naperville). How many bedrooms do you need?'
        },
        'credit score': {
            triggers: ['credit score', 'credit', 'credit check', 'score required'],
            response: 'We work with various credit scores! Generally, we prefer 650+ but consider applications with 600+. Lower scores may require additional deposit or co-signer. We focus on overall financial picture, not just credit score. What\'s your approximate credit range?'
        },
        'income': {
            triggers: ['income', 'salary', 'employment', 'job', 'work', 'income requirement'],
            response: 'Typically, we require income to be 3x the monthly rent. For example, our $2,200 Austin home would need $6,600+ monthly income. We accept various income sources including employment, freelance, and investments. Self-employed? We can work with bank statements.'
        },
        'utilities': {
            triggers: ['utilities', 'electric', 'gas', 'water', 'internet', 'cable', 'electricity'],
            response: 'Utility inclusion varies by property. Many include water/trash, some include internet. Electric/gas are typically tenant responsibility. All details are clearly listed in each property description. Want specifics for a particular property?'
        },
        'parking': {
            triggers: ['parking', 'garage', 'car', 'vehicle', 'space'],
            response: 'Most properties include parking! Urban locations (Manhattan, SF) may have paid garage spots ($150-300/month), while suburban properties (Austin, Houston) typically include free parking. Street parking also available in most areas.'
        },
        'neighborhoods': {
            triggers: ['neighborhood', 'area', 'safe', 'safety', 'schools', 'nearby'],
            response: 'All our properties are in safe, desirable neighborhoods! We carefully select locations near good schools, shopping, and transportation. Each listing includes neighborhood highlights and nearby amenities. Which area are you most interested in?'
        },
        'transportation': {
            triggers: ['transportation', 'subway', 'bus', 'train', 'transit', 'commute'],
            response: 'Great transit access at all locations! NYC properties near subway lines, Chicago near L train, SF near BART/Muni. Texas and Florida properties have excellent highway access and some public transit. What\'s your commute needs?'
        },
        'furnished': {
            triggers: ['furnished', 'furniture', 'unfurnished', 'appliances'],
            response: 'We offer both furnished and unfurnished options! Most come with essential appliances (refrigerator, stove, dishwasher). Some premium properties offer full furnishing packages. Unfurnished gives you flexibility to personalize. Which do you prefer?'
        },
        'help': {
            triggers: ['help', 'assistance', 'support', 'confused', 'dont understand'],
            response: 'I\'m here to help! I can assist with: property information, pricing, application process, scheduling tours, neighborhood details, amenities, and more. What specific question do you have? <button onclick="fillChatInput(\'show me properties under $2500\')" class="btn chat-btn">Show properties under $2500</button>'
        },
        'thank you': {
            triggers: ['thank you', 'thanks', 'appreciate', 'helpful'],
            response: 'You\'re very welcome! I\'m glad I could help. Feel free to ask more questions anytime, or if you\'re ready to move forward: <a href="rental-application.html" class="btn chat-btn">Start Your Application</a>'
        },
        'goodbye': {
            triggers: ['goodbye', 'bye', 'see you later', 'talk later', 'thanks bye'],
            response: 'Goodbye! Thanks for your interest in NestVibe Realty. Don\'t hesitate to reach out when you\'re ready to find your perfect home. Have a great day!'
        }
    };

    // Utility Functions
    function showToast(message, isError = false) {
        if (elements.toast) {
            elements.toast.textContent = message;
            elements.toast.className = `toast ${isError ? 'error' : 'success'} show`;
            setTimeout(() => {
                elements.toast.className = 'toast hidden';
            }, 4000);
        }
    }

    function validateForm(form) {
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;

        inputs.forEach(input => {
            input.classList.remove('error');
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('error');
            }
        });

        if (!isValid) {
            showToast('Please fill all required fields.', true);
        }

        return isValid;
    }

    // Mobile Menu Functions
    function openMenu() {
        if (elements.navRight && elements.menuOpen && elements.menuClose && window.innerWidth <= 1024) {
            elements.navRight.classList.add('active');
            elements.menuOpen.style.display = 'none';
            elements.menuClose.style.display = 'block';
            elements.menuClose.style.zIndex = '1001';
            document.body.classList.add('menu-open');
            scrollPosition = window.pageYOffset;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollPosition}px`;
            document.body.style.width = '100%';
        }
    }

    function closeMenu() {
        if (elements.navRight && elements.menuOpen && elements.menuClose) {
            elements.navRight.classList.remove('active');
            elements.menuOpen.style.display = 'block';
            elements.menuClose.style.display = 'none';
            document.body.classList.remove('menu-open');
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            window.scrollTo(0, scrollPosition);
        }
    }

    function handleResize() {
        if (window.innerWidth > 1024) {
            if (elements.navRight && elements.menuOpen && elements.menuClose) {
                elements.navRight.classList.remove('active');
                elements.menuOpen.style.display = 'block';
                elements.menuClose.style.display = 'none';
                document.body.classList.remove('menu-open');
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                window.scrollTo(0, scrollPosition);
            }
        }
    }

    // Form Submission Functions
    async function submitRentalForm(form) {
        if (isRentalSubmitting) return;
        isRentalSubmitting = true;

        const submitBtn = form.querySelector('#submit-btn');
        const submitText = submitBtn?.querySelector('.submit-text');
        const loader = submitBtn?.querySelector('.loader');
        const formFeedback = form.querySelector('.form-feedback');
        const successMessage = formFeedback?.querySelector('.success-message');
        const errorMessage = formFeedback?.querySelector('.error-message');

        if (formFeedback) formFeedback.classList.remove('show');
        if (successMessage) successMessage.classList.remove('show');
        if (errorMessage) errorMessage.classList.remove('show');

        if (submitBtn) submitBtn.disabled = true;
        if (submitText) submitText.classList.add('hidden');
        if (loader) loader.classList.remove('hidden');

        try {
            const formData = new FormData(form);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            const response = await fetch(FORMSPREE_RENTAL_ENDPOINT, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok || response.status === 302) {
                form.reset();
                showToast('✅ Application submitted successfully! We\'ll contact you within 24 hours.');
                if (formFeedback && successMessage) {
                    formFeedback.classList.add('show');
                    successMessage.classList.add('show');
                }
            } else {
                const errorData = await response.json().catch(() => ({}));
                let errorText = `Error submitting application (Status: ${response.status}). Please try again or contact support@nestviberealty.com.`;
                if (response.status === 404) {
                    errorText = 'Error: Rental form service not found. Please contact support@nestviberealty.com to report this issue.';
                } else if (response.status === 403) {
                    errorText = 'Error: Rental form submission not authorized. Please verify the form setup or contact support@nestviberealty.com.';
                } else if (response.status === 429) {
                    errorText = 'Error: Too many submissions. Please try again later or contact support@nestviberealty.com.';
                }
                console.error('Rental form submission failed:', { status: response.status, statusText: response.statusText, errorData });
                showToast(`❌ ${errorText}`, true);
                if (formFeedback && errorMessage) {
                    formFeedback.classList.add('show');
                    errorMessage.classList.add('show');
                }
            }
        } catch (error) {
            let errorText = 'Something went wrong with the rental application. Please try again later or contact support@nestviberealty.com.';
            if (error.name === 'AbortError') {
                errorText = 'Rental form request timed out. Please check your connection and try again.';
            }
            console.error('Rental form submission error:', error);
            showToast(`❌ ${errorText}`, true);
            if (formFeedback && errorMessage) {
                formFeedback.classList.add('show');
                errorMessage.classList.add('show');
            }
        } finally {
            setTimeout(() => {
                isRentalSubmitting = false;
                if (submitBtn) submitBtn.disabled = false;
                if (submitText) submitText.classList.remove('hidden');
                if (loader) loader.classList.add('hidden');
            }, 1000);
        }
    }

    async function submitContactForm(form) {
        if (isContactSubmitting) return;
        isContactSubmitting = true;

        const submitBtn = form.querySelector('#submit-btn');
        const submitText = submitBtn?.querySelector('.submit-text');
        const loader = submitBtn?.querySelector('.loader');
        const formFeedback = form.querySelector('.form-feedback');
        const successMessage = formFeedback?.querySelector('.success-message');
        const errorMessage = formFeedback?.querySelector('.error-message');

        if (formFeedback) formFeedback.classList.remove('show');
        if (successMessage) successMessage.classList.remove('show');
        if (errorMessage) errorMessage.classList.remove('show');

        if (submitBtn) submitBtn.disabled = true;
        if (submitText) submitText.classList.add('hidden');
        if (loader) loader.classList.remove('hidden');

        try {
            const formData = new FormData(form);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            const response = await fetch(FORMSPREE_CONTACT_ENDPOINT, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok || response.status === 302) {
                form.reset();
                showToast('✅ Message sent successfully! We\'ll get back to you soon.');
                if (formFeedback && successMessage) {
                    formFeedback.classList.add('show');
                    successMessage.classList.add('show');
                }
            } else {
                const errorData = await response.json().catch(() => ({}));
                let errorText = `Error sending message (Status: ${response.status}). Please try again or contact support@nestviberealty.com.`;
                if (response.status === 404) {
                    errorText = 'Error: Contact form service not found. Please contact support@nestviberealty.com to report this issue.';
                } else if (response.status === 403) {
                    errorText = 'Error: Contact form submission not authorized. Please verify the form setup or contact support@nestviberealty.com.';
                } else if (response.status === 429) {
                    errorText = 'Error: Too many submissions. Please try again later or contact support@nestviberealty.com.';
                }
                console.error('Contact form submission failed:', { status: response.status, statusText: response.statusText, errorData });
                showToast(`❌ ${errorText}`, true);
                if (formFeedback && errorMessage) {
                    formFeedback.classList.add('show');
                    errorMessage.classList.add('show');
                }
            }
        } catch (error) {
            let errorText = 'Something went wrong with the contact form. Please try again later or contact support@nestviberealty.com.';
            if (error.name === 'AbortError') {
                errorText = 'Contact form request timed out. Please check your connection and try again.';
            }
            console.error('Contact form submission error:', error);
            showToast(`❌ ${errorText}`, true);
            if (formFeedback && errorMessage) {
                formFeedback.classList.add('show');
                errorMessage.classList.add('show');
            }
        } finally {
            setTimeout(() => {
                isContactSubmitting = false;
                if (submitBtn) submitBtn.disabled = false;
                if (submitText) submitText.classList.remove('hidden');
                if (loader) loader.classList.add('hidden');
            }, 1000);
        }
    }

    // Chat Functions
    function addChatMessage(message, sender = 'bot') {
        if (!elements.chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        const messageContent = document.createElement('p');
        messageContent.innerHTML = message;
        messageDiv.appendChild(messageContent);

        elements.chatMessages.appendChild(messageDiv);
        elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    }

    function getChatResponse(message) {
        const lowerMessage = message.toLowerCase().trim();

        if (lowerMessage.includes('under') && lowerMessage.includes('$')) {
            const priceMatch = lowerMessage.match(/\$?(\d+)/);
            if (priceMatch) {
                const maxPrice = parseInt(priceMatch[1]);
                const affordableProperties = propertyData.filter(prop => prop.price <= maxPrice);
                if (affordableProperties.length > 0) {
                    const propertyList = affordableProperties.map(prop =>
                        `• ${prop.name} - $${prop.price}/month`
                    ).join('<br>');
                    return `Here are properties under $${maxPrice}:<br><br>${propertyList}<br><br><a href="properties.html" class="btn chat-btn small">View All Properties</a>`;
                }
                return `I don't currently have properties under $${maxPrice}, but our most affordable option is the Orlando Resort Living at $1,650/month. <a href="properties.html" class="btn chat-btn small">See All Options</a>`;
            }
        }

        for (const [key, data] of Object.entries(chatResponses)) {
            if (data.triggers.some(trigger => lowerMessage.includes(trigger))) {
                return data.response;
            }
        }

        return `I'm not sure how to answer that, but I can help with these topics:<br><br>
            <button onclick="fillChatInput('show me properties under $2500')" class="btn chat-btn small">Properties under $2500</button>
            <button onclick="fillChatInput('pet-friendly properties')" class="btn chat-btn small">Pet-friendly properties</button>
            <button onclick="fillChatInput('application process')" class="btn chat-btn small">Application process</button><br><br>
            Still need help? <a href="contact.html" class="btn chat-btn small">Contact Us</a>`;
    }

    function playNotificationSound(type = 'send') {
        try {
            const audio = new Audio(type === 'send' ? 'audio1.mp3' : 'audio1.mp3');
            audio.play().catch(error => {
                console.log('Audio playback failed:', error);
            });
        } catch (error) {
            console.log('Audio not available:', error);
        }
    }

    function sendChatMessage() {
        if (!elements.chatInput) return;

        const message = elements.chatInput.value.trim();
        if (!message) return;

        playNotificationSound('send');
        addChatMessage(message, 'user');
        elements.chatInput.value = '';

        showTypingIndicator();

        setTimeout(() => {
            hideTypingIndicator();
            const response = getChatResponse(message);
            addChatMessage(response, 'bot');
            playNotificationSound('receive');
        }, 1000);
    }

    function showTypingIndicator() {
        if (!elements.chatMessages) return;

        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <p>
                <div class="typing-dots">
                    <span></span><span></span><span></span>
                </div>
            </p>
        `;

        elements.chatMessages.appendChild(typingDiv);
        elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    }

    function hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    function toggleChat(e) {
        console.log('[NestVibe] toggleChat triggered, window.innerWidth:', window.innerWidth);
        if (!elements.chatContainer) {
            console.log('[NestVibe] chatContainer not found');
            return;
        }

        if (window.innerWidth <= 768) {
            console.log('[NestVibe] Mobile view detected, redirecting to chat.html');
            window.location.href = 'chat.html';
        } else {
            console.log('[NestVibe] Desktop view, toggling chat container');
            const isActive = elements.chatContainer.classList.contains('active');
            elements.chatContainer.classList.toggle('active');

            const chatNotification = document.getElementById('chat-notification');
            if (!isActive && chatNotification) {
                chatNotification.style.display = 'none';
            }

            if (!isActive && elements.chatInput) {
                setTimeout(() => elements.chatInput.focus(), 100);
            }
        }
    }

    window.fillChatInput = function(query) {
        if (elements.chatInput) {
            elements.chatInput.value = query;
            elements.chatInput.focus();
            sendChatMessage();
        }
    };

    // Filter Functions
    function updateCityOptions(stateValue, citySelectElement) {
        if (!citySelectElement) return;

        citySelectElement.innerHTML = '<option value="">All Cities</option>';

        if (stateValue && cityData[stateValue]) {
            cityData[stateValue].forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city.charAt(0).toUpperCase() + city.slice(1).replace('-', ' ');
                citySelectElement.appendChild(option);
            });
        }
    }

    function filterProperties() {
        const state = elements.stateSelect?.value || '';
        const city = elements.citySelect?.value || '';
        const type = elements.propertyType?.value || '';

        const filtered = propertyData.filter(property => {
            return (!state || property.state === state) &&
                   (!city || property.city === city) &&
                   (!type || property.type === type);
        });

        displayFilterResults(filtered);
    }

    function filterPropertiesPage() {
        const state = elements.propsStateSelect?.value || '';
        const city = elements.propsCitySelect?.value || '';
        const type = elements.propsPropertyType?.value || '';
        const priceRange = elements.priceRange?.value || '';

        if (!elements.propertyGrid) {
            console.error('[NestVibe] propertyGrid not found');
            return;
        }

        const cards = elements.propertyGrid.querySelectorAll('.property-card');

        if (cards.length === 0) {
            console.warn('[NestVibe] No property-card elements found in propertyGrid');
        }

        cards.forEach(card => {
            const cardState = card.dataset.state || '';
            const cardCity = card.dataset.city || '';
            const cardType = card.dataset.type || '';
            const cardPrice = parseInt(card.dataset.price) || 0;

            let priceMatch = true;
            if (priceRange) {
                if (priceRange === '1000-2000') priceMatch = cardPrice >= 1000 && cardPrice <= 2000;
                else if (priceRange === '2000-3000') priceMatch = cardPrice >= 2000 && cardPrice <= 3000;
                else if (priceRange === '3000-4000') priceMatch = cardPrice >= 3000 && cardPrice <= 4000;
                else if (priceRange === '4000+') priceMatch = cardPrice >= 4000;
            }

            const matches = (!state || cardState === state) &&
                           (!city || cardCity === city) &&
                           (!type || cardType === type) &&
                           priceMatch;

            if (matches) {
                card.style.display = 'block';
                card.classList.add('visible');
                console.log(`[NestVibe] Showing card: ${card.dataset.name || 'unknown'}, Classes: ${card.className}`);
            } else {
                card.style.display = 'none';
                card.classList.remove('visible');
                console.log(`[NestVibe] Hiding card: ${card.dataset.name || 'unknown'}`);
            }
        });

        // Reinitialize animations to catch any missed elements
        initScrollAnimations();
    }

    function displayFilterResults(properties) {
        if (!elements.filterResults) return;

        const resultsCount = document.getElementById('results-count');
        const filteredProperties = document.getElementById('filtered-properties');

        if (resultsCount) {
            resultsCount.textContent = `Found ${properties.length} ${properties.length === 1 ? 'property' : 'properties'}`;
        }

        if (filteredProperties) {
            if (properties.length === 0) {
                filteredProperties.innerHTML = '<p>No properties found matching your criteria. Try adjusting your filters.</p>';
            } else {
                filteredProperties.innerHTML = properties.map(property => `
                    <div class="rental-card mobile-scroll">
                        <div class="rental-image" style="background-image: url('images/hero-main.jpg')"></div>
                        <h3>${property.name}</h3>
                        <p>$${property.price}/month | ${property.city.replace('-', ' ')} | ${property.type}</p>
                        <a href="rental-application.html" class="btn rental-btn">Rent Now</a>
                    </div>
                `).join('');
            }
            // Reinitialize scroll animations for new elements
            initScrollAnimations();
            console.log('[NestVibe] Reinitialized scroll animations for rental-card elements');
        }
    }

    // Navigation scroll behavior
    let lastScrollY = 0;

    function updateNavigation() {
        if (!elements.nav) return;

        const scrollY = window.scrollY;

        if (scrollY > lastScrollY && scrollY > 100) {
            elements.nav.classList.add('hidden-nav');
        } else {
            elements.nav.classList.remove('hidden-nav');
            if (scrollY > 100) {
                elements.nav.classList.add('scrolled');
            } else {
                elements.nav.classList.remove('scrolled');
            }
        }

        lastScrollY = scrollY;
    }

    function initScrollAnimations() {
        // Clean up existing observer
        if (window.scrollObserver) {
            window.scrollObserver.disconnect();
        }

        // Configure Intersection Observer
        window.scrollObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    console.log(`[NestVibe] Observing element: ${entry.target.className}, Intersecting: ${entry.isIntersecting}`);
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        window.scrollObserver.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: window.innerWidth <= 768 ? 0.01 : 0.15,
                rootMargin: window.innerWidth <= 768 ? '-50px 0px' : '30px 0px'
            }
        );

        // Select elements to observe
        const elementsToObserve = document.querySelectorAll(
            '.mobile-scroll, .slide-in-left, .slide-in-right, .fade-in, .form-side, .property-card, .rental-card, .hero-title, .hero-text, .hero-btn'
        );

        // Log for debugging
        console.log(`[NestVibe] Found ${elementsToObserve.length} elements to observe`);

        // Observe all elements
        elementsToObserve.forEach((el) => {
            if (el && !el.hasAttribute('data-observed')) {
                el.setAttribute('data-observed', 'true');
                window.scrollObserver.observe(el);
            }
        });

        // Fallback: Force visibility after 2 seconds for mobile
        if (window.innerWidth <= 768) {
            setTimeout(() => {
                elementsToObserve.forEach((el) => {
                    if (!el.classList.contains('visible')) {
                        el.classList.add('visible');
                        console.log(`[NestVibe] Fallback: Forced visibility for ${el.className}`);
                    }
                });
            }, 2000);
        }
    }

    // Event Listeners Setup
    function setupEventListeners() {
        elements.modeToggles.forEach(toggle => {
            if (!toggle.hasAttribute('data-listener-added')) {
                toggle.setAttribute('data-listener-added', 'true');
                toggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    document.body.classList.toggle('dark-mode');
                    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
                });
            }
        });

        if (elements.menuOpen && !elements.menuOpen.hasAttribute('data-listener-added')) {
            elements.menuOpen.setAttribute('data-listener-added', 'true');
            elements.menuOpen.addEventListener('click', (e) => {
                e.preventDefault();
                openMenu();
            });
        }

        if (elements.menuClose && !elements.menuClose.hasAttribute('data-listener-added')) {
            elements.menuClose.setAttribute('data-listener-added', 'true');
            elements.menuClose.addEventListener('click', (e) => {
                e.preventDefault();
                closeMenu();
            });
        }

        if (elements.navLinks) {
            elements.navLinks.querySelectorAll('a').forEach(link => {
                if (!link.hasAttribute('data-listener-added')) {
                    link.setAttribute('data-listener-added', 'true');
                    link.addEventListener('click', closeMenu);
                }
            });
        }

        if (elements.rentalForm && !elements.rentalForm.hasAttribute('data-listener-added')) {
            elements.rentalForm.setAttribute('data-listener-added', 'true');
            elements.rentalForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                if (!validateForm(elements.rentalForm)) return;
                await submitRentalForm(elements.rentalForm);
            });
        }

        if (elements.contactForm && !elements.contactForm.hasAttribute('data-listener-added')) {
            elements.contactForm.setAttribute('data-listener-added', 'true');
            elements.contactForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                if (!validateForm(elements.contactForm)) return;
                await submitContactForm(elements.contactForm);
            });
        }

        window.addEventListener('resize', handleResize, { passive: true });

        if (elements.chatToggle && !elements.chatToggle.hasAttribute('data-listener-added')) {
            elements.chatToggle.setAttribute('data-listener-added', 'true');
            elements.chatToggle.addEventListener('click', toggleChat);
        }

        if (elements.chatClose && !elements.chatClose.hasAttribute('data-listener-added')) {
            elements.chatClose.setAttribute('data-listener-added', 'true');
            elements.chatClose.addEventListener('click', toggleChat);
        }

        if (elements.sendMessage && !elements.sendMessage.hasAttribute('data-listener-added')) {
            elements.sendMessage.setAttribute('data-listener-added', 'true');
            elements.sendMessage.addEventListener('click', sendChatMessage);
        }

        if (elements.chatInput && !elements.chatInput.hasAttribute('data-listener-added')) {
            elements.chatInput.setAttribute('data-listener-added', 'true');
            elements.chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendChatMessage();
                }
            });
            elements.chatInput.addEventListener('touchstart', (e) => {
                e.target.focus();
            }, { passive: true });
        }

        if (elements.stateSelect && !elements.stateSelect.hasAttribute('data-listener-added')) {
            elements.stateSelect.setAttribute('data-listener-added', 'true');
            elements.stateSelect.addEventListener('change', (e) => {
                updateCityOptions(e.target.value, elements.citySelect);
            });
        }

        if (elements.applyFilter && !elements.applyFilter.hasAttribute('data-listener-added')) {
            elements.applyFilter.setAttribute('data-listener-added', 'true');
            elements.applyFilter.addEventListener('click', filterProperties);
        }

        if (elements.propsStateSelect && !elements.propsStateSelect.hasAttribute('data-listener-added')) {
            elements.propsStateSelect.setAttribute('data-listener-added', 'true');
            elements.propsStateSelect.addEventListener('change', (e) => {
                updateCityOptions(e.target.value, elements.propsCitySelect);
            });
        }

        if (elements.applyPropsFilter && !elements.applyPropsFilter.hasAttribute('data-listener-added')) {
            elements.applyPropsFilter.setAttribute('data-listener-added', 'true');
            elements.applyPropsFilter.addEventListener('click', filterPropertiesPage);
        }

        window.addEventListener('scroll', updateNavigation, { passive: true });

        document.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (document.body.classList.contains('menu-open') && !e.target.closest('form') && !e.target.closest('.chat-container')) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    // Initialization
    function init() {
        if (localStorage.getItem('darkMode') === 'true') {
            document.body.classList.add('dark-mode');
        }

        if (elements.loader) {
            setTimeout(() => {
                elements.loader.classList.add('hidden');
            }, 2000);
        }

        setupEventListeners();
        initScrollAnimations();

        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        if (elements.navLinks) {
            elements.navLinks.querySelectorAll('a').forEach(link => {
                const linkPath = link.getAttribute('href');
                if (linkPath === currentPath || (currentPath === '' && linkPath === 'index.html')) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }

        console.log('[NestVibe] Initialization complete');
    }

    init();
});

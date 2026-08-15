// Modal State Management
const modalOverlay = document.getElementById('auth-modal');
const signupView = document.getElementById('signup-form');
const loginView = document.getElementById('login-form');

// Mobile Menu Toggle
window.toggleMenu = function() {
    const navLinks = document.getElementById('nav-links');
    if (navLinks) {
        navLinks.classList.toggle('show');
    }
}

// Open the modal (specify 'login' or 'signup')
window.openModal = function(type, module = null) {
    modalOverlay.classList.add('show');
    window.switchView(type);
    
    if (type === 'signup') {
        const title = document.getElementById('signup-title');
        const desc = document.getElementById('signup-desc');
        const select = document.getElementById('module-select');
        
        if (module === 'eduflow') {
            if (title) title.innerText = "Configure Academic Portal";
            if (desc) desc.innerText = "Provision your EduFlow environment.";
            if (select) select.value = 'eduflow';
        } else {
            if (title) title.innerText = "Configure Enterprise Pilot";
            if (desc) desc.innerText = "Provision your secure environment.";
            if (select && module) {
                select.value = module;
            } else if (select) {
                select.value = 'oee';
            }
        }
    }
}

// Close the modal
window.closeModal = function() {
    modalOverlay.classList.remove('show');
}

// Switch between Login and Signup forms inside the modal
window.switchView = function(type) {
    if (type === 'signup') {
        loginView.classList.remove('active');
        signupView.classList.add('active');
    } else {
        signupView.classList.remove('active');
        loginView.classList.add('active');
    }
}

// Handle Form Submission (The Prototype Redirection)
window.handleAuth = function(event) {
    event.preventDefault(); // Prevent page reload
    
    const submitBtn = event.target.querySelector('.submit-btn');
    const originalText = submitBtn.innerText;
    
    // Simulate network delay for realism
    submitBtn.innerText = "Authenticating...";
    submitBtn.style.opacity = "0.7";
    
    setTimeout(() => {
        // Retrieve the company name and module if they signed up
        const companyInput = document.getElementById('company');
        const moduleSelect = document.getElementById('module-select');
        
        if (companyInput && companyInput.value) {
            localStorage.setItem('companyName', companyInput.value);
        }
        if (moduleSelect && moduleSelect.value) {
            localStorage.setItem('selectedModule', moduleSelect.value);
        }

        // REDIRECT TO YOUR DASHBOARD
        // Ensure your previous file is named dashboard.html
        window.open('dashboard.html', '_blank');
        
        // Reset the button state
        submitBtn.innerText = originalText;
        submitBtn.style.opacity = "1";
        closeModal();
    }, 1200);
}

// Validation for Google SSO Button and Submit Button
window.validateSSO = function() {
    const companyInput = document.getElementById('company');
    const moduleSelect = document.getElementById('module-select');
    const termsCheckbox = document.getElementById('terms-checkbox');
    const googleSsoBtn = document.getElementById('google-sso-btn');
    const submitBtn = document.querySelector('#signup-form .submit-btn');
    
    if (companyInput && moduleSelect && termsCheckbox) {
        const companyFilled = companyInput.value.trim() !== '';
        const moduleSelected = !moduleSelect.options[moduleSelect.selectedIndex].disabled;
        const termsAccepted = termsCheckbox.checked;
        
        const isValid = companyFilled && moduleSelected && termsAccepted;
        
        if (googleSsoBtn) googleSsoBtn.disabled = !isValid;
        if (submitBtn) submitBtn.disabled = !isValid;
    }
}

// Attach listeners for SSO validation
const companyInput = document.getElementById('company');
const moduleSelect = document.getElementById('module-select');
const termsCheckbox = document.getElementById('terms-checkbox');

if (companyInput) companyInput.addEventListener('input', window.validateSSO);
if (moduleSelect) moduleSelect.addEventListener('change', window.validateSSO);
if (termsCheckbox) termsCheckbox.addEventListener('change', window.validateSSO);

// Close modal if user clicks outside the card
modalOverlay.addEventListener('click', function(e) {
    if (e.target === modalOverlay) {
        closeModal();
    }
});

// Pitch Deck Slider Logic
let slideIndex = 1;

// Initialize the slider only if it exists on the page
if (document.querySelector('.slide')) {
    showSlides(slideIndex);
}

// Next/previous controls
window.changeSlide = function(n) {
    showSlides(slideIndex += n);
}

// Thumbnail image controls
window.currentSlide = function(n) {
    showSlides(slideIndex = n);
}

function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("slide");
    let dots = document.getElementsByClassName("dot");
    
    if (slides.length === 0) return; // Failsafe
    
    if (n > slides.length) { slideIndex = 1 }    
    if (n < 1) { slideIndex = slides.length }
    
    // Hide all slides and remove active class from dots
    for (i = 0; i < slides.length; i++) {
        slides[i].classList.remove("active");  
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].classList.remove("active");
    }
    
    // Show the current slide and highlight the corresponding dot
    slides[slideIndex - 1].classList.add("active");  
    dots[slideIndex - 1].classList.add("active");
}

// --- FIREBASE BACKEND INTEGRATION ---

// 1. Import Firebase dependencies from shared config
import { db, auth, provider, collection, addDoc, serverTimestamp } from "./firebase-config.js";

// 4. Handle Standard Form Submission
const pilotForm = document.getElementById('pilot-form');
if (pilotForm) {
    pilotForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        
        const company = document.getElementById('company-name').value;
        const email = document.getElementById('work-email').value;
        const module = document.getElementById('module-select').value;
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.innerText = "Provisioning...";
        submitBtn.disabled = true;

        try {
            const docRef = await addDoc(collection(db, "enterprise_pilots"), {
                companyName: company,
                workEmail: email,
                selectedModule: module,
                authMethod: "Manual Email",
                status: "Pending Deployment",
                timestamp: serverTimestamp()
            });
            
            console.log("Pilot requested with ID: ", docRef.id);
            alert("Success! Your pilot environment is being provisioned. Our team will contact you shortly.");
            window.location.href = "dashboard.html"; 
            
        } catch (error) {
            console.error("Error adding document: ", error);
            alert("Error provisioning database. Please check console.");
            submitBtn.innerText = "Provision Dashboard";
            submitBtn.disabled = false;
        }
    });
}

// 5. Handle Google Workspace SSO
const googleSsoBtn = document.getElementById('google-sso-btn');
if (googleSsoBtn) {
    googleSsoBtn.addEventListener('click', async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            
            await addDoc(collection(db, "enterprise_pilots"), {
                companyName: "Google Auth User", 
                workEmail: user.email,
                selectedModule: "To Be Determined",
                authMethod: "Google SSO",
                uid: user.uid,
                status: "Pending Deployment",
                timestamp: serverTimestamp()
            });

            alert(`Authenticated successfully as ${user.email}`);
            window.location.href = "dashboard.html";
            
        } catch (error) {
            console.error("SSO Failed: ", error.message);
            alert("Authentication failed. Please try again.");
        }
    });
}

// 6. Handle Client Login Form Submission
const loginForm = document.getElementById('login-form');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Stop the page from refreshing

        // Grab the button to show a loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText;
        submitBtn.innerText = "Authenticating...";
        submitBtn.disabled = true;

        // Simulate a secure network delay for realism during your professor's pitch
        setTimeout(() => {
            // For the prototype, we simulate a successful Access Key verification
            alert("Authentication successful. Securing connection to fleet telemetry...");
            
            // Redirect to the dashboard
            window.location.href = "dashboard.html";
            
            // Reset button just in case the user navigates back
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        }, 1500); 
    });
}

// 7. Dynamic Pricing Logic
const pricingData = {
    eduflow: {
        personal: { price: "₹2999", period: "/mo", desc: "For individual tutors or small classrooms.", features: ["Up to 50 students", "Basic NLP Chatbot", "Core Analytics Dashboard"] },
        business: { price: "₹11,999", period: "/mo", desc: "For mid-sized schools and learning centers.", features: ["Up to 500 students", "Advanced Adaptive Curriculum", "Teacher Alert System", "Priority Support"] },
        enterprise: { price: "Custom", period: "", desc: "For universities and large school districts.", features: ["Unlimited students", "Custom LLM Fine-tuning", "SIS Integration", "Dedicated Account Manager"] }
    },
    oee: {
        personal: { price: "₹4999", period: "/mo", desc: "For single-machine monitoring.", features: ["1 Edge Node", "Real-time Telemetry", "Basic Uptime Reports"] },
        business: { price: "₹18,999", period: "/mo", desc: "For small factory floors.", features: ["Up to 10 Edge Nodes", "Automated Shift Reports", "Historical Trends", "Email Alerts"] },
        enterprise: { price: "Custom", period: "", desc: "For full-scale industrial operations.", features: ["Unlimited Edge Nodes", "ERP/MES Integration", "Custom API Access", "24/7 Support"] }
    },
    vision: {
        personal: { price: "₹2999", period: "/mo", desc: "For basic quality inspection.", features: ["1 Camera Stream", "Standard Defect Detection", "Daily Summary Reports"] },
        business: { price: "₹9,999", period: "/mo", desc: "For high-speed production lines.", features: ["Up to 5 Camera Streams", "Custom Defect Training", "Sub-millimeter Accuracy", "Automated Reject System"] },
        enterprise: { price: "Custom", period: "", desc: "For global manufacturing plants.", features: ["Unlimited Streams", "Multi-factory Aggregation", "On-premise Deployment", "Dedicated Engineer"] }
    },
    predictive: {
        personal: { price: "6,999", period: "/mo", desc: "For critical asset monitoring.", features: ["Up to 5 Sensors", "Basic Anomaly Detection", "Maintenance Alerts"] },
        business: { price: "₹21,999", period: "/mo", desc: "For facility-wide maintenance.", features: ["Up to 50 Sensors", "Advanced Failure Prediction", "Vibration & Thermal Analysis", "Maintenance Scheduling"] },
        enterprise: { price: "Custom", period: "", desc: "For heavy industry & energy.", features: ["Unlimited Sensors", "Digital Twin Integration", "RUL (Remaining Useful Life) Models", "SLA Guarantee"] }
    }
};

function renderPricing(model) {
    const grid = document.getElementById('pricing-grid');
    if (!grid) return;
    const data = pricingData[model];
    if (!data) return;

    grid.classList.add('fade-out');
    
    setTimeout(() => {
        grid.innerHTML = `
            <div class="pricing-card">
                <h3 class="pricing-tier">Personal</h3>
                <div class="pricing-price">${data.personal.price}<span>${data.personal.period}</span></div>
                <p class="pricing-desc">${data.personal.desc}</p>
                <ul class="pricing-features">
                    ${data.personal.features.map(f => `<li>${f}</li>`).join('')}
                </ul>
                <button class="pricing-btn" onclick="openModal('signup', '${model}')">Get Started</button>
            </div>
            <div class="pricing-card featured">
                <h3 class="pricing-tier">Business</h3>
                <div class="pricing-price">${data.business.price}<span>${data.business.period}</span></div>
                <p class="pricing-desc">${data.business.desc}</p>
                <ul class="pricing-features">
                    ${data.business.features.map(f => `<li>${f}</li>`).join('')}
                </ul>
                <button class="pricing-btn" onclick="openModal('signup', '${model}')">Start Free Trial</button>
            </div>
            <div class="pricing-card">
                <h3 class="pricing-tier">Enterprise</h3>
                <div class="pricing-price">${data.enterprise.price}<span>${data.enterprise.period}</span></div>
                <p class="pricing-desc">${data.enterprise.desc}</p>
                <ul class="pricing-features">
                    ${data.enterprise.features.map(f => `<li>${f}</li>`).join('')}
                </ul>
                <button class="pricing-btn" onclick="openModal('signup', '${model}')">Contact Sales</button>
            </div>
        `;
        grid.classList.remove('fade-out');
    }, 300); // Wait for fade out animation
}

document.addEventListener('DOMContentLoaded', () => {
    // Setup Pricing Tabs
    const tabs = document.querySelectorAll('.pricing-tab');
    if (tabs.length > 0) {
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                renderPricing(tab.getAttribute('data-model'));
            });
        });
        // Initial render
        renderPricing('eduflow');
    }
});
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
window.openModal = function(type, module = null, tier = 'business') {
    const modalOverlay = document.getElementById('auth-modal');
    modalOverlay.classList.add('show');
    window.switchView(type);
    
    // Pre-select module if coming from a specific CTA
    if (module) {
        const select = document.getElementById('module-select');
        if (select) {
            select.value = module;
        }
        localStorage.setItem('selectedModule', module);
        localStorage.setItem('selectedTier', tier);
    }
    
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

window.handleAuth = async function(event) {
    event.preventDefault(); // Prevent page reload
    
    const form = event.target;
    const submitBtn = form.querySelector('.submit-btn');
    const originalText = submitBtn.innerText;
    
    // Check if it's signup or login
    const isSignup = form.closest('#signup-form') !== null;
    
    if (isSignup) {
        const companyInput = document.getElementById('company');
        const moduleSelect = document.getElementById('module-select');
        const emailInput = document.getElementById('signup-email');
        const passwordInput = document.getElementById('signup-password');
        
        if (companyInput && companyInput.value) {
            localStorage.setItem('companyName', companyInput.value);
        }
        if (moduleSelect && moduleSelect.value) {
            localStorage.setItem('selectedModule', moduleSelect.value);
        }

        submitBtn.innerText = "Provisioning...";
        submitBtn.disabled = true;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
            const user = userCredential.user;
            
            await addDoc(collection(db, "enterprise_pilots"), {
                companyName: companyInput.value,
                workEmail: user.email,
                selectedModule: moduleSelect.value,
                authMethod: "Manual Email/Password",
                uid: user.uid,
                status: "Pending Deployment",
                timestamp: serverTimestamp()
            });
            
            console.log("Pilot requested for UID: ", user.uid);
            alert("Success! Redirecting to checkout...");
            window.location.href = "checkout.html"; 
        } catch (error) {
            console.error("Error signing up: ", error);
            alert("Error: " + error.message);
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        }
    } else {
        // Login Logic
        const emailInput = form.querySelector('input[type="email"]');
        const passwordInput = form.querySelector('input[type="password"]');
        
        submitBtn.innerText = "Authenticating...";
        submitBtn.disabled = true;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
            const user = userCredential.user;
            await handleLoginSuccess(user);
        } catch (error) {
            console.error("Error logging in: ", error);
            alert("Login failed: " + error.message);
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        }
    }
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

import { db, auth, provider, collection, addDoc, serverTimestamp, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, getDocs, query, where } from "./firebase-config.js";

// Standard Form Submission logic moved to handleAuth

async function handleLoginSuccess(user) {
    try {
        const q = query(collection(db, "enterprise_pilots"), where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);
        
        let modules = new Set();
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.selectedModule) {
                modules.add(data.selectedModule);
            }
        });
        
        const moduleArray = Array.from(modules);
        
        if (moduleArray.length === 1) {
            localStorage.setItem("selectedModule", moduleArray[0]);
            alert("Authentication successful. Securing connection to fleet telemetry...");
            window.location.href = "dashboard.html";
        } else if (moduleArray.length > 1) {
            sessionStorage.setItem("availableModules", JSON.stringify(moduleArray));
            window.location.href = "model_select.html";
        } else {
            alert("Authentication successful. Securing connection to fleet telemetry...");
            window.location.href = "dashboard.html";
        }
    } catch (error) {
        console.error("Error fetching modules:", error);
        alert("Error: " + error.message);
    }
}

// 5. Handle Google Workspace SSO (Signup)
const googleSsoBtn = document.getElementById('google-sso-btn');
if (googleSsoBtn) {
    googleSsoBtn.addEventListener('click', async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            
            const companyInput = document.getElementById('company');
            const moduleSelect = document.getElementById('module-select');
            
            const companyName = companyInput && companyInput.value ? companyInput.value : "Google Auth User";
            const selectedModule = moduleSelect && moduleSelect.value ? moduleSelect.value : "To Be Determined";
            
            if (companyInput && companyInput.value) {
                localStorage.setItem('companyName', companyInput.value);
            }
            if (moduleSelect && moduleSelect.value) {
                localStorage.setItem('selectedModule', moduleSelect.value);
            }
            
            await addDoc(collection(db, "enterprise_pilots"), {
                companyName: companyName, 
                workEmail: user.email,
                selectedModule: selectedModule,
                selectedTier: localStorage.getItem('selectedTier') || 'business',
                authMethod: "Google SSO",
                uid: user.uid,
                status: "Pending Deployment",
                timestamp: serverTimestamp()
            });

            alert(`Authenticated successfully as ${user.email}`);
            window.location.href = "checkout.html";
            
        } catch (error) {
            console.error("SSO Failed: ", error.message);
            alert("Authentication failed. Please try again.");
        }
    });
}

// 5b. Handle Google Workspace SSO (Login)
const googleLoginSsoBtn = document.getElementById('google-login-sso-btn');
if (googleLoginSsoBtn) {
    googleLoginSsoBtn.addEventListener('click', async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            
            await handleLoginSuccess(user);
            
        } catch (error) {
            console.error("SSO Failed: ", error.message);
            alert("Authentication failed. Please try again.");
        }
    });
}

// Login form submission logic moved to handleAuth

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
                <button class="pricing-btn" onclick="openModal('signup', '${model}', 'personal')">Get Started</button>
            </div>
            <div class="pricing-card featured">
                <h3 class="pricing-tier">Business</h3>
                <div class="pricing-price">${data.business.price}<span>${data.business.period}</span></div>
                <p class="pricing-desc">${data.business.desc}</p>
                <ul class="pricing-features">
                    ${data.business.features.map(f => `<li>${f}</li>`).join('')}
                </ul>
                <button class="pricing-btn" onclick="openModal('signup', '${model}', 'business')">Start Free Trial</button>
            </div>
            <div class="pricing-card">
                <h3 class="pricing-tier">Enterprise</h3>
                <div class="pricing-price">${data.enterprise.price}<span>${data.enterprise.period}</span></div>
                <p class="pricing-desc">${data.enterprise.desc}</p>
                <ul class="pricing-features">
                    ${data.enterprise.features.map(f => `<li>${f}</li>`).join('')}
                </ul>
                <button class="pricing-btn" onclick="openModal('signup', '${model}', 'enterprise')">Contact Sales</button>
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
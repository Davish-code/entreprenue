// Modal State Management
const modalOverlay = document.getElementById('auth-modal');
const signupView = document.getElementById('signup-form');
const loginView = document.getElementById('login-form');

// Open the modal (specify 'login' or 'signup')
window.openModal = function(type) {
    modalOverlay.classList.add('show');
    switchView(type);
}

// Close the modal
window.closeModal = function() {
    modalOverlay.classList.remove('show');
}

// Switch between Login and Signup forms inside the modal
function switchView(type) {
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
        // Retrieve the company name if they signed up (for custom UX)
        const companyInput = document.getElementById('company');
        if (companyInput && companyInput.value) {
            // Save to localStorage so the dashboard can read it
            localStorage.setItem('companyName', companyInput.value);
        }

        // REDIRECT TO YOUR DASHBOARD
        // Ensure your previous file is named dashboard.html
        window.location.href = 'dashboard.html';
    }, 1200);
}

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

// 1. Import Firebase dependencies directly from the CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// 2. PASTE YOUR FIREBASE CONFIG HERE
const firebaseConfig = {
    apiKey: "AIzaSyC6A09UYfNJH84hdnCa1YRhJa_7SJplNt0",
    authDomain: "entrepre-d7396.firebaseapp.com",
    projectId: "entrepre-d7396",
    storageBucket: "entrepre-d7396.firebasestorage.app",
    messagingSenderId: "630944878630",
    appId: "1:630944878630:web:bc525e1c15a1257bb416e7",
    measurementId: "G-521YZP53HP"
  };

// 3. Initialize Firebase services
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// 4. Handle Standard Form Submission
document.getElementById('pilot-form').addEventListener('submit', async (e) => {
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

// 5. Handle Google Workspace SSO
document.getElementById('google-sso-btn').addEventListener('click', async () => {
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
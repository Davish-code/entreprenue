// Modal State Management
const modalOverlay = document.getElementById('auth-modal');
const signupView = document.getElementById('signup-form');
const loginView = document.getElementById('login-form');

// Open the modal (specify 'login' or 'signup')
function openModal(type) {
    modalOverlay.classList.add('show');
    switchView(type);
}

// Close the modal
function closeModal() {
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
function handleAuth(event) {
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
function changeSlide(n) {
    showSlides(slideIndex += n);
}

// Thumbnail image controls
function currentSlide(n) {
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
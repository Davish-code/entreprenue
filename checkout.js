document.addEventListener("DOMContentLoaded", () => {
    const qrContainer = document.getElementById("qr-container");
    const simulateBtn = document.getElementById("simulate-btn");
    const checkoutContent = document.getElementById("checkout-content");
    const successContent = document.getElementById("success-content");
    const planNameEl = document.getElementById("plan-name");

    const pricingData = {
        eduflow: {
            personal: { price: "₹2999", period: "/mo", name: "EduFlow Personal Tier" },
            business: { price: "₹11,999", period: "/mo", name: "EduFlow Business Tier" },
            enterprise: { price: "Custom", period: "", name: "EduFlow Enterprise Tier" }
        },
        oee: {
            personal: { price: "₹4999", period: "/mo", name: "OEE Monitor Personal Tier" },
            business: { price: "₹18,999", period: "/mo", name: "OEE Monitor Business Tier" },
            enterprise: { price: "Custom", period: "", name: "OEE Monitor Enterprise Tier" }
        },
        vision: {
            personal: { price: "₹2999", period: "/mo", name: "Vision AI Personal Tier" },
            business: { price: "₹9,999", period: "/mo", name: "Vision AI Business Tier" },
            enterprise: { price: "Custom", period: "", name: "Vision AI Enterprise Tier" }
        },
        predictive: {
            personal: { price: "₹6,999", period: "/mo", name: "Predictive Maintenance Personal" },
            business: { price: "₹21,999", period: "/mo", name: "Predictive Maintenance Business" },
            enterprise: { price: "Custom", period: "", name: "Predictive Maintenance Enterprise" }
        }
    };

    const selectedModule = localStorage.getItem("selectedModule") || "eduflow";
    const selectedTier = localStorage.getItem("selectedTier") || "business";
    
    if (pricingData[selectedModule] && pricingData[selectedModule][selectedTier]) {
        const planInfo = pricingData[selectedModule][selectedTier];
        planNameEl.textContent = planInfo.name;
        const priceEl = document.querySelector('.price');
        if (priceEl) {
            priceEl.textContent = `${planInfo.price}${planInfo.period}`;
        }
    }

    const processPayment = () => {
        simulateBtn.innerHTML = '<div class="spinner"></div>';
        simulateBtn.disabled = true;
        qrContainer.style.pointerEvents = 'none';

        // Wait 1.5 seconds
        setTimeout(() => {
            // Show Success
            checkoutContent.classList.add("hidden");
            successContent.classList.remove("hidden");

            // Write to localStorage
            localStorage.setItem("isPremium", "true");

            // Wait 2 seconds, redirect to dashboard
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 2000);

        }, 1500);
    };

    qrContainer.addEventListener("click", processPayment);
    simulateBtn.addEventListener("click", processPayment);
});

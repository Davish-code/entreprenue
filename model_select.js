document.addEventListener("DOMContentLoaded", () => {
    const modelGrid = document.getElementById("model-grid");
    
    // Retrieve modules from session storage
    const storedModules = sessionStorage.getItem("availableModules");
    
    if (!storedModules) {
        // If somehow someone lands here without modules, redirect to login
        window.location.href = "index.html";
        return;
    }

    try {
        const modules = JSON.parse(storedModules);
        
        if (!Array.isArray(modules) || modules.length === 0) {
            window.location.href = "index.html";
            return;
        }

        // Map internal names to display names and descriptions
        const moduleDetails = {
            "eduflow": { name: "EduFlow", desc: "Adaptive Learning Ecosystem" },
            "oee": { name: "OEE Monitor", desc: "Industrial IoT Telemetry" },
            "vision": { name: "Vision AI", desc: "Edge Quality Inspection" },
            "predictive": { name: "Predictive", desc: "Predictive Maintenance" }
        };

        modules.forEach(modelKey => {
            const details = moduleDetails[modelKey] || { name: modelKey, desc: "Enterprise Module" };
            
            const card = document.createElement("div");
            card.className = "model-card";
            card.innerHTML = `
                <h3>${details.name}</h3>
                <p>${details.desc}</p>
            `;
            
            card.addEventListener("click", () => {
                // Save chosen model to localStorage for the dashboard to use
                localStorage.setItem("selectedModule", modelKey);
                
                // Clear the session storage if we don't need it anymore
                sessionStorage.removeItem("availableModules");
                
                // Redirect to dashboard
                window.location.href = "dashboard.html";
            });
            
            modelGrid.appendChild(card);
        });

    } catch (e) {
        console.error("Error parsing modules:", e);
        window.location.href = "index.html";
    }
});

// Target DOM Elements
const tempEl = document.getElementById('temp-val');
const vibEl = document.getElementById('vib-val');
const ampEl = document.getElementById('amp-val');
const oeeEl = document.getElementById('oee-score');
const alertFeed = document.getElementById('alert-feed');
const alertContainer = document.getElementById('alert-container');

// Initial Machine State
let telemetry = {
    temp: 62.4,
    vib: 115.2,
    amp: 12.4,
    oee: 81.3
};

let anomalyTriggered = false;
let cycleCount = 0;

// The Ghost Simulator Logic
function simulateLiveTelemetry() {
    cycleCount++;

    // Add random noise to simulate sensor data (± 0.5)
    telemetry.temp += (Math.random() - 0.5);
    telemetry.vib += (Math.random() - 0.5) * 2;
    telemetry.amp += (Math.random() - 0.5) * 0.2;
    telemetry.oee += (Math.random() - 0.5) * 0.1;

    // Trigger Anomaly for the presentation after ~10 seconds
    if (cycleCount > 5 && !anomalyTriggered) {
        triggerCriticalAlert();
    }

    // Update the DOM safely
    tempEl.innerText = telemetry.temp.toFixed(1);
    vibEl.innerText = telemetry.vib.toFixed(1);
    ampEl.innerText = telemetry.amp.toFixed(2);
    oeeEl.innerText = telemetry.oee.toFixed(1);

    // If anomaly is running, force temp to rise aggressively
    if (anomalyTriggered) {
        telemetry.temp += 1.5;
        tempEl.style.color = '#ef4444'; // Turn text red
    }
}

function triggerCriticalAlert() {
    anomalyTriggered = true;
    
    // Visually change the container to look dangerous
    alertContainer.style.border = "1px solid #ef4444";

    // Inject the new critical alert into the feed
    alertFeed.innerHTML = `
        <div class="alert critical">
            <strong>CRITICAL:</strong> Spindle Motor Temperature exceeded threshold (85°C). 
            Estimated bearing failure in 14 minutes.
        </div>
        ` + alertFeed.innerHTML;
}

// Run the engine every 2 seconds
setInterval(simulateLiveTelemetry, 2000);
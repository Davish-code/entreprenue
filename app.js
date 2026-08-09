document.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById('dashboard-content');
    const clientName = document.getElementById('client-name');
    const dashboardLogo = document.getElementById('dashboard-logo');
    const breadcrumb = document.getElementById('breadcrumb');
    const navHome = document.getElementById('nav-home');

    // Retrieve data from localStorage
    const company = localStorage.getItem('companyName') || 'Guest Client';
    const selectedModule = localStorage.getItem('selectedModule') || 'oee'; 

    // Set Header
    if (clientName) clientName.innerText = company;

    // Inject UI based on module
    if (selectedModule === 'eduflow') {
        if (dashboardLogo) dashboardLogo.innerHTML = 'Edu<span>Flow</span>';
        if (breadcrumb) breadcrumb.innerText = 'Academic Portal > Overview';
        if (navHome) navHome.innerText = 'Campus Overview';
        injectAcademicUI(content);
    } else {
        // We use VentureOS for industrial as per original CSS/Dashboard
        if (dashboardLogo) dashboardLogo.innerHTML = 'Venture<span>OS</span>';
        if (breadcrumb) breadcrumb.innerText = 'Industrial Portal > Overview';
        if (navHome) navHome.innerText = 'Plant Overview';
        
        if (selectedModule === 'vision') {
            injectVisionUI(content);
        } else if (selectedModule === 'predictive') {
            injectPredictiveUI(content);
        } else {
            injectOEEUI(content);
        }
    }
});

function injectAcademicUI(container) {
    if (!container) return;
    container.innerHTML = `
        <section class="card modules-card" style="grid-column: span 2;">
            <h3>Active Academic Modules</h3>
            <div class="module-list" style="display: flex; gap: 15px;">
                <div class="module-item active" style="flex: 1;">
                    <span>Student Progress Analytics</span>
                    <span class="tag">Active</span>
                </div>
                <div class="module-item active" style="flex: 1;">
                    <span>NLP Query Assistant</span>
                    <span class="tag">Active</span>
                </div>
            </div>
        </section>

        <section class="card metrics-card">
            <h3>Student Cohort Progress</h3>
            <div class="big-metric">
                <span id="progress-score">89.4</span>%
            </div>
            <div class="sub-metrics">
                <div>Engagement: <span>92%</span></div>
                <div>Retention: <span>98%</span></div>
            </div>
        </section>

        <section class="card alert-card">
            <h3>Teacher Alerts</h3>
            <div class="alert-feed">
                <div class="alert critical">
                    3 students in Cohort B are struggling with advanced thermodynamics. Review suggested.
                </div>
                <div class="alert normal">All other cohorts tracking above baseline.</div>
            </div>
        </section>

        <section class="card sensor-card" style="grid-column: span 2;">
            <h3>Live NLP Query Stream</h3>
            <div class="sensor-grid">
                <div class="sensor-box">
                    <h4>Calculus Gap Detected</h4>
                    <div class="sensor-value" style="font-size: 18px;">Auto-tailoring Module 4</div>
                </div>
                <div class="sensor-box">
                    <h4>Physics Q&A Volume</h4>
                    <div class="sensor-value">1,402 / hr</div>
                </div>
                <div class="sensor-box">
                    <h4>Student Stress Index</h4>
                    <div class="sensor-value" style="color: var(--accent-green);">Nominal</div>
                </div>
            </div>
        </section>
    `;
}

function injectOEEUI(container) {
    if (!container) return;
    container.innerHTML = `
        <section class="card modules-card" style="grid-column: span 2;">
            <h3>Active Industrial Modules</h3>
            <div class="module-list" style="display: flex; gap: 15px;">
                <div class="module-item active" style="flex: 1;">
                    <span>Telemetry & OEE</span>
                    <span class="tag">Active</span>
                </div>
                <div class="module-item active" style="flex: 1;">
                    <span>Vision Quality Control</span>
                    <span class="tag">Active</span>
                </div>
                <div class="module-item inactive" style="flex: 1;">
                    <span>Predictive Maintenance</span>
                    <button class="upgrade-btn">Upgrade</button>
                </div>
            </div>
        </section>

        <section class="card metrics-card">
            <h3>Overall Equipment Effectiveness (OEE)</h3>
            <div class="big-metric">
                <span id="oee-score">81.3</span>%
            </div>
            <div class="sub-metrics">
                <div>Availability: <span>94.2%</span></div>
                <div>Quality: <span>98.1%</span></div>
            </div>
        </section>

        <section class="card alert-card">
            <h3>System Alerts</h3>
            <div class="alert-feed">
                <div class="alert normal">All systems operating within normal parameters.</div>
            </div>
        </section>

        <section class="card sensor-card" style="grid-column: span 2;">
            <h3>Live Edge Telemetry: CNC_Milling_04</h3>
            <div class="sensor-grid">
                <div class="sensor-box">
                    <h4>Spindle Temp</h4>
                    <div class="sensor-value"><span>62.4</span>°C</div>
                </div>
                <div class="sensor-box">
                    <h4>Vibration</h4>
                    <div class="sensor-value"><span>115.2</span> Hz</div>
                </div>
                <div class="sensor-box">
                    <h4>Current Load</h4>
                    <div class="sensor-value"><span>12.4</span> A</div>
                </div>
            </div>
        </section>
    `;
}

function injectVisionUI(container) {
    if (!container) return;
    container.innerHTML = `
        <section class="card modules-card" style="grid-column: span 2;">
            <h3>Active Industrial Modules</h3>
            <div class="module-list" style="display: flex; gap: 15px;">
                <div class="module-item inactive" style="flex: 1;">
                    <span>Telemetry & OEE</span>
                    <button class="upgrade-btn">Upgrade</button>
                </div>
                <div class="module-item active" style="flex: 1;">
                    <span>Vision Quality Control</span>
                    <span class="tag">Active</span>
                </div>
                <div class="module-item inactive" style="flex: 1;">
                    <span>Predictive Maintenance</span>
                    <button class="upgrade-btn">Upgrade</button>
                </div>
            </div>
        </section>

        <section class="card metrics-card">
            <h3>Real-time Defect Rate</h3>
            <div class="big-metric">
                <span id="defect-score">1.2</span>%
            </div>
            <div class="sub-metrics">
                <div>Parts Scanned: <span>14,208</span></div>
                <div>False Positives: <span>0.05%</span></div>
            </div>
        </section>

        <section class="card alert-card">
            <h3>Vision Alerts</h3>
            <div class="alert-feed">
                <div class="alert critical" style="border-left-color: var(--accent-red); background: rgba(239, 68, 68, 0.1); color: #fca5a5;">
                    Critical: Defect threshold exceeded on Assembly Line 2 (Micro-fractures detected).
                </div>
                <div class="alert normal">Camera 1 and 3 operating nominally.</div>
            </div>
        </section>

        <section class="card sensor-card" style="grid-column: span 2;">
            <h3>Live Camera Feed Analysis</h3>
            <div class="sensor-grid">
                <div class="sensor-box" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 120px; border: 1px dashed var(--accent-green);">
                    <span style="color: var(--accent-green); font-weight: bold; margin-bottom: 5px;">[ CAM 1 ]</span>
                    <span style="font-size: 14px;">Clear</span>
                </div>
                <div class="sensor-box" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 120px; border: 1px dashed var(--accent-red);">
                    <span style="color: var(--accent-red); font-weight: bold; margin-bottom: 5px;">[ CAM 2 ]</span>
                    <span style="font-size: 14px; color: #fca5a5;">Anomaly Detected</span>
                </div>
                <div class="sensor-box" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 120px; border: 1px dashed var(--text-muted); opacity: 0.5;">
                    <span style="color: var(--text-muted); font-weight: bold; margin-bottom: 5px;">[ CAM 3 ]</span>
                    <span style="font-size: 14px;">Offline / Standby</span>
                </div>
            </div>
        </section>
    `;
}

function injectPredictiveUI(container) {
    if (!container) return;
    container.innerHTML = `
        <section class="card modules-card" style="grid-column: span 2;">
            <h3>Active Industrial Modules</h3>
            <div class="module-list" style="display: flex; gap: 15px;">
                <div class="module-item inactive" style="flex: 1;">
                    <span>Telemetry & OEE</span>
                    <button class="upgrade-btn">Upgrade</button>
                </div>
                <div class="module-item inactive" style="flex: 1;">
                    <span>Vision Quality Control</span>
                    <button class="upgrade-btn">Upgrade</button>
                </div>
                <div class="module-item active" style="flex: 1;">
                    <span>Predictive Maintenance</span>
                    <span class="tag">Active</span>
                </div>
            </div>
        </section>

        <section class="card metrics-card">
            <h3>Average Fleet Health</h3>
            <div class="big-metric">
                <span id="health-score">91</span>/100
            </div>
            <div class="sub-metrics">
                <div>Machines Monitored: <span>42</span></div>
                <div>Risk Level: <span style="color: var(--accent-green);">Low</span></div>
            </div>
        </section>

        <section class="card alert-card">
            <h3>Maintenance Schedule</h3>
            <div class="alert-feed">
                <div class="alert" style="border-left-color: #f59e0b; background: rgba(245, 158, 11, 0.1); color: #fcd34d;">
                    Upcoming: Schedule bearing replacement for CNC_04 before Friday.
                </div>
                <div class="alert normal">No immediate failures predicted.</div>
            </div>
        </section>

        <section class="card sensor-card" style="grid-column: span 2;">
            <h3>Predicted Time to Failure</h3>
            <div class="sensor-grid">
                <div class="sensor-box">
                    <h4>CNC_Milling_04</h4>
                    <div class="sensor-value" style="color: #f59e0b;">12 Days</div>
                </div>
                <div class="sensor-box">
                    <h4>Conveyor_Belt_01</h4>
                    <div class="sensor-value">45 Days</div>
                </div>
                <div class="sensor-box">
                    <h4>Hydraulic_Press_B</h4>
                    <div class="sensor-value">120+ Days</div>
                </div>
            </div>
        </section>
    `;
}
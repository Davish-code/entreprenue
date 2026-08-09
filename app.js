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
        injectIndustrialUI(content);
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

function injectIndustrialUI(container) {
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
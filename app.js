import { db, auth, onAuthStateChanged, signOut, collection, addDoc, serverTimestamp, getDocs, doc, setDoc, getDoc, updateDoc } from "./firebase-config.js";

let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            initDashboard();
        } else {
            // Redirect to login if not authenticated
            window.location.href = 'index.html';
        }
    });

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            signOut(auth).then(() => {
                window.location.href = 'index.html';
            }).catch((error) => console.error("Sign out error", error));
        });
    }
});

function initDashboard() {
    const content = document.getElementById('dashboard-content');
    const clientName = document.getElementById('client-name');
    const dashboardLogo = document.getElementById('dashboard-logo');
    const breadcrumb = document.getElementById('breadcrumb');
    const navHome = document.getElementById('nav-home');
    const navStudents = document.getElementById('nav-students');

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
        if (navStudents) navStudents.style.display = 'block';

        injectAcademicUI(content);

        if (navHome && navStudents) {
            navHome.addEventListener('click', (e) => {
                e.preventDefault();
                navHome.classList.add('active');
                navStudents.classList.remove('active');
                breadcrumb.innerText = 'Academic Portal > Overview';
                injectAcademicUI(content);
            });

            navStudents.addEventListener('click', (e) => {
                e.preventDefault();
                navStudents.classList.add('active');
                navHome.classList.remove('active');
                breadcrumb.innerText = 'Academic Portal > Student Details';
                injectStudentDetailsUI(content);
            });
        }

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
}

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
        </section>
    `;
}

// --- STUDENT DETAILS FIREBASE UI ---
let subjectCounter = 1;

window.addSubjectRow = function() {
    subjectCounter++;
    const container = document.getElementById('subjects-container');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'subject-row';
    row.id = `subject-row-${subjectCounter}`;
    row.style.cssText = 'display:flex; gap:8px; align-items:center;';
    row.innerHTML = `
        <input type="text" placeholder="Subject" required style="flex:2; padding:10px; background:rgba(255,255,255,0.05); border:1px solid var(--border-color); color:white; border-radius:4px;">
        <input type="text" placeholder="Marks" required style="flex:1; padding:10px; background:rgba(255,255,255,0.05); border:1px solid var(--border-color); color:white; border-radius:4px;">
        <input type="text" placeholder="Attend %" required style="flex:1; padding:10px; background:rgba(255,255,255,0.05); border:1px solid var(--border-color); color:white; border-radius:4px;">
        <button type="button" onclick="window.removeSubjectRow('subject-row-${subjectCounter}')" style="width:36px; height:36px; background:rgba(239,68,68,0.2); color:#fca5a5; border:1px solid rgba(239,68,68,0.4); border-radius:4px; cursor:pointer; font-size:18px; display:flex; align-items:center; justify-content:center;">×</button>
    `;
    container.appendChild(row);
};

window.removeSubjectRow = function(rowId) {
    const row = document.getElementById(rowId);
    if (row) row.remove();
};

window.submitStudentForm = async function(event) {
    event.preventDefault();
    const btn = document.getElementById('add-student-btn');
    btn.innerText = "Adding...";
    btn.disabled = true;

    const name = document.getElementById('student-name').value;
    const regNo = document.getElementById('student-reg').value.trim();
    const branch = document.getElementById('student-branch').value;

    if (!regNo) {
        alert('Registration Number is required.');
        btn.innerText = "Add Student";
        btn.disabled = false;
        return;
    }

    // Collect all subject rows
    const rows = document.querySelectorAll('#subjects-container .subject-row');
    const subjects = [];
    rows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        const subName = inputs[0].value.trim();
        const subMarks = inputs[1].value.trim();
        const subAttend = inputs[2].value.trim();
        if (subName && subMarks) {
            subjects.push({ subject: subName, marks: subMarks, attendance: subAttend || '0' });
        }
    });

    try {
        // Use regNo as document ID in user's isolated subcollection
        await setDoc(doc(db, "users", currentUser.uid, "eduflow", regNo), {
            name, regNo, branch, subjects, timestamp: serverTimestamp()
        });
        alert("Student added successfully!");
        document.getElementById('student-form').reset();
        const container = document.getElementById('subjects-container');
        container.innerHTML = `
            <div class="subject-row" id="subject-row-1" style="display:flex; gap:8px; align-items:center;">
                <input type="text" placeholder="Subject" required style="flex:2; padding:10px; background:rgba(255,255,255,0.05); border:1px solid var(--border-color); color:white; border-radius:4px;">
                <input type="text" placeholder="Marks" required style="flex:1; padding:10px; background:rgba(255,255,255,0.05); border:1px solid var(--border-color); color:white; border-radius:4px;">
                <input type="text" placeholder="Attend %" required style="flex:1; padding:10px; background:rgba(255,255,255,0.05); border:1px solid var(--border-color); color:white; border-radius:4px;">
                <div style="width:36px;"></div>
            </div>
        `;
        subjectCounter = 1;
        window.loadStudentsList();
    } catch (e) {
        console.error("Error adding student: ", e);
        alert("Failed to add student. Check console.");
    } finally {
        btn.innerText = "Add Student";
        btn.disabled = false;
    }
};

// Load a clickable list of students (not full details)
window.loadStudentsList = async function() {
    const listContainer = document.getElementById('students-list');
    if (!listContainer) return;

    listContainer.innerHTML = '<p style="text-align:center; color:var(--text-muted); padding:20px;">Loading students...</p>';

    try {
        const querySnapshot = await getDocs(collection(db, "users", currentUser.uid, "eduflow"));
        listContainer.innerHTML = '';
        if (querySnapshot.empty) {
            listContainer.innerHTML = '<p style="text-align:center; color:var(--text-muted); padding:20px;">No students found.</p>';
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const card = document.createElement('div');
            card.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:14px 16px; background:rgba(255,255,255,0.03); border:1px solid var(--border-color); border-radius:8px; cursor:pointer; transition:all 0.2s;';
            card.onmouseover = () => { card.style.background = 'rgba(59,130,246,0.1)'; card.style.borderColor = 'var(--accent-blue)'; };
            card.onmouseout = () => { card.style.background = 'rgba(255,255,255,0.03)'; card.style.borderColor = 'var(--border-color)'; };
            card.onclick = () => window.showStudentDetail(docSnap.id);
            card.innerHTML = `
                <div>
                    <div style="font-weight:600; font-size:15px;">${data.name || 'Unknown'}</div>
                    <div style="font-size:12px; color:var(--text-muted); margin-top:3px;">${data.branch || '-'} &bull; Reg: ${data.regNo || docSnap.id}</div>
                </div>
                <span style="color:var(--text-muted); font-size:20px;">›</span>
            `;
            listContainer.appendChild(card);
        });
    } catch (e) {
        console.error("Error fetching students: ", e);
        listContainer.innerHTML = '<p style="text-align:center; color:var(--accent-red); padding:20px;">Failed to load. Check console.</p>';
    }
};

// Show full details of a single student
window.showStudentDetail = async function(docId) {
    const content = document.getElementById('dashboard-content');
    if (!content) return;

    content.innerHTML = '<div style="grid-column:span 2; text-align:center; padding:40px; color:var(--text-muted);">Loading student data...</div>';

    try {
        const docSnap = await getDoc(doc(db, "users", currentUser.uid, "eduflow", docId));
        if (!docSnap.exists()) {
            content.innerHTML = '<div style="grid-column:span 2; text-align:center; padding:40px; color:var(--accent-red);">Student not found.</div>';
            return;
        }
        const data = docSnap.data();

        // Build subjects table rows
        let subjectRows = '';
        if (Array.isArray(data.subjects) && data.subjects.length > 0) {
            data.subjects.forEach((s, i) => {
                subjectRows += `
                    <tr>
                        <td style="padding:10px 12px; border-bottom:1px solid var(--border-color);">${i + 1}</td>
                        <td style="padding:10px 12px; border-bottom:1px solid var(--border-color);">${s.subject}</td>
                        <td style="padding:10px 12px; border-bottom:1px solid var(--border-color);">${s.marks}</td>
                        <td style="padding:10px 12px; border-bottom:1px solid var(--border-color);">${s.attendance || '0'}%</td>
                    </tr>
                `;
            });
        } else {
            subjectRows = '<tr><td colspan="4" style="text-align:center; padding:15px; color:var(--text-muted);">No subjects recorded.</td></tr>';
        }

        content.innerHTML = `
            <div style="grid-column: span 2;">
                <button onclick="window.injectStudentDetailsUI(document.getElementById('dashboard-content'))" style="background:none; border:1px solid var(--border-color); color:var(--accent-blue); padding:8px 16px; border-radius:6px; cursor:pointer; font-size:14px; margin-bottom:20px;">← Back to Student List</button>
            </div>

            <section class="card" style="grid-column: span 2;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <div>
                        <h3 style="font-size:22px; color:var(--text-main); margin-bottom:4px;">${data.name}</h3>
                        <p style="color:var(--text-muted); font-size:14px;">Reg. No: ${data.regNo || docId} &bull; Branch: ${data.branch || '-'}</p>
                    </div>
                    <div style="display:flex; gap:12px; align-items:center;">
                        <span class="status-badge green">Active</span>
                        <button onclick="window.editStudentUI('${docId}')" style="background:rgba(255,255,255,0.05); color:var(--text-main); border:1px solid var(--border-color); padding:6px 16px; border-radius:6px; cursor:pointer; font-size:13px; font-weight:600; transition:0.2s;">Edit Details</button>
                    </div>
                </div>
            </section>

            <section class="card" style="grid-column: span 2;">
                <h3 style="margin-bottom:15px;">Subjects, Marks & Attendance</h3>
                <table style="width:100%; border-collapse:collapse; text-align:left;">
                    <thead>
                        <tr style="border-bottom:1px solid var(--border-color); color:var(--text-muted); font-size:13px;">
                            <th style="padding:10px 12px;">#</th>
                            <th style="padding:10px 12px;">Subject</th>
                            <th style="padding:10px 12px;">Marks</th>
                            <th style="padding:10px 12px;">Attendance</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${subjectRows}
                    </tbody>
                </table>
            </section>
        `;
    } catch (e) {
        console.error("Error loading student: ", e);
        content.innerHTML = '<div style="grid-column:span 2; text-align:center; padding:40px; color:var(--accent-red);">Error loading student. Check console.</div>';
    }
};

window.injectStudentDetailsUI = function injectStudentDetailsUI(container) {
    if (!container) return;

    container.innerHTML = `
        <div style="grid-column: span 2; display: flex; gap: 24px;">
            <!-- Form Section -->
            <section class="card" style="flex: 1; height: fit-content;">
                <h3 style="margin-bottom: 20px;">Add New Student</h3>
                <form id="student-form" onsubmit="window.submitStudentForm(event)" style="display: flex; flex-direction: column; gap: 15px;">
                    <div>
                        <label style="display:block; font-size:12px; color:var(--text-muted); margin-bottom:5px;">Full Name</label>
                        <input type="text" id="student-name" required style="width:100%; padding:10px; background:rgba(255,255,255,0.05); border:1px solid var(--border-color); color:white; border-radius:4px;">
                    </div>
                    <div>
                        <label style="display:block; font-size:12px; color:var(--text-muted); margin-bottom:5px;">Registration Number</label>
                        <input type="text" id="student-reg" required style="width:100%; padding:10px; background:rgba(255,255,255,0.05); border:1px solid var(--border-color); color:white; border-radius:4px;">
                    </div>
                    <div>
                        <label style="display:block; font-size:12px; color:var(--text-muted); margin-bottom:5px;">Branch</label>
                        <input type="text" id="student-branch" required style="width:100%; padding:10px; background:rgba(255,255,255,0.05); border:1px solid var(--border-color); color:white; border-radius:4px;">
                    </div>
                    <div>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                            <label style="font-size:12px; color:var(--text-muted);">Subjects, Marks & Attendance</label>
                            <button type="button" onclick="window.addSubjectRow()" style="padding:4px 12px; background:rgba(59,130,246,0.2); color:var(--accent-blue); border:1px solid rgba(59,130,246,0.4); border-radius:4px; cursor:pointer; font-size:16px; font-weight:bold;">+ Add Subject</button>
                        </div>
                        <div id="subjects-container" style="display:flex; flex-direction:column; gap:8px;">
                            <div class="subject-row" id="subject-row-1" style="display:flex; gap:8px; align-items:center;">
                                <input type="text" placeholder="Subject" required style="flex:2; padding:10px; background:rgba(255,255,255,0.05); border:1px solid var(--border-color); color:white; border-radius:4px;">
                                <input type="text" placeholder="Marks" required style="flex:1; padding:10px; background:rgba(255,255,255,0.05); border:1px solid var(--border-color); color:white; border-radius:4px;">
                                <input type="text" placeholder="Attend %" required style="flex:1; padding:10px; background:rgba(255,255,255,0.05); border:1px solid var(--border-color); color:white; border-radius:4px;">
                                <div style="width:36px;"></div>
                            </div>
                        </div>
                    </div>
                    <button type="submit" id="add-student-btn" style="padding:12px; background:var(--accent-blue); color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer; margin-top:10px;">Add Student</button>
                </form>
            </section>

            <!-- Student List Section -->
            <section class="card" style="flex: 2;">
                <h3 style="margin-bottom: 20px;">Students</h3>
                <div id="students-list" style="display:flex; flex-direction:column; gap:10px;">
                    <!-- Populated by JS -->
                </div>
            </section>
        </div>
    `;

    window.loadStudentsList();
}

// ----------------------------------------------------
// Edit Student Logic
// ----------------------------------------------------
window.editStudentUI = async function(docId) {
    const content = document.getElementById('dashboard-content');
    if (!content) return;
    
    content.innerHTML = '<div style="grid-column:span 2; text-align:center; padding:40px; color:var(--text-muted);">Loading student data for edit...</div>';
    
    try {
        const docSnap = await getDoc(doc(db, "users", currentUser.uid, "eduflow", docId));
        if (!docSnap.exists()) {
            content.innerHTML = '<div style="grid-column:span 2; text-align:center; padding:40px; color:var(--accent-red);">Student not found.</div>';
            return;
        }
        const data = docSnap.data();
        
        let subjectRowsHTML = '';
        window.editSubjectCounter = 0;
        
        if (Array.isArray(data.subjects) && data.subjects.length > 0) {
            data.subjects.forEach((s) => {
                window.editSubjectCounter++;
                subjectRowsHTML += `
                    <div class="subject-row" id="edit-subject-row-${window.editSubjectCounter}" style="display:flex; gap:8px; align-items:center;">
                        <input type="text" placeholder="Subject" value="${s.subject || ''}" required style="flex:2; padding:10px; background:rgba(255,255,255,0.05); border:1px solid var(--border-color); color:white; border-radius:4px;">
                        <input type="text" placeholder="Marks" value="${s.marks || ''}" required style="flex:1; padding:10px; background:rgba(255,255,255,0.05); border:1px solid var(--border-color); color:white; border-radius:4px;">
                        <input type="text" placeholder="Attend %" value="${s.attendance || ''}" required style="flex:1; padding:10px; background:rgba(255,255,255,0.05); border:1px solid var(--border-color); color:white; border-radius:4px;">
                        <button type="button" onclick="window.removeEditSubjectRow('edit-subject-row-${window.editSubjectCounter}')" style="width:36px; height:36px; background:rgba(239,68,68,0.2); color:#fca5a5; border:1px solid rgba(239,68,68,0.4); border-radius:4px; cursor:pointer; font-size:18px; display:flex; align-items:center; justify-content:center;">×</button>
                    </div>
                `;
            });
        } else {
            window.editSubjectCounter = 1;
            subjectRowsHTML = `
                <div class="subject-row" id="edit-subject-row-1" style="display:flex; gap:8px; align-items:center;">
                    <input type="text" placeholder="Subject" required style="flex:2; padding:10px; background:rgba(255,255,255,0.05); border:1px solid var(--border-color); color:white; border-radius:4px;">
                    <input type="text" placeholder="Marks" required style="flex:1; padding:10px; background:rgba(255,255,255,0.05); border:1px solid var(--border-color); color:white; border-radius:4px;">
                    <input type="text" placeholder="Attend %" required style="flex:1; padding:10px; background:rgba(255,255,255,0.05); border:1px solid var(--border-color); color:white; border-radius:4px;">
                    <button type="button" onclick="window.removeEditSubjectRow('edit-subject-row-1')" style="width:36px; height:36px; background:rgba(239,68,68,0.2); color:#fca5a5; border:1px solid rgba(239,68,68,0.4); border-radius:4px; cursor:pointer; font-size:18px; display:flex; align-items:center; justify-content:center;">×</button>
                </div>
            `;
        }

        content.innerHTML = `
            <div style="grid-column: span 2;">
                <button onclick="window.showStudentDetail('${docId}')" style="background:none; border:1px solid var(--border-color); color:var(--accent-blue); padding:8px 16px; border-radius:6px; cursor:pointer; font-size:14px; margin-bottom:20px;">← Cancel Edit</button>
            </div>
            
            <section class="card" style="grid-column: span 2;">
                <h3 style="margin-bottom: 20px;">Edit Student: ${data.name}</h3>
                <form id="edit-student-form" onsubmit="window.submitEditStudentForm(event, '${docId}')" style="display: flex; flex-direction: column; gap: 15px;">
                    <div style="display:flex; gap:15px; flex-wrap:wrap;">
                        <div style="flex:1; min-width:200px;">
                            <label style="display:block; font-size:12px; color:var(--text-muted); margin-bottom:5px;">Full Name</label>
                            <input type="text" id="edit-student-name" value="${data.name || ''}" required style="width:100%; padding:10px; background:rgba(255,255,255,0.05); border:1px solid var(--border-color); color:white; border-radius:4px;">
                        </div>
                        <div style="flex:1; min-width:200px;">
                            <label style="display:block; font-size:12px; color:var(--text-muted); margin-bottom:5px;">Registration Number (Fixed)</label>
                            <input type="text" id="edit-student-reg" value="${data.regNo || docId}" disabled style="width:100%; padding:10px; background:rgba(255,255,255,0.02); border:1px solid var(--border-color); color:var(--text-muted); border-radius:4px; cursor:not-allowed;">
                        </div>
                        <div style="flex:1; min-width:200px;">
                            <label style="display:block; font-size:12px; color:var(--text-muted); margin-bottom:5px;">Branch</label>
                            <input type="text" id="edit-student-branch" value="${data.branch || ''}" required style="width:100%; padding:10px; background:rgba(255,255,255,0.05); border:1px solid var(--border-color); color:white; border-radius:4px;">
                        </div>
                    </div>
                    
                    <div style="margin-top:10px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                            <label style="font-size:12px; color:var(--text-muted);">Subjects, Marks & Attendance</label>
                            <button type="button" onclick="window.addEditSubjectRow()" style="padding:4px 12px; background:rgba(59,130,246,0.2); color:var(--accent-blue); border:1px solid rgba(59,130,246,0.4); border-radius:4px; cursor:pointer; font-size:16px; font-weight:bold;">+ Add Subject</button>
                        </div>
                        <div id="edit-subjects-container" style="display:flex; flex-direction:column; gap:8px;">
                            ${subjectRowsHTML}
                        </div>
                    </div>
                    
                    <button type="submit" id="save-edit-btn" style="padding:12px; background:var(--accent-green); color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer; margin-top:20px; width:100%; max-width:300px;">Save Changes</button>
                </form>
            </section>
        `;
    } catch (e) {
        console.error("Error loading student for edit: ", e);
        content.innerHTML = '<div style="grid-column:span 2; text-align:center; padding:40px; color:var(--accent-red);">Error loading student data. Check console.</div>';
    }
};

window.addEditSubjectRow = function() {
    window.editSubjectCounter++;
    const container = document.getElementById('edit-subjects-container');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'subject-row';
    row.id = `edit-subject-row-${window.editSubjectCounter}`;
    row.style.cssText = 'display:flex; gap:8px; align-items:center;';
    row.innerHTML = `
        <input type="text" placeholder="Subject" required style="flex:2; padding:10px; background:rgba(255,255,255,0.05); border:1px solid var(--border-color); color:white; border-radius:4px;">
        <input type="text" placeholder="Marks" required style="flex:1; padding:10px; background:rgba(255,255,255,0.05); border:1px solid var(--border-color); color:white; border-radius:4px;">
        <input type="text" placeholder="Attend %" required style="flex:1; padding:10px; background:rgba(255,255,255,0.05); border:1px solid var(--border-color); color:white; border-radius:4px;">
        <button type="button" onclick="window.removeEditSubjectRow('edit-subject-row-${window.editSubjectCounter}')" style="width:36px; height:36px; background:rgba(239,68,68,0.2); color:#fca5a5; border:1px solid rgba(239,68,68,0.4); border-radius:4px; cursor:pointer; font-size:18px; display:flex; align-items:center; justify-content:center;">×</button>
    `;
    container.appendChild(row);
};

window.removeEditSubjectRow = function(rowId) {
    const row = document.getElementById(rowId);
    if (row) row.remove();
};

window.submitEditStudentForm = async function(event, docId) {
    event.preventDefault();
    const btn = document.getElementById('save-edit-btn');
    btn.innerText = "Saving...";
    btn.disabled = true;

    const name = document.getElementById('edit-student-name').value;
    const branch = document.getElementById('edit-student-branch').value;

    const rows = document.querySelectorAll('#edit-subjects-container .subject-row');
    const subjects = [];
    rows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        const subName = inputs[0].value.trim();
        const subMarks = inputs[1].value.trim();
        const subAttend = inputs[2].value.trim();
        if (subName && subMarks) {
            subjects.push({ subject: subName, marks: subMarks, attendance: subAttend || '0' });
        }
    });

    try {
        await updateDoc(doc(db, "users", currentUser.uid, "eduflow", docId), {
            name, branch, subjects
        });
        alert("Student updated successfully!");
        window.showStudentDetail(docId); // Go back to view mode
    } catch (e) {
        console.error("Error updating student: ", e);
        alert("Failed to update student. Check console.");
        btn.innerText = "Save Changes";
        btn.disabled = false;
    }
};

/**
 * ============================================================
 * EV OVERSEAS — Student Dashboard JavaScript
 * ============================================================
 * 
 * Handles:
 * - Google Sign-In authentication
 * - Fetching student data from Google Apps Script
 * - Rendering dashboard UI components
 * - Chart.js progress visualization
 */

// ── CONFIGURATION ──────────────────────────────────────────
// ⚠️ REPLACE THESE WITH YOUR ACTUAL VALUES:
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzI6mgA3ELgi4YW-nbbpXEUhxJsBUc6gyj7IZn6rodIClK7AybjkVfTQMyDxfF1B8c-/exec';
const GOOGLE_CLIENT_ID = '1004728784932-0380a7n79s0rs5d41dbgnmreoogp0fmm.apps.googleusercontent.com';

// ── Journey Steps Definition (matches website) ────────────
const JOURNEY_STEPS = [
    { number: 1, name: 'Initial Consultation', icon: '💬' },
    { number: 2, name: 'Profile & University Shortlist', icon: '🎯' },
    { number: 3, name: 'Application & Documentation', icon: '📋' },
    { number: 4, name: 'Offer & Scholarship', icon: '🎓' },
    { number: 5, name: 'Visa & Pre-departure', icon: '🛂' },
    { number: 6, name: 'Arrival & Onboarding', icon: '✈️' }
];

// ── GLOBAL STATE ───────────────────────────────────────────
let currentUser = null;
let studentData = null;
let progressChart = null;

// ── INITIALIZATION ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    // Show login screen initially
    showLoginScreen();

    // Initialize custom Google Sign-In button
    const googleBtn = document.getElementById('customGoogleBtn');
    if (googleBtn) {
        googleBtn.addEventListener('click', handleGoogleSignIn);
    }
});

// ── Google Identity Services Callback ──────────────────────
function handleCredentialResponse(response) {
    // Decode the JWT token from Google
    const payload = parseJwt(response.credential);

    if (payload) {
        currentUser = {
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            given_name: payload.given_name
        };
        loadDashboard();
    } else {
        showError('Failed to process your sign-in. Please try again.');
    }
}

// Google Sign-In handler for custom button
function handleGoogleSignIn() {
    // Check if GIS is loaded
    if (typeof google === 'undefined' || !google.accounts) {
        showError('Google Sign-In is loading. Please wait a moment and try again.');
        return;
    }

    google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true
    });

    google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Fallback — show the One Tap prompt in popup mode
            google.accounts.id.renderButton(
                document.getElementById('googleSignInFallback'),
                {
                    type: 'standard',
                    theme: 'outline',
                    size: 'large',
                    shape: 'pill',
                    width: 300,
                    text: 'signin_with',
                    logo_alignment: 'left'
                }
            );
            document.getElementById('googleSignInFallback').style.display = 'flex';
            document.getElementById('googleSignInFallback').style.justifyContent = 'center';
            document.getElementById('googleSignInFallback').style.marginTop = '12px';
        }
    });
}

// ── Parse JWT Token ────────────────────────────────────────
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Error parsing JWT:', e);
        return null;
    }
}

// ── Load Dashboard Data ────────────────────────────────────
async function loadDashboard() {
    showLoadingScreen();

    try {
        const url = `${APPS_SCRIPT_URL}?email=${encodeURIComponent(currentUser.email)}&action=getAll`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        if (!data.success) {
            showNotRegistered(data.error);
            return;
        }

        studentData = data;
        renderDashboard();

    } catch (error) {
        console.error('Error loading dashboard:', error);
        showError('Unable to connect to the server. Please check your internet connection and try again.');
    }
}

// ── SCREEN RENDERING ───────────────────────────────────────

function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('loadingScreen').style.display = 'none';
    document.getElementById('dashboardScreen').style.display = 'none';
    document.getElementById('errorScreen').style.display = 'none';
}

function showLoadingScreen() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('loadingScreen').style.display = 'flex';
    document.getElementById('dashboardScreen').style.display = 'none';
    document.getElementById('errorScreen').style.display = 'none';
}

function showDashboardScreen() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('loadingScreen').style.display = 'none';
    document.getElementById('dashboardScreen').style.display = 'block';
    document.getElementById('errorScreen').style.display = 'none';
}

function showError(message) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('loadingScreen').style.display = 'none';
    document.getElementById('dashboardScreen').style.display = 'none';
    document.getElementById('errorScreen').style.display = 'flex';
    document.getElementById('errorMessage').textContent = message;
}

function showNotRegistered(message) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('loadingScreen').style.display = 'none';
    document.getElementById('dashboardScreen').style.display = 'none';
    document.getElementById('errorScreen').style.display = 'flex';
    document.getElementById('errorIcon').textContent = '🔒';
    document.getElementById('errorTitle').textContent = 'Account Not Found';
    document.getElementById('errorMessage').textContent = message ||
        'Your email is not registered with EV Overseas. Please contact us to get started on your study abroad journey.';
    document.getElementById('retryBtn').textContent = 'Contact EV Overseas';
    document.getElementById('retryBtn').onclick = function () {
        window.location.href = 'index.html#contact';
    };
}

// ── SIGN OUT ───────────────────────────────────────────────
function signOut() {
    currentUser = null;
    studentData = null;

    if (typeof google !== 'undefined' && google.accounts) {
        google.accounts.id.disableAutoSelect();
    }

    // Destroy chart
    if (progressChart) {
        progressChart.destroy();
        progressChart = null;
    }

    showLoginScreen();
}

// ── RENDER DASHBOARD ───────────────────────────────────────
function renderDashboard() {
    const student = studentData.student;
    const milestones = studentData.milestones;
    const documents = studentData.documents;
    const currentStep = parseInt(student.CurrentStep) || 1;
    const totalSteps = 6;
    const progress = Math.round((currentStep / totalSteps) * 100);

    // ── Welcome Header
    document.getElementById('welcomeName').textContent = `Welcome back, ${student.Name || currentUser.given_name || 'Student'}!`;

    // Build meta badges
    const metaHtml = [];
    if (student.University) metaHtml.push(`<span class="meta-badge">🎓 ${student.University}</span>`);
    if (student.Destination) metaHtml.push(`<span class="meta-badge">🌍 ${student.Destination}</span>`);
    if (student.Intake) metaHtml.push(`<span class="meta-badge">📅 ${student.Intake}</span>`);
    document.getElementById('welcomeMeta').innerHTML = metaHtml.join('');

    // User avatar
    const avatar = document.getElementById('userAvatar');
    if (currentUser.picture) {
        avatar.src = currentUser.picture;
        avatar.style.display = 'block';
    }

    // ── Status Overview Cards
    renderStatusCards(student, milestones, documents, currentStep, progress);

    // ── Progress Tracker
    renderProgressTracker(currentStep, milestones, progress);

    // ── Progress Chart
    renderProgressChart(currentStep, totalSteps);

    // ── Documents
    renderDocuments(documents);

    // ── Timeline
    renderTimeline(milestones, currentStep);

    // ── Counselor Card
    renderCounselor(student);

    // Show dashboard
    showDashboardScreen();
}

// ── Status Cards ───────────────────────────────────────────
function renderStatusCards(student, milestones, documents, currentStep, progress) {
    const completedDocs = documents.filter(d =>
        d.Status && (d.Status.toLowerCase() === 'approved' || d.Status.toLowerCase() === 'submitted')
    ).length;

    const container = document.getElementById('statusCards');
    container.innerHTML = `
        <div class="status-card fade-in stagger-1" style="--card-accent: var(--dash-accent);">
            <div class="status-card-icon">📊</div>
            <div class="status-card-label">Overall Progress</div>
            <div class="status-card-value">${progress}%</div>
        </div>
        <div class="status-card fade-in stagger-2" style="--card-accent: var(--dash-success);">
            <div class="status-card-icon">🎯</div>
            <div class="status-card-label">Current Step</div>
            <div class="status-card-value">Step ${currentStep} of 6</div>
        </div>
        <div class="status-card fade-in stagger-3" style="--card-accent: var(--dash-warning);">
            <div class="status-card-icon">📄</div>
            <div class="status-card-label">Documents</div>
            <div class="status-card-value">${completedDocs} / ${documents.length}</div>
        </div>
        <div class="status-card fade-in stagger-4" style="--card-accent: ${getStatusColor(student.OverallStatus)};">
            <div class="status-card-icon">${getStatusIcon(student.OverallStatus)}</div>
            <div class="status-card-label">Status</div>
            <div class="status-card-value">
                <span class="badge badge-${getStatusBadgeClass(student.OverallStatus)}">${student.OverallStatus || 'Active'}</span>
            </div>
        </div>
    `;
}

// ── Progress Tracker ───────────────────────────────────────
function renderProgressTracker(currentStep, milestones, progress) {
    // Progress bar
    const fill = document.getElementById('progressFill');
    const percent = document.getElementById('progressPercent');
    setTimeout(() => {
        fill.style.width = `${progress}%`;
    }, 300);
    percent.textContent = `${progress}% Complete`;

    // Steps
    const stepsContainer = document.getElementById('stepsGrid');
    stepsContainer.innerHTML = JOURNEY_STEPS.map(step => {
        let status = 'pending';
        if (step.number < currentStep) status = 'completed';
        else if (step.number === currentStep) status = 'active';

        // Find milestone date
        const milestone = milestones.find(m => parseInt(m.StepNumber) === step.number);
        const dateStr = milestone && milestone.Date ? formatDate(milestone.Date) : '';

        return `
            <div class="step-item ${status}">
                <div class="step-circle">
                    ${status === 'completed' ? '✓' : step.number}
                </div>
                <div class="step-name">${step.name}</div>
                ${dateStr ? `<div class="step-date">${dateStr}</div>` : ''}
            </div>
        `;
    }).join('');
}

// ── Progress Chart ─────────────────────────────────────────
function renderProgressChart(currentStep, totalSteps) {
    const ctx = document.getElementById('progressChartCanvas');
    if (!ctx) return;

    // Destroy existing chart
    if (progressChart) {
        progressChart.destroy();
    }

    const completed = currentStep - 1;
    const inProgress = 1;
    const remaining = totalSteps - currentStep;

    progressChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'In Progress', 'Remaining'],
            datasets: [{
                data: [completed, inProgress, remaining],
                backgroundColor: [
                    '#22C55E',
                    '#00B4D8',
                    '#1E293B'
                ],
                borderColor: [
                    'rgba(34, 197, 94, 0.3)',
                    'rgba(0, 180, 216, 0.3)',
                    'rgba(30, 41, 59, 0.5)'
                ],
                borderWidth: 2,
                hoverOffset: 6,
                borderRadius: 4,
                spacing: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '72%',
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        color: '#94A3B8',
                        padding: 16,
                        font: {
                            family: "'Open Sans', sans-serif",
                            size: 11
                        },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: '#111D33',
                    titleColor: '#E2E8F0',
                    bodyColor: '#94A3B8',
                    borderColor: 'rgba(0, 180, 216, 0.2)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12
                }
            }
        }
    });
}

// ── Documents ──────────────────────────────────────────────
function renderDocuments(documents) {
    const container = document.getElementById('documentsList');

    if (!documents || documents.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📂</div>
                <p>No documents submitted yet. Your counselor will update this as your application progresses.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = documents.map(doc => {
        const statusClass = getDocStatusClass(doc.Status);
        const icon = getDocIcon(doc.DocumentName);

        return `
            <div class="doc-item">
                <div class="doc-info">
                    <span class="doc-icon">${icon}</span>
                    <div>
                        <div class="doc-name">${doc.DocumentName}</div>
                        ${doc.SubmittedDate ? `<div class="doc-date">${formatDate(doc.SubmittedDate)}</div>` : ''}
                    </div>
                </div>
                <span class="badge badge-${statusClass}">${doc.Status}</span>
            </div>
        `;
    }).join('');
}

// ── Timeline ───────────────────────────────────────────────
function renderTimeline(milestones, currentStep) {
    const container = document.getElementById('timelineContainer');

    // If no milestones, generate from journey steps
    const items = milestones.length > 0 ? milestones : JOURNEY_STEPS.map(s => ({
        StepNumber: s.number,
        StepName: s.name,
        Status: s.number < currentStep ? 'Completed' : (s.number === currentStep ? 'In Progress' : 'Pending'),
        Date: '',
        Notes: ''
    }));

    container.innerHTML = items.map(item => {
        const stepNum = parseInt(item.StepNumber) || 0;
        let status = 'pending';
        if (item.Status && item.Status.toLowerCase() === 'completed') status = 'completed';
        else if (item.Status && item.Status.toLowerCase() === 'in progress') status = 'active';
        else if (stepNum < currentStep) status = 'completed';
        else if (stepNum === currentStep) status = 'active';

        return `
            <div class="timeline-item ${status}">
                <div class="timeline-dot"></div>
                <div class="timeline-title">${item.StepName}</div>
                ${item.Date ? `<div class="timeline-meta">📅 ${formatDate(item.Date)}</div>` : ''}
                <span class="badge badge-${status === 'completed' ? 'approved' : (status === 'active' ? 'submitted' : 'pending')}" style="margin-top: 4px;">${item.Status || (status === 'completed' ? 'Completed' : (status === 'active' ? 'In Progress' : 'Pending'))}</span>
                ${item.Notes ? `<div class="timeline-notes">"${item.Notes}"</div>` : ''}
            </div>
        `;
    }).join('');
}

// ── Counselor Card ─────────────────────────────────────────
function renderCounselor(student) {
    const container = document.getElementById('counselorContainer');

    const name = student.CounselorName || 'EV Overseas Team';
    const email = student.CounselorEmail || 'info@evoverseas.com';
    const initials = name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase();

    container.innerHTML = `
        <div class="counselor-card">
            <div class="counselor-avatar">${initials}</div>
            <div class="counselor-info">
                <h3>${name}</h3>
                <p>Your Dedicated Counselor</p>
                <p style="font-size: 0.78rem; color: var(--dash-accent);">${email}</p>
            </div>
        </div>
        <div class="quick-actions">
            <a href="https://wa.me/919666963756?text=Hi, I'm ${encodeURIComponent(student.Name || 'a student')} and I have a query about my application." 
               class="action-btn action-btn-whatsapp" target="_blank" rel="noopener">
                💬 WhatsApp
            </a>
            <a href="mailto:${email}?subject=Application Query - ${student.Name || 'Student'}" 
               class="action-btn action-btn-email">
                ✉️ Email
            </a>
            <a href="tel:+919666963756" class="action-btn action-btn-call">
                📞 Call
            </a>
            <a href="index.html" class="action-btn action-btn-website">
                🌐 Website
            </a>
        </div>
    `;
}

// ── UTILITY FUNCTIONS ──────────────────────────────────────

function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    } catch (e) {
        return dateStr;
    }
}

function getStatusColor(status) {
    if (!status) return 'var(--dash-success)';
    switch (status.toLowerCase()) {
        case 'active': return 'var(--dash-success)';
        case 'completed': return 'var(--dash-info)';
        case 'on hold': return 'var(--dash-warning)';
        default: return 'var(--dash-success)';
    }
}

function getStatusIcon(status) {
    if (!status) return '✅';
    switch (status.toLowerCase()) {
        case 'active': return '✅';
        case 'completed': return '🎉';
        case 'on hold': return '⏸️';
        default: return '✅';
    }
}

function getStatusBadgeClass(status) {
    if (!status) return 'active';
    switch (status.toLowerCase()) {
        case 'active': return 'active';
        case 'completed': return 'completed';
        case 'on hold': return 'on-hold';
        default: return 'active';
    }
}

function getDocStatusClass(status) {
    if (!status) return 'pending';
    switch (status.toLowerCase()) {
        case 'submitted': return 'submitted';
        case 'approved': return 'approved';
        case 'pending': return 'pending';
        case 'under review': return 'review';
        default: return 'pending';
    }
}

function getDocIcon(docName) {
    if (!docName) return '📄';
    const name = docName.toLowerCase();
    if (name.includes('passport')) return '🛂';
    if (name.includes('sop') || name.includes('statement')) return '📝';
    if (name.includes('lor') || name.includes('recommendation')) return '📧';
    if (name.includes('transcript') || name.includes('marksheet')) return '📜';
    if (name.includes('resume') || name.includes('cv')) return '📋';
    if (name.includes('ielts') || name.includes('toefl') || name.includes('gre') || name.includes('gmat')) return '📊';
    if (name.includes('photo') || name.includes('image')) return '🖼️';
    if (name.includes('financial') || name.includes('bank') || name.includes('loan')) return '💰';
    if (name.includes('visa')) return '🛂';
    if (name.includes('offer') || name.includes('admission')) return '🎓';
    return '📄';
}

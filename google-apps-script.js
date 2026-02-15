/* ============================================================
   EV OVERSEAS — Google Apps Script Backend (Multi-Application)
   Handles multiple university applications per student
   ============================================================ */

/**
 * Serves the API for the student dashboard
 * Fetches student profile and all their applications
 * Each student can have multiple university applications
 * 
 * @param {Object} e - Request parameters
 * @param {string} e.parameter.email - Student's email address
 * @returns {Object} JSON response with student data and applications
 */
function doGet(e) {
    // Enable CORS for cross-origin requests
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);

    try {
        // Get email from request parameter
        const email = e.parameter.email;

        if (!email) {
            return output.setContent(JSON.stringify({
                error: 'Email parameter is required',
                message: 'Please provide an email address'
            }));
        }

        const ss = SpreadsheetApp.getActiveSpreadsheet();

        // ============================================
        // STEP 1: Get Student Profile
        // ============================================
        const studentSheet = ss.getSheetByName('Students');

        if (!studentSheet) {
            return output.setContent(JSON.stringify({
                error: 'Configuration Error',
                message: 'Students tab not found in Google Sheet'
            }));
        }

        const studentData = studentSheet.getDataRange().getValues();
        const studentHeaders = studentData[0]; // First row is headers
        const studentRows = studentData.slice(1); // Data starts from row 2

        // Find student by email
        const studentRow = studentRows.find(row => row[0] === email);

        if (!studentRow) {
            return output.setContent(JSON.stringify({
                error: 'Account Not Found',
                message: 'No account found for ' + email + '. Please contact your counselor.',
                email: email
            }));
        }

        // Build student profile object
        const student = {
            email: studentRow[0],
            name: studentRow[1],
            phone: studentRow[2],
            counselorName: studentRow[3],
            counselorEmail: studentRow[4],
            counselorPhone: studentRow[5],
            registrationDate: formatDate(studentRow[6]),
            notes: studentRow[7] || ''
        };

        // ============================================
        // STEP 2: Get All Applications for This Student
        // ============================================
        const appSheet = ss.getSheetByName('Applications');

        if (!appSheet) {
            return output.setContent(JSON.stringify({
                error: 'Configuration Error',
                message: 'Applications tab not found in Google Sheet'
            }));
        }

        const appData = appSheet.getDataRange().getValues();
        const appHeaders = appData[0];
        const appRows = appData.slice(1);

        // Filter applications by student email
        const applications = appRows
            .filter(row => row[0] === email)
            .map(row => ({
                applicationId: row[1],
                country: row[2],
                university: row[3],
                course: row[4],
                intake: row[5],
                currentStep: parseInt(row[6]) || 1,
                overallStatus: row[7] || 'Active',
                startDate: formatDate(row[8]),
                lastUpdated: formatDate(row[9]),
                notes: row[10] || ''
            }));

        if (applications.length === 0) {
            return output.setContent(JSON.stringify({
                error: 'No Applications Found',
                message: 'You don\'t have any university applications yet. Please contact your counselor.',
                student: student
            }));
        }

        // ============================================
        // STEP 3: Get Milestones for Each Application
        // ============================================
        const milestoneSheet = ss.getSheetByName('Milestones');
        const milestoneData = milestoneSheet ? milestoneSheet.getDataRange().getValues() : [];
        const milestoneRows = milestoneData.slice(1);

        // ============================================
        // STEP 4: Get Documents for Each Application
        // ============================================
        const docSheet = ss.getSheetByName('Documents');
        const docData = docSheet ? docSheet.getDataRange().getValues() : [];
        const docRows = docData.slice(1);

        // Attach milestones and documents to each application
        applications.forEach(app => {
            // Get milestones for this specific application
            app.milestones = milestoneRows
                .filter(row => row[0] === app.applicationId)
                .map(row => ({
                    stepNumber: parseInt(row[1]) || 0,
                    stepName: row[2],
                    status: row[3],
                    date: formatDate(row[4]),
                    notes: row[5] || ''
                }))
                .sort((a, b) => a.stepNumber - b.stepNumber);

            // Get documents for this specific application
            app.documents = docRows
                .filter(row => row[0] === app.applicationId)
                .map(row => ({
                    name: row[1],
                    status: row[2],
                    submittedDate: formatDate(row[3]),
                    notes: row[4] || ''
                }));

            // Calculate progress percentage
            const completedSteps = app.milestones.filter(m => m.status === 'Completed').length;
            const totalSteps = 6; // As defined in JOURNEY_STEPS
            app.progressPercentage = Math.round((completedSteps / totalSteps) * 100);
        });

        // ============================================
        // Return Success Response
        // ============================================
        return output.setContent(JSON.stringify({
            success: true,
            student: student,
            applications: applications,
            totalApplications: applications.length
        }));

    } catch (error) {
        // Handle any errors
        return output.setContent(JSON.stringify({
            error: 'Server Error',
            message: 'An unexpected error occurred: ' + error.message
        }));
    }
}

/**
 * Format date for consistent display
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string or empty string
 */
function formatDate(date) {
    if (!date) return '';

    try {
        if (date instanceof Date) {
            return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
        }
        return date.toString();
    } catch (e) {
        return '';
    }
}

/**
 * Test function to verify the API works
 * Run this in Apps Script editor to test
 */
function testAPI() {
    const testEmail = 'mohibmulani@gmail.com'; // Replace with your test email
    const result = doGet({ parameter: { email: testEmail } });
    Logger.log(result.getContent());
}

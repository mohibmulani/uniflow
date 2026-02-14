/**
 * ============================================================
 * EV OVERSEAS — Student Dashboard Backend (Google Apps Script)
 * ============================================================
 * 
 * INSTRUCTIONS:
 * 1. Open your Google Sheet → Extensions → Apps Script
 * 2. Delete any existing code in Code.gs
 * 3. Paste this entire file content into Code.gs
 * 4. Click Deploy → New Deployment → Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the Web App URL and paste it into dashboard.js (APPS_SCRIPT_URL variable)
 * 
 * GOOGLE SHEET TABS REQUIRED:
 * - Tab 1: "Students"   → Headers: Email, Name, Phone, Destination, University, Course, Intake, CurrentStep, OverallStatus, CounselorName, CounselorEmail, StartDate, Notes
 * - Tab 2: "Milestones" → Headers: Email, StepNumber, StepName, Status, Date, Notes
 * - Tab 3: "Documents"  → Headers: Email, DocumentName, Status, SubmittedDate, Notes
 */

// ── Main Entry Point ──────────────────────────────────────────
function doGet(e) {
    // Set CORS headers for cross-origin requests
    var output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);

    try {
        var email = e.parameter.email;
        var action = e.parameter.action || 'getAll';

        if (!email) {
            output.setContent(JSON.stringify({
                success: false,
                error: 'Email parameter is required'
            }));
            return output;
        }

        // Normalize email to lowercase
        email = email.toLowerCase().trim();

        var result;

        switch (action) {
            case 'getStudent':
                result = getStudentData(email);
                break;
            case 'getMilestones':
                result = getMilestones(email);
                break;
            case 'getDocuments':
                result = getDocuments(email);
                break;
            case 'getAll':
            default:
                result = getAllData(email);
                break;
        }

        output.setContent(JSON.stringify(result));
        return output;

    } catch (error) {
        output.setContent(JSON.stringify({
            success: false,
            error: 'Server error: ' + error.message
        }));
        return output;
    }
}

// ── Get All Data for a Student ────────────────────────────────
function getAllData(email) {
    var student = getStudentData(email);

    if (!student.success) {
        return student; // Return the error
    }

    var milestones = getMilestones(email);
    var documents = getDocuments(email);

    return {
        success: true,
        student: student.student,
        milestones: milestones.milestones || [],
        documents: documents.documents || []
    };
}

// ── Get Student Profile ───────────────────────────────────────
function getStudentData(email) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Students');

    if (!sheet) {
        return { success: false, error: 'Students sheet not found' };
    }

    var data = sheet.getDataRange().getValues();
    var headers = data[0];

    // Find the email column index
    var emailIdx = headers.indexOf('Email');
    if (emailIdx === -1) {
        return { success: false, error: 'Email column not found in Students sheet' };
    }

    // Search for the student
    for (var i = 1; i < data.length; i++) {
        if (data[i][emailIdx] && data[i][emailIdx].toString().toLowerCase().trim() === email) {
            var student = {};
            for (var j = 0; j < headers.length; j++) {
                var key = headers[j].toString().trim();
                var value = data[i][j];

                // Format dates
                if (value instanceof Date) {
                    value = Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
                }

                student[key] = value;
            }
            return { success: true, student: student };
        }
    }

    return {
        success: false,
        error: 'Student not found. Please contact EV Overseas to register your account.'
    };
}

// ── Get Milestones ────────────────────────────────────────────
function getMilestones(email) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Milestones');

    if (!sheet) {
        return { success: true, milestones: [] };
    }

    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var emailIdx = headers.indexOf('Email');

    if (emailIdx === -1) {
        return { success: true, milestones: [] };
    }

    var milestones = [];
    for (var i = 1; i < data.length; i++) {
        if (data[i][emailIdx] && data[i][emailIdx].toString().toLowerCase().trim() === email) {
            var milestone = {};
            for (var j = 0; j < headers.length; j++) {
                var key = headers[j].toString().trim();
                var value = data[i][j];

                if (value instanceof Date) {
                    value = Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
                }

                milestone[key] = value;
            }
            milestones.push(milestone);
        }
    }

    // Sort by StepNumber
    milestones.sort(function (a, b) {
        return (parseInt(a.StepNumber) || 0) - (parseInt(b.StepNumber) || 0);
    });

    return { success: true, milestones: milestones };
}

// ── Get Documents ─────────────────────────────────────────────
function getDocuments(email) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Documents');

    if (!sheet) {
        return { success: true, documents: [] };
    }

    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var emailIdx = headers.indexOf('Email');

    if (emailIdx === -1) {
        return { success: true, documents: [] };
    }

    var documents = [];
    for (var i = 1; i < data.length; i++) {
        if (data[i][emailIdx] && data[i][emailIdx].toString().toLowerCase().trim() === email) {
            var doc = {};
            for (var j = 0; j < headers.length; j++) {
                var key = headers[j].toString().trim();
                var value = data[i][j];

                if (value instanceof Date) {
                    value = Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
                }

                doc[key] = value;
            }
            documents.push(doc);
        }
    }

    return { success: true, documents: documents };
}

// ── Utility: Test the script from the editor ──────────────────
function testGetAll() {
    var mockEvent = {
        parameter: {
            email: 'test@gmail.com',
            action: 'getAll'
        }
    };

    var result = doGet(mockEvent);
    Logger.log(result.getContent());
}

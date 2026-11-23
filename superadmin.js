
/* ==========================================
   ALONG DIGITAL
   SUPER ADMIN PANEL JAVASCRIPT

   Backend: Separate Google Apps Script
   ========================================== */


/* ==========================================
   1. BACKEND CONFIGURATION
========================================== */

// Yahan Super Admin ke NEW Apps Script Web App
// deployment URL ko baad mein paste karna hai.
// Entry.js wala URL yahan use mat karna.

const SUPERADMIN_API_URL = "PASTE_SUPERADMIN_WEB_APP_URL_HERE";


/* ==========================================
   2. ELEMENTS
========================================== */

const loginPage = document.querySelector("#loginPage");
const dashboardPage = document.querySelector("#dashboardPage");

const loginForm = document.querySelector("#superAdminForm");
const loginBtn = document.querySelector("#loginBtn");
const loginMessage = document.querySelector("#loginMessage");

const logoutBtn = document.querySelector("#logoutBtn");
const sidebar = document.querySelector("#sidebar");
const menuToggle = document.querySelector("#menuToggle");

const pageTitle = document.querySelector("#pageTitle");


/* ==========================================
   3. SESSION
========================================== */

// Session token backend generate karega.
// Password aur Secret Key browser mein save nahi honge.

let sessionToken = sessionStorage.getItem("AD_SUPERADMIN_TOKEN") || "";

let currentUser = sessionStorage.getItem("AD_SUPERADMIN_USER") || "";


/* ==========================================
   4. HELPER FUNCTIONS
========================================== */

function showLoginMessage(message, type = "error") {

  loginMessage.textContent = message;
  loginMessage.className = type;
  loginMessage.style.display = "block";

}


function hideLoginMessage() {

  loginMessage.textContent = "";
  loginMessage.className = "";
  loginMessage.style.display = "none";

}


function escapeHTML(value) {

  return String(value ?? "").replace(/[&<>"']/g, char => {

    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };

    return entities[char];

  });

}


function setText(selector, value) {

  const element = document.querySelector(selector);

  if (element) {
    element.textContent = value ?? "—";
  }

}


function showTableMessage(selector, message, colspan) {

  const tbody = document.querySelector(selector);

  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="${colspan}">
        ${escapeHTML(message)}
      </td>
    </tr>
  `;

}


/* ==========================================
   5. BACKEND REQUEST FUNCTION
========================================== */

async function apiRequest(action, data = {}) {

  if (
    !SUPERADMIN_API_URL ||
    SUPERADMIN_API_URL.includes("PASTE_SUPERADMIN")
  ) {
    throw new Error("Super Admin backend URL is not configured.");
  }

  const payload = {
    action: action,
    ...data
  };

  if (sessionToken && action !== "superAdminLogin") {
    payload.sessionToken = sessionToken;
  }

  const response = await fetch(SUPERADMIN_API_URL, {

    method: "POST",

    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },

    body: JSON.stringify(payload),

    redirect: "follow"

  });

  if (!response.ok) {
    throw new Error("Server connection failed.");
  }

  const result = await response.json();

  if (!result || typeof result !== "object") {
    throw new Error("Invalid server response.");
  }

  if (result.success !== true) {

    if (
      result.code === "UNAUTHORIZED" ||
      result.code === "SESSION_EXPIRED"
    ) {
      logout(false);
    }

    throw new Error(result.message || "Request failed.");

  }

  return result;

}


/* ==========================================
   6. PASSWORD SHOW / HIDE
========================================== */

document.querySelectorAll(".toggle-password").forEach(button => {

  button.addEventListener("click", function() {

    const target = document.getElementById(
      this.dataset.target
    );

    if (!target) return;

    const isHidden = target.type === "password";

    target.type = isHidden ? "text" : "password";

    this.textContent = isHidden ? "Hide" : "Show";

  });

});


/* ==========================================
   7. LOGIN
========================================== */

loginForm.addEventListener("submit", async function(event) {

  event.preventDefault();

  hideLoginMessage();

  const userID = document.querySelector("#superUserID").value.trim();
  const password = document.querySelector("#superPassword").value;
  const secretKey = document.querySelector("#secretKey").value;

  if (!userID || !password || !secretKey) {

    showLoginMessage("Please complete all login fields.");
    return;

  }

  loginBtn.disabled = true;
  loginBtn.textContent = "Authenticating...";

  try {

    const result = await apiRequest("superAdminLogin", {

      userID: userID,
      password: password,
      secretKey: secretKey

    });

    if (!result.sessionToken) {
      throw new Error("Server did not return a valid session.");
    }

    sessionToken = result.sessionToken;
    currentUser = result.userID || userID;

    // Only temporary session information is stored.
    sessionStorage.setItem("AD_SUPERADMIN_TOKEN", sessionToken);
    sessionStorage.setItem("AD_SUPERADMIN_USER", currentUser);

    // Clear sensitive fields.
    document.querySelector("#superPassword").value = "";
    document.querySelector("#secretKey").value = "";

    openDashboard();

  } catch (error) {

    console.error("Super Admin Login Error:", error);

    showLoginMessage(error.message || "Login failed.");

  } finally {

    loginBtn.disabled = false;
    loginBtn.textContent = "Secure Login";

  }

});


/* ==========================================
   8. OPEN DASHBOARD
========================================== */

function openDashboard() {

  if (!sessionToken) return;

  loginPage.hidden = true;
  dashboardPage.hidden = false;

  setText("#superAdminName", currentUser || "Super Admin");
  setText("#settingsUserID", currentUser || "—");

  loadDashboard();

}


/* ==========================================
   9. LOGOUT
========================================== */

function logout(showMessage = true) {

  sessionToken = "";
  currentUser = "";

  sessionStorage.removeItem("AD_SUPERADMIN_TOKEN");
  sessionStorage.removeItem("AD_SUPERADMIN_USER");

  dashboardPage.hidden = true;
  loginPage.hidden = false;

  loginForm.reset();

  if (showMessage) {
    hideLoginMessage();
  }

  if (sidebar) {
    sidebar.classList.remove("open");
  }

}


logoutBtn.addEventListener("click", function() {

  logout(true);

});


/* ==========================================
   10. SIDEBAR NAVIGATION
========================================== */

const sectionNames = {

  overview: "Overview",
  keyGenerator: "Activation Keys",
  adminManagement: "Admin Management",
  emailTemplates: "Email Templates",
  entryRecords: "Entry Records",
  activityLogs: "Activity Logs",
  settings: "Settings"

};


function openSection(sectionID) {

  const target = document.getElementById(sectionID);

  if (!target || !sectionNames[sectionID]) return;

  document.querySelectorAll(".dashboard-section").forEach(section => {

    section.classList.remove("active");

  });

  target.classList.add("active");

  document.querySelectorAll(".nav-link").forEach(button => {

    button.classList.toggle(
      "active",
      button.dataset.section === sectionID
    );

  });

  pageTitle.textContent = sectionNames[sectionID];

  sidebar.classList.remove("open");

  if (sectionID === "keyGenerator") {
    loadKeys();
  }

  if (sectionID === "adminManagement") {
    loadAdmins();
  }

  if (sectionID === "entryRecords") {
    loadEntries();
  }

  if (sectionID === "activityLogs") {
    loadLogs();
  }

}


document.querySelectorAll("[data-section]").forEach(button => {

  button.addEventListener("click", function() {

    openSection(this.dataset.section);

  });

});


/* ==========================================
   11. MOBILE SIDEBAR
========================================== */

menuToggle.addEventListener("click", function() {

  sidebar.classList.toggle("open");

});


document.addEventListener("click", function(event) {

  if (window.innerWidth > 768) return;

  const clickedInsideSidebar = sidebar.contains(event.target);
  const clickedMenu = menuToggle.contains(event.target);

  if (!clickedInsideSidebar && !clickedMenu) {
    sidebar.classList.remove("open");
  }

});


/* ==========================================
   12. DASHBOARD STATISTICS
========================================== */

async function loadDashboard() {

  try {

    const result = await apiRequest("getDashboardData");

    const data = result.data || {};

    setText("#totalAdmins", data.totalAdmins ?? 0);
    setText("#pendingAdmins", data.pendingAdmins ?? 0);
    setText("#unusedKeys", data.unusedKeys ?? 0);
    setText("#usedKeys", data.usedKeys ?? 0);

  } catch (error) {

    console.error("Dashboard Error:", error);

  }

}


/* ==========================================
   13. ACTIVATION KEY GENERATOR
========================================== */

const keyForm = document.querySelector("#keyForm");
const generateKeyBtn = document.querySelector("#generateKeyBtn");


keyForm.addEventListener("submit", async function(event) {

  event.preventDefault();

  const expiryDays = Number(
    document.querySelector("#keyExpiry").value
  );

  const note = document.querySelector("#keyNote").value.trim();

  generateKeyBtn.disabled = true;
  generateKeyBtn.textContent = "Generating...";

  try {

    const result = await apiRequest("generateActivationKey", {

      expiryDays: expiryDays,
      note: note

    });

    const key = result.data?.activationKey;

    if (!key) {
      throw new Error("Server did not return an activation key.");
    }

    document.querySelector("#generatedKey").textContent = key;

    document.querySelector("#generatedKeyBox").hidden = false;

    keyForm.reset();

    await loadKeys();
    await loadDashboard();

  } catch (error) {

    alert(error.message || "Unable to generate activation key.");

    console.error("Key Generation Error:", error);

  } finally {

    generateKeyBtn.disabled = false;
    generateKeyBtn.textContent = "Generate Activation Key";

  }

});


/* ==========================================
   14. COPY ACTIVATION KEY
========================================== */

document.querySelector("#copyKeyBtn").addEventListener("click", async function() {

  const key = document.querySelector("#generatedKey").textContent;

  if (!key) return;

  try {

    await navigator.clipboard.writeText(key);

    this.textContent = "Copied!";

  } catch (error) {

    alert("Copy failed. Please copy the key manually.");

  }

  setTimeout(() => {

    this.textContent = "Copy Key";

  }, 2000);

});


/* ==========================================
   15. LOAD ACTIVATION KEYS
========================================== */

async function loadKeys() {

  showTableMessage("#keysTableBody", "Loading records...", 4);

  try {

    const result = await apiRequest("getActivationKeys");

    const keys = result.data?.keys || [];

    const tbody = document.querySelector("#keysTableBody");

    if (!keys.length) {

      showTableMessage("#keysTableBody", "No activation keys found.", 4);
      return;

    }

    tbody.innerHTML = keys.map(item => `

      <tr>
        <td>${escapeHTML(item.activationKey)}</td>
        <td>${escapeHTML(item.status)}</td>
        <td>${escapeHTML(item.expiry)}</td>
        <td>${escapeHTML(item.createdAt)}</td>
      </tr>

    `).join("");

  } catch (error) {

    showTableMessage("#keysTableBody", error.message, 4);

  }

}


/* ==========================================
   16. LOAD ADMIN RECORDS
========================================== */

async function loadAdmins() {

  showTableMessage("#adminsTableBody", "Loading admins...", 5);

  try {

    const result = await apiRequest("getAdmins");

    const admins = result.data?.admins || [];

    const tbody = document.querySelector("#adminsTableBody");

    if (!admins.length) {

      showTableMessage("#adminsTableBody", "No admin records found.", 5);
      return;

    }

    tbody.innerHTML = admins.map(admin => `

      <tr>
        <td>${escapeHTML(admin.userID)}</td>
        <td>${escapeHTML(admin.fullName)}</td>
        <td>${escapeHTML(admin.email)}</td>
        <td>${escapeHTML(admin.status)}</td>
        <td>—</td>
      </tr>

    `).join("");

  } catch (error) {

    showTableMessage("#adminsTableBody", error.message, 5);

  }

}


/* ==========================================
   17. LOAD ENTRY RECORDS
========================================== */

async function loadEntries() {

  showTableMessage("#entriesTableBody", "Loading entries...", 5);

  try {

    const result = await apiRequest("getEntryRecords");

    const entries = result.data?.entries || [];

    const tbody = document.querySelector("#entriesTableBody");

    if (!entries.length) {

      showTableMessage("#entriesTableBody", "No entry records found.", 5);
      return;

    }

    tbody.innerHTML = entries.map(entry => `

      <tr>
        <td>${escapeHTML(entry.userID)}</td>
        <td>${escapeHTML(entry.fullName)}</td>
        <td>${escapeHTML(entry.email)}</td>
        <td>${escapeHTML(entry.createdAt)}</td>
        <td>${escapeHTML(entry.status)}</td>
      </tr>

    `).join("");

  } catch (error) {

    showTableMessage("#entriesTableBody", error.message, 5);

  }

}


/* ==========================================
   18. LOAD ACTIVITY LOGS
========================================== */

async function loadLogs() {

  showTableMessage("#logsTableBody", "Loading activity logs...", 4);

  try {

    const result = await apiRequest("getActivityLogs");

    const logs = result.data?.logs || [];

    const tbody = document.querySelector("#logsTableBody");

    if (!logs.length) {

      showTableMessage("#logsTableBody", "No activity logs found.", 4);
      return;

    }

    tbody.innerHTML = logs.map(log => `

      <tr>
        <td>${escapeHTML(log.createdAt)}</td>
        <td>${escapeHTML(log.activity)}</td>
        <td>${escapeHTML(log.performedBy)}</td>
        <td>${escapeHTML(log.details)}</td>
      </tr>

    `).join("");

  } catch (error) {

    showTableMessage("#logsTableBody", error.message, 4);

  }

}


/* ==========================================
   19. EMAIL TEMPLATE GENERATOR
========================================== */

const emailForm = document.querySelector("#emailForm");

emailForm.addEventListener("submit", function(event) {

  event.preventDefault();

  const name = document.querySelector("#adminName").value.trim();
  const email = document.querySelector("#adminEmail").value.trim();
  const userID = document.querySelector("#adminUserID").value.trim();
  const key = document.querySelector("#emailActivationKey").value.trim();

  const template = `
Hello ${name},

Welcome to Along Digital!

Your administrator registration has been authorized.

Your account details:

Name: ${name}
User ID: ${userID}
Activation Key: ${key}

Registration Instructions:

1. Visit the Along Digital Admin Registration page.
2. Enter your personal details.
3. Create your account password.
4. Enter the activation key provided above.
5. Submit your registration.

Your activation key is single-use and subject to its expiry date.

Please keep this key confidential.

Regards,
Along Digital
Super Admin Team

© 2026 ALL RIGHTS RESERVED
  `.trim();

  document.querySelector("#emailPreview").value = template;

});


/* ==========================================
   20. OPEN EMAIL APPLICATION
========================================== */

document.querySelector("#sendEmailBtn").addEventListener("click", function() {

  const email = document.querySelector("#adminEmail").value.trim();

  const preview = document.querySelector("#emailPreview").value.trim();

  if (!email) {

    alert("Please enter the admin email address.");
    return;

  }

  if (!preview) {

    alert("Please generate the email template first.");
    return;

  }

  const subject = "Along Digital - Admin Account Activation";

  const mailtoURL =
    "mailto:" + encodeURIComponent(email) +
    "?subject=" + encodeURIComponent(subject) +
    "&body=" + encodeURIComponent(preview);

  window.location.href = mailtoURL;

});


/* ==========================================
   21. INITIALIZATION
========================================== */

function initializePanel() {

  if (sessionToken && currentUser) {

    openDashboard();

  } else {

    logout(false);

  }

  console.log("Along Digital Super Admin JS Loaded.");

}


initializePanel();


/* ==========================================
   END OF FILE
========================================== */
  


/* ==========================================
   ALONG DIGITAL - ADMIN REGISTRATION
   Frontend JavaScript
========================================== */

// 1. GOOGLE APPS SCRIPT WEB APP URL
const SCRIPT_URL = "PASTE_YOUR_DEPLOYED_WEB_APP_URL_HERE";


// 2. ELEMENTS
const adminForm = document.querySelector("#adminForm");
const message = document.querySelector("#message");
const submitBtn = document.querySelector("#submitBtn");


// 3. SHOW MESSAGE
function showMessage(text, success = false) {

  message.textContent = text;

  message.className = success ? "success" : "error";

  message.style.display = "block";

  message.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}


// 4. HIDE MESSAGE
function hideMessage() {

  message.textContent = "";
  message.className = "";
  message.style.display = "none";

}


// 5. PASSWORD SHOW / HIDE
document.querySelectorAll(".toggle-password").forEach(button => {

  button.addEventListener("click", () => {

    const target = document.getElementById(
      button.dataset.target
    );

    if (!target) return;

    if (target.type === "password") {

      target.type = "text";
      button.textContent = "Hide";

    } else {

      target.type = "password";
      button.textContent = "Show";

    }

  });

});


// 6. FORM SUBMISSION
adminForm.addEventListener("submit", async function(event) {

  event.preventDefault();

  hideMessage();

  // Get form values
  const userID = document.querySelector("#userID").value.trim();

  const fullName = document.querySelector("#fullName").value.trim();

  const email = document.querySelector("#email").value.trim();

  const mobile = document.querySelector("#mobile").value.trim();

  const password = document.querySelector("#password").value;

  const confirmPassword = document.querySelector("#confirmPassword").value;

  const activationKey = document.querySelector("#activationKey").value.trim();

  const securityQuestion1 = document.querySelector("#securityQuestion1").value;

  const securityAnswer1 = document.querySelector("#securityAnswer1").value.trim();

  const securityQuestion2 = document.querySelector("#securityQuestion2").value;

  const securityAnswer2 = document.querySelector("#securityAnswer2").value.trim();


  // 7. BASIC VALIDATION

  if (!userID || !fullName || !email || !mobile) {

    showMessage("Please complete all personal information.");
    return;

  }

  if (userID.length < 4) {

    showMessage("User ID must contain at least 4 characters.");
    return;

  }

  if (password.length < 10) {

    showMessage("Password must contain at least 10 characters.");
    return;

  }

  if (password !== confirmPassword) {

    showMessage("Password and Confirm Password do not match.");
    return;

  }

  if (securityQuestion1 === securityQuestion2) {

    showMessage("Please select two different security questions.");
    return;

  }

  if (!securityAnswer1 || !securityAnswer2) {

    showMessage("Please enter both security answers.");
    return;

  }

  if (!activationKey) {

    showMessage("Please enter your activation key.");
    return;

  }


  // 8. PREPARE DATA FOR BACKEND

  const formData = {

    action: "createAdmin",

    userID: userID,

    fullName: fullName,

    email: email,

    mobile: mobile,

    password: password,

    confirmPassword: confirmPassword,

    activationKey: activationKey,

    securityQuestion1: securityQuestion1,

    securityAnswer1: securityAnswer1,

    securityQuestion2: securityQuestion2,

    securityAnswer2: securityAnswer2

  };


  // 9. LOADING STATE

  submitBtn.disabled = true;

  submitBtn.textContent = "Submitting Registration...";


  try {

    // 10. SEND DATA TO GOOGLE APPS SCRIPT

    const response = await fetch(SCRIPT_URL, {

      method: "POST",

      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },

      body: JSON.stringify(formData)

    });


    if (!response.ok) {

      throw new Error("Server connection failed.");

    }


    const result = await response.json();


    // 11. HANDLE RESPONSE

    if (result.success) {

      showMessage(
        result.message || "Registration submitted successfully.",
        true
      );

      adminForm.reset();

      document.querySelectorAll(".toggle-password").forEach(button => {
        button.textContent = "Show";
      });

      document.querySelectorAll(".password-wrapper input").forEach(input => {
        input.type = "password";
      });

    } else {

      showMessage(
        result.message || "Registration failed. Please try again."
      );

    }


  } catch (error) {

    console.error("Registration Error:", error);

    showMessage(
      "Unable to connect to the server. Please check your internet connection and backend URL."
    );

  } finally {

    // 12. RESET BUTTON

    submitBtn.disabled = false;

    submitBtn.textContent = "Submit Registration";

  }

});
    


/* ==========================================
   ALONG DIGITAL
   ADMIN REGISTRATION JAVASCRIPT
   Backend: Google Apps Script
========================================== */


/* 1. BACKEND URL */

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzuuhjRrvIjIfItJ0DuD7z9iNJmGxfOSHf1xxx3wvHsUhULyrSkkO55gOJCRW-fnnJpww/exec";


/* 2. ELEMENTS */

const adminForm = document.querySelector("#adminForm");
const message = document.querySelector("#message");
const submitBtn = document.querySelector("#submitBtn");


/* 3. SHOW MESSAGE */

function showMessage(text, type = "error") {

  message.textContent = text;
  message.className = type;
  message.style.display = "block";

  message.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

}


/* 4. HIDE MESSAGE */

function hideMessage() {

  message.textContent = "";
  message.className = "";
  message.style.display = "none";

}


/* 5. PASSWORD SHOW / HIDE */

document.querySelectorAll(".toggle-password").forEach(button => {

  button.addEventListener("click", () => {

    const target = document.getElementById(
      button.dataset.target
    );

    if (!target) return;

    const isPassword = target.type === "password";

    target.type = isPassword ? "text" : "password";

    button.textContent = isPassword ? "Hide" : "Show";

  });

});


/* 6. PREVENT SAME SECURITY QUESTIONS */

const question1 = document.querySelector("#securityQuestion1");
const question2 = document.querySelector("#securityQuestion2");

function validateQuestions() {

  if (
    question1.value &&
    question2.value &&
    question1.value === question2.value
  ) {

    question2.setCustomValidity(
      "Please select a different security question."
    );

  } else {

    question2.setCustomValidity("");

  }

}

question1.addEventListener("change", validateQuestions);
question2.addEventListener("change", validateQuestions);


/* 7. USER ID INPUT */

document.querySelector("#userID").addEventListener("input", function() {

  this.value = this.value.trim();

});


/* 8. FORM SUBMISSION */

adminForm.addEventListener("submit", async function(event) {

  event.preventDefault();

  hideMessage();

  validateQuestions();

  if (!adminForm.reportValidity()) {
    return;
  }


  /* GET FORM DATA */

  const formData = {

    action: "createAdmin",

    userID: document.querySelector("#userID").value.trim(),

    fullName: document.querySelector("#fullName").value.trim(),

    email: document.querySelector("#email").value.trim(),

    mobile: document.querySelector("#mobile").value.trim(),

    password: document.querySelector("#password").value,

    confirmPassword: document.querySelector("#confirmPassword").value,

    activationKey: document.querySelector("#activationKey").value.trim(),

    securityQuestion1: question1.value,

    securityAnswer1: document.querySelector("#securityAnswer1").value.trim(),

    securityQuestion2: question2.value,

    securityAnswer2: document.querySelector("#securityAnswer2").value.trim()

  };


  /* CLIENT-SIDE VALIDATION */

  if (formData.userID.length < 4) {

    showMessage("User ID must contain at least 4 characters.");
    return;

  }


  if (!/^[a-zA-Z0-9._-]{4,32}$/.test(formData.userID)) {

    showMessage("User ID contains invalid characters.");
    return;

  }


  if (formData.password.length < 10) {

    showMessage("Password must contain at least 10 characters.");
    return;

  }


  if (formData.password !== formData.confirmPassword) {

    showMessage("Passwords do not match.");
    return;

  }


  if (formData.securityQuestion1 === formData.securityQuestion2) {

    showMessage("Please select two different security questions.");
    return;

  }


  if (!formData.activationKey) {

    showMessage("Please enter your activation key.");
    return;

  }


  /* LOADING STATE */

  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";


  try {

    /* SEND REQUEST TO GOOGLE APPS SCRIPT */

    const response = await fetch(SCRIPT_URL, {

      method: "POST",

      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },

      body: JSON.stringify(formData),

      redirect: "follow"

    });


    if (!response.ok) {

      throw new Error("Server returned an error.");

    }


    const result = await response.json();


    /* HANDLE BACKEND RESPONSE */

    if (result.success === true) {

      showMessage(
        result.message || "Registration successful.",
        "success"
      );

      adminForm.reset();

      // Reset password visibility
      document.querySelectorAll(".password-wrapper input").forEach(input => {
        input.type = "password";
      });

      document.querySelectorAll(".toggle-password").forEach(button => {
        button.textContent = "Show";
      });

      question2.setCustomValidity("");

    } else {

      showMessage(
        result.message || "Registration failed. Please try again."
      );

    }


  } catch (error) {

    console.error("Along Digital Registration Error:", error);

    showMessage(
      "Unable to connect to the server. Please check your internet connection and Web App URL."
    );

  } finally {

    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Registration";

  }

});


/* 9. INITIALIZATION */

hideMessage();

console.log("Along Digital Registration JS Loaded Successfully.");

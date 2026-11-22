
const form = document.getElementById("contactForm");
const statusMessage = document.getElementById("formStatus");

if (form && statusMessage) {
  form.addEventListener("submit", function(event) {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const config = window.ALONG_CONFIG?.backend || {};
    const number = (config.whatsappNumber || "").replace(/\D/g, "");

    if (!number) {
      statusMessage.textContent = "WhatsApp number is not configured.";
      return;
    }

    const data = new FormData(form);

    const message = `
Hello Along Digital! 👋

I want to discuss a website project.

👤 Name: ${data.get("name")}
📧 Email: ${data.get("email")}
📱 WhatsApp: ${data.get("phone") || "Not provided"}

🌐 Requirement: ${data.get("requirement")}
💰 Budget: ${data.get("budget")}

📝 Project Details:
${data.get("message") || "Not provided"}

Sent through Along Digital Website.
    `.trim();

    const url =
      "https://wa.me/" + number +
      "?text=" + encodeURIComponent(message);

    statusMessage.textContent =
      "Opening WhatsApp. Please press Send to submit your inquiry.";

    window.open(url, "_blank", "noopener,norefer
                rer");
  });
}

const menu = document.getElementById("menu");
const nav = document.getElementById("nav");

menu.addEventListener("click", () => {
  nav.classList.toggle("active");
  menu.textContent = nav.classList.contains("active") ? "✕" : "☰";
});

document.querySelectorAll("#nav a").forEach(link => {
  link.addEventListener("click", () => {
    nav.classList.remove("active");
    menu.textContent = "☰";
  });
});

// Reveal animation on scroll
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.animate(
        [
          { opacity: 0, transform: "translateY(35px)" },
          { opacity: 1, transform: "translateY(0)" }
        ],
        { duration: 850, easing: "ease-out", fill: "forwards" }
      );
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll(".section").forEach(section => {
  section.style.opacity = "0";
  observer.observe(section);
});

/* Shared interactions for Taste of Freetown */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-year]").forEach(el => el.textContent = new Date().getFullYear());

  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    });
    nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
      nav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }));
  }

  // Menu category filtering
  const filterButtons = document.querySelectorAll("[data-filter]");
  const menuCards = document.querySelectorAll(".menu-card[data-category]");
  if (filterButtons.length && menuCards.length) {
    filterButtons.forEach(button => button.addEventListener("click", () => {
      filterButtons.forEach(item => item.classList.toggle("active", item === button));
      const filter = button.dataset.filter;
      menuCards.forEach(card => card.hidden = !(filter === "all" || card.dataset.category === filter));
      document.querySelectorAll(".menu-category-title").forEach(title => {
        const section = title.nextElementSibling;
        if (section && section.classList.contains("menu-grid")) {
          title.hidden = !Array.from(section.querySelectorAll(".menu-card")).some(card => !card.hidden);
        }
      });
    }));
  }

  // A front-end order preview; it does not submit a real food order.
  const cart = [];
  document.querySelectorAll(".add-cart").forEach(button => button.addEventListener("click", () => {
    cart.push({ name: button.dataset.name, price: Number(button.dataset.price) });
    const count = document.querySelector("#cart-count");
    const items = document.querySelector("#cart-items");
    const total = document.querySelector("#cart-total");
    if (count) count.textContent = cart.length;
    if (items) items.textContent = cart.map((item, i) => `${i + 1}. ${item.name}`).join(" · ");
    if (total) total.textContent = `Le ${cart.reduce((sum, item) => sum + item.price, 0)}`;
    const original = button.textContent;
    button.textContent = "Added ✓";
    window.setTimeout(() => button.textContent = original, 900);
  }));

  // Four-step booking flow with browser-side validation.
  const bookingForm = document.querySelector("#booking-form");
  if (bookingForm) {
    let currentStep = 1;
    const steps = [...bookingForm.querySelectorAll(".booking-step")];
    const dots = [...bookingForm.querySelectorAll(".progress-dot")];
    const titles = {
      1: ["Step 1: Date & time", "Choose when you would like to visit us."],
      2: ["Step 2: Party size", "Tell us how many guests will be joining you."],
      3: ["Step 3: Your details", "Add contact details so the restaurant can follow up."],
      4: ["Step 4: Confirmation", "Review the request confirmation."]
    };
    const showStep = step => {
      currentStep = step;
      steps.forEach(panel => panel.classList.toggle("active", Number(panel.dataset.step) === step));
      dots.forEach((dot, i) => {
        dot.classList.toggle("current", i + 1 === step);
        dot.classList.toggle("done", i + 1 < step);
      });
      const title = document.querySelector("#booking-step-title");
      const description = document.querySelector("#booking-step-description");
      if (title) title.textContent = titles[step][0];
      if (description) description.textContent = titles[step][1];
    };
    const validateStep = () => {
      const panel = steps.find(item => Number(item.dataset.step) === currentStep);
      const fields = [...panel.querySelectorAll("input,select,textarea")].filter(el => el.required);
      for (const field of fields) {
        if (!field.reportValidity()) return false;
      }
      return true;
    };
    bookingForm.querySelectorAll("[data-next]").forEach(button => button.addEventListener("click", () => {
      if (validateStep()) showStep(Math.min(3, currentStep + 1));
    }));
    bookingForm.querySelectorAll("[data-prev]").forEach(button => button.addEventListener("click", () => showStep(Math.max(1, currentStep - 1))));
    const dateInput = document.querySelector("#booking-date");
    if (dateInput) {
      const today = new Date();
      const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
      dateInput.min = localToday;
    }
    bookingForm.addEventListener("submit", event => {
      event.preventDefault();
      if (!validateStep()) return;
      const data = new FormData(bookingForm);
      const details = document.querySelector("#confirmation-details");
      const safe = value => String(value || "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
      if (details) details.innerHTML = `<strong>${safe(data.get("fullName"))}</strong>, your request is for <strong>${safe(data.get("guests"))} guest(s)</strong> on <strong>${safe(data.get("date"))}</strong> at <strong>${safe(data.get("time"))}</strong>. Please note this is a demonstration, not a live confirmed booking.`;
      showStep(4);
    });
  }

  // Contact form demonstration. No data is sent or stored.
  const contactForm = document.querySelector("#contact-form");
  if (contactForm) contactForm.addEventListener("submit", event => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;
    const feedback = document.querySelector("#contact-feedback");
    if (feedback) feedback.textContent = "Thank you! The form works in demo mode, but no message has been sent to the restaurant.";
    contactForm.reset();
  });
});

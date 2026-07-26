(function () {
  function getImageSource(trigger) {
    const directImage = trigger.querySelector("img");

    if (directImage && directImage.getAttribute("src")) {
      return directImage.getAttribute("src");
    }

    const computed = window.getComputedStyle(trigger);
    const backgroundImage = computed.backgroundImage || "";
    const matches = Array.from(backgroundImage.matchAll(/url\((['\"]?)(.*?)\1\)/g));

    if (!matches.length) {
      return "";
    }

    return matches[matches.length - 1][2];
  }

  const year = document.getElementById("year");
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  const lightbox = document.getElementById("image-lightbox");
  const previewImage = document.getElementById("lightbox-image");
  const title = document.getElementById("lightbox-title");
  const closeBtn = document.getElementById("lightbox-close");

  if (!lightbox || !previewImage || !title || !closeBtn) {
    return;
  }

  const triggers = Array.from(document.querySelectorAll(".js-lightbox-trigger"));
  let lastTrigger = null;

  function openLightbox(trigger) {
    const src = getImageSource(trigger);

    if (!src) {
      return;
    }

    const label = trigger.getAttribute("data-lightbox-label") || trigger.getAttribute("aria-label") || "Artwork preview";

    previewImage.src = src;
    previewImage.alt = label;
    title.textContent = label;

    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    previewImage.src = "";

    if (lastTrigger) {
      lastTrigger.focus();
    }
  }

  triggers.forEach(function (trigger) {
    trigger.tabIndex = trigger.tabIndex >= 0 ? trigger.tabIndex : 0;
    trigger.setAttribute("aria-haspopup", "dialog");

    trigger.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      lastTrigger = trigger;
      openLightbox(trigger);
    });

    trigger.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        lastTrigger = trigger;
        openLightbox(trigger);
      }
    });
  });

  closeBtn.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", function (event) {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
      closeLightbox();
    }
  });
})();

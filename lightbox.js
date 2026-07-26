(function () {
  function getImageSource(trigger) {
    const directImage = trigger.querySelector("img");

    if (directImage && directImage.getAttribute("src")) {
      return directImage.getAttribute("src");
    }

    const computed = window.getComputedStyle(trigger);
    const backgroundImage = computed.backgroundImage || "";

    // Prefer quoted url() matches so filenames with parentheses remain intact.
    const quotedMatches = Array.from(backgroundImage.matchAll(/url\((?:\"([^\"]+)\"|'([^']+)')\)/g));
    if (quotedMatches.length) {
      const last = quotedMatches[quotedMatches.length - 1];
      return last[1] || last[2] || "";
    }

    const bareMatches = Array.from(backgroundImage.matchAll(/url\(([^)]+)\)/g));
    if (bareMatches.length) {
      return bareMatches[bareMatches.length - 1][1].trim();
    }

    return "";
  }

  const year = document.getElementById("year");
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  const lightbox = document.getElementById("image-lightbox");
  const previewImage = document.getElementById("lightbox-image");
  const title = document.getElementById("lightbox-title");
  const closeBtn = document.getElementById("lightbox-close");
  const media = previewImage ? previewImage.parentElement : null;

  if (!lightbox || !previewImage || !title || !closeBtn || !media) {
    return;
  }

  const prevBtn = document.createElement("button");
  prevBtn.type = "button";
  prevBtn.className = "lightbox-nav lightbox-nav-prev";
  prevBtn.setAttribute("aria-label", "Previous image");
  prevBtn.textContent = "‹";

  const nextBtn = document.createElement("button");
  nextBtn.type = "button";
  nextBtn.className = "lightbox-nav lightbox-nav-next";
  nextBtn.setAttribute("aria-label", "Next image");
  nextBtn.textContent = "›";

  media.appendChild(prevBtn);
  media.appendChild(nextBtn);

  const triggers = Array.from(document.querySelectorAll(".js-lightbox-trigger"));
  let lastTrigger = null;
  let galleryLabel = "Artwork preview";
  let gallerySources = [];
  let galleryIndex = 0;
  let suppressNav = false;
  let navMode = "none";
  let currentTrigger = null;
  let groupedTriggers = [];

  function parseGallerySources(trigger, primarySource) {
    const galleryAttr = trigger.getAttribute("data-lightbox-gallery") || "";
    const extras = galleryAttr
      .split("|")
      .map(function (item) {
        return item.trim();
      })
      .filter(Boolean);

    const merged = [primarySource].concat(extras).filter(Boolean);
    const seen = new Set();

    return merged.filter(function (src) {
      if (seen.has(src)) {
        return false;
      }

      seen.add(src);
      return true;
    });
  }

  function updateNavState() {
    const hasNavigation = !suppressNav && navMode !== "none";
    prevBtn.hidden = !hasNavigation;
    nextBtn.hidden = !hasNavigation;
  }

  function updateTitle() {
    if (navMode === "gallery" && gallerySources.length > 1) {
      title.textContent = galleryLabel + " (" + (galleryIndex + 1) + "/" + gallerySources.length + ")";
      return;
    }

    if (navMode === "layout" && groupedTriggers.length > 1 && currentTrigger) {
      const currentIndex = groupedTriggers.indexOf(currentTrigger);
      title.textContent = galleryLabel + " (" + (currentIndex + 1) + "/" + groupedTriggers.length + ")";
      return;
    }

    title.textContent = galleryLabel;
  }

  function showGalleryImage(index) {
    if (!gallerySources.length) {
      return;
    }

    const length = gallerySources.length;
    galleryIndex = (index + length) % length;
    previewImage.src = gallerySources[galleryIndex];
    previewImage.alt = galleryLabel;
    updateTitle();
  }

  function getGroupedTriggers(trigger) {
    const group = trigger.getAttribute("data-lightbox-group");

    if (!group) {
      return [];
    }

    return triggers.filter(function (item) {
      return item.getAttribute("data-lightbox-group") === group;
    });
  }

  function loadTrigger(trigger) {
    const src = getImageSource(trigger);

    if (!src) {
      return false;
    }

    const label = trigger.getAttribute("data-lightbox-label") || trigger.getAttribute("aria-label") || "Artwork preview";
    const requestedNav = trigger.getAttribute("data-lightbox-navigation");

    galleryLabel = label;
    gallerySources = parseGallerySources(trigger, src);
    galleryIndex = 0;
    suppressNav = trigger.getAttribute("data-lightbox-arrows") === "false";
    currentTrigger = trigger;
    groupedTriggers = requestedNav === "layout" ? getGroupedTriggers(trigger) : [];

    if (!suppressNav && gallerySources.length > 1) {
      navMode = "gallery";
    } else if (!suppressNav && groupedTriggers.length > 1) {
      navMode = "layout";
    } else {
      navMode = "none";
    }

    updateNavState();
    showGalleryImage(0);
    return true;
  }

  function moveByLayout(delta) {
    if (navMode !== "layout" || !currentTrigger || groupedTriggers.length < 2) {
      return;
    }

    const currentIndex = groupedTriggers.indexOf(currentTrigger);
    if (currentIndex === -1) {
      return;
    }

    const nextIndex = (currentIndex + delta + groupedTriggers.length) % groupedTriggers.length;
    loadTrigger(groupedTriggers[nextIndex]);
  }

  function openLightbox(trigger) {
    if (!loadTrigger(trigger)) {
      return;
    }

    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    previewImage.src = "";
    gallerySources = [];
    galleryIndex = 0;
    suppressNav = false;
    navMode = "none";
    currentTrigger = null;
    groupedTriggers = [];
    updateNavState();

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

  prevBtn.addEventListener("click", function (event) {
    event.stopPropagation();

    if (navMode === "gallery") {
      showGalleryImage(galleryIndex - 1);
      return;
    }

    moveByLayout(-1);
  });

  nextBtn.addEventListener("click", function (event) {
    event.stopPropagation();

    if (navMode === "gallery") {
      showGalleryImage(galleryIndex + 1);
      return;
    }

    moveByLayout(1);
  });

  lightbox.addEventListener("click", function (event) {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (!lightbox.classList.contains("is-open")) {
      return;
    }

    if (event.key === "Escape") {
      closeLightbox();
      return;
    }

    if (event.key === "ArrowLeft") {
      if (navMode === "gallery") {
        showGalleryImage(galleryIndex - 1);
        return;
      }

      moveByLayout(-1);
      return;
    }

    if (event.key === "ArrowRight") {
      if (navMode === "gallery") {
        showGalleryImage(galleryIndex + 1);
        return;
      }

      moveByLayout(1);
    }
  });
})();

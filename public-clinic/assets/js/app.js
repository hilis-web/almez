/* =========================================================
   GLOBAL LANGUAGE / CACHE VARIABLES
========================================================= */

let currentNavSections = null;
let currentCategories = null;
let currentCategoriesSectionId = null;
let currentHomeSections = null;

/* =========================================================
   GET CURRENT LANGUAGE
========================================================= */

function getCurrentLanguage() {
  return localStorage.getItem("selectedLang") || "es";
}

/* =========================================================
   DOCUMENT READY
========================================================= */

$(document).ready(function () {
  const urlParams = new URLSearchParams(window.location.search);

  const sectionId = urlParams.get("sectionId");
  const categoryId = urlParams.get("categoryId");

  /* =======================================================
     LOAD CATEGORIES PAGE
  ======================================================= */

  if (sectionId && categoryId) {
    // loadSubcategoryDetails(sectionId, categoryId);
  } else if (sectionId) {
    if (typeof loadCategories === "function") {
      loadCategories(sectionId);
    } else {
      console.error(
        "Function loadCategories is not defined. Check if app.js is loaded.",
      );
    }
  } else {
    console.log("No Section ID in URL - probably homepage.");
  }

  /* =======================================================
     LOAD HOMEPAGE SECTIONS
  ======================================================= */

  fetchSections();

  /* =======================================================
     GOOGLE LOGIN
  ======================================================= */

  $("#google-login").click(function () {
    window.location.href = API_BASE_URL;
  });

  /* =======================================================
     MICROSOFT LOGIN
  ======================================================= */

  $("#microsoft-login").click(function () {
    $.ajax({
      url: "/api/auth/microsoft",

      method: "GET",

      success: function (response) {
        window.location.href = "/";
      },

      error: function (error) {
        console.error("Error logging in with Microsoft", error);
      },
    });
  });

  /* =======================================================
     LOAD NAVBAR
  ======================================================= */

  loadSectionsStatic();

  /* =======================================================
     UPDATE PAGE HEADER
  ======================================================= */

  updatePageHeader();
});

/* =========================================================
   UPDATE PAGE HEADER
========================================================= */

function updatePageHeader() {
  const title = localStorage.getItem("sectionTitle") || "";

  const description = localStorage.getItem("sectionDescription") || "";

  $("#headerTitle").text(title);

  $("#headerDescription").text(description);
}

/* =========================================================
   LOAD STATIC NAVBAR DATA
========================================================= */

function loadSectionsStatic() {
  $.get(`${API_BASE_URL}/newsection/navstatic/section`, function (sections) {
    if (!sections || !Array.isArray(sections)) {
      console.error("Invalid sections data");

      return;
    }

    /* Store data so we can render it again
         when the language changes */

    currentNavSections = sections;

    renderNavSections();
  }).fail(function () {
    console.error("Error loading sections.");
  });
}

/* =========================================================
   RENDER NAVBAR
========================================================= */

function renderNavSections() {
  if (!i18next.isInitialized) {
    console.log("i18next is not ready yet. Waiting...");

    setTimeout(() => {
      renderNavSections();
    }, 100);

    return;
  }
  if (!currentNavSections || !Array.isArray(currentNavSections)) {
    return;
  }

  const lang = getCurrentLanguage();

  const navList = $(".sectionsList");

  /* Important:
     clear old navbar before rendering */

  navList.empty();

  currentNavSections.forEach((section) => {
    const categories = Array.isArray(section.categories)
      ? section.categories
      : [];

    /* =====================================================
       SECTION TITLE
    ===================================================== */
    const sectionTitle = section.i18next
      ? i18next.t(section.i18next)
      : section.title || "";

    console.log("6666666666666666fggggggggggggfggfdfg", section);

    /* =====================================================
       SECTION DESCRIPTION
    ===================================================== */

    const sectionDescription = section.descriptioni18next
      ? i18next.t(section.descriptioni18next)
      : section.description || "";
    /* =====================================================
       SECTION HTML
    ===================================================== */

    const sectionItem = `

<li
  class="nav-item mega-dropdown"
  id="${section.page}"
  style="align-content:center; font-weight:700"
>

    <a
        href="#"
        class="section-link nav-link text-white menu-link"

        data-page-title="${escapeHtml(sectionTitle)}"

        data-page-description="${escapeHtml(sectionDescription)}"

        data-page-name="${section.page}"

        data-section-id="${section.sectionId}"

        
    >

        ${sectionTitle}

    </a>


    ${
      categories.length
        ? `

<div class="mega-menu">

    <div class="mega-left">

        <h3>
            ${sectionTitle}
        </h3>

        <p>
            ${sectionDescription}
        </p>


        <a
            data-i18n="see_all"

            href="#"

            class="section-link view-all-link"

            data-page-title="${escapeHtml(sectionTitle)}"

            data-page-description="${escapeHtml(sectionDescription)}"

            data-page-name="${section.page}"

            data-section-id="${section.sectionId}"
        >

            Ver todo

        </a>

    </div>


    <div class="mega-right mega-grid">

       ${categories
         .map((cat) => {
           const categoryTitle =
             cat.title?.[lang] || cat.title?.es || cat.title?.en || "";

           const items = Array.isArray(cat.items) ? cat.items : [];

           return `

      <div class="mega-category-column">

          <div class="mega-category-header">

              ${
                cat.imageUrl
                  ? `
                    <img
                      src="${cat.imageUrl}"
                      class="mega-category-icon"
                    >
                  `
                  : ""
              }


              <span class="mega-category-title">

                  ${categoryTitle}

              </span>

          </div>


          <div class="mega-items">

              ${
                items.length
                  ? items
                      .map((item) => {
                        const itemTitle =
                          item.title?.[lang] ||
                          item.title?.es ||
                          item.title?.en ||
                          "";

                        return `

                          <a
                              href="#"

                              class="item-link"

                              data-page-title="${escapeHtml(sectionTitle)}"

                              data-page-description="${escapeHtml(sectionDescription)}"

                              data-page-name="${section.page}"

                              data-section-id="${section.sectionId}"

                              data-category-id="${cat.categoryId}"

                              data-item-id="${item.itemId}"
                          >

                              ${itemTitle}

                          </a>

                        `;
                      })
                      .join("")
                  : `<span class="mega-empty">Coming soon</span>`
              }

          </div>

      </div>

           `;
         })
         .join("")}

    </div>

</div>

`
        : ""
    }

</li>

`;

    navList.append(sectionItem);
  });

  /* =======================================================
     ITEM CLICK
  ======================================================= */

  $(".item-link")
    .off("click.appNavigation")
    .on("click.appNavigation", function (e) {
      e.preventDefault();

      const sectionId = $(this).attr("data-section-id");

      const categoryId = $(this).attr("data-category-id");

      const itemId = $(this).attr("data-item-id");

      const pageName = $(this).attr("data-page-name");

      const sectionTitle = $(this).attr("data-page-title");

      const sectionDescription = $(this).attr("data-page-description");

      const selectedNavItem = pageName || "index";

      localStorage.setItem("selectedNavItem", selectedNavItem);

      localStorage.setItem("sectionTitle", sectionTitle);

      localStorage.setItem("sectionDescription", sectionDescription);

      setTimeout(function () {
        window.location.href =
          `item.html?sectionId=${sectionId}` +
          `&categoryId=${categoryId}` +
          `&itemId=${itemId}`;
      }, 20);
    });

  /* =======================================================
     SECTION CLICK
  ======================================================= */

  $(".section-link")
    .off("click.appNavigation")
    .on("click.appNavigation", function (e) {
      e.preventDefault();

      const pageName = $(this).attr("data-page-name");

      const sectionId = $(this).attr("data-section-id");

      const sectionTitle = $(this).attr("data-page-title");

      const sectionDescription = $(this).attr("data-page-description");

      const selectedNavItem = pageName || "index";

      localStorage.setItem("selectedNavItem", selectedNavItem);

      localStorage.setItem("sectionTitle", sectionTitle);

      localStorage.setItem("sectionDescription", sectionDescription);

      if (pageName === "index") {
        setTimeout(function () {
          window.location.href = `${pageName}.html`;
        }, 20);
      } else {
        setTimeout(function () {
          window.location.href = `${pageName}.html?sectionId=${sectionId}`;
        }, 20);
      }
    });
}

/* =========================================================
   LOAD CATEGORIES
========================================================= */

window.loadCategories = function (sectionId) {
  $.ajax({
    url: `${API_BASE_URL}/newsection/section/${sectionId}/categories`,

    method: "GET",

    success: function (categories) {
      if (!categories || !Array.isArray(categories)) {
        console.warn("No categories found.");

        return;
      }

      /* Save data for language switching */

      currentCategories = categories;

      currentCategoriesSectionId = sectionId;

      /* Render */

      renderCategories();
    },

    error: function (err) {
      console.error("Error fetching categories:", err);
    },
  });
};

/* =========================================================
   RENDER CATEGORIES
========================================================= */

function renderCategories() {
  if (!currentCategories || !Array.isArray(currentCategories)) {
    return;
  }

  const categories = currentCategories;

  const sectionId = currentCategoriesSectionId;

  const lang = getCurrentLanguage();

  const $container = $("#categoriesSection");

  /* Clear previous language */

  $container.empty();

  /* =======================================================
     CATEGORY NAVIGATION
  ======================================================= */

  const $categoryNavigation = $(`
    <div class="category-navigation">
      <div class="category-navigation-list"></div>
    </div>

    <div style="height:500px"></div>
  `);

  const $categoryList = $categoryNavigation.find(".category-navigation-list");

  /* =======================================================
     CREATE CATEGORIES
  ======================================================= */

  categories.forEach((category, index) => {
    /* =====================================================
       CATEGORY TITLE
    ===================================================== */

    const categoryTitle =
      category.title?.[lang] || category.title?.es || category.title?.en || "";

    /* =====================================================
       CATEGORY DESCRIPTION
    ===================================================== */

    const categoryDescription =
      category.description?.[lang] ||
      category.description?.es ||
      category.description?.en ||
      "";

    const categoryId = category.categoryId;

    const imageUrl = category.imageUrl || "";

    /* =====================================================
       ITEMS
    ===================================================== */

    const items = Array.isArray(category.items) ? category.items : [];

    /* =====================================================
       CATEGORY BUTTON
    ===================================================== */

    const $categoryItem = $(`
      <div
        class="category-nav-item"
        data-category-id="${categoryId}"
      >

        <button
          type="button"
          class="category-nav-link"
          aria-expanded="false"
        >

          ${
            imageUrl
              ? `
                <span class="category-nav-icon">

                  <img
                    src="${imageUrl}"
                    alt="${escapeHtml(categoryTitle)}"
                  >

                </span>
              `
              : `
                <span class="category-nav-icon category-nav-icon-placeholder">

                  <i class="bi bi-grid"></i>

                </span>
              `
          }


          <span class="category-nav-title">

            ${categoryTitle}

          </span>


          <span class="category-nav-arrow">

            <i class="bi bi-chevron-down"></i>

          </span>

        </button>

      </div>
    `);

    /* =====================================================
       MEGA PANEL
    ===================================================== */

    const $megaPanel = $(`
      <div
        class="category-mega-panel"
        data-category-panel="${categoryId}"
      >

        <div class="category-mega-inner">


          <!-- LEFT -->

          <div class="category-mega-left">

            <span class="category-mega-label">

              ${categoryTitle}

            </span>


            <h3>

              ${categoryTitle}

            </h3>


            ${categoryDescription ? `<p>${categoryDescription}</p>` : ""}


            <a
              data-i18n="see_all"

              href="subcategory.html?sectionId=${sectionId}&categoryId=${categoryId}"

              class="category-mega-view-all"
            >

              Ver todo

              <i class="bi bi-arrow-right"></i>

            </a>

          </div>


          <!-- RIGHT -->

          <div class="category-mega-right">

            <div class="category-items-grid"></div>

          </div>


        </div>

      </div>
    `);

    const $itemsGrid = $megaPanel.find(".category-items-grid");

    /* =====================================================
       CREATE ITEMS
    ===================================================== */

    if (items.length > 0) {
      items.forEach((item) => {
        const itemTitle =
          item.title?.[lang] || item.title?.es || item.title?.en || "";

        const itemDescription =
          item.description?.[lang] ||
          item.description?.es ||
          item.description?.en ||
          "";

        const itemId = item.itemId;

        const itemImage = item.imageUrl || "";

        const itemLink =
          `item.html?sectionId=${sectionId}` +
          `&categoryId=${categoryId}` +
          `&itemId=${itemId}`;

        const $item = $(`
          <a
            href="${itemLink}"

            class="category-mega-item"

            data-item-id="${itemId}"
          >

            <span class="category-mega-item-icon">

              ${
                itemImage
                  ? `
                    <img
                      src="${itemImage}"
                      alt="${escapeHtml(itemTitle)}"
                    >
                  `
                  : `
                    <i class="bi bi-arrow-up-right"></i>
                  `
              }

            </span>


            <span class="category-mega-item-content">

              <strong>

                ${itemTitle}

              </strong>


              ${
                itemDescription
                  ? `
                    <small>

                      ${itemDescription}

                    </small>
                  `
                  : ""
              }

            </span>


            <span class="category-mega-item-arrow">

              <i class="bi bi-arrow-right"></i>

            </span>

          </a>
        `);

        /* =================================================
           TOOLTIP
        ================================================= */

        $item.attr(
          "data-tooltip-title",

          item.toolTip?.title?.[lang] ||
            item.toolTip?.title?.es ||
            item.toolTip?.title?.en ||
            "",
        );

        $item.attr(
          "data-tooltip-desc",

          item.toolTip?.description?.[lang] ||
            item.toolTip?.description?.es ||
            item.toolTip?.description?.en ||
            "",
        );

        $item.attr(
          "data-tooltip-img",

          item.toolTip?.imageUrl || "",
        );

        $itemsGrid.append($item);
      });
    } else {
      $itemsGrid.html(`
        <div class="category-mega-empty">

          No hay elementos disponibles.

        </div>
      `);
    }

    /* =====================================================
       PUT MEGA PANEL INSIDE CATEGORY
    ===================================================== */

    $categoryItem.append($megaPanel);

    $categoryList.append($categoryItem);
  });

  /* =======================================================
     ADD TO PAGE
  ======================================================= */

  $container.append($categoryNavigation);

  /* =======================================================
     HOVER HANDLING
  ======================================================= */

  let closeTimer = null;

  function closeAllMegaMenus() {
    $(".category-nav-item").removeClass("active");

    $(".category-nav-link").attr("aria-expanded", "false");

    $(".category-mega-panel").removeClass("visible");
  }

  function openMegaMenu($categoryItem) {
    clearTimeout(closeTimer);

    $(".category-nav-item").not($categoryItem).removeClass("active");

    $(".category-nav-link")
      .not($categoryItem.find(".category-nav-link"))
      .attr("aria-expanded", "false");

    $(".category-mega-panel")
      .not($categoryItem.find(".category-mega-panel"))
      .removeClass("visible");

    $categoryItem.addClass("active");

    $categoryItem.find(".category-nav-link").attr("aria-expanded", "true");

    $categoryItem.find(".category-mega-panel").addClass("visible");
  }

  /* =======================================================
     CATEGORY HOVER
  ======================================================= */

  $(document)
    .off("mouseenter.categoryMega", ".category-nav-item")

    .on("mouseenter.categoryMega", ".category-nav-item", function () {
      clearTimeout(closeTimer);

      openMegaMenu($(this));
    });

  /* =======================================================
     CATEGORY LEAVE
  ======================================================= */

  $(document)
    .off("mouseleave.categoryMega", ".category-nav-item")

    .on("mouseleave.categoryMega", ".category-nav-item", function () {
      const $item = $(this);

      closeTimer = setTimeout(() => {
        $item.removeClass("active");

        $item.find(".category-nav-link").attr("aria-expanded", "false");

        $item.find(".category-mega-panel").removeClass("visible");
      }, 150);
    });

  /* =======================================================
     CATEGORY CLICK
  ======================================================= */

  $(document)
    .off("click.categoryNavigation", ".category-nav-link")

    .on("click.categoryNavigation", ".category-nav-link", function (e) {
      e.preventDefault();

      const $categoryItem = $(this).closest(".category-nav-item");

      const categoryId = $categoryItem.attr("data-category-id");

      window.location.href =
        `subcategory.html?sectionId=${sectionId}` + `&categoryId=${categoryId}`;
    });

  /* =======================================================
     ITEM CLICK
  ======================================================= */

  $(document)
    .off("click.categoryItem", ".category-mega-item")

    .on("click.categoryItem", ".category-mega-item", function (e) {
      const $item = $(this);

      const itemId = $item.attr("data-item-id");

      console.log("Item clicked:", itemId);

      closeAllMegaMenus();
    });

  /* =======================================================
     ESCAPE KEY
  ======================================================= */

  $(document)
    .off("keydown.categoryMega")

    .on("keydown.categoryMega", function (e) {
      if (e.key === "Escape") {
        closeAllMegaMenus();
      }
    });
}

/* =========================================================
   ESCAPE HTML HELPER
========================================================= */

function escapeHtml(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");
}

/* =========================================================
   LOAD SUBCATEGORIES
========================================================= */

window.loadSubcategories = function (sectionId, categoryId) {
  $.ajax({
    url: `${API_BASE_URL}/section/${sectionId}/category/${categoryId}/subcategories`,

    method: "GET",

    success: function (subcategories) {
      const subcategoriesContainer = $(`#subcategories-${categoryId}`);

      subcategoriesContainer.empty();

      subcategoriesContainer.append('<div class="subcategory-row">');

      const lang = getCurrentLanguage();

      subcategories.forEach((subcategory, index) => {
        if (index % 3 === 0 && index !== 0) {
          subcategoriesContainer.append('</div><div class="subcategory-row">');
        }

        const title =
          subcategory.title?.[lang] ||
          subcategory.title?.es ||
          subcategory.title?.en ||
          "";

        subcategoriesContainer.append(`

            <div class="col-md-4 mb-4 mt-5">

              <div
                class="card subcategory-card"

                data-section-id="${sectionId}"

                data-category-id="${categoryId}"

                data-subcategory-id="${subcategory.subcategoryId}"
              >

                <img
                  src="${subcategory.imageUrl}"

                  class="card-img-top"

                  alt="${escapeHtml(title)}"

                  style="height: 36px; width: 40%; object-fit: cover;"
                >


                <div class="card-body">

                  <h6
                    class="card-title"
                    style="font-size: 14px; font-weight: bold;"
                  >

                    ${title}

                  </h6>


                  <a
                    href="subcategory.html?sectionId=${sectionId}&categoryId=${categoryId}&subcategoryId=${subcategory.subcategoryId}"

                    class="btn btn-sm btn-primary"
                  >

                    Read More

                  </a>

                </div>

              </div>

            </div>

          `);
      });

      subcategoriesContainer.append("</div>");

      subcategoriesContainer.slideDown();

      $(".subcategory-card")
        .off("click.subcategory")
        .on("click.subcategory", function () {
          const sectionId = $(this).data("section-id");

          const categoryId = $(this).data("category-id");

          const subcategoryId = $(this).data("subcategory-id");

          window.location.href =
            `subcategory.html?sectionId=${sectionId}` +
            `&categoryId=${categoryId}` +
            `&subcategoryId=${subcategoryId}`;
        });
    },

    error: function (err) {
      console.error("Error fetching subcategories:", err);
    },
  });
};

/* =========================================================
   LOAD SUBCATEGORY DESCRIPTION
========================================================= */

function loadSubcategoryDescription(sectionId, categoryId, subcategoryId) {
  const lang = getCurrentLanguage();

  $.ajax({
    url: `${API_BASE_URL}/section/${sectionId}/category/${categoryId}/subcategory/${subcategoryId}`,

    method: "GET",

    success: function (subcategory) {
      $("#sectionsSection").empty();

      const title =
        subcategory.title?.[lang] ||
        subcategory.title?.es ||
        subcategory.title?.en ||
        "";

      const content =
        subcategory.content?.[lang] ||
        subcategory.content?.es ||
        subcategory.content?.en ||
        "";

      $("#sectionsSection").append(`

        <div class="card">

          <div class="card-body">

            <h5 class="card-title">

              ${title}

            </h5>

            <hr>

            <p class="card-text">

              ${content}

            </p>

          </div>

        </div>

      `);
    },

    error: function (err) {
      console.error("Error fetching subcategory description:", err);
    },
  });
}

/* =========================================================
   FETCH HOMEPAGE SECTIONS
========================================================= */

function fetchSections() {
  $.ajax({
    url: `${API_BASE_URL}/newsection/sections`,

    method: "GET",

    success: function (data) {
      /* Save sections */

      currentHomeSections = data;

      /* Render */

      renderSections();
    },

    error: function (err) {
      console.error("Error fetching sections:", err);
    },
  });
}

/* =========================================================
   RENDER HOMEPAGE SECTIONS
========================================================= */

function renderSections() {
  const sections = currentHomeSections;

  if (!sections || sections.length === 0) {
    return;
  }

  const lang = getCurrentLanguage();

  const $container = $("#sectionsSection");

  /* Important:
     clear old cards before rendering */

  $container.empty();

  sections.forEach((section) => {
    const title =
      section.title?.[lang] || section.title?.es || section.title?.en || "";

    const description =
      section.description?.[lang] ||
      section.description?.es ||
      section.description?.en ||
      "";

    const imageUrl =
      section.imageUrl || "../assets/images/almez-decoration.svg";

    $container.append(`

      <div class="col-lg-3 col-md-6">

        <div
          class="service-card"
          data-section-id="${section.sectionId}"
        >

          <div class="card-image icon-background">

            <div class="center-icon">

              <img
                src="${imageUrl}"
                class="card-img-top"
                alt="${escapeHtml(title)}"
              >

            </div>

          </div>


          <div class="card-body-custom">

            <h2
              style="
                font-weight:700;
                font-family: Cormorant Garamond, serif !important;
                line-height: 1.5;
              "
            >

              ${title}

            </h2>


            <a
              data-i18n="see_all"
              href="#"
              class="read-more"
            >

              Ver todo

              <i class="bi bi-arrow-right"></i>

            </a>

          </div>

        </div>

      </div>

    `);
  });

  /* =======================================================
     HOMEPAGE CARD CLICK
  ======================================================= */

  $(".service-card")
    .off("click.homeNavigation")
    .on("click.homeNavigation", function () {
      const sectionId = $(this).data("section-id");

      window.location.href = `categories.html?sectionId=${sectionId}`;
    });
}

/* =========================================================
   REFRESH EVERYTHING WHEN LANGUAGE CHANGES
========================================================= */

window.refreshAppLanguage = function () {
  console.log("Refreshing app language:", getCurrentLanguage());

  /* =======================================================
     NAVBAR
  ======================================================= */

  if (currentNavSections) {
    renderNavSections();
  }

  /* =======================================================
     HOMEPAGE
  ======================================================= */

  if (currentHomeSections) {
    renderSections();
  }

  /* =======================================================
     CATEGORIES PAGE
  ======================================================= */

  if (currentCategories && currentCategoriesSectionId) {
    renderCategories();
  }

  /* =======================================================
     PAGE HEADER
  ======================================================= */

  updatePageHeader();

  /* =======================================================
     ITEM PAGE
  ======================================================= */

  if (typeof currentItem !== "undefined" && currentItem) {
    renderItem(currentItem);
  }
};

/* =========================================================
   RUN APP
========================================================= */

function runApp() {
  const userName = localStorage.getItem("userName");

  if (userName) {
    const dashboardLink = document.getElementById("dashboardLink");

    const logoutBtn = document.getElementById("logoutBtn");

    const loginLink = document.getElementById("loginLink");

    const signupLink = document.getElementById("signupLink");

    if (dashboardLink) {
      dashboardLink.style.display = "inline-block";
    }

    if (logoutBtn) {
      logoutBtn.style.display = "inline-block";
    }

    if (loginLink) {
      loginLink.style.display = "none";
    }

    if (signupLink) {
      signupLink.style.display = "none";
    }
  }

  /* =======================================================
     LOGOUT
  ======================================================= */

  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      localStorage.removeItem("userName");

      localStorage.removeItem("userEmail");

      localStorage.removeItem("token");

      window.location.href = "index";
    });
  }
}

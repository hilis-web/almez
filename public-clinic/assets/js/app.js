$(document).ready(function () {
  const urlParams = new URLSearchParams(window.location.search);
  const sectionId = urlParams.get("sectionId");
  const categoryId = urlParams.get("categoryId");
  if (sectionId && categoryId) {
    //loadSubcategoryDetails(sectionId, categoryId);
  } else if (sectionId) {
    if (typeof loadCategories === "function") {
      loadCategories(sectionId);
    } else {
      console.error(
        "Function loadCategories is not defined. Check if app.js is loaded.",
      );
    }
  } else {
    console.error("Section ID not found in URL");
  }

  fetchSections();

  $("#google-login").click(function () {
    window.location.href = API_BASE_URL;
  });

  $("#microsoft-login").click(function () {
    $.ajax({
      url: "/api/auth/microsoft",
      method: "GET",
      success: function (response) {
        // معالجة الاستجابة هنا
        window.location.href = "/";
      },
      error: function (error) {
        console.error("Error logging in with Microsoft", error);
      },
    });
  });

  function loadSectionsStatic() {
    $.get(`${API_BASE_URL}/newsection/navstatic/section`, function (sections) {
      if (sections && Array.isArray(sections)) {
        const navList = $(".sectionsList");

        sections.forEach((section) => {
          const sectionTitle = section.title;
          const categories = section.categories;

          const sectionItem = `
<li class="nav-item mega-dropdown" id="${section.page}" style="align-content:center">

    <a
        href="#"
        class="section-link nav-link text-white menu-link"
        data-page-title="${section.title}"
        data-page-description="${section.description}"
        data-page-name="${section.page}"
        data-section-id="${section.sectionId}"
        data-i18n="${section.i18next}"
    >

        ${sectionTitle}

    </a>

    ${
      categories.length
        ? `
<div class="mega-menu">

    <div class="mega-left">

        <h3>${sectionTitle}</h3>

        <p>
            ${section.description || ""}
        </p>

        <a
            href="#"
            class="section-link view-all-link"
            data-page-title="${section.title}"
            data-page-description="${section.description}"
            data-page-name="${section.page}"
            data-section-id="${section.sectionId}"
        >

            Ver todos

        </a>

    </div>

    <div class="mega-right mega-grid">

       ${categories
         .map(
           (cat) => `
      <div class="mega-category-column">

          <div class="mega-category-header">

              ${
                cat.imageUrl
                  ? `<img src="${cat.imageUrl}" class="mega-category-icon">`
                  : ""
              }

              <span class="mega-category-title">
                  ${cat.title.es}
              </span>

          </div>

          <div class="mega-items">

              ${
                cat.items && cat.items.length
                  ? cat.items
                      .map(
                        (item) => `
                          <a
                              href="#"
                              class="item-link"

                              data-page-title="${section.title}"
                              data-page-description="${section.description}"
                              data-page-name="${section.page}"
                              data-section-id="${section.sectionId}"
                              data-category-id="${cat.categoryId}"
                              data-item-id="${item.itemId}">

                              ${item.title.es}

                          </a>
                        `,
                      )
                      .join("")
                  : `<span class="mega-empty">Coming soon</span>`
              }

          </div>

      </div>
`,
         )
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
        // $(".category-link").click(function (e) {

        $(".item-link").click(function (e) {
          e.preventDefault();
          const sectionId = $(this).data("section-id");
          const categoryId = $(this).data("category-id");
          const itemId = $(this).data("itemId");
          const pageName = $(this).data("page-name");
          const sectionTitle = $(this).data("page-title");
          const sectionDescription = $(this).data("page-description");

          var selectedNavItem = pageName || "index";
          localStorage.setItem("selectedNavItem", selectedNavItem);

          localStorage.setItem("sectionTitle", sectionTitle);
          localStorage.setItem("sectionDescription", sectionDescription);

          setTimeout(function () {
            window.location.href = `item.html?sectionId=${sectionId}&categoryId=${categoryId}&itemId=${itemId}`;
          }, 20);
        });
        $(".section-link").click(function (e) {
          e.preventDefault();
          const pageName = $(this).data("page-name");
          const sectionId = $(this).data("section-id");

          const sectionTitle = $(this).data("page-title");
          const sectionDescription = $(this).data("page-description");

          var selectedNavItem = pageName || "index";
          localStorage.setItem("selectedNavItem", selectedNavItem);

          localStorage.setItem("sectionTitle", sectionTitle);
          localStorage.setItem("sectionDescription", sectionDescription);

          if (pageName == "index") {
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
    }).fail(function () {
      console.error("Error loading sections.");
    });
  }

  loadSectionsStatic();
  let headerTitle = localStorage.getItem("sectionTitle");
  let headerDescription = localStorage.getItem("sectionDescription");

  $("#headerTitle").text(headerTitle);
  $("#headerDescription").text(headerDescription);
});

window.loadCategories = function (sectionId) {
  const lang = localStorage.getItem("selectedLang") || "es";

  $.ajax({
    url: `${API_BASE_URL}/newsection/section/${sectionId}/categories`,
    method: "GET",

    success: function (categories) {
      const $container = $("#categoriesSection");

      $container.empty();

      if (!categories || !Array.isArray(categories)) {
        console.warn("No categories found.");
        return;
      }

      console.log("#### categories ####", categories);

      /* =====================================================
         CATEGORY NAVIGATION
      ===================================================== */

      const $categoryNavigation = $(`
        <div class="category-navigation">
          <div class="category-navigation-list"></div>
        </div>
      `);

      const $categoryList = $categoryNavigation.find(
        ".category-navigation-list",
      );

      /* =====================================================
         CREATE CATEGORY BUTTONS
      ===================================================== */

      categories.forEach((category, index) => {
        const categoryTitle =
          category.title?.[lang] ||
          category.title?.es ||
          category.title?.en ||
          "";

        const categoryDescription =
          category.description?.[lang] ||
          category.description?.es ||
          category.description?.en ||
          "";

        const categoryId = category.categoryId;

        const imageUrl = category.imageUrl || "";

        /* ================================================
           ITEMS
        ================================================= */

        const items = Array.isArray(category.items) ? category.items : [];

        /* ================================================
           CATEGORY BUTTON
        ================================================= */

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
                        alt="${categoryTitle}"
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

        /* =================================================
           MEGA PANEL
        ================================================= */

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
                  href="subcategory.html?sectionId=${sectionId}&categoryId=${categoryId}"
                  class="category-mega-view-all"
                >
                  Ver todos
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

        /* =================================================
           CREATE ITEMS AS LIST
        ================================================= */

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
                          alt="${itemTitle}"
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

            /* =============================================
               ITEM TOOLTIP DATA
            ============================================= */

            $item.attr(
              "data-tooltip-title",
              item.toolTip?.title?.[lang] || item.toolTip?.title?.es || "",
            );

            $item.attr(
              "data-tooltip-desc",
              item.toolTip?.description?.[lang] ||
                item.toolTip?.description?.es ||
                "",
            );

            $item.attr("data-tooltip-img", item.toolTip?.imageUrl || "");

            $itemsGrid.append($item);
          });
        } else {
          $itemsGrid.html(`
            <div class="category-mega-empty">
              No hay elementos disponibles.
            </div>
          `);
        }

        /*
         * Put the mega panel INSIDE the category item.
         * This allows the panel to stay open while moving
         * from the category button into the mega menu.
         */

        $categoryItem.append($megaPanel);

        $categoryList.append($categoryItem);
      });

      /* =====================================================
         ADD TO PAGE
      ===================================================== */

      $container.append($categoryNavigation);

      /* =====================================================
         HOVER HANDLING
      ===================================================== */

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

      /* =====================================================
         CATEGORY HOVER
      ===================================================== */

      $(document)
        .off("mouseenter.categoryMega", ".category-nav-item")
        .on("mouseenter.categoryMega", ".category-nav-item", function () {
          clearTimeout(closeTimer);

          openMegaMenu($(this));
        });

      /* =====================================================
         CATEGORY LEAVE
      ===================================================== */

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

      /* =====================================================
         CATEGORY CLICK
         ===================================================== */

      $(document)
        .off("click.categoryNavigation", ".category-nav-link")
        .on("click.categoryNavigation", ".category-nav-link", function (e) {
          e.preventDefault();

          const $categoryItem = $(this).closest(".category-nav-item");

          /*
           * On click, go to the complete category page.
           */

          const categoryId = $categoryItem.data("category-id");

          window.location.href =
            `subcategory.html?sectionId=${sectionId}` +
            `&categoryId=${categoryId}`;
        });

      /* =====================================================
         ITEM CLICK
      ===================================================== */

      $(document)
        .off("click.categoryItem", ".category-mega-item")
        .on("click.categoryItem", ".category-mega-item", function (e) {
          /*
           * Let the normal <a href=""> navigation happen.
           * We only close the menu.
           */

          const $item = $(this);

          const itemId = $item.data("item-id");

          console.log("Item clicked:", itemId);

          closeAllMegaMenus();
        });

      /* =====================================================
         ESCAPE KEY
      ===================================================== */

      $(document)
        .off("keydown.categoryMega")
        .on("keydown.categoryMega", function (e) {
          if (e.key === "Escape") {
            closeAllMegaMenus();
          }
        });

      /* =====================================================
         ITEM TOOLTIP
         OPTIONAL
      ===================================================== */

      /*
       * We are NOT showing the old category tooltip anymore.
       *
       * If you want item tooltips later, we can attach them
       * specifically to .category-mega-item.
       */
    },

    /* =======================================================
       AJAX ERROR
    ======================================================= */

    error: function (err) {
      console.error("Error fetching categories:", err);
    },
  });
};

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

// تحميل الفئات الفرعية
window.loadSubcategories = function (sectionId, categoryId) {
  $.ajax({
    url: `${API_BASE_URL}/section/${sectionId}/category/${categoryId}/subcategories`,
    method: "GET",
    success: function (subcategories) {
      const subcategoriesContainer = $(`#subcategories-${categoryId}`);
      subcategoriesContainer.empty();

      // إضافة حاوية الفئات الفرعية التي تحتوي على الكروت
      subcategoriesContainer.append('<div class="subcategory-row">');

      subcategories.forEach((subcategory, index) => {
        // توزيع الكروت على صفوف مكونة من 3 كروت
        if (index % 3 === 0 && index !== 0) {
          subcategoriesContainer.append('</div><div class="subcategory-row">'); // إضافة صف جديد بعد 3 كروت
        }

        // إضافة الكرت الخاص بالفئة الفرعية
        subcategoriesContainer.append(`
        <div class="col-md-4 mb-4 mt-5">
          <div class="card subcategory-card" data-section-id="${sectionId}" data-category-id="${categoryId}" data-subcategory-id="${subcategory.subcategoryId}">
            <img src="${subcategory.imageUrl}" class="card-img-top" alt="${subcategory.title.es}" style="height: 36px; width: 40%; object-fit: cover;">
            <div class="card-body">
              <h6 class="card-title" style="font-size: 14px; font-weight: bold;">${subcategory.title.es}</h6>
              <a href="subcategory.html?sectionId=${sectionId}&categoryId=${categoryId}&subcategoryId=${subcategory.subcategoryId}" class="btn btn-sm btn-primary">Read More</a>
            </div>
          </div>
        </div>
      `);
      });

      subcategoriesContainer.append("</div>"); // إغلاق الحاوية بعد إضافة كل الكروت

      // إظهار الفئات الفرعية تحت الفئة المختارة
      subcategoriesContainer.slideDown();

      // عند الضغط على فئة فرعية، يتم فتح صفحة جديدة
      $(".subcategory-card").click(function () {
        const sectionId = $(this).data("section-id");
        const categoryId = $(this).data("category-id");
        const subcategoryId = $(this).data("subcategory-id");

        // الانتقال إلى صفحة جديدة مع تمرير المعلومات في الرابط
        window.location.href = `subcategory.html?sectionId=${sectionId}&categoryId=${categoryId}&subcategoryId=${subcategoryId}`;
      });
    },
    error: function (err) {
      console.error("Error fetching subcategories:", err);
    },
  });
};

function loadSubcategoryDescription(sectionId, categoryId, subcategoryId) {
  const lang = localStorage.getItem("selectedLang") || "es"; // أو يمكنك تحديد اللغة من الـ query أو من مكان آخر

  $.ajax({
    url: `${API_BASE_URL}/section/${sectionId}/category/${categoryId}/subcategory/${subcategoryId}`,
    method: "GET",
    success: function (subcategory) {
      $("#sectionsSection").empty(); // Clear the current content

      // استخدام اللغة المحددة في العنوان والوصف والمحتوى
      const title = subcategory.title[lang] || subcategory.title["es"];
      // const description = subcategory.description[lang] || subcategory.description['es'];
      const content = subcategory.content[lang] || subcategory.content["es"];

      // إضافة البيانات إلى الـ HTML
      $("#sectionsSection").append(`
          <div class="card">
              <div class="card-body">
                  <h5 class="card-title">${title}</h5>
                  <hr>
                  <p class="card-text">${content}</p>
              </div>
          </div>
      `);
    },
    error: function (err) {
      console.error("Error fetching subcategory description:", err);
    },
  });
}

// function loadSubcategoryDetails(sectionId, categoryId) {
//   const lang = localStorage.getItem("selectedLang") || "es";

//   $.ajax({
//     url: `${API_BASE_URL}/newsection/section/${sectionId}/category/${categoryId}`,
//     method: "GET",
//     success: function (data) {
//       console.log("^^pppppppppppp ", data);
//       let htmlContent = data.content[lang] || data.content["es"];
//     },
//     error: function (err) {
//       console.error("Error fetching category details:", err);
//     },
//   });
// }

function fetchSections() {
  $.ajax({
    url: `${API_BASE_URL}/newsection/sections`,
    method: "GET",
    success: function (data) {
      renderSections(data);
    },
    error: function (err) {
      console.error("Error fetching sections:", err);
    },
  });
}

function renderSections(sections) {
  if (sections.length === 0) return;
  const lang = localStorage.getItem("selectedLang") || "es";
  console.log("^^^^^^^sections", sections);
  sections.forEach((section) => {
    console.log("HOME sectionnnnn", section);

    const title = section.title?.[lang] || section.title?.es || "";
    console.log("langggggg", [lang]);
    console.log("HOME CARD", title);
    const description =
      section.description?.[lang] || section.description?.es || "";
    const imageUrl =
      section.imageUrl || "../assets/images/almez-decoration.svg";
    console.log("img", imageUrl);
    $("#sectionsSection").append(
      `

         <div class="col-lg-3 col-md-6 ">
            <div class="service-card" data-section-id="${section.sectionId}">
              <div class="card-image icon-background">
                <div class="center-icon">
                   <img src="${imageUrl}" class="card-img-top" alt="${title}">
                </div>
              </div>

              <div class="card-body-custom">
                <h2 style="font-weight:700; font-family: Cormorant Garamond, serif !important; line-height: 1.5;">${title}</h2>


              

                <a href="#" class="read-more">
                  Ver todo

                  <i class="bi bi-arrow-right"></i>
                </a>
              </div>
            </div>
          </div>
           `,
    );
  });
  $(".service-card").click(function () {
    const sectionId = $(this).data("section-id");
    window.location.href = `categories.html?sectionId=${sectionId}`;
  });
}

function runApp() {
  const userName = localStorage.getItem("userName");

  if (userName) {
    document.getElementById("dashboardLink").style.display = "inline-block";
    document.getElementById("logoutBtn").style.display = "inline-block";

    // Hide login and signup buttons
    document.getElementById("loginLink").style.display = "none";
    document.getElementById("signupLink").style.display = "none";
  }

  // Handle logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      // Clear user data from localStorage
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("token");

      // Redirect to homepage or login page
      window.location.href = "index";
    });
  }
  // });
}

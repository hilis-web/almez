$(document).ready(function () {
  const urlParams = new URLSearchParams(window.location.search);
  const sectionId = urlParams.get("sectionId");
  const categoryId = urlParams.get("categoryId");
  if (sectionId && categoryId) {
    loadSubcategoryDetails(sectionId, categoryId);
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

    <div class="mega-right">

        ${categories
          .map(
            (cat) => `

            <a
                href="#"
                class="category-link mega-item"

                data-page-title="${section.title}"
                data-page-description="${section.description}"
                data-page-name="${section.page}"
                data-section-id="${section.sectionId}"
                data-category-id="${cat.categoryId}">

                <div class="mega-icon">

                    <img src="${cat.imageUrl}">

                </div>

                <span>

                    ${cat.title.es}

                </span>

            </a>

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

        $(".category-link").click(function (e) {
          e.preventDefault();
          const sectionId = $(this).data("section-id");
          const categoryId = $(this).data("category-id");
          const pageName = $(this).data("page-name");
          const sectionTitle = $(this).data("page-title");
          const sectionDescription = $(this).data("page-description");

          var selectedNavItem = pageName || "index";
          localStorage.setItem("selectedNavItem", selectedNavItem);

          localStorage.setItem("sectionTitle", sectionTitle);
          localStorage.setItem("sectionDescription", sectionDescription);

          setTimeout(function () {
            window.location.href = `subcategory.html?sectionId=${sectionId}&categoryId=${categoryId}`;
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
      $("#categoriesSection").empty();

      console.log("####categories####", categories);

      /* ========================================
         CREATE CATEGORY CARDS
      ======================================== */

      categories.forEach((category) => {
        const title = category.title?.[lang] || category.title?.["es"] || "";

        const description =
          category.description?.[lang] || category.description?.["es"] || "";

        const categoryId = category.categoryId;

        /* TOOLTIP DATA */

        const tooltipTitle =
          category.toolTip?.title?.[lang] || category.toolTip?.title?.es || "";

        const tooltipDesc =
          category.toolTip?.description?.[lang] ||
          category.toolTip?.description?.es ||
          "";

        const tooltipImg = category.toolTip?.imageUrl || "";

        /* CREATE CARD */

        $("#categoriesSection").append(`
          <div class="col-md-3 mb-4">

            <div class="card category-card"
                 data-category-id="${categoryId}"
                 data-section-id="${sectionId}"
                 data-tooltip-title="${tooltipTitle}"
                 data-tooltip-desc="${tooltipDesc}"
                 data-tooltip-img="${tooltipImg}">

              <img
                src="${category.imageUrl}"
                alt="${title}"
              >

              <div class="card-body p-0">

              <h3>
                <strong class="category-title">
                  ${title}
                </strong>
</h3>
                <small class="category-description">
                  ${description}
                </small>

              </div>

              <div class="mt-2 category-footer">

                <a data-i18n="more_info" href="subcategory.html?sectionId=${sectionId}&categoryId=${categoryId}" style="color: #1b3b36 !important; font-weight: 700" >
                  More info
                  <i class="bi bi-arrow-right"></i>
                </a>

              </div>

            </div>

          </div>
        `);
      });

      /* ========================================
         TOOLTIP SETTINGS
      ======================================== */

      let tooltipTimeout = null;
      let hideTooltipTimeout = null;
      let isHoveringTooltip = false;

      const tooltip = $("#customTooltip");

      /* ========================================
         REMOVE OLD EVENTS
      ======================================== */

      $(document).off("mouseenter.categoryTooltip", ".category-card");

      $(document).off("mouseleave.categoryTooltip", ".category-card");

      tooltip.off(".categoryTooltip");

      /* ========================================
         CARD MOUSE ENTER
      ======================================== */

      $(document).on(
        "mouseenter.categoryTooltip",
        ".category-card",

        function () {
          clearTimeout(tooltipTimeout);
          clearTimeout(hideTooltipTimeout);

          const $card = $(this);

          const title = $card.data("tooltip-title");

          const desc = $card.data("tooltip-desc");

          const img = $card.data("tooltip-img");

          const cardSectionId = $card.data("section-id");

          const categoryId = $card.data("category-id");

          /* UPDATE TOOLTIP CONTENT */

          $("#tooltipImage").attr("src", img || "");

          $("#tooltipTitle").text(title || "");

          $("#tooltipDesc").text(desc || "");

          /* UPDATE TOOLTIP LINK */

          tooltip
            .data(
              "link",
              `subcategory.html?sectionId=${cardSectionId}&categoryId=${categoryId}`,
            )
            .removeClass("visible arrow-top arrow-bottom")
            .show();

          /* ========================================
             GET CARD POSITION
          ======================================== */

          const cardRect = this.getBoundingClientRect();

          /* GET TOOLTIP DIMENSIONS */

          const tooltipWidth = tooltip.outerWidth();

          const tooltipHeight = tooltip.outerHeight();

          const gap = 0;

          /* ========================================
             DEFAULT POSITION
             RIGHT SIDE OF CARD
          ======================================== */

          let left = cardRect.right + gap;

          let top = cardRect.top + cardRect.height / 2 - tooltipHeight / 2;

          /* ========================================
             CHECK RIGHT SIDE
          ======================================== */

          if (left + tooltipWidth > window.innerWidth - gap) {
            left = cardRect.left - tooltipWidth - gap;
          }

          /* ========================================
             CHECK LEFT SIDE
          ======================================== */

          if (left < gap) {
            left = gap;
          }

          /* ========================================
             CHECK TOP
          ======================================== */

          if (top < gap) {
            top = gap;
          }

          /* ========================================
             CHECK BOTTOM
          ======================================== */

          if (top + tooltipHeight > window.innerHeight - gap) {
            top = window.innerHeight - tooltipHeight - gap;
          }

          /* ========================================
             APPLY POSITION
          ======================================== */

          tooltip.css({
            position: "fixed",
            top: `${top}px`,
            left: `${left}px`,
          });

          /* SHOW TOOLTIP */

          setTimeout(() => {
            tooltip.addClass("visible");
          }, 10);

          /* ========================================
             IMAGE FLEX DIRECTION
          ======================================== */

          const imgElement = document.getElementById("tooltipImage");

          if (imgElement) {
            imgElement.onload = function () {
              const tooltipInner = tooltip.find(".tooltip-inner");

              if (imgElement.naturalHeight > imgElement.naturalWidth) {
                tooltipInner.css("flex-direction", "row");

                $(imgElement).css("order", 1);
              } else {
                tooltipInner.css("flex-direction", "column");

                $(imgElement).css("order", 0);
              }
            };
          }
        },
      );

      /* ========================================
         CARD MOUSE LEAVE
      ======================================== */

      $(document).on(
        "mouseleave.categoryTooltip",
        ".category-card",

        function () {
          tooltipTimeout = setTimeout(() => {
            if (!isHoveringTooltip) {
              tooltip.removeClass("visible");

              hideTooltipTimeout = setTimeout(() => {
                tooltip.hide();
              }, 200);
            }
          }, 200);
        },
      );

      /* ========================================
         TOOLTIP MOUSE ENTER
      ======================================== */

      tooltip.on(
        "mouseenter.categoryTooltip",

        function () {
          isHoveringTooltip = true;

          clearTimeout(tooltipTimeout);

          clearTimeout(hideTooltipTimeout);
        },
      );

      /* ========================================
         TOOLTIP MOUSE LEAVE
      ======================================== */

      tooltip.on(
        "mouseleave.categoryTooltip",

        function () {
          isHoveringTooltip = false;

          $(this).removeClass("visible");

          hideTooltipTimeout = setTimeout(() => {
            $(this).hide();
          }, 200);
        },
      );

      /* ========================================
         TOOLTIP CLICK
      ======================================== */

      tooltip.on(
        "click.categoryTooltip",

        function () {
          const link = $(this).data("link");

          if (link) {
            window.location.href = link;
          }
        },
      );

      /* ========================================
         CARD CLICK
      ======================================== */

      $(".category-card")
        .off("click.categoryTooltip")
        .on(
          "click.categoryTooltip",

          function () {
            const categoryId = $(this).data("category-id");

            window.location.href = `subcategory.html?sectionId=${sectionId}&categoryId=${categoryId}`;
          },
        );
    },

    /* ========================================
       AJAX ERROR
    ======================================== */

    error: function (err) {
      console.error("Error fetching categories:", err);
    },
  });
};

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

function loadSubcategoryDetails(sectionId, categoryId) {
  const lang = localStorage.getItem("selectedLang") || "es";

  $.ajax({
    url: `${API_BASE_URL}/newsection/section/${sectionId}/category/${categoryId}`,
    method: "GET",
    success: function (data) {
      let htmlContent = data.content[lang] || data.content["es"];
    },
    error: function (err) {
      console.error("Error fetching category details:", err);
    },
  });
}

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
    const title = section.title?.[lang] || section.title?.es || "";
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

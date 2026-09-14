// const API_BASE_URL = 'https://user-api-server.onrender.com';
// const API_BASE_URL = 'http://localhost:3000';

// const token = localStorage.getItem('token');
// if (!token) {
//   alert('Unauthorized! Please login first.');
//   window.location.href = 'index.html';
// }
// $('#addArticleBtn').click(function () {
//   $('#addArticlePopup').modal('show');
// });
// $('#newCategoryContentEs').summernote({
//     toolbar: [
//       ['style', ['bold', 'italic', 'underline', 'clear']],
//       ['font', ['strikethrough', 'superscript', 'subscript']],
//       ['color', ['color']],
//       ['para', ['ul', 'ol', 'paragraph']],
//       ['table', ['table']],
//       ['insert', ['link', 'picture', 'video']],
//       ['view', ['fullscreen', 'codeview', 'help']],
//       ['insert', ['hr', 'removeFormat']], // تأكد أن hr و removeFormat هنا
//       ['style', ['h1', 'h2', 'h3', 'p']] // إضافة العناوين والفقرات
//     ]
//   });

$(document).ready(function () {
  $("#newSectionsLink").on("click", function (e) {
    e.preventDefault();
    window.location.hash = "sections";
    setActiveTab("newSectionsLink");
    loadNewSections();
  });

  loadNewSections1();
  //NEW HANDLE FOR SECTION
  $("#newSectionSelect").change(function () {
    let sectionId = $(this).val();
    console.log("sectionSelect sectionId:", sectionId);
    if (sectionId) {
      // hideNewNewSectionInputs(); // Hide fields for adding a new section
    } else {
      $("#categorySelect").html(
        '<option value="">Choose a category...</option>',
      );
      showNewSectionInputs(); // Show fields if no section is selected
    }
  });

  //NEW HANDLE FOR SECTION
  $("#addNewSectionForm").submit(function (e) {
    e.preventDefault();

    // ==========================================
    // SECTION
    // ==========================================

    let sectionId = $("#newSectionSelect").val();

    let newSectionTitle = $("#newSectionTitleEs").val();
    let newSectionDescription = $("#newSectionDescriptionEs").val();

    let newSectionTitleEn = $("#newSectionTitleEn").val();
    let newSectionDescriptionEn = $("#newSectionDescriptionEn").val();

    let newSectionImage = $("#newSectionImage").val();

    // ==========================================
    // CATEGORY
    // ==========================================

    let categoryId = $("#newCategorySelect").val();

    let newCategoryTitle = $("#newCategoryTitleEs").val();
    let newCategoryDescription = $("#newCategoryDescriptionEs").val();

    let newCategoryTitleEn = $("#newCategoryTitleEn").val();
    let newCategoryDescriptionEn = $("#newCategoryDescriptionEn").val();

    let newCategoryImage = $("#newCategoryImage").val();

    let newCategoryToolTipTitle = $("#newCategoryToolTipTitleEs").val();

    let newCategoryToolTipDescription = $(
      "#newCategoryToolTipDescriptionEs",
    ).val();

    let newCategoryToolTipTitleEn = $("#newCategoryToolTipTitleEn").val();

    let newCategoryToolTipDescriptionEn = $(
      "#newCategoryToolTipDescriptionEn",
    ).val();

    let newCategoryToolTipImage = $("#newCategoryToolTipImage").val();

    // ==========================================
    // ITEM
    // ==========================================

    let newItemTitle = $("#newItemTitleEs").val();
    let newItemTitleEn = $("#newItemTitleEn").val();

    let newItemDescription = $("#newItemDescriptionEs").val();
    let newItemDescriptionEn = $("#newItemDescriptionEn").val();

    let newItemImage = $("#newItemImage").val();

    let newItemToolTipTitle = $("#newItemToolTipTitleEs").val();

    let newItemToolTipTitleEn = $("#newItemToolTipTitleEn").val();

    let newItemToolTipDescription = $("#newItemToolTipDescriptionEs").val();

    let newItemToolTipDescriptionEn = $("#newItemToolTipDescriptionEn").val();

    let newItemToolTipImage = $("#newItemToolTipImage").val();

    let newItemContent = $("#newItemContentEs").val();
    let newItemContentEn = $("#newItemContentEn").val();

    // ==========================================
    // ITEM DATA
    // ==========================================

    const itemData = {
      title: {
        es: newItemTitle,
        en: newItemTitleEn,
      },

      description: {
        es: newItemDescription,
        en: newItemDescriptionEn,
      },

      content: {
        es: newItemContent,
        en: newItemContentEn,
      },

      imageUrl: newItemImage,

      toolTip: {
        title: {
          es: newItemToolTipTitle,
          en: newItemToolTipTitleEn,
        },

        description: {
          es: newItemToolTipDescription,
          en: newItemToolTipDescriptionEn,
        },

        imageUrl: newItemToolTipImage,
      },

      status: "Published",
    };

    // ==========================================
    // CATEGORY DATA
    // ==========================================

    const categoryData = {
      title: {
        es: newCategoryTitle,
        en: newCategoryTitleEn,
      },

      description: {
        es: newCategoryDescription,
        en: newCategoryDescriptionEn,
      },

      toolTip: {
        title: {
          es: newCategoryToolTipTitle,
          en: newCategoryToolTipTitleEn,
        },

        description: {
          es: newCategoryToolTipDescription,
          en: newCategoryToolTipDescriptionEn,
        },

        imageUrl: newCategoryToolTipImage,
      },

      imageUrl: newCategoryImage,

      status: "Published",

      items: [itemData],
    };

    // ==========================================
    // CASE 1
    // NEW SECTION + NEW CATEGORY + NEW ITEM
    // ==========================================

    if (!sectionId && newSectionTitle && newCategoryTitle) {
      const sectionData = {
        title: {
          es: newSectionTitle,
          en: newSectionTitleEn,
        },

        description: {
          es: newSectionDescription,
          en: newSectionDescriptionEn,
        },

        imageUrl: newSectionImage,

        status: "Published",

        categories: [categoryData],
      };

      newCreateSectionWithCategoryAndSubcategory(sectionData, categoryData);

      return;
    }

    // ==========================================
    // CASE 2
    // EXISTING SECTION + NEW CATEGORY + NEW ITEM
    // ==========================================

    if (sectionId && !categoryId && newCategoryTitle) {
      console.log("categoryData in addNewSectionForm", categoryData);
      newCreateCategory(sectionId, categoryData);

      return;
    }

    // ==========================================
    // CASE 3
    // EXISTING SECTION + EXISTING CATEGORY
    // + NEW ITEM
    // ==========================================

    if (sectionId && categoryId && newItemTitle) {
      newCreateItem(sectionId, categoryId, itemData);

      return;
    }

    // ==========================================
    // INVALID
    // ==========================================

    alert(
      "Please select or create a section, select or create a category, and fill in the item information.",
    );
  });

  $("#newSectionSelect").on("change", function () {
    alert(1);
    const sectionId = $(this).val();

    const categorySelect = $("#newCategorySelect");

    // ==========================================
    // RESET CATEGORY SELECT
    // ==========================================

    categorySelect.empty();

    categorySelect.append('<option value="">Choose a category...</option>');

    // ==========================================
    // NO SECTION SELECTED
    // ==========================================

    if (!sectionId) {
      categorySelect.prop("disabled", true);

      return;
    }

    // ==========================================
    // LOADING
    // ==========================================

    categorySelect.prop("disabled", true);

    categorySelect.empty();

    categorySelect.append('<option value="">Loading categories...</option>');

    // ==========================================
    // GET CATEGORIES
    // ==========================================

    $.get(
      // url: `${API_BASE_URL}/newsection/section/${sectionId}/categories`,

      `${API_BASE_URL}/newsection/section/${sectionId}/categories`,
      function (categories) {
        // Reset
        categorySelect.empty();

        categorySelect.append('<option value="">Choose a category...</option>');

        // ==========================================
        // NO CATEGORIES
        // ==========================================

        if (!categories || !Array.isArray(categories)) {
          categorySelect.append(
            '<option value="">No categories found</option>',
          );

          return;
        }

        if (categories.length === 0) {
          categorySelect.append(
            '<option value="">No categories found</option>',
          );

          return;
        }

        // ==========================================
        // ADD CATEGORIES
        // ==========================================

        categories.forEach((category) => {
          const categoryTitle =
            category.title?.es || category.title?.en || "Unnamed Category";

          categorySelect.append(
            $("<option>", {
              value: category.categoryId,
              text: categoryTitle,
            }),
          );
        });

        // ==========================================
        // ENABLE CATEGORY SELECT
        // ==========================================

        categorySelect.prop("disabled", false);
      },
    ).fail(function (xhr) {
      console.error("Error loading categories");
      console.log("Status:", xhr.status);
      console.log("Response:", xhr.responseText);
      console.log("URL:", `${API_BASE_URL}/section/${sectionId}/categories`);

      categorySelect.empty();

      categorySelect.append(
        '<option value="">Error loading categories</option>',
      );
    });
  });

  //NEW HANDLE FOR SECTION
  function hideNewNewSectionInputs() {
    $("#newSectionTitleEs, newSectionDescriptinEs, #newSectionImage")
      .val("")
      .removeAttr("required")
      .parent()
      .hide();
  }

  //NEW HANDLE FOR SECTION
  function showNewSectionInputs() {
    $("#newSectionTitleEs, newSectionDescriptinEs, #newSectionImage")
      .attr("required", "required")
      .parent()
      .show();
  }
});

function viewNewCategories(sectionId, sectionTitle) {
  console.log("viewCategories sectionId", sectionId);
  console.log("%%% sectionTitle", sectionTitle);
  $("#content").html("<h3>Loading Categories...</h3>");
  $.ajax({
    url: `${API_BASE_URL}/newsection/section/${sectionId}/categories`,
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    success: function (response) {
      console.log("response", response);
      let categoriesHTML = `<nav aria-label="breadcrumb">
  <ol class="breadcrumb">
    <li class="breadcrumb-item"><a onclick="loadNewSections()">Sections</a></li>
    <li class="breadcrumb-item active" aria-current="page">${sectionTitle || "section title"}</li>
  </ol></nav><button type="button" class="btn btn-primary add-float" data-bs-toggle="modal" data-bs-target="#addNewSectionModal">Add New Section </button><h3>${sectionTitle || "section title"}</h3><div class="row">`;

      response.forEach((category) => {
        console.log(category);
        const isChecked = category.status === "Published" ? "checked" : "";
        const safeCategoryData = JSON.stringify(category).replace(
          /"/g,
          "&quot;",
        ); // ✅ Fix issue with passing the object inside `onclick`
        const encodedData = encodeBase64(JSON.stringify(category));
        categoriesHTML += `
          <div class="col-lg-3 mb-4">
            <div class="card">
              <img style="max-height: 110px;max-width: 110px;" src="${category.imageUrl || "default-image.jpg"}" class="card-img-top" alt="${category.title?.es || category.title?.en || "category img"}">
              <div class="card-body">
                <strong class="card-title">${category.title?.es || category.title?.en || "category title"}</strong><br />
                <small class="card-title">${category.description?.es || category.description?.en || "category description"}</small>
                <small class="card-title">${category.toolTip?.description?.es || category.toolTip?.description?.en || "category description"}</small>
                <img style="max-height: 110px;max-width: 110px;" src="${category.toolTip?.imageUrl || "default-image.jpg"}" class="card-img-top" alt="${category.title?.es || category.title?.en || "category img"}">
                <br />
                <button class="btn btn-primary btn-sm" onclick="viewCategoryItems('${encodedData}', '${sectionId}','${sectionTitle}')">view items</button>
                
                <button class="btn btn-warning btn-sm" onclick="newOpenEditPopup('category', '${sectionId}', ${safeCategoryData})">Edit</button>

                <button class="btn btn-danger btn-sm" onclick="deleteNewCategory('${sectionId}', '${category.categoryId}', '${sectionTitle}')">Delete</button>

                <div class="form-check form-switch mt-2">
                  <input class="form-check-input" type="checkbox" role="switch" id="switch-${category.categoryId}"
                    ${isChecked} onclick="sectionToggleStatus('category', '${category.categoryId}', this.checked)">
                  <label class="form-check-label" for="switch-${category.categoryId}">
                    ${category.status}
                  </label>
                </div>
              </div>
            </div>
          </div>`;
      });

      categoriesHTML += "</div>";
      $("#content").html(categoriesHTML);
    },
    error: function () {
      $("#content").html(
        '<p class="text-danger">Failed to load categories.</p>',
      );
    },
  });
}

// Convert text to Base64 with UTF-8 support
function encodeBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

// Decode Base64 to text with UTF-8 support
function decodeBase64(str) {
  return decodeURIComponent(escape(atob(str)));
}

function viewCategoryContent(
  encodedData,
  sectionId,
  sectionTitle,
  sectionDescription,
) {
  let category = JSON.parse(decodeBase64(encodedData)); // ✅ Decode Base64 with UTF-8 support
  let contentHTML = `
  <nav aria-label="breadcrumb">
  <ol class="breadcrumb">
    <li class="breadcrumb-item">
      <a onclick="loadNewSections()">All Sections</a>
    </li>
    <li class="breadcrumb-item">
      <a onclick="viewNewCategories('${sectionId}', '${sectionTitle ? sectionTitle.replace(/'/g, "\\'") : "section title"}')">
        ${sectionTitle || "section title"}
      </a>
    </li>
    <li class="breadcrumb-item active" aria-current="page">
      ${category && category.title ? category.title.es || category.title.en || "category title" : "category title"}
    </li>
  </ol>
</nav>
    <h3>${category.title?.es || category.title?.en || "subcategory title"}</h3>
    <h5>${category.description?.es || category.description?.en || "subcategory description"}</h5>
    <h6${category.toolTip?.description?.es || category.toolTip?.description?.en || "subcategory description"}</h5>

    <label for="languageSelect"><strong>Select Language:</strong></label>
    <select id="languageSelect" class="form-select" onchange="updateContent('${encodedData}')">
      <option value="ar" selected>العربية</option>
      <option value="en">English</option>
      <option value="es">Español</option>
    </select>
    <div id="contentDisplay" class="mt-3">
      <p>${category.content.es}</p>
    </div>`;

  $("#content").html(contentHTML);
}

function viewCategoryItems(
  encodedData,
  sectionId,
  sectionTitle,
  sectionDescription,
) {
  let category = JSON.parse(decodeBase64(encodedData));

  console.log("category itemssss", category);

  let contentHTML = `
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <a onclick="loadNewSections()">All Sections</a>
        </li>

        <li class="breadcrumb-item">
          <a onclick="viewNewCategories(
            '${sectionId}',
            '${sectionTitle ? sectionTitle.replace(/'/g, "\\'") : "section title"}'
          )">
            ${sectionTitle || "section title"}
          </a>
        </li>

        <li class="breadcrumb-item active" aria-current="page">
          ${
            category && category.title
              ? category.title.es || category.title.en || "category title"
              : "category title"
          }
        </li>
      </ol>
    </nav>

    <h3>
      ${category.title?.es || category.title?.en || "subcategory title"}
    </h3>

    <h5>
      ${
        category.description?.es ||
        category.description?.en ||
        "subcategory description"
      }
    </h5>

    <h6>
      ${
        category.toolTip?.description?.es ||
        category.toolTip?.description?.en ||
        "subcategory description"
      }
    </h6>

    <label for="languageSelect">
      <strong>Select Language:</strong>
    </label>

    <select
      id="languageSelect"
      class="form-select"
      onchange="updateContent('${encodedData}')"
    >
      <option value="ar" selected>العربية</option>
      <option value="en">English</option>
      <option value="es">Español</option>
    </select>
  `;

  $("#content").html(contentHTML);

  let categoriesHTML = `
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">

        <li class="breadcrumb-item">
          <a onclick="loadNewSections()">All Sections</a>
        </li>

        <li class="breadcrumb-item">
          <a onclick="viewNewCategories(
            '${sectionId}',
            '${sectionTitle ? sectionTitle.replace(/'/g, "\\'") : "section title"}'
          )">
            ${sectionTitle || "section title"}
          </a>
        </li>

        <li class="breadcrumb-item active" aria-current="page">
          ${
            category && category.title
              ? category.title.es || category.title.en || "category title"
              : "category title"
          }
        </li>

      </ol>
    </nav>

    <div class="row">
  `;

  category.items.forEach((item) => {
    console.log("Current item:", item);

    const isChecked = item.status === "Published" ? "checked" : "";

    const safeItemData = JSON.stringify(item).replace(/"/g, "&quot;");

    const encodedItemData = encodeBase64(JSON.stringify(item));

    categoriesHTML += `
      <div class="col-lg-3 mb-4">

        <div class="card">

          <img
            style="max-height: 110px;max-width: 110px;"
            src="${item.imageUrl || "default-image.jpg"}"
            class="card-img-top"
            alt="${item.title?.es || item.title?.en || "item img"}"
          >

          <div class="card-body">

            <strong class="card-title">
              ${item.title?.es || item.title?.en || "item title"}
            </strong>

            <br />

            <small class="card-title">
              ${
                item.description?.es ||
                item.description?.en ||
                "item description"
              }
            </small>

            <small class="card-title">
              ${
                item.toolTip?.description?.es ||
                item.toolTip?.description?.en ||
                "item description"
              }
            </small>

            <img
              style="max-height: 110px;max-width: 110px;"
              src="${item.toolTip?.imageUrl || "default-image.jpg"}"
              class="card-img-top"
              alt="${item.title?.es || item.title?.en || "item img"}"
            >

            <br />

            <button
              class="btn btn-primary btn-sm"
              onclick="viewItemContent(
                '${encodedItemData}',
                '${sectionId}',
                '${sectionTitle ? sectionTitle.replace(/'/g, "\\'") : "section title"}'
              )"
            >
              view content
            </button>

            <button
              class="btn btn-warning btn-sm"
              onclick="newOpenEditPopup(
                'item',
                '${category.categoryId}',
                ${safeItemData},
                '${sectionId}',
                '${sectionTitle ? sectionTitle.replace(/'/g, "\\'") : "section title"}'
              )"
            >
              Edit
            </button>

            <button
              class="btn btn-danger btn-sm"
              onclick="deleteNewItem(
                '${sectionId}',
                '${category.categoryId}',
                '${item.itemId}',
                '${sectionTitle ? sectionTitle.replace(/'/g, "\\'") : "section title"}'
              )"
            >
              Delete
            </button>

            <div class="form-check form-switch mt-2">

              <input
                class="form-check-input"
                type="checkbox"
                role="switch"
                id="switch-${item.itemId}"
                ${isChecked}
                onclick="sectionToggleStatus(
                  'item',
                  '${item.itemId}',
                  this.checked
                )"
              >

              <label
                class="form-check-label"
                for="switch-${item.itemId}"
              >
                ${item.status}
              </label>

            </div>

          </div>
        </div>

      </div>
    `;
  });

  categoriesHTML += `
    </div>
  `;

  $("#content").html(categoriesHTML);
}

function viewItemContent(encodedData, sectionId, sectionTitle) {
  // ==========================================
  // GET ITEM DATA
  // ==========================================

  const item = JSON.parse(decodeBase64(encodedData));

  console.log("Selected item:", item);

  // ==========================================
  // DEFAULT LANGUAGE
  // ==========================================

  const lang = "es";

  const itemTitle =
    item.title?.[lang] || item.title?.en || item.title?.es || "Item title";

  // ==========================================
  // BREADCRUMB
  // ==========================================

  const contentHTML = `
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">

        <li class="breadcrumb-item">
          <a onclick="loadNewSections()">
            All Sections
          </a>
        </li>

        <li class="breadcrumb-item">
          <a onclick="viewNewCategories(
            '${sectionId}',
            '${sectionTitle ? sectionTitle.replace(/'/g, "\\'") : "section title"}'
          )">
            ${sectionTitle || "section title"}
          </a>
        </li>

        <li class="breadcrumb-item active" aria-current="page">
          ${itemTitle}
        </li>

      </ol>
    </nav>

    <!-- ==========================================
         ITEM TITLE
    =========================================== -->

    <h3 id="itemContentTitle">
      ${itemTitle}
    </h3>

    <!-- ==========================================
         LANGUAGE SELECT
    =========================================== -->

    <div class="mb-3">

      <label for="itemLanguageSelect">
        <strong>Select Language:</strong>
      </label>

      <select
        id="itemLanguageSelect"
        class="form-select"
        onchange="updateItemContent('${encodedData}')"
      >
        <option value="ar">العربية</option>
        <option value="en">English</option>
        <option value="es" selected>Español</option>
      </select>

    </div>

    <!-- ==========================================
         ITEM CONTENT
    =========================================== -->

    <div id="itemContentDisplay" class="mt-4">
      ${item.content?.[lang] || "No content available."}
    </div>
  `;

  $("#content").html(contentHTML);
}

function updateItemContent(encodedData) {
  // ==========================================
  // GET ITEM DATA
  // ==========================================

  const item = JSON.parse(decodeBase64(encodedData));

  // ==========================================
  // GET SELECTED LANGUAGE
  // ==========================================

  const lang = $("#itemLanguageSelect").val();

  // ==========================================
  // GET CONTENT
  // ==========================================

  const content =
    item.content?.[lang] ||
    item.content?.en ||
    item.content?.es ||
    "No content available.";

  // ==========================================
  // GET TITLE
  // ==========================================

  const title =
    item.title?.[lang] || item.title?.en || item.title?.es || "Item title";

  // ==========================================
  // UPDATE TITLE
  // ==========================================

  $("#itemContentTitle").text(title);

  // ==========================================
  // UPDATE CONTENT
  // ==========================================

  $("#itemContentDisplay").html(content);
}

///////////////////////////////////

// **Load sections**
function loadNewSections1() {
  $.ajax({
    url: `${API_BASE_URL}/newsection/sections`,
    type: "GET",
    headers: { Authorization: `Bearer ${token}` },
    success: function (sections) {
      let options = '<option value="">Choose a section...</option>';
      sections.forEach((section) => {
        options += `<option value="${section.sectionId}">${section.title.es}</option>`;
      });
      console.log("Loaded sections:", sections);
      console.log("options", options);
      $("#newSectionSelect").html(options);
    },
    error: function () {
      alert("Failed to load sections.");
    },
  });
}

function newCreateSectionWithCategoryAndSubcategory(sectionData, categoryData) {
  const newCategory = {
    title: {
      es: categoryData.title?.es || "",
      en: categoryData.title?.en || "",
    },

    description: {
      es: categoryData.description?.es || "",
      en: categoryData.description?.en || "",
    },

    imageUrl: categoryData.imageUrl || "",

    toolTip: categoryData.toolTip || null,

    status: "Published",

    items: categoryData.items || [],
  };

  sectionData.categories = [newCategory];

  $.ajax({
    url: `${API_BASE_URL}/newsection/form/sections`,

    type: "POST",

    headers: {
      Authorization: `Bearer ${token}`,
    },

    contentType: "application/json",

    data: JSON.stringify(sectionData),

    success: function (response) {
      console.log("Section + Category + Item created:", response);

      alert("Section with Category and Item added successfully!");

      document
        .querySelectorAll(
          "#addNewSectionForm input, #addNewSectionForm textarea, #addNewSectionForm select",
        )
        .forEach((input) => {
          input.value = "";
        });

      // $("#addNewSectionModal").modal("hide");

      loadNewSections();
    },

    error: function (xhr) {
      console.error("Error creating section:", xhr.responseText);

      alert("Failed to add section with category and item.");
    },
  });
}
function newCreateCategory(sectionId, data) {
  console.log("sectionId in createCategory:", sectionId);
  console.log("data in createCategory:", data);
  $.ajax({
    url: `${API_BASE_URL}/newsection/form/sections/${sectionId}/categories`,
    type: "POST",
    headers: { Authorization: `Bearer ${token}` },
    contentType: "application/json",
    data: JSON.stringify(data),
    success: function () {
      alert("Category added successfully!");
      document
        .querySelectorAll(
          "#addNewSectionForm input, #addNewSectionForm textarea",
        )
        .forEach((input) => (input.value = ""));
      // $("#addNewSectionModal").modal("hide");
      // loadNewCategories1(sectionId);
      viewNewCategories(sectionId, data.title.es);
    },
    error: function () {
      alert("Failed to add category.");
    },
  });
}

function newCreateItem(sectionId, categoryId, itemData) {
  $.ajax({
    url: `${API_BASE_URL}/newsection/form/sections/${sectionId}/categories/${categoryId}/items`,
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },

    contentType: "application/json",
    data: JSON.stringify(itemData),

    success: function (response) {
      console.log("Item added successfully:", response);

      alert("Item added successfully!");

      // Optional: reload the section/category view
      viewNewCategories(sectionId);
    },

    error: function (xhr) {
      console.error("Error adding item:", xhr);
      console.error("Status:", xhr.status);
      console.error("Response:", xhr.responseText);

      alert(xhr.responseJSON?.message || "Error adding item");
    },
  });
}

function loadNewCategories1(sectionId) {
  console.log("loadNewCategories1 sectionId:", sectionId);

  $.ajax({
    url: `${API_BASE_URL}/newsection/form/sections/${sectionId}/categories`,
    type: "GET",
    headers: { Authorization: `Bearer ${token}` },
    success: function (categories) {
      let options = '<option value="">Choose a category...</option>';
      console.log("Loaded categories:", categories);
      categories.forEach((category) => {
        options += `<option value="${category.categoryId}">${category.title.es}</option>`;
      });
      $("#categorySelect").html(options);
    },
    error: function () {
      alert("Failed to load categories.");
    },
  });
}

// Delete section
function deleteNewSection(sectionId) {
  if (confirm("Are you sure you want to delete this section?")) {
    $.ajax({
      url: `${API_BASE_URL}/newsection/section/${sectionId}`,
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      success: function () {
        alert("deleded successfully!");
        loadNewSections();
      },
      error: function () {
        alert("Failed to delete section.");
      },
    });
  }
}

// Delete category inside a section
function deleteNewCategory(sectionId, categoryId, sectionTitle) {
  if (confirm("Are you sure you want to delete this category?")) {
    $.ajax({
      url: `${API_BASE_URL}/newsection/section/${sectionId}/category/${categoryId}`,
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      success: function () {
        alert("Category deleted successfully!");
        viewNewCategories(sectionId, sectionTitle);
      },
      error: function () {
        alert("Failed to delete category.");
      },
    });
  }
}

function newSectionToggleStatus(type, id, isChecked) {
  const newStatus = isChecked ? "Published" : "Unpublished";
  $.ajax({
    url: `${API_BASE_URL}/newsection/${type}/${id}/status`,
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    data: JSON.stringify({ status: newStatus }),
    success: function () {
      $(`#switch-${id}`).next().text(newStatus);
      alert(type + " updated successfully.");
    },
    error: function () {
      alert("Failed to update status.");
    },
  });
}

function newOpenEditPopup(type, parentId, item, sectionId, sectionTitle) {
  console.log("########### item", item);
  console.log("Edit type:", type);
  console.log("Parent ID:", parentId);
  console.log("Section ID:", sectionId);

  // Hide optional fields first

  $("#newLblEditContentEs").hide();
  $("#newCategoryEditContentEs").hide();

  $("#newLblEditContentEn").hide();
  $("#newCategoryEditContentEn").hide();

  $("#newLblEditToolTipTitleEs").hide();
  $("#newLblEditToolTipDescriptionEs").hide();

  $("#newLblEditToolTipTitleEn").hide();
  $("#newLblEditToolTipDescriptionEn").hide();

  $("#newLblEditToolTipImageUrl").hide();

  $("#newEditToolTipTitleEs").hide();
  $("#newEditToolTipDescriptionEs").hide();

  $("#newEditToolTipTitleEn").hide();
  $("#newEditToolTipDescriptionEn").hide();

  $("#newEditToolTipImageUrl").hide();

  // Determine the correct ID

  let editId = "";

  if (type === "item") {
    editId = item.itemId;
  } else if (type === "category") {
    editId = item.categoryId;
  } else if (type === "section") {
    editId = item.sectionId;
  } else {
    editId =
      item._id ||
      item.sectionId ||
      item.categoryId ||
      item.itemId ||
      item.subcategoryId;
  }

  console.log("Edit ID:", editId);

  $("#newEditId").val(editId || "");
  $("#newEditType").val(type);

  // Common fields

  $("#newEditTitleEs").val(item.title?.es || "");

  $("#newEditDescriptionEs").val(item.description?.es || "");

  $("#newEditTitleEn").val(item.title?.en || "");

  $("#newEditDescriptionEn").val(item.description?.en || "");

  $("#newEditImageUrl").val(item.imageUrl || "");

  /*
   * CATEGORY
   */

  if (type === "category") {
    console.log("Editing category:", item);

    // $("#newLblEditContentEs").show();
    // $("#newCategoryEditContentEs").show();

    // $("#newCategoryEditContentEs").val(item.content?.es || "");

    // $("#newLblEditContentEn").show();
    // $("#newCategoryEditContentEn").show();

    // $("#newCategoryEditContentEn").val(item.content?.en || "");

    $("#newLblEditToolTipTitleEs").show();
    $("#newLblEditToolTipDescriptionEs").show();

    $("#newLblEditToolTipTitleEn").show();
    $("#newLblEditToolTipDescriptionEn").show();

    $("#newLblEditToolTipImageUrl").show();

    $("#newEditToolTipTitleEs").show();
    $("#newEditToolTipDescriptionEs").show();

    $("#newEditToolTipTitleEn").show();
    $("#newEditToolTipDescriptionEn").show();

    $("#newEditToolTipImageUrl").show();

    $("#newEditToolTipTitleEs").val(item.toolTip?.title?.es || "");

    $("#newEditToolTipDescriptionEs").val(item.toolTip?.description?.es || "");

    $("#newEditToolTipTitleEn").val(item.toolTip?.title?.en || "");

    $("#newEditToolTipDescriptionEn").val(item.toolTip?.description?.en || "");

    $("#newEditToolTipImageUrl").val(item.toolTip?.imageUrl || "");
  }

  /*
   * ITEM
   */

  if (type === "item") {
    console.log("Editing item:", item);

    $("#newLblEditContentEs").show();
    $("#newCategoryEditContentEs").show();

    $("#newCategoryEditContentEs").val(item.content?.es || "");

    $("#newLblEditContentEn").show();
    $("#newCategoryEditContentEn").show();

    $("#newCategoryEditContentEn").val(item.content?.en || "");

    $("#newLblEditToolTipTitleEs").show();
    $("#newLblEditToolTipDescriptionEs").show();

    $("#newLblEditToolTipTitleEn").show();
    $("#newLblEditToolTipDescriptionEn").show();

    $("#newLblEditToolTipImageUrl").show();

    $("#newEditToolTipTitleEs").show();
    $("#newEditToolTipDescriptionEs").show();

    $("#newEditToolTipTitleEn").show();
    $("#newEditToolTipDescriptionEn").show();

    $("#newEditToolTipImageUrl").show();

    $("#newEditToolTipTitleEs").val(item.toolTip?.title?.es || "");

    $("#newEditToolTipDescriptionEs").val(item.toolTip?.description?.es || "");

    $("#newEditToolTipTitleEn").val(item.toolTip?.title?.en || "");

    $("#newEditToolTipDescriptionEn").val(item.toolTip?.description?.en || "");

    $("#newEditToolTipImageUrl").val(item.toolTip?.imageUrl || "");
  }

  // Show popup

  $("#newEditPopup").modal("show");

  // Store IDs for newSaveChanges()

  $("#newEditPopup").data("parentId", parentId || null);

  $("#newEditPopup").data("sectionId", sectionId || null);

  $("#newEditPopup").data("sectionTitle", sectionTitle || null);
}

function newSaveChanges() {
  const type = $("#newEditType").val();
  const id = $("#newEditId").val();

  const parentId = $("#newEditPopup").data("parentId");
  const sectionId = $("#newEditPopup").data("sectionId");
  const sectionTitle = $("#newEditPopup").data("sectionTitle");

  console.log("========== SAVE CHANGES ==========");
  console.log("type:", type);
  console.log("id:", id);
  console.log("parentId:", parentId);
  console.log("sectionId:", sectionId);

  // Common data

  const updatedData = {
    title: {
      es: $("#newEditTitleEs").val(),
      en: $("#newEditTitleEn").val(),
    },

    description: {
      es: $("#newEditDescriptionEs").val(),
      en: $("#newEditDescriptionEn").val(),
    },

    imageUrl: $("#newEditImageUrl").val(),

    toolTip: {
      title: {
        es: $("#newEditToolTipTitleEs").val(),
        en: $("#newEditToolTipTitleEn").val(),
      },

      description: {
        es: $("#newEditToolTipDescriptionEs").val(),
        en: $("#newEditToolTipDescriptionEn").val(),
      },

      imageUrl: $("#newEditToolTipImageUrl").val(),
    },
  };

  let url = "";

  /*
   * SECTION
   */

  if (type === "section") {
    url = `${API_BASE_URL}/newsection/section/${id}`;
  } else if (type === "category") {
    /*
     * CATEGORY
     *
     * parentId = sectionId
     * id = categoryId
     */
    url = `${API_BASE_URL}/newsection/section/${parentId}/category/${id}`;
  } else if (type === "item") {
    /*
     * ITEM
     *
     * sectionId = section ID
     * parentId = category ID
     * id = item ID
     */
    updatedData.content = {
      es: $("#newCategoryEditContentEs").val(),
      en: $("#newCategoryEditContentEn").val(),
    };

    url = `${API_BASE_URL}/newsection/section/${sectionId}/category/${parentId}/item/${id}`;
  } else {
    console.error("Unknown edit type:", type);
    alert("Invalid edit type.");
    return;
  }

  console.log("PUT URL:", url);
  console.log("Updated data:", updatedData);

  $.ajax({
    url: url,

    method: "PUT",

    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },

    data: JSON.stringify(updatedData),

    success: function (response) {
      console.log("Update successful:", response);

      $("#newEditPopup").modal("hide");

      alert("Updated successfully!");

      /*
       * Reload after update
       */

      if (type === "section") {
        loadNewSections();
      } else if (type === "category") {
        viewNewCategories(parentId, sectionTitle || "section title");
      } else if (type === "item") {
        viewNewCategories(sectionId, sectionTitle || "section title");
      }
    },

    error: function (xhr) {
      console.error("Failed to update.");
      console.error("Status:", xhr.status);
      console.error("Response:", xhr.responseText);

      alert(
        xhr.responseJSON?.message ||
          xhr.responseJSON?.error ||
          "Failed to update.",
      );
    },
  });
}

function deleteNewItem(sectionId, categoryId, itemId, sectionTitle) {
  const confirmed = confirm("Are you sure you want to delete this item?");

  if (!confirmed) {
    return;
  }

  const url =
    `${API_BASE_URL}/newsection/section/` +
    `${sectionId}/category/${categoryId}/item/${itemId}`;

  console.log("Deleting item:", itemId);
  console.log("DELETE URL:", url);

  $.ajax({
    url: url,

    method: "DELETE",

    headers: {
      Authorization: `Bearer ${token}`,
    },

    success: function (response) {
      console.log("Item deleted successfully:", response);

      alert("Item deleted successfully!");

      // Reload categories after deletion
      viewNewCategories(sectionId, sectionTitle || "section title");
    },

    error: function (xhr) {
      console.error("Error deleting item:", xhr);
      console.error("Status:", xhr.status);
      console.error("Response:", xhr.responseText);

      alert(
        xhr.responseJSON?.message ||
          xhr.responseJSON?.error ||
          "Failed to delete item.",
      );
    },
  });
}

function loadNewSections() {
  $("#content").html("<h3>Loading Sections...</h3>");
  const lang = localStorage.getItem("selectedLang") || "es"; // أو يمكنك تحديد اللغة من إعدادات المستخدم أو من الصفحة
  $.ajax({
    url: `${API_BASE_URL}/newsection/sections`, // إضافة اللغة في استعلام الـ URL
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    success: function (response) {
      let sectionsHTML =
        '<nav aria-label="breadcrumb"><ol id="sectionsBreadcrumb" class="breadcrumb"><li class="breadcrumb-item active" aria-current="page">Sections</li></ol></nav><button type="button" class="btn btn-primary add-float" data-bs-toggle="modal" data-bs-target="#addNewSectionModal">Add New Section </button><div class="row">';

      $("#content").html(sectionsHTML);
      console.log(response);
      response.forEach((section) => {
        console.log("@@@@", section);
        const isChecked = section.status === "Published" ? "checked" : "";
        const safeSectionData = JSON.stringify(section).replace(/"/g, "&quot;"); // ✅ Fix issue with passing the object inside `onclick`

        // بناء المحتوى للـ HTML
        sectionsHTML += `
          <div class="col-lg-3 mb-4">
            <div class="card">
              <img src="${section.imageUrl || "default-image.jpg"}" class="card-img-top" alt=""${section.title?.es || section.title?.en || "Section Title"}">
              <div class="card-body">
                <h5 class="card-title">${section.title?.es || category.title?.en || "Section Title"}</h5>
                
                <button class="btn btn-primary btn-sm" onclick="viewNewCategories('${section.sectionId}', '${section.title.es}')">Read More</button>
  
                <button class="btn btn-warning btn-sm" onclick="newOpenEditPopup('section', '${section.sectionId}', ${safeSectionData})">Edit</button>
  
                <button class="btn btn-danger btn-sm" onclick="deleteNewSection('${section.sectionId}')">Delete</button>
  
                <!-- Switch Toggle for Publish/Unpublish -->
                <div class="form-check form-switch mt-2">
                  <input class="form-check-input" type="checkbox" role="switch" id="switch-${section.sectionId}"
                    ${isChecked} onclick="newSectionToggleStatus('section', '${section.sectionId}', this.checked)">
                  <label class="form-check-label" for="switch-${section.sectionId}">
                    ${section.status}
                  </label>
                </div>
                
                <!-- Loop through categories and display them 
                <div class="categories mt-3">
                  <h6>Categories:</h6>
                  ${section.categories
                    .map(
                      (category) => `
                    <p><strong>${category.title || "Category Title"}</strong>: ${category.content || "No content available"}</p>
                  `,
                    )
                    .join("")}
                </div>
                -->
              </div>
            </div>
          </div>`;
      });

      sectionsHTML += "</div>";
      $("#content").html(sectionsHTML);
    },
    error: function () {
      $("#content").html('<p class="text-danger">Failed to load sections.</p>');
    },
  });
}

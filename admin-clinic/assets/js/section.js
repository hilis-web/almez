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
      hideNewNewSectionInputs(); // Hide fields for adding a new section
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

    let sectionId = $("#newSectionSelect").val();

    let newSectionTitle = $("#newSectionTitleEs").val();
    let newSectionDescription = $("#newSectionDescriptionEs").val();

    let newSectionTitleEn = $("#newSectionTitleEn").val();
    let newSectionDescriptionEn = $("#newSectionDescriptionEn").val();

    let newSectionImage = $("#newSectionImage").val();

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

    let newCategoryContent = $("#newCategoryContentEs").val();
    let newCategoryContentEn = $("#newCategoryContentEn").val();

    if (!sectionId && newSectionTitle) {
      // 🟢 Create a new section with a category and subcategory
      const sectionData = {
        title: { es: newSectionTitle, en: newSectionTitleEn },
        description: { es: newSectionDescription, en: newSectionDescriptionEn },
        imageUrl: newSectionImage,
      };

      const categoryData = {
        title: { es: newCategoryTitle, en: newCategoryTitleEn },
        description: {
          es: newCategoryDescription,
          encodedData: newCategoryDescriptionEn,
        },
        toolTip: {
          title: { es: newCategoryToolTipTitle, en: newCategoryToolTipTitleEn },
          description: {
            es: newCategoryToolTipDescription,
            en: newCategoryToolTipDescriptionEn,
          },
          imageUrl: newCategoryToolTipImage,
        },
        imageUrl: newCategoryImage,
        content: { es: newCategoryContent, en: newCategoryContentEn },
      };

      newCreateSectionWithCategoryAndSubcategory(sectionData, categoryData);
    } else if (sectionId && newCategoryTitle) {
      // 🟢 Add a new category inside an existing section

      const categoryData = {
        title: { es: newCategoryTitle, en: newCategoryTitleEn },
        description: {
          es: newCategoryDescription,
          en: newCategoryDescriptionEn,
        },
        toolTip: {
          title: { es: newCategoryToolTipTitle, en: newCategoryToolTipTitleEn },
          description: {
            es: newCategoryToolTipDescription,
            en: newCategoryToolTipDescriptionEn,
          },
          imageUrl: newCategoryToolTipImage,
        },
        imageUrl: newCategoryImage,
        content: { es: newCategoryContent, en: newCategoryContentEn },
      };

      newCreateCategory(sectionId, categoryData);
    } else {
      alert("Please fill in the required fields.");
    }
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
                <button class="btn btn-primary btn-sm" onclick="viewCategoryContent('${encodedData}', '${sectionId}','${sectionTitle}')">Read More</button>
                
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
  // تحضير الفئة الجديدة مع الفئة الفرعية داخلها
  const newCategory = {
    title: { es: categoryData.title.es },
    description: { es: categoryData.description.es },
    imageUrl: categoryData.imageUrl,
    toolTip: {
      description: { es: categoryData.toolTip.description.es },
      imageUrl: categoryData.toolTip.imageUrl,
    },
    content: { es: categoryData.content.es },
  };

  // إضافة الفئة إلى بيانات القسم
  sectionData.categories = [newCategory]; // إضافة الفئة إلى القسم الجديد

  // إرسال القسم الجديد مع الفئة والفئة الفرعية
  $.ajax({
    url: `${API_BASE_URL}/newsection/form/sections`,
    type: "POST",
    headers: { Authorization: `Bearer ${token}` },
    contentType: "application/json",
    data: JSON.stringify(sectionData), // إرسال البيانات مع الفئة والفئة الفرعية
    success: function () {
      alert("Section with Category added successfully!");
      document
        .querySelectorAll(
          "#addNewSectionForm input, #addNewSectionForm textarea",
        )
        .forEach((input) => (input.value = ""));
      $("#addNewSectionModal").modal("hide");
      // loadNewSections1(); // إعادة تحميل الأقسام بعد إضافة القسم الجديد
      loadNewSections();
    },
    error: function () {
      alert("Failed to add section with category.");
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
      $("#addNewSectionModal").modal("hide");
      // loadNewCategories1(sectionId);
      viewNewCategories(sectionId, data.title.es);
    },
    error: function () {
      alert("Failed to add category.");
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

function newOpenEditPopup(type, parentId, item) {
  console.log("########### item", item);
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

  console.log("section popup", type, parentId, item);
  $("#newEditId").val(
    item._id || item.sectionId || item.categoryId || item.subcategoryId,
  );
  $("#newEditType").val(type);

  $("#newEditTitleEs").val(item.title?.es || "");
  $("#newEditDescriptionEs").val(item.description?.es || "");

  $("#newEditTitleEn").val(item.title?.en || "");
  $("#newEditDescriptionEn").val(item.description?.en || "");

  $("#newEditImageUrl").val(item.imageUrl);

  if (type == "category") {
    console.log("wwwwww", item);

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
  $("#newEditPopup").modal("show");
  // Store parentId to use it in the update if the edit is on a category or subcategory
  $("#newEditPopup").data("parentId", parentId || null);
}

function newSaveChanges() {
  const type = $("#newEditType").val();
  const id = $("#newEditId").val();

  console.log("type", type);
  console.log("id", id);

  const parentId = $("#newEditPopup").data("parentId");

  const updatedData = {
    title: { es: $("#newEditTitleEs").val(), en: $("#newEditTitleEn").val() },
    description: {
      es: $("#newEditDescriptionEs").val(),
      en: $("#newEditDescriptionEn").val(),
    },
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
    imageUrl: $("#newEditImageUrl").val(),
  };
  if (type == "category") {
    updatedData.content = {
      es: $("#newCategoryEditContentEs").val(),
      en: $("#newCategoryEditContentEn").val(),
    };
  }

  let url = `${API_BASE_URL}/newsection/${type}/${parentId}`;

  if (type === "category") {
    url = `${API_BASE_URL}/newsection/section/${parentId}/category/${id}`;
  }

  console.log("updatedData", updatedData);

  $.ajax({
    url: url,
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    data: JSON.stringify(updatedData),
    success: function () {
      $("#newEditPopup").modal("hide");
      alert("Updated successfully!");

      // Reload the data based on what was edited
      if (type === "section") {
        loadNewSections();
      } else if (type === "category") {
        viewNewCategories(parentId, item.title.es);
      }
    },
    error: function () {
      alert("Failed to update.");
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

let currentItem = null;

$(document).ready(function () {
  loadItem();
});

function loadItem() {
  // ============================================
  // GET PARAMETERS FROM URL
  // ============================================

  const params = new URLSearchParams(window.location.search);

  const sectionId = params.get("sectionId");
  const categoryId = params.get("categoryId");
  const itemId = params.get("itemId");

  console.log("Section ID:", sectionId);
  console.log("Category ID:", categoryId);
  console.log("Item ID:", itemId);

  // ============================================
  // VALIDATE PARAMETERS
  // ============================================

  if (!sectionId || !categoryId || !itemId) {
    console.error("Missing sectionId, categoryId or itemId");
    return;
  }

  // ============================================
  // API REQUEST
  // ============================================

  $.ajax({
    url: `${API_BASE_URL}/newsection/section/${sectionId}/category/${categoryId}/item/${itemId}`,

    method: "GET",

    success: function (data) {
      console.log("ITEM DATA:", data);

      // Save the complete item data
      currentItem = data;

      // Render according to current language
      renderItem(currentItem);
    },

    error: function (xhr) {
      console.error("Error loading item:", xhr);

      $("#contentContainer").html(`
        <div class="alert alert-danger">
          No se ha podido cargar la información.
        </div>
      `);
    },
  });
}

// ==================================================
// RENDER ITEM ACCORDING TO SELECTED LANGUAGE
// ==================================================

function renderItem(data) {
  const lang = localStorage.getItem("selectedLang") || "es";

  console.log("Rendering item in language:", lang);

  // ========================================
  // CATEGORY
  // ========================================

  const categoryTitle =
    data.categoryTitle?.[lang] ||
    data.categoryTitle?.es ||
    data.categoryTitle?.en ||
    "";

  // ========================================
  // ITEM TITLE
  // ========================================

  const title =
    data.item?.title?.[lang] ||
    data.item?.title?.es ||
    data.item?.title?.en ||
    "";

  // ========================================
  // ITEM DESCRIPTION
  // ========================================

  const description =
    data.item?.description?.[lang] ||
    data.item?.description?.es ||
    data.item?.description?.en ||
    "";

  // ========================================
  // ITEM CONTENT
  // ========================================

  const content =
    data.item?.content?.[lang] ||
    data.item?.content?.es ||
    data.item?.content?.en ||
    "";

  // ========================================
  // IMAGE
  // ========================================

  const image = data.item?.imageUrl || "";

  // ========================================
  // DISPLAY
  // ========================================

  $("#itemCategory").text(categoryTitle);

  $("#itemTitle").text(title);

  $("#itemDescription").text(description);

  $("#contentContainer").html(content);

  // ========================================
  // IMAGE
  // ========================================

  if (image) {
    $("#itemImage").attr("src", image).attr("alt", title).show();
  } else {
    $("#itemImage").hide();
  }

  // ========================================
  // PAGE TITLE
  // ========================================

  document.title = `${title} | ALMEZ`;
}

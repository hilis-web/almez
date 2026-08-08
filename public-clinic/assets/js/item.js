$(document).ready(function () {
  loadItem();
});

function loadItem() {
  const lang = localStorage.getItem("selectedLang") || "es";

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

      const item = data;

      console.log("item mmmmm", item);

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

      //const title = "item.title";
      const title =
        item.item.title?.[lang] ||
        item.item.title?.es ||
        item.item.title?.en ||
        "";

      // ========================================
      // ITEM DESCRIPTION
      // ========================================

      const description =
        item.item.description?.[lang] ||
        item.item.description?.es ||
        item.item.description?.en ||
        "";

      // ========================================
      // ITEM CONTENT
      // ========================================

      const content =
        item.item.content?.[lang] || item.content?.es || item.content?.en || "";

      // ========================================
      // IMAGE
      // ========================================

      const image = item.item.imageUrl || "";

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
    },
    error: function (xhr) {
      console.error("Error loading item:", xhr);

      $("#itemContent").html(`
        <div class="alert alert-danger">
          No se ha podido cargar la información.
        </div>
      `);
    },
  });
}

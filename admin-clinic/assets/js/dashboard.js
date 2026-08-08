const API_BASE_URL = "http://localhost:3000";
// const API_BASE_URL = 'https://user-api-server.onrender.com';
//const API_BASE_URL = "https://aaron-clinic-1.onrender.com";
//#region TOKEN
// Check the token
const token = localStorage.getItem("token");
if (!token) {
  alert("Unauthorized! Please login first.");
  window.location.href = "index.html";
}
// $('.addArticleBtn').click(function () {
//   console.log("addArticleBtn clicked");
//   $('#addArticlePopup').modal('show');
// });
//#endregion

$("#subCategoryContentEs").summernote({
  toolbar: [
    ["style", ["bold", "italic", "underline", "clear"]],
    ["font", ["strikethrough", "superscript", "subscript"]],
    ["color", ["color"]],
    ["para", ["ul", "ol", "paragraph"]],
    ["table", ["table"]],
    ["insert", ["link", "picture", "video"]],
    ["view", ["fullscreen", "codeview", "help"]],
    ["insert", ["hr", "removeFormat"]], // تأكد أن hr و removeFormat هنا
    ["style", ["h1", "h2", "h3", "p"]], // إضافة العناوين والفقرات
  ],
});
$("#subCategoryEditContentEs").summernote({
  toolbar: [
    ["style", ["bold", "italic", "underline", "clear"]],
    ["font", ["strikethrough", "superscript", "subscript"]],
    ["color", ["color"]],
    ["para", ["ul", "ol", "paragraph"]],
    ["table", ["table"]],
    ["insert", ["link", "picture", "video"]],
    ["view", ["fullscreen", "codeview", "help"]],
    ["insert", ["hr", "removeFormat"]], // تأكد أن hr و removeFormat هنا
    ["style", ["h1", "h2", "h3", "p"]], // إضافة العناوين والفقرات
  ],
});

function setActiveTab(tabId) {
  $(".sidebar-link").removeClass("active");
  $(`#${tabId}`).addClass("active");
}

//#region DOCUMENT READY
//Document ready
$(document).ready(function () {
  // Sidebar Toggle
  $("#sidebarToggle").click(function () {
    $("#sidebar").toggleClass("closed");
    $("#page-content").toggleClass("expanded");
  });

  $("#sidebarClose").click(function () {
    $("#sidebar").addClass("closed");
    $("#page-content").addClass("expanded");
  });

  // Fetch user information from localStorage (or the API)
  let adminFullName = localStorage.getItem("name");
  let adminEmail = localStorage.getItem("email");
  let adminRole = localStorage.getItem("role");

  // Fetch user information from localStorage (or the API)
  // let user = JSON.parse(localStorage.getItem('user'));
  // Check if data exists and replace spaces with "_"
  if (adminFullName) {
    adminFullName = adminFullName.replace(/ /g, " ");
  } else {
    adminFullName = "Admin";
  }

  if (!adminEmail) {
    adminEmail = "??";
  }

  if (!adminRole) {
    adminRole = "??";
  }

  // Display data in the Navbar
  $("#userInfo").text(`${adminFullName} (${adminEmail}) - ${adminRole}`);

  // Logout
  $("#logoutLink").on("click", function () {
    localStorage.removeItem("token"); // Remove token
    window.location.href = "index.html"; // Redirect to login page
  });

  // Handle Sidebar links (بدون Reload)
  $("#dashboardLink").on("click", function (e) {
    e.preventDefault();
    window.location.hash = "dashboard";
    setActiveTab("dashboardLink");
    loadDashboard();
  });

  $("#usersLink").on("click", function (e) {
    e.preventDefault();
    window.location.hash = "users";
    setActiveTab("usersLink");
    loadUsers();
  });

  $("#patientsLink").on("click", function (e) {
    e.preventDefault();
    window.location.hash = "patients";
    setActiveTab("patientsLink");
    loadPatients();
  });

  $("#appointmentsLink").on("click", function (e) {
    e.preventDefault();
    window.location.hash = "appointments";
    setActiveTab("appointmentsLink");
    loadCalendar();
  });

  $("#articlesLink").on("click", function (e) {
    e.preventDefault();
    window.location.hash = "articles";
    setActiveTab("articlesLink");
    loadArticles();
  });

  // Load content based on current hash
  const hash = window.location.hash.substring(1); // remove the #
  switch (hash) {
    case "users":
      setActiveTab("usersLink");
      loadUsers();
      break;
    case "patients":
      setActiveTab("patientsLink");
      loadPatients();
      break;
    case "appointments":
      setActiveTab("appointmentsLink");
      loadCalendar();
      break;
    case "articles":
      setActiveTab("articlesLink");
      loadArticles();
      break;
    case "sections":
      setActiveTab("newSectionsLink");
      loadNewSections();
      break;
    default:
      setActiveTab("dashboardLink");
      loadDashboard();
  }
});

//#endregion
//Load dashboard data
function loadDashboard() {}

const consultationTypes = {
  new_patient: "New Patient Consultation",
  second_opinion: "Second Medical Opinion",
  follow_up: "Follow-up Consultation",
  online: "Online / Video Consultation",
  post_surgery: "Post-operative Consultation",
  other: "Other",
};

// const consultationReasons = {
//   back_pain: "Back Pain",
//   neck_pain: "Neck Pain",
//   sciatica: "Sciatica / Leg Pain",
//   disc_herniation: "Disc Herniation",
//   spinal_stenosis: "Spinal Stenosis",
//   scoliosis: "Scoliosis / Spinal Deformity",
//   vertebral_fracture: "Vertebral Fracture",
//   sports_injury: "Sports Injury",
//   medical_report: "Review Medical Reports",
//   other: "Other",
// };

// Load users
function loadUsers() {
  $("#content").html("<h3>Loading Users...</h3>");
  $.ajax({
    url: `${API_BASE_URL}/dashboard/getAllUsers`,
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    success: function (response) {
      let usersHTML =
        '<h3>Users</h3><table class="table table-striped table-bordered"><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Consultation Type</th><th>Additional Info</th><th>Created At</th></tr></thead><tbody>';

      response.forEach((user) => {
        usersHTML += `<tr>
    <td>${user.fullName}</td>
    <td>${user.email}</td>
    <td>${user.phone || "-"}</td>
    <td>${consultationTypes[user.consultationType] || user.consultationType || "-"}</td>
    <td>${user.additionalInfo || "-"}</td>
    <td>${user.createdAt}</td>
  </tr>`;
      });
      usersHTML += "</tbody></table>";
      $("#content").html(usersHTML);
    },
    error: function () {
      $("#content").html('<p class="text-danger">Failed to load users.</p>');
    },
  });
}

// Load patients
function loadPatients() {
  $("#content").html("<h3>Loading Patients...</h3>");
  $.ajax({
    url: `${API_BASE_URL}/dashboard/getAllPatients`,
    method: "GET",
    headers: { Authorization: `Bearer ${token}` }, // Send token for verification
    success: function (response) {
      let patientsHTML = `
        <h3>Patients</h3>
        <table class="table table-striped table-bordered">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Appointment Date</th>
              <th>Appointment Time</th>
              <th>Reason</th>
              <th>Additional Notes</th>
              <th>Booked At</th>
              <th>Agree to Terms</th>
            </tr>
          </thead>
          <tbody>`;

      response.forEach((patient) => {
        patientsHTML += `
          <tr>
            <td>${patient.patient_name}</td>
            <td>${patient.phone_number}</td>
            <td>${patient.email}</td>
            <td>${patient.appointment_date}</td>
            <td>${patient.appointment_time}</td>
            <td>${patient.appointment_reason}</td>
            <td>${patient.additional_notes || "N/A"}</td>
            <td>${new Date(patient.booked_at).toLocaleString()}</td>
            <td>${patient.agree_to_terms ? "Yes" : "No"}</td>
          </tr>`;
      });

      patientsHTML += `</tbody></table>`;
      $("#content").html(patientsHTML);
    },
    error: function () {
      $("#content").html('<p class="text-danger">Failed to load patients.</p>');
    },
  });
}

// Load articles
function loadArticles() {
  $("#content").html("<h3>Loading Articles...</h3>");
  $.ajax({
    url: `${API_BASE_URL}/dashboard/getAllArticles`,
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    success: function (response) {
      console.log("response", response);
      let articlesHTML =
        '<button type="button" class="btn btn-primary add-float" data-bs-toggle="modal" data-bs-target="#addArticlePopup">Add New Article </button><h3>Articles</h3> <div class="row">';

      if (response?.length > 0) {
        response.forEach((article) => {
          const isChecked = article.status === "Published" ? "checked" : "";
          articlesHTML += `
            <div class="col-lg-2 mb-4">
              <div class="card">
                <img src="${
                  article.images[0] || "default-image.jpg"
                }" class="card-img-top" alt="${article.title}">
                <div class="card-body">
                  <h5 class="card-title">${article.title}</h5>
                  <p class="card-text">${article.summary}</p>
                  
                  <button class="btn btn-primary btn-sm" onclick="viewArticle('${
                    article._id
                  }')">Read More</button>
                  <button class="btn btn-warning btn-sm" onclick="editArticle('${
                    article._id
                  }')">Edit</button>
                  <button class="btn btn-danger btn-sm" onclick="deleteArticle('${
                    article._id
                  }')">Delete</button>
  
                  <!-- Switch Toggle for Publish/Unpublish -->
                  <div class="form-check form-switch mt-2">
                    <input class="form-check-input" type="checkbox" role="switch" id="switch-${
                      article._id
                    }"
                      ${isChecked} onclick="toggleStatus('${
                        article._id
                      }', this.checked)">
                    <label class="form-check-label" for="switch-${article._id}">
                      ${article.status}
                    </label>
                  </div>
                </div>
              </div>
            </div>`;
        });
        articlesHTML += "</div>";
        $("#content").html(articlesHTML);
      } else {
        $("#content").html(
          '<button type="button" class="btn btn-primary add-float" data-bs-toggle="modal" data-bs-target="#addArticlePopup">Add New Article </button><p class="text-danger">No articles available.</p>',
        );
      }
    },
    error: function () {
      $("#content").html(
        '<button type="button" class="btn btn-primary add-float" data-bs-toggle="modal" data-bs-target="#addArticlePopup">Add New Article </button><p class="text-danger">No articles available.</p>',
      );
    },
  });
}
// Load calendar
function loadCalendar() {
  $("#content").html("<h3>Loading Calendar...</h3>");

  $.ajax({
    url: `${API_BASE_URL}/dashboard/getAllAppointments`,
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    success: function (appointments) {
      $("#content").html('<div id="calendar"></div>');

      let events = appointments.map((appointment) => ({
        id: appointment._id,
        title: getEventTitle(appointment),
        start: `${appointment.date}T${appointment.time}`,
        backgroundColor: getColor(appointment.status),
        borderColor: getBorderColor(appointment.status),
        extendedProps: {
          status: appointment.status,
          date: appointment.date,
          patientName: appointment.patientName || "N/A",
          time: appointment.time,
          id: appointment._id,
        },
      }));

      let calendarEl = document.getElementById("calendar");

      if (calendarEl) {
        let calendar = new FullCalendar.Calendar(calendarEl, {
          initialView: "dayGridMonth",
          headerToolbar: {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          },
          events: events,
          eventClick: function (info) {
            console.log("Event Details:", info.event);

            let currentId = info.event.extendedProps.id;
            let currentDate = info.event.extendedProps.date;
            let currentPatientName = info.event.extendedProps.patientName;
            let currentTime = info.event.extendedProps.time;
            let currentStatus = info.event.extendedProps.status;

            let popupContent = `
                        <div class="popup">
                            <h3>Appointment Details</h3>
                            <p><strong>ID:</strong> ${currentId}</p>
                            <p><strong>Date:</strong> ${currentDate}</p>
                            <p><strong>Time:</strong> ${currentTime}</p>
                            <p><strong>Patient:</strong> ${currentPatientName}</p>
                            <p><strong>Status:</strong> ${currentStatus}</p>
                            <label for="newStatus">Change Status:</label>
                            <select id="newStatus">
                                <option value="available" ${
                                  currentStatus === "available"
                                    ? "selected"
                                    : ""
                                }>Available</option>
                                <option value="booked" ${
                                  currentStatus === "booked" ? "selected" : ""
                                }>Booked</option>
                                <option value="locked" ${
                                  currentStatus === "locked" ? "selected" : ""
                                }>Locked</option>
                            </select>
                            <button id="updateStatusBtn">Update</button>
                            <button id="closePopup">Close</button>
                        </div>
                    `;

            $("body").append(
              `<div class="popup-container">${popupContent}</div>`,
            );

            $("#closePopup").click(function () {
              $(".popup-container").remove();
            });

            $("#updateStatusBtn").click(function () {
              let newStatus = $("#newStatus").val();
              if (
                newStatus &&
                ["available", "booked", "locked"].includes(newStatus)
              ) {
                updateAppointmentStatus(currentId, newStatus, () => {
                  info.event.setProp("backgroundColor", getColor(newStatus));
                  info.event.setProp("borderColor", getBorderColor(newStatus));
                  info.event.setProp(
                    "title",
                    getEventTitle({ _id: currentId, status: newStatus }),
                  );
                  info.event.setExtendedProp("status", newStatus);
                  $(".popup-container").remove();
                });
              }
            });
          },
        });

        calendar.render();
      } else {
        console.error("Calendar element not found!");
      }
    },
    error: function () {
      $("#content").html('<p class="text-danger">Failed to load calendar.</p>');
    },
  });
}

// Function to update status on the server
function updateAppointmentStatus(appointmentId, newStatus, callback) {
  $.ajax({
    url: `${API_BASE_URL}/dashboard/updateAppointment/${appointmentId}`,
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    data: JSON.stringify({ status: newStatus }),
    success: function () {
      alert("Appointment updated successfully!");
      if (callback) callback();
    },
    error: function () {
      alert("Failed to update appointment.");
    },
  });
}

// Function to determine the title based on the status
function getEventTitle(appointment) {
  if (appointment.status === "locked") {
    return `Locked 🔒`;
  }
  return appointment.status === "booked"
    ? `Booked: ${appointment._id}`
    : "Available";
}

// Function to choose the color based on the status
function getColor(status) {
  return status === "booked"
    ? "orange"
    : status === "locked"
      ? "lightgray"
      : "green";
}

// Function to choose the border color based on the status
function getBorderColor(status) {
  return status === "booked"
    ? "darkorange"
    : status === "locked"
      ? "gray"
      : "darkgreen";
}
console.log("test");

//#region ARTICLE METHODS
//View selected articl in popup
function viewArticle(articleId) {
  $.ajax({
    url: `${API_BASE_URL}/dashboard/getArticle/${articleId}`,
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    success: function (article) {
      const imagesHTML = article.images
        .map(
          (img) =>
            `<img src="${img}" class="img-fluid mb-2" style="max-width: 100%; height: auto;">`,
        )
        .join("");
      const videosHTML = article.videos
        .map(
          (video) =>
            `<a href="${video}" target="_blank" class="d-block text-primary">Watch Video</a>`,
        )
        .join("");
      const keywordsHTML = article.keywords.join(", ");
      const tagsHTML = article.tags
        .map((tag) => `<span class="badge bg-primary me-1">${tag}</span>`)
        .join("");
      const sourcesHTML = article.sources
        .map(
          (source) =>
            `<li><a href="${source}" target="_blank">${source}</a></li>`,
        )
        .join("");

      const detailsHTML = `
          <h4 class="mb-3">${article.title}</h4>
          <p><strong>Summary:</strong> ${article.summary}</p>
          <div class="mb-3">${imagesHTML}</div>
          <p><strong>Author:</strong> ${article.author}</p>
          <p><strong>Category:</strong> ${article.category}</p>
          <p><strong>Keywords:</strong> ${keywordsHTML}</p>
          <p><strong>Tags:</strong> ${tagsHTML}</p>
          <p><strong>Content:</strong></p>
          <p>${article.content}</p>
          <p><strong>Videos:</strong></p>
          <p>${videosHTML || "No videos available"}</p>
          <p><strong>Sources:</strong></p>
          <ul>${sourcesHTML || "<li>No sources available</li>"}</ul>
          <p><strong>Comments Enabled:</strong> ${
            article.comments_enabled ? "Yes" : "No"
          }</p>
          <p><strong>Status:</strong> <span class="badge ${
            article.status === "Published" ? "bg-success" : "bg-secondary"
          }">${article.status}</span></p>
          <p><strong>Created At:</strong> ${new Date(
            article.created_at,
          ).toLocaleString()}</p>
          <p><strong>Updated At:</strong> ${new Date(
            article.updated_at,
          ).toLocaleString()}</p>
        `;

      $("#articleDetails").html(detailsHTML);
      $("#viewArticlePopup").modal("show");
    },
    error: function () {
      alert("Failed to load article details.");
    },
  });
}

//Edit the article
function editArticle(articleId) {
  $.ajax({
    url: `${API_BASE_URL}/dashboard/getArticle/${articleId}`,
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    success: function (article) {
      $("#editArticleId").val(article._id);
      $("#editTitle").val(article.title);
      $("#editContent").val(article.content);
      $("#editSummary").val(article.summary);
      $("#editAuthor").val(article.author);
      $("#editCategory").val(article.category);
      $("#editKeywords").val(article.keywords.join(", "));
      $("#editSources").val(article.sources.join(", "));
      $("#editTags").val(article.tags.join(", "));
      $("#editImages").val(article.images.join(", "));
      $("#editVideos").val(article.videos.join(", "));
      $("#editStatus").val(article.status);
      $("#editCommentsEnabled").prop("checked", article.comments_enabled);

      $("#editArticlePopup").modal("show");
    },
    error: function () {
      alert("Failed to load article for editing.");
    },
  });
}

$("#editArticleForm").on("submit", function (e) {
  e.preventDefault();

  const articleId = $("#editArticleId").val();
  const updatedData = {
    title: $("#editTitle").val(),
    content: $("#editContent").val(),
    summary: $("#editSummary").val(),
    author: $("#editAuthor").val(),
    category: $("#editCategory").val(),
    keywords: $("#editKeywords")
      .val()
      .split(",")
      .map((keyword) => keyword.trim()),
    sources: $("#editSources")
      .val()
      .split(",")
      .map((source) => source.trim()),
    tags: $("#editTags")
      .val()
      .split(",")
      .map((tag) => tag.trim()),
    images: $("#editImages")
      .val()
      .split(",")
      .map((image) => image.trim()),
    videos: $("#editVideos")
      .val()
      .split(",")
      .map((video) => video.trim()),
    status: $("#editStatus").val(),
    comments_enabled: $("#editCommentsEnabled").prop("checked"),
  };

  $.ajax({
    url: `${API_BASE_URL}/dashboard/updateArticle/${articleId}`,
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    contentType: "application/json",
    data: JSON.stringify(updatedData),
    success: function () {
      alert("Article updated successfully.");
      $("#editArticlePopup").modal("hide");
      loadArticles();
    },
    error: function () {
      alert("Failed to update article.");
    },
  });
});

//Update the article status
function toggleStatus(articleId, isChecked) {
  const newStatus = isChecked ? "Published" : "Draft";

  $.ajax({
    url: `${API_BASE_URL}/dashboard/updateArticleStatus/${articleId}`,
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    contentType: "application/json",
    data: JSON.stringify({ status: newStatus }),
    success: function () {
      // Update the status label next to the switch directly without reloading the page
      $(`#switch-${articleId}`).next("label").text(newStatus);
    },
    error: function () {
      alert("Failed to update article status.");
    },
  });
}

//Delete the article
function deleteArticle(articleId) {
  if (confirm("Are you sure you want to delete this article?")) {
    $.ajax({
      url: `${API_BASE_URL}/dashboard/deleteArticle/${articleId}`,
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      success: function () {
        alert("Article deleted successfully.");
        loadArticles();
      },
      error: function () {
        alert("Failed to delete article.");
      },
    });
  }
}

// Send data to the server when adding an article
$("#addArticleForm").on("submit", function (e) {
  e.preventDefault();

  const articleData = {
    title: $("#addtitle").val(),
    content: $("#addcontent").val(),
    summary: $("#addsummary").val(),
    category: $("#addcategory").val(),
    author: $("#addauthor").val(),
    images: $("#addimages")
      .val()
      .split(",")
      .map((img) => img.trim()), // Split the text into an array
    videos: $("#addvideos")
      .val()
      .split(",")
      .map((vid) => vid.trim()),
    keywords: $("#addkeywords")
      .val()
      .split(",")
      .map((kw) => kw.trim()),
    sources: $("#addsources")
      .val()
      .split(",")
      .map((src) => src.trim()),
    tags: $("#addtags")
      .val()
      .split(",")
      .map((tag) => tag.trim()),
    comments_enabled: $("#addcomments_enabled").val() === "true",
    status: $("#addstatus").val(),
  };

  $.ajax({
    url: `${API_BASE_URL}/dashboard/addArticle`,
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    contentType: "application/json",
    data: JSON.stringify(articleData),
    success: function (response) {
      alert("تم إضافة المقال بنجاح!");
      $("#addArticlePopup").modal("hide");
      loadArticles(); // Reload articles to display the new article
    },
    error: function () {
      alert("Failed to add the article.");
    },
  });
});
//#endregion

// Update the content when changing the language
function updateContent(encodedData) {
  let subcategory = JSON.parse(decodeBase64(encodedData)); // ✅ Decode Base64 with UTF-8 support
  let selectedLang = $("#languageSelect").val();
  $("#contentDisplay").html(`<p>${subcategory.content[selectedLang]}</p>`);
}

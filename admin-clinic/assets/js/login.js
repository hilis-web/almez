//const API_BASE_URL = "http://localhost:3000";
// const API_BASE_URL = 'https://user-api-server.onrender.com';
const API_BASE_URL = "https://aaron-clinic-1.onrender.com";
$(document).ready(function () {
  // Initialize Bootstrap Loading Modal
  const loadingModal = new bootstrap.Modal(
    document.getElementById("loadingModal"),
  );

  $("#loginForm").on("submit", function (event) {
    event.preventDefault();

    const email = $("#email").val().trim();
    const password = $("#password").val().trim();

    // Hide previous error
    $("#loginError").hide();

    // Validate fields
    if (!email || !password) {
      $("#loginError").text("Please fill in all fields").show();
      return;
    }

    // Show loading popup
    loadingModal.show();

    // Disable login button
    const loginButton = $("#loginForm button[type='submit']");
    loginButton.prop("disabled", true);

    // Send data to API
    $.ajax({
      url: `${API_BASE_URL}/dashboard/adminLogin`,
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ email, password }),

      success: function (response) {
        console.log("Login response:", response);

        const adminInfo = response.adminInfo;

        console.log("adminInfo:", adminInfo);

        // Store login information
        localStorage.setItem("token", response.token);
        localStorage.setItem("name", adminInfo.fullName);
        localStorage.setItem("email", adminInfo.email);
        localStorage.setItem("role", adminInfo.role);

        // Redirect to dashboard
        window.location.href = "dashboard.html";
      },

      error: function (xhr) {
        // Hide loading popup
        loadingModal.hide();

        // Enable login button again
        loginButton.prop("disabled", false);

        const errorMsg =
          xhr.responseJSON?.error || "An error occurred during login.";

        $("#loginError").text(errorMsg).show();
      },
    });
  });
});

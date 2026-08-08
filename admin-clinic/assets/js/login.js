//const API_BASE_URL = "http://localhost:3000";
// const API_BASE_URL = 'https://user-api-server.onrender.com';
const API_BASE_URL = "https://aaron-clinic-1.onrender.com";
$(document).ready(function () {
  $("#loginForm").on("submit", function (event) {
    event.preventDefault(); // Prevent default page refresh

    const email = $("#email").val().trim();
    const password = $("#password").val().trim();

    // Validate fields
    if (!email || !password) {
      $("#loginError").text("Please fill in all fields").show();
      return;
    }

    // Send data to API
    $.ajax({
      url: `${API_BASE_URL}/dashboard/adminLogin`,
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ email, password }),
      success: function (response) {
        console.log("login creds", response);
        let adminInfo = response.adminInfo;
        console.log("adminInfo", adminInfo);
        alert("1");
        // On successful login
        console.log("Login successful:", response);
        localStorage.setItem("token", response.token); // Store token in Local Storage
        //localStorage.setItem('adminInfo', response.adminInfo); // Store admin info in Local Storage
        localStorage.setItem("name", response.adminInfo.fullName); // Store admin info in Local Storage
        localStorage.setItem("email", response.adminInfo.email); // Store admin info in Local Storage
        localStorage.setItem("role", response.adminInfo.role); // Store admin info in Local Storage

        window.location.href = "dashboard.html"; // Redirect to Dashboard page
      },
      error: function (xhr) {
        // On error
        const errorMsg =
          xhr.responseJSON?.error || "An error occurred during login.";
        $("#loginError").text(errorMsg).show();
      },
    });
  });
});

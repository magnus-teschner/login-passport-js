console.log("test");

function validatePassword(password) {
    // Minimum length of 8 characters
    if (password.length < 8) {
        return false;
    }

    // At least one uppercase letter
    if (!/[A-Z]/.test(password)) {
        return false;
    }

    // At least one lowercase letter
    if (!/[a-z]/.test(password)) {
        return false;
    }

    // At least one numeric digit
    if (!/\d/.test(password)) {
        return false;
    }

    // At least one special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return false;
    }

    // Password meets all requirements
    return true;
}

// Regular expression for email validation
var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Function to validate form fields and enable/disable submission button
function validateForm() {
    console.log("actiom");
  var fname = document.getElementById("fname");
  var lname = document.getElementById("lname");
  var email = document.getElementById("email");
  var password = document.getElementById("password");

  // Check if all fields are filled and email is in correct format
  if (fname.value.trim() == "" && lname.value.trim() == "") {
    alert("Enter first and last name")
    document.getElementById("submitBtn").disabled = true;
} else if (validatePassword(password) !== true) {
    document.getElementById("submitBtn").disabled = true;
    alert("Enter passwort which fullfills standard password requirements")
}
  else {
    document.getElementById("submitBtn").disabled = false;
  }
}

const inputs = document.querySelectorAll("input");
console.log(inputs)
inputs.forEach(input => {
    input.addEventListener("input", validateForm);
});
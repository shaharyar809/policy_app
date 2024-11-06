document.addEventListener("DOMContentLoaded", () => {
    const addUserBtn = document.getElementById("addUserBtn");
    const userModal = document.getElementById("userModal");
    const closeModal = userModal.querySelector(".close");
    const addUserForm = document.getElementById("addUserForm");
    const userTableBody = document.getElementById("userTableBody");
    const searchBtn = document.getElementById("searchBtn");

    addUserBtn.onclick = () => {
        userModal.style.display = "block";
    };

    closeModal.onclick = () => {
        userModal.style.display = "none";
    };

    window.onclick = (event) => {
        if (event.target === userModal) {
            userModal.style.display = "none";
        }
    };

    addUserForm.onsubmit = async (event) => {
        event.preventDefault();
        const formData = {
            fullname: document.getElementById("fullname").value,
            cnic: document.getElementById("cnic").value,
            phone_number: document.getElementById("phone_number").value,
            policy_number: document.getElementById("policy_number").value,
            dob: document.getElementById("dob").value,
        };

        // Basic validation
        if (!validateForm(formData)) {
            alert("Please fill in all fields correctly.");
            return;
        }

        // Additional validations for CNIC and Phone number
        if (!validateCNIC(formData.cnic)) {
            alert("Please enter a valid CNIC number.");
            return;
        }

        if (!validatePhoneNumber(formData.phone_number)) {
            alert("Please enter a valid Pakistan phone number.");
            return;
        }

        try {
            const response = await fetch("http://policy476.infinityfreeapp.com/api.php?action=add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });
            const result = await response.json();

            if (result.status === "success") {
                alert(result.message);
                userModal.style.display = "none";
                clearForm(); // Clear the form only after successful submission
                window.location.reload(); // Refresh the page
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error("Error adding user:", error);
            alert("Failed to add user. Please try again.");
        }
    };

    searchBtn.onclick = async () => {
        const phone = document.getElementById("searchPhone").value;
        const cnic = document.getElementById("searchCnic").value;

        // Validate search input for phone and CNIC
        let isValid = true;

        if (phone && !validatePhoneNumber(phone)) {
            alert("Please enter a valid Pakistan phone number for search.");
            isValid = false;
        }

        if (cnic && !validateCNIC(cnic)) {
            alert("Please enter a valid CNIC number for search.");
            isValid = false;
        }

        if (!isValid) {
            return; // Stop execution if validation fails
        }

        await loadUsers(phone, cnic);
    };

    async function loadUsers(phone = '', cnic = '') {
        const url = `http://policy476.infinityfreeapp.com/api.php?${phone ? `phone_number=${phone}` : ''}${cnic ? `${phone ? '&' : ''}cnic=${cnic}` : ''}`;
        try {
            const response = await fetch(url);
            const result = await response.json();
            userTableBody.innerHTML = '';

            if (result.status === "success" && result.users) {
                result.users.forEach(user => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${user.id}</td>
                        <td>${user.fullname}</td>
                        <td>${user.cnic}</td>
                        <td>${user.policy_number}</td>
                    `;
                    // <td>${user.phone_number}</td>
                    // <td>${user.dob}</td>
                    userTableBody.appendChild(row);
                });
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error("Error loading users:", error);
            alert("Failed to load users. Please try again.");
        }
    }

    function validateForm(data) {
        // Basic validation for empty fields
        return Object.values(data).every(value => value.trim() !== "");
    }

    function validateCNIC(cnic) {
        // Check if CNIC is exactly 13 digits
        return /^\d{13}$/.test(cnic);
    }

    function validatePhoneNumber(phone) {
        // Check if phone number is 11 digits and starts with '03'
        return /^03\d{9}$/.test(phone);
    }

    function clearForm() {
        // Clear the form fields
        addUserForm.reset();
    }
});

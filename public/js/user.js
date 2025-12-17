window.addEventListener('DOMContentLoaded', () => {
    const darkmodeSwitch = document.getElementById('darkmodeSwitch');
    const body = document.body;

    if (localStorage.getItem('darkmode') === 'enabled') {
        body.classList.add('dark-mode');
    }

    darkmodeSwitch.addEventListener('click', () => {
        body.classList.toggle('dark-mode');

        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('darkmode', 'enabled');
        } else {
            localStorage.setItem('darkmode', 'disabled');
        }
    });
});


document.addEventListener('DOMContentLoaded', () => {
    // Buttons
    const usernameBtn = document.getElementById('changeUsernameBtn');
    const passwordBtn = document.getElementById('changePasswordBtn');
    const emailBtn = document.getElementById('changeEmailBtn');
    const phoneBtn = document.getElementById('changePhoneBtn');
    const twoFaBtn = document.getElementById('change2faBtn');

    // Modals
    const usernameModal = document.getElementById('changeUsernameModal');
    const passwordModal = document.getElementById('changePasswordModal');
    const emailModal = document.getElementById('changeEmailModal');
    const phoneModal = document.getElementById('changePhoneModal');
    const twoFaModal = document.getElementById('change2faModal');

    const closeButtons = document.querySelectorAll('.modal .close');

    // Open Modals
    if (usernameBtn) {
        usernameBtn.addEventListener('click', () => {
            usernameModal.style.display = 'flex';
        });
    }

    if (passwordBtn) {
        passwordBtn.addEventListener('click', () => {
            passwordModal.style.display = 'flex';
        });
    }

    if (emailBtn) {
        emailBtn.addEventListener('click', () => {
            emailModal.style.display = 'flex';
        });
    }

    if (phoneBtn) {
        phoneBtn.addEventListener('click', () => {
            phoneModal.style.display = 'flex';
        });
    }

    if (twoFaBtn) {
        twoFaBtn.addEventListener('click', () => {
            twoFaModal.style.display = 'flex';
        });
    }

    //modals dicht wnnr je op "x" drukt
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            modal.style.display = 'none';

            //reset form binnen modal
            const form = modal.querySelector('form');
            if (form) form.reset();

            //clear de error messages
            const errorDiv = modal.querySelector('div[id$="Error"]');
            if (errorDiv) errorDiv.textContent = '';
        });
    });

    //alle modals closen als je buiten modal clickt
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';

            //reset form binnen modal
            const form = event.target.querySelector('form');
            if (form) form.reset();

            //clear de error messages
            const errorDiv = event.target.querySelector('div[id$="Error"]');
            if (errorDiv) errorDiv.textContent = '';
        }
    });
});



document.addEventListener("DOMContentLoaded", () => {
    //username veranderen
    const usernameForm = document.getElementById("changeUsernameForm");
    const usernameErrorDiv = document.getElementById("usernameError");

    usernameForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        usernameErrorDiv.textContent = "";

        const formData = new FormData(usernameForm);
        const newUsername = formData.get("newUsername");

        try {
            const response = await fetch("/user/change-username", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newUsername })
            });

            const data = await response.json();

            if (data.error) {
                usernameErrorDiv.textContent = data.error;
            } else if (data.success) {
                document.getElementById("username").textContent = data.newUsername;
                document.getElementById("changeUsernameModal").style.display = "none";
            }
        } catch (err) {
            console.error(err);
            usernameErrorDiv.textContent = "Er ging iets mis, probeer opnieuw.";
        }
    });

    //wachtwoord veranderen
    const passwordForm = document.getElementById("changePasswordForm");
    const passwordErrorDiv = document.getElementById("passwordError");

    passwordForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        passwordErrorDiv.textContent = "";

        const formData = new FormData(passwordForm);
        const currentPassword = formData.get("currentPassword");
        const newPassword = formData.get("newPassword");
        const confirmPassword = formData.get("confirmPassword");

        try {
            const response = await fetch("/user/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
            });

            const data = await response.json();

            if (data.error) {
                passwordErrorDiv.textContent = data.error;
            } else if (data.success) {
                passwordForm.reset();
                document.getElementById("changePasswordModal").style.display = "none";
                alert("Wachtwoord succesvol gewijzigd!");
            }
        } catch (err) {
            console.error(err);
            passwordErrorDiv.textContent = "Er ging iets mis, probeer opnieuw.";
        }
    });


    //email veranderen
    const emailForm = document.getElementById("changeEmailForm");
    const emailErrorDiv = document.getElementById("emailError");

    if (emailForm) {
        emailForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            emailErrorDiv.textContent = "";

            const formData = new FormData(emailForm);
            const newEmail = formData.get("newEmail");

            try {
                const response = await fetch("/user/change-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ newEmail })
                });

                const data = await response.json();

                if (data.error) {
                    emailErrorDiv.textContent = data.error;
                } else if (data.success) {
                    location.reload();
                }
            } catch (err) {
                console.error(err);
                emailErrorDiv.textContent = "Er ging iets mis, probeer opnieuw.";
            }
        });
    }

    //gsm veranderen
    const phoneForm = document.getElementById("changePhoneForm");
    const phoneErrorDiv = document.getElementById("phoneError");

    if (phoneForm) {
        phoneForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            phoneErrorDiv.textContent = "";

            const formData = new FormData(phoneForm);
            const newPhone = formData.get("newPhone");

            try {
                const response = await fetch("/user/change-phone", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ newPhone })
                });

                const data = await response.json();

                if (data.error) {
                    phoneErrorDiv.textContent = data.error;
                } else if (data.success) {
                    location.reload();
                }
            } catch (err) {
                console.error(err);
                phoneErrorDiv.textContent = "Er ging iets mis, probeer opnieuw.";
            }
        });
    }

    //2fa veranderen
    const twoFaForm = document.getElementById("change2faForm");
    const twoFaErrorDiv = document.getElementById("2faError");

    if (twoFaForm) {
        twoFaForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            twoFaErrorDiv.textContent = "";

            const formData = new FormData(twoFaForm);
            const enabled = formData.get("enabled") === "on";
            const method = formData.get("method");

            try {
                const response = await fetch("/user/update-2fa", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ enabled, method })
                });

                const data = await response.json();

                if (data.error) {
                    twoFaErrorDiv.textContent = data.error;
                } else if (data.success) {
                    location.reload();
                }
            } catch (err) {
                console.error(err);
                twoFaErrorDiv.textContent = "Er ging iets mis, probeer opnieuw.";
            }
        });
    }
});

document.addEventListener("DOMContentLoaded", () => {
    //pfp upload + preview
    const pfpImg = document.getElementById("profilepicture");
    const pfpInput = document.getElementById("pfpInput");

    //modal elements
    const pfpModal = document.getElementById("changeProfilePictureModal");
    const pfpPreview = document.getElementById("pfpPreview");
    const savePfpBtn = document.getElementById("savePfpBtn");
    const cancelPfpBtn = document.getElementById("cancelPfpBtn");
    const pfpErrorDiv = document.getElementById("pfpError");

    //helper om modals the closen
    function closePfpModal() {
        if (pfpModal) {
            pfpModal.style.display = "none";
            pfpInput.value = ""; // Clear input
            pfpPreview.src = "";
            pfpPreview.style.display = "none";
            if (pfpErrorDiv) pfpErrorDiv.textContent = "";
        }
    }

    if (pfpImg && pfpInput && pfpModal) {
        //trigger file input
        pfpImg.addEventListener("click", () => {
            pfpInput.click();
        });

        //handle file selectie -> laat preview Modal zien
        pfpInput.addEventListener("change", () => {
            const file = pfpInput.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    pfpPreview.src = e.target.result;
                    pfpPreview.style.display = "block";
                    pfpModal.style.display = "flex";
                };
                reader.readAsDataURL(file);
            }
        });

        //handle cancel
        if (cancelPfpBtn) {
            cancelPfpBtn.addEventListener("click", closePfpModal);
        }

        //handle save
        if (savePfpBtn) {
            savePfpBtn.addEventListener("click", async () => {
                const file = pfpInput.files[0];
                if (!file) {
                    closePfpModal();
                    return;
                }

                const formData = new FormData();
                formData.append("profilePicture", file);

                //disable knop om dubbele submit tegen te komen
                savePfpBtn.disabled = true;
                savePfpBtn.textContent = "Bezig...";

                try {
                    const response = await fetch("/user/upload-pfp", {
                        method: "POST",
                        body: formData
                    });

                    const data = await response.json();

                    if (data.success) {
                        //update main pfp
                        pfpImg.src = `/resources/profilepictures/${data.filename}?t=${new Date().getTime()}`;
                        closePfpModal();
                    } else {
                        if (pfpErrorDiv) pfpErrorDiv.textContent = data.error || "Upload mislukt.";
                    }
                } catch (err) {
                    console.error("Error uploading profile picture:", err);
                    if (pfpErrorDiv) pfpErrorDiv.textContent = "Er ging iets mis.";
                } finally {
                    savePfpBtn.disabled = false;
                    savePfpBtn.textContent = "Opslaan";
                }
            });
        }
    }
});
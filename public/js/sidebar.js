document.addEventListener("DOMContentLoaded", () => {

    const homeButton = document.querySelector(".bi.bi-house");
    const uploadButton = document.querySelector(".bi.bi-upload");
    const ingredientsButton = document.querySelector(".bi.bi-basket");

    if (homeButton) {
        homeButton.addEventListener("click", () => {
            window.location.href = "/";
        });
    }

    uploadButton.addEventListener("click", () => {
        window.location.href = "/upload";
    });

    ingredientsButton.addEventListener("click", () => {
        window.location.href = "/my-ingredients";
    });
});
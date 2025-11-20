document.addEventListener("DOMContentLoaded", () => {

    const homeButton = document.querySelector(".bi.bi-house");
    const uploadButton = document.querySelector(".bi.bi-upload");
    const uploadLinkButton = document.querySelector(".bi.bi-link-45deg");
    const ingredientsButton = document.querySelector(".bi.bi-basket");

    homeButton.addEventListener("click", () => {
        window.location.href = "/";
    });

    uploadButton.addEventListener("click", () => {
        window.location.href = "/upload";
    });

    uploadLinkButton.addEventListener("click", () => {
        window.location.href = "/uploadlink";
    });

    ingredientsButton.addEventListener("click", () => {
        window.location.href = "/my-ingredients";
    });
});
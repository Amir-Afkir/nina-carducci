document.addEventListener("DOMContentLoaded", () => {
    if (typeof MauGallery === "function") {
      new MauGallery(".gallery", {
        columns: { xs: 1, sm: 2, md: 3, lg: 3, xl: 3 },
        lightBox: true,
        lightboxId: 'myAwesomeLightbox',
        showTags: true,
        tagsPosition: 'top'
      });
    } else {
      console.error("Erreur : la fonction MauGallery() n'est pas dispo.");
    }
  });
  
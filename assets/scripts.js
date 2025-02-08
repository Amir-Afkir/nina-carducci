document.addEventListener("DOMContentLoaded", function() {
    const gallery = document.querySelector(".gallery");
    
    if (gallery && typeof gallery.mauGallery === "function") {
        gallery.mauGallery({
            columns: {
                xs: 1,
                sm: 2,
                md: 3,
                lg: 3,
                xl: 3
            },
            lightBox: true,
            lightboxId: 'myAwesomeLightbox',
            showTags: true,
            tagsPosition: 'top'
        });
    } else {
        console.error("Erreur : la fonction mauGallery() n'est pas disponible.");
    }
});

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ maugallery.js chargé !");
  
  // Vérification que la classe MauGallery n’est pas déjà définie
  if (typeof window.MauGallery === "function") {
      console.warn("⚠️ MauGallery est déjà défini !");
      return;
  }

  class MauGallery {
      constructor(selector, options = {}) {
          this.gallery = document.querySelector(selector);
          if (!this.gallery) return;

          this.options = {
              columns: options.columns || { xs: 1, sm: 2, md: 3, lg: 4 },
              lightBox: options.lightBox !== false,
              lightboxId: options.lightboxId || "galleryLightbox",
              showTags: options.showTags !== false,
              tagsPosition: options.tagsPosition || "bottom",
              navigation: options.navigation !== false,
          };

          this.tagsCollection = new Set();
          this.images = [];
          if ("IntersectionObserver" in window) {
              this.imageObserver = new IntersectionObserver(this.lazyLoad, {
                  rootMargin: "100px",
              });
          }
          this.initGallery();
      }

      static registerGlobal() {
          if (typeof window !== "undefined") {
              window.MauGallery = MauGallery;
          }
      }

      lazyLoad = (entries, observer) => {
          entries.forEach(entry => {
              if (entry.isIntersecting) {
                  entry.target.src = entry.target.dataset.src || entry.target.src;
                  observer.unobserve(entry.target);
              }
          });
      };

      initGallery() {
          this.createRowWrapper();
          const galleryItems = [...this.gallery.querySelectorAll(".gallery-item")];

          galleryItems.forEach(item => {
              const col = this.wrapItem(item);
              this.optimizeImage(item);
              this.collectTag(item);
              this.gallery.querySelector(".gallery-items-row").appendChild(col);
          });

          if (this.options.showTags) this.showTags();
          if (this.options.lightBox) this.createLightBox();

          this.images = galleryItems.map(item => item.dataset.src || item.src);
          this.setupEvents();
          this.gallery.style.display = "block";
      }

      createRowWrapper() {
          if (!this.gallery.querySelector(".gallery-items-row")) {
              const row = document.createElement("div");
              row.className = "gallery-items-row row";
              this.gallery.appendChild(row);
          }
      }

      wrapItem(item) {
          const colSize = this.calculateColumnClass();
          const col = document.createElement("div");
          col.className = `item-column mb-4 ${colSize}`;
          item.parentNode.replaceChild(col, item);
          col.appendChild(item);
          return col;
      }

      calculateColumnClass() {
          const columns = this.options.columns;
          const breakpoints = ["xs", "sm", "md", "lg", "xl"];
          return breakpoints
              .map(bp => (columns[bp] ? `col-${bp}-${Math.ceil(12 / columns[bp])}` : ""))
              .join(" ");
      }

      optimizeImage(item) {
          if (item.tagName === "IMG") {
              item.classList.add("img-fluid");
              item.setAttribute("loading", "lazy");
              if (this.imageObserver) this.imageObserver.observe(item);
          }
      }

      collectTag(item) {
          const tag = item.dataset.galleryTag;
          if (tag) this.tagsCollection.add(tag);
      }

      showTags() {
          const ul = document.createElement("ul");
          ul.className = "my-4 tags-bar nav nav-pills";
          ul.innerHTML = `<li class="nav-item">
                          <span class="nav-link active active-tag" data-images-toggle="all">Tous</span>
                          </li>`;
          this.tagsCollection.forEach(tag => {
              ul.innerHTML += `<li class="nav-item">
                              <span class="nav-link" data-images-toggle="${tag}">${tag}</span>
                              </li>`;
          });
          const row = this.gallery.querySelector(".gallery-items-row");
          this.gallery.insertBefore(ul, row);
      }

      createLightBox() {
          const lb = document.createElement("div");
          lb.id = this.options.lightboxId;
          lb.className = "modal fade";
          lb.innerHTML = `
          <div class="modal-dialog modal-dialog-centered">
              <div class="modal-content position-relative">
                  <div class="modal-body text-center">
                      <span class="mg-close" style="cursor:pointer;position:absolute;top:10px;right:20px;font-size:30px;color:white;">✖</span>
                      <div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:15px;color:white;font-size:40px;font-weight:bold;">❮</div>
                      <img class="lightboxImage img-fluid" alt="Image agrandie"/>
                      <div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:15px;color:white;font-size:40px;font-weight:bold;">❯</div>
                  </div>
              </div>
          </div>`;
          document.body.appendChild(lb);
      }

      setupEvents() {
          this.gallery.addEventListener("click", e => {
              const t = e.target;
              if (t.classList.contains("mg-prev")) this.changeImage(-1);
              else if (t.classList.contains("mg-next")) this.changeImage(1);
              else if (t.classList.contains("mg-close")) this.closeLightBox();
              else if (t.dataset.imagesToggle) this.filterByTag(t);
              else if (t.closest(".gallery-item")) {
                  this.openLightBox(t.closest(".gallery-item"));
              }
          });
      }

      openLightBox(item) {
          const lb = document.getElementById(this.options.lightboxId);
          if (!lb) return;

          const imgElement = lb.querySelector(".lightboxImage");
          imgElement.src = item.dataset.src || item.src;

          this.images = [...document.querySelectorAll(".gallery-item")].map(img => img.dataset.src || img.src);

          const index = this.images.indexOf(imgElement.src);
          imgElement.dataset.index = index;

          let backdrop = document.createElement("div");
          backdrop.className = "modal-backdrop fade show";
          document.body.appendChild(backdrop);

          lb.classList.add("show");
          lb.style.display = "block";

          document.querySelector(".mg-close").addEventListener("click", () => this.closeLightBox());
          backdrop.addEventListener("click", () => this.closeLightBox());

          document.querySelector(".mg-prev").addEventListener("click", () => this.changeImage(-1));
          document.querySelector(".mg-next").addEventListener("click", () => this.changeImage(1));
      }

      closeLightBox() {
          const lb = document.getElementById(this.options.lightboxId);
          if (lb) {
              lb.classList.remove("show");
              setTimeout(() => {
                  lb.style.display = "none";
              }, 300);

              const backdrop = document.querySelector(".modal-backdrop");
              if (backdrop) {
                  backdrop.classList.remove("show");
                  setTimeout(() => backdrop.remove(), 300);
              }
          }
      }

      changeImage(direction) {
          const lb = document.getElementById(this.options.lightboxId);
          if (!lb) return;

          const imgElement = lb.querySelector(".lightboxImage");

          if (!this.images || this.images.length === 0) {
              console.warn("Aucune image trouvée dans la galerie !");
              return;
          }

          let index = parseInt(imgElement.dataset.index, 10);

          if (isNaN(index) || index < 0 || index >= this.images.length) {
              console.warn("Index d'image invalide !");
              return;
          }

          index = (index + direction + this.images.length) % this.images.length;
          imgElement.src = this.images[index];
          imgElement.dataset.index = index;
      }

      filterByTag(tagEl) {
          this.gallery.querySelectorAll(".active-tag").forEach(el =>
              el.classList.remove("active", "active-tag")
          );
          tagEl.classList.add("active", "active-tag");
          const tag = tagEl.dataset.imagesToggle;
          this.gallery.querySelectorAll(".item-column").forEach(col => {
              const item = col.querySelector(".gallery-item");
              col.style.display =
                  tag === "all" || (item && item.dataset.galleryTag === tag)
                      ? "block"
                      : "none";
          });
      }
  }

  MauGallery.registerGlobal();
  console.log("✅ MauGallery est maintenant défini !");
});

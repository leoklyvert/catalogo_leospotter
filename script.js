```javascript
/* =========================================
   CATÁLOGO LEOSPOTTER - V1
========================================= */


/* =========================================
   DADOS DE TESTE

   Depois vamos substituir isso pelo sistema
   real de eventos/fotos.
========================================= */

const aircraft = [

    {
        registration: "PT-TEST",
        model: "Aeronave de demonstração",
        photos: [
            "https://images.unsplash.com/photo-1436491865332-7a61a109cc05",
            "https://images.unsplash.com/photo-1474302770737-173ee21bab63",
            "https://images.unsplash.com/photo-1506947411487-a56738267384",
            "https://images.unsplash.com/photo-1529074963764-98f45c47344b"
        ]
    },

    {
        registration: "PR-TEST",
        model: "Aeronave de demonstração",
        photos: [
            "https://images.unsplash.com/photo-1556388158-158ea5ccacbd",
            "https://images.unsplash.com/photo-1517479149777-5f3e1511d3ba",
            "https://images.unsplash.com/photo-1540962351504-03099e0a754b"
        ]
    },

    {
        registration: "PP-TEST",
        model: "Aeronave de demonstração",
        photos: [
            "https://images.unsplash.com/photo-1542296332-2e4473faf563",
            "https://images.unsplash.com/photo-1436491865332-7a61a109cc05"
        ]
    }

];


/* =========================================
   VARIÁVEIS
========================================= */

let currentAircraft = null;
let currentPhotoIndex = 0;

let selectedPhotos = [];


/* =========================================
   ELEMENTOS
========================================= */

const aircraftGrid =
    document.getElementById("aircraftGrid");

const photoGrid =
    document.getElementById("photoGrid");

const galleryModal =
    document.getElementById("galleryModal");

const orderModal =
    document.getElementById("orderModal");

const photoViewer =
    document.getElementById("photoViewer");

const viewerImage =
    document.getElementById("viewerImage");

const galleryTitle =
    document.getElementById("galleryTitle");

const selectedCount =
    document.getElementById("selectedCount");

const selectionText =
    document.getElementById("selectionText");

const continueButton =
    document.getElementById("continueButton");

const searchInput =
    document.getElementById("searchInput");


/* =========================================
   INICIALIZAÇÃO
========================================= */

renderAircraft();

updateSummary();


/* =========================================
   RESUMO
========================================= */

function updateSummary() {

    const aircraftCount =
        document.getElementById("aircraftCount");

    const photoCount =
        document.getElementById("photoCount");

    aircraftCount.textContent =
        aircraft.length;

    const totalPhotos =
        aircraft.reduce(
            (total, plane) => total + plane.photos.length,
            0
        );

    photoCount.textContent =
        totalPhotos;
}


/* =========================================
   MOSTRAR AERONAVES
========================================= */

function renderAircraft(list = aircraft) {

    aircraftGrid.innerHTML = "";

    if (list.length === 0) {

        aircraftGrid.innerHTML = `
            <p>
                Nenhuma aeronave encontrada.
            </p>
        `;

        return;
    }


    list.forEach((plane, index) => {

        const card =
            document.createElement("article");

        card.className =
            "aircraft-card";


        card.innerHTML = `

            <img
                src="${plane.photos[0]}"
                class="aircraft-image"
                alt="${plane.registration}"
                loading="lazy"
            >

            <div class="aircraft-info">

                <div class="aircraft-registration">
                    ${plane.registration}
                </div>

                <div class="aircraft-model">
                    ${plane.model}
                </div>

                <div class="photo-number">
                    ${plane.photos.length}
                    ${plane.photos.length === 1 ? "foto" : "fotos"}
                </div>

                <button
                    class="view-button"
                    onclick="openGallery(${index})"
                >
                    Ver fotos
                </button>

            </div>
        `;


        card
            .querySelector(".aircraft-image")
            .addEventListener(
                "click",
                () => openGallery(index)
            );


        aircraftGrid.appendChild(card);

    });

}


/* =========================================
   PESQUISA
========================================= */

searchInput.addEventListener(
    "input",
    function () {

        const term =
            this.value
                .trim()
                .toLowerCase();


        const filtered =
            aircraft.filter(plane =>
                plane.registration
                    .toLowerCase()
                    .includes(term)
            );


        renderAircraft(filtered);

    }
);


/* =========================================
   ABRIR GALERIA
========================================= */

function openGallery(index) {

    currentAircraft =
        aircraft[index];

    galleryTitle.textContent =
        currentAircraft.registration;


    selectedPhotos = [];


    renderPhotos();

    updateSelection();


    galleryModal.classList.add("active");

    document.body.style.overflow =
        "hidden";
}


/* =========================================
   FECHAR GALERIA
========================================= */

document
    .getElementById("closeGallery")
    .addEventListener(
        "click",
        closeGallery
    );


function closeGallery() {

    galleryModal.classList.remove("active");

    document.body.style.overflow =
        "";

}


/* =========================================
   RENDERIZAR FOTOS
========================================= */

function renderPhotos() {

    photoGrid.innerHTML = "";


    currentAircraft.photos.forEach(
        (photo, index) => {

            const card =
                document.createElement("div");

            card.className =
                "photo-card";


            const selected =
                selectedPhotos.includes(index);


            if (selected) {
                card.classList.add("selected");
            }


            card.innerHTML = `

                <img
                    src="${photo}"
                    alt="Foto ${index + 1}"
                    loading="lazy"
                >

                <div
                    class="select-check"
                    title="Selecionar foto"
                >
                    ${selected ? "✓" : "+"}
                </div>

            `;


            const image =
                card.querySelector("img");

            const check =
                card.querySelector(".select-check");


            image.addEventListener(
                "click",
                () => openViewer(index)
            );


            check.addEventListener(
                "click",
                (event) => {

                    event.stopPropagation();

                    togglePhoto(index);

                }
            );


            photoGrid.appendChild(card);

        }
    );

}


/* =========================================
   SELECIONAR FOTO
========================================= */

function togglePhoto(index) {

    if (selectedPhotos.includes(index)) {

        selectedPhotos =
            selectedPhotos.filter(
                item => item !== index
            );

    } else {

        selectedPhotos.push(index);

    }


    renderPhotos();

    updateSelection();

}


/* =========================================
   ATUALIZAR SELEÇÃO
========================================= */

function updateSelection() {

    const total =
        selectedPhotos.length;


    selectedCount.textContent =
        total;


    if (total === 0) {

        selectionText.textContent =
            "Nenhuma foto selecionada";

        continueButton.disabled =
            true;

    } else {

        selectionText.textContent =
            `${total} ${
                total === 1
                    ? "foto selecionada"
                    : "fotos selecionadas"
            }`;

        continueButton.disabled =
            false;

    }

}


/* =========================================
   VISUALIZADOR
========================================= */

function openViewer(index) {

    currentPhotoIndex =
        index;


    viewerImage.src =
        currentAircraft.photos[index];


    photoViewer.classList.add("active");

}


document
    .getElementById("closeViewer")
    .addEventListener(
        "click",
        closeViewer
    );


function closeViewer() {

    photoViewer.classList.remove("active");

}


/* =========================================
   FOTO ANTERIOR
========================================= */

document
    .getElementById("previousPhoto")
    .addEventListener(
        "click",
        () => {

            currentPhotoIndex--;

            if (currentPhotoIndex < 0) {

                currentPhotoIndex =
                    currentAircraft.photos.length - 1;

            }

            viewerImage.src =
                currentAircraft.photos[
                    currentPhotoIndex
                ];

        }
    );


/* =========================================
   PRÓXIMA FOTO
========================================= */

document
    .getElementById("nextPhoto")
    .addEventListener(
        "click",
        () => {

            currentPhotoIndex++;

            if (
                currentPhotoIndex >=
                currentAircraft.photos.length
            ) {

                currentPhotoIndex = 0;

            }

            viewerImage.src =
                currentAircraft.photos[
                    currentPhotoIndex
                ];

        }
    );


/* =========================================
   CONTINUAR
========================================= */

continueButton.addEventListener(
    "click",
    openOrder
);


function openOrder() {

    const list =
        document.getElementById(
            "selectedPhotosList"
        );


    list.innerHTML = "";


    selectedPhotos.forEach(
        index => {

            const img =
                document.createElement("img");

            img.src =
                currentAircraft.photos[index];

            img.alt =
                `Foto selecionada ${index + 1}`;


            list.appendChild(img);

        }
    );


    orderModal.classList.add("active");

}


/* =========================================
   FECHAR PEDIDO
========================================= */

document
    .getElementById("closeOrder")
    .addEventListener(
        "click",
        () => {

            orderModal.classList.remove("active");

        }
    );


/* =========================================
   VOLTAR PARA GALERIA
========================================= */

document
    .getElementById("backToGallery")
    .addEventListener(
        "click",
        () => {

            orderModal.classList.remove("active");

        }
    );


/* =========================================
   FINALIZAR
========================================= */

document
    .getElementById("finishButton")
    .addEventListener(
        "click",
        () => {

            alert(
                "Sua seleção foi registrada nesta demonstração. Na próxima etapa vamos transformar isso em um pedido real."
            );

        }
    );


/* =========================================
   TECLADO
========================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            !photoViewer.classList.contains("active")
        ) {
            return;
        }


        if (event.key === "Escape") {

            closeViewer();

        }


        if (event.key === "ArrowLeft") {

            document
                .getElementById("previousPhoto")
                .click();

        }


        if (event.key === "ArrowRight") {

            document
                .getElementById("nextPhoto")
                .click();

        }

    }
);
```


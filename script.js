```javascript
/* ==================================================
   CATÁLOGO LEOSPOTTER
   Versão 1.2.0

   Dados:
   data/catalogo.json

   Fotos:
   amostra  = imagem pública do catálogo
   original = alta resolução, reservada para entrega
================================================== */


/* ==================================================
   ESTADO
================================================== */

let catalogo = null;
let aircraft = [];

let currentAircraft = null;
let currentPhotoIndex = 0;

let selectedPhotos = [];


/* ==================================================
   ELEMENTOS
================================================== */

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

const galleryModel =
    document.getElementById("galleryModel");

const selectedCount =
    document.getElementById("selectedCount");

const selectionText =
    document.getElementById("selectionText");

const continueButton =
    document.getElementById("continueButton");

const searchInput =
    document.getElementById("searchInput");

const searchResult =
    document.getElementById("searchResult");


/* ==================================================
   INICIALIZAÇÃO
================================================== */

loadCatalog();


/* ==================================================
   NORMALIZAR TEXTO DE PESQUISA
================================================== */

/*
   Remove:
   - hífen
   - espaços
   - pontos
   - barras
   - outros caracteres

   Assim:

   PP-XXX
   PPXXX
   pp xxx
   pp-xxx

   serão considerados iguais.
*/

function normalizeSearch(value) {

    return String(value || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");

}


/* ==================================================
   CARREGAR CATÁLOGO
================================================== */

async function loadCatalog() {

    try {

        const response =
            await fetch("data/catalogo.json");


        if (!response.ok) {

            throw new Error(
                `Erro HTTP ${response.status}`
            );

        }


        catalogo =
            await response.json();


        aircraft =
            Array.isArray(catalogo.aeronaves)
                ? catalogo.aeronaves
                : [];


        updateEventInformation();

        updateSummary();

        renderAircraft();


    } catch (error) {

        console.error(
            "Erro ao carregar catálogo:",
            error
        );


        showCatalogError();

    }

}


/* ==================================================
   INFORMAÇÕES DO EVENTO
================================================== */

function updateEventInformation() {

    if (!catalogo || !catalogo.evento) {
        return;
    }


    /*
       Título da seção.
    */

    const sectionHeading =
        document.querySelector(
            ".event-heading h2"
        );


    if (sectionHeading) {

        sectionHeading.textContent =
            "Confira o último evento";

    }


    /*
       Informações do evento.
    */

    const eventLocation =
        document.querySelector(
            ".event-heading p"
        );


    if (eventLocation) {

        const local =
            catalogo.evento.local || "";


        const ano =
            catalogo.evento.ano || "";


        eventLocation.textContent =
            `${local} · ${ano}`;

    }

}


/* ==================================================
   ERRO
================================================== */

function showCatalogError() {

    if (!aircraftGrid) {
        return;
    }


    aircraftGrid.innerHTML = `

        <div class="search-empty">

            <strong>
                Não foi possível carregar o catálogo.
            </strong>

            <span>
                Verifique o arquivo
                data/catalogo.json.
            </span>

        </div>

    `;


    const aircraftCount =
        document.getElementById(
            "aircraftCount"
        );


    const photoCount =
        document.getElementById(
            "photoCount"
        );


    if (aircraftCount) {
        aircraftCount.textContent = "0";
    }


    if (photoCount) {
        photoCount.textContent = "0";
    }

}


/* ==================================================
   RESUMO
================================================== */

function updateSummary() {

    const aircraftCount =
        document.getElementById(
            "aircraftCount"
        );


    const photoCount =
        document.getElementById(
            "photoCount"
        );


    if (aircraftCount) {

        aircraftCount.textContent =
            aircraft.length;

    }


    const totalPhotos =
        aircraft.reduce(
            (total, plane) => {

                const photos =
                    Array.isArray(plane.fotos)
                        ? plane.fotos.length
                        : 0;


                return total + photos;

            },
            0
        );


    if (photoCount) {

        photoCount.textContent =
            totalPhotos;

    }

}


/* ==================================================
   FOTO PRINCIPAL DA AERONAVE
================================================== */

function getSamplePhoto(plane) {

    if (
        !plane ||
        !Array.isArray(plane.fotos) ||
        plane.fotos.length === 0
    ) {

        return "";

    }


    return plane.fotos[0].amostra || "";

}


/* ==================================================
   EXIBIR AERONAVES
================================================== */

function renderAircraft(list = aircraft) {

    if (!aircraftGrid) {
        return;
    }


    aircraftGrid.innerHTML = "";


    if (!list || list.length === 0) {

        aircraftGrid.innerHTML = `

            <div class="search-empty">

                <strong>
                    Nenhuma aeronave encontrada.
                </strong>

                <span>
                    Tente outra matrícula.
                </span>

            </div>

        `;

        return;

    }


    list.forEach(
        (plane) => {

            const originalIndex =
                aircraft.indexOf(plane);


            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "aircraft-card";


            const samplePhoto =
                getSamplePhoto(plane);


            const photoCount =
                Array.isArray(plane.fotos)
                    ? plane.fotos.length
                    : 0;


            card.innerHTML = `

                <img
                    src="${samplePhoto}"
                    class="aircraft-image"
                    alt="${plane.matricula}"
                    loading="lazy"
                >


                <div class="aircraft-info">

                    <div class="aircraft-registration">
                        ${plane.matricula}
                    </div>


                    <div class="aircraft-model">
                        ${
                            plane.modelo ||
                            "Modelo não informado"
                        }
                    </div>


                    <div class="photo-number">

                        ${photoCount}

                        ${
                            photoCount === 1
                                ? "FOTOGRAFIA"
                                : "FOTOGRAFIAS"
                        }

                    </div>


                    <button
                        class="view-button"
                        type="button"
                    >
                        VER FOTOGRAFIAS →
                    </button>

                </div>

            `;


            card.addEventListener(
                "click",
                () => openGallery(originalIndex)
            );


            aircraftGrid.appendChild(card);

        }
    );

}


/* ==================================================
   PESQUISA
================================================== */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        function () {

            const rawTerm =
                this.value.trim();


            const term =
                normalizeSearch(rawTerm);


            /*
               Campo vazio:
               mostra todas as aeronaves.
            */

            if (term === "") {

                if (searchResult) {
                    searchResult.innerHTML = "";
                }


                renderAircraft();

                return;

            }


            /*
               Pesquisa normalizada.
            */

            const filtered =
                aircraft.filter(
                    plane => {

                        const registration =
                            normalizeSearch(
                                plane.matricula
                            );


                        return registration.includes(
                            term
                        );

                    }
                );


            /*
               Nenhum resultado.
            */

            if (filtered.length === 0) {

                if (searchResult) {

                    searchResult.innerHTML = `

                        <div class="search-empty">

                            <strong>
                                Nenhuma aeronave encontrada
                            </strong>

                            <span>
                                Não encontramos
                                "${rawTerm.toUpperCase()}".
                            </span>

                        </div>

                    `;

                }


                aircraftGrid.innerHTML = "";

                return;

            }


            /*
               Resultado encontrado.
            */

            const plane =
                filtered[0];


            const originalIndex =
                aircraft.indexOf(plane);


            const photoCount =
                Array.isArray(plane.fotos)
                    ? plane.fotos.length
                    : 0;


            if (searchResult) {

                searchResult.innerHTML = `

                    <div
                        class="search-result-content"
                        id="searchAircraftResult"
                    >

                        <div>

                            <span class="search-result-label">
                                AERONAVE ENCONTRADA
                            </span>


                            <strong>
                                ${plane.matricula}
                            </strong>


                            <span class="search-result-model">

                                ${
                                    plane.modelo ||
                                    "Modelo não informado"
                                }

                                ·

                                ${photoCount}

                                ${
                                    photoCount === 1
                                        ? "fotografia"
                                        : "fotografias"
                                }

                            </span>

                        </div>


                        <div class="search-result-arrow">
                            →
                        </div>

                    </div>

                `;


                const resultElement =
                    document.getElementById(
                        "searchAircraftResult"
                    );


                if (resultElement) {

                    resultElement.addEventListener(
                        "click",
                        () => openGallery(originalIndex)
                    );

                }

            }


            /*
               Esconde os cards enquanto
               o usuário está pesquisando.
            */

            aircraftGrid.innerHTML = "";

        }
    );

}


/* ==================================================
   ABRIR GALERIA
================================================== */

function openGallery(index) {

    if (
        index < 0 ||
        index >= aircraft.length
    ) {

        return;

    }


    currentAircraft =
        aircraft[index];


    if (galleryTitle) {

        galleryTitle.textContent =
            currentAircraft.matricula;

    }


    if (galleryModel) {

        galleryModel.textContent =
            currentAircraft.modelo ||
            "Modelo não informado";

    }


    selectedPhotos = [];


    renderPhotos();

    updateSelection();


    if (galleryModal) {

        galleryModal.classList.add(
            "active"
        );

    }


    document.body.style.overflow =
        "hidden";

}


/* ==================================================
   FECHAR GALERIA
================================================== */

const closeGalleryButton =
    document.getElementById(
        "closeGallery"
    );


if (closeGalleryButton) {

    closeGalleryButton.addEventListener(
        "click",
        closeGallery
    );

}


function closeGallery() {

    if (galleryModal) {

        galleryModal.classList.remove(
            "active"
        );

    }


    document.body.style.overflow =
        "";

}


/* ==================================================
   RENDERIZAR FOTOS
================================================== */

function renderPhotos() {

    if (!photoGrid) {
        return;
    }


    photoGrid.innerHTML = "";


    if (
        !currentAircraft ||
        !Array.isArray(
            currentAircraft.fotos
        )
    ) {

        return;

    }


    currentAircraft.fotos.forEach(
        (photo, index) => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "photo-card";


            const selected =
                selectedPhotos.includes(
                    index
                );


            if (selected) {

                card.classList.add(
                    "selected"
                );

            }


            card.innerHTML = `

                <img
                    src="${photo.amostra}"
                    alt="Fotografia ${index + 1}"
                    loading="lazy"
                >


                <div
                    class="select-check"
                    title="Selecionar fotografia"
                >
                    ${
                        selected
                            ? "✓"
                            : "+"
                    }
                </div>

            `;


            const image =
                card.querySelector(
                    "img"
                );


            const check =
                card.querySelector(
                    ".select-check"
                );


            if (image) {

                image.addEventListener(
                    "click",
                    () => openViewer(index)
                );

            }


            if (check) {

                check.addEventListener(
                    "click",
                    (event) => {

                        event.stopPropagation();

                        togglePhoto(index);

                    }
                );

            }


            photoGrid.appendChild(card);

        }
    );

}


/* ==================================================
   SELECIONAR / DESMARCAR FOTO
================================================== */

function togglePhoto(index) {

    if (
        selectedPhotos.includes(index)
    ) {

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


/* ==================================================
   ATUALIZAR SELEÇÃO
================================================== */

function updateSelection() {

    if (selectedCount) {

        selectedCount.textContent =
            selectedPhotos.length;

    }


    if (
        selectedPhotos.length === 0
    ) {

        if (selectionText) {

            selectionText.textContent =
                "Nenhuma foto selecionada";

        }


        if (continueButton) {

            continueButton.disabled =
                true;

        }

    } else {

        if (selectionText) {

            selectionText.textContent =
                `${selectedPhotos.length} ${
                    selectedPhotos.length === 1
                        ? "foto selecionada"
                        : "fotos selecionadas"
                }`;

        }


        if (continueButton) {

            continueButton.disabled =
                false;

        }

    }

}


/* ==================================================
   VISUALIZADOR
================================================== */

function openViewer(index) {

    if (
        !currentAircraft ||
        !currentAircraft.fotos ||
        !currentAircraft.fotos[index]
    ) {

        return;

    }


    currentPhotoIndex =
        index;


    /*
       SOMENTE AMOSTRA.

       A alta resolução nunca é
       carregada pelo catálogo.
    */

    viewerImage.src =
        currentAircraft
            .fotos[index]
            .amostra;


    if (photoViewer) {

        photoViewer.classList.add(
            "active"
        );

    }

}


/* ==================================================
   FECHAR VISUALIZADOR
================================================== */

const closeViewerButton =
    document.getElementById(
        "closeViewer"
    );


if (closeViewerButton) {

    closeViewerButton.addEventListener(
        "click",
        closeViewer
    );

}


function closeViewer() {

    if (photoViewer) {

        photoViewer.classList.remove(
            "active"
        );

    }

}


/* ==================================================
   FOTO ANTERIOR
================================================== */

const previousPhotoButton =
    document.getElementById(
        "previousPhoto"
    );


if (previousPhotoButton) {

    previousPhotoButton.addEventListener(
        "click",
        () => {

            if (
                !currentAircraft ||
                !currentAircraft.fotos ||
                currentAircraft.fotos.length === 0
            ) {

                return;

            }


            currentPhotoIndex--;


            if (
                currentPhotoIndex < 0
            ) {

                currentPhotoIndex =
                    currentAircraft.fotos.length - 1;

            }


            viewerImage.src =
                currentAircraft
                    .fotos[currentPhotoIndex]
                    .amostra;

        }
    );

}


/* ==================================================
   PRÓXIMA FOTO
================================================== */

const nextPhotoButton =
    document.getElementById(
        "nextPhoto"
    );


if (nextPhotoButton) {

    nextPhotoButton.addEventListener(
        "click",
        () => {

            if (
                !currentAircraft ||
                !currentAircraft.fotos ||
                currentAircraft.fotos.length === 0
            ) {

                return;

            }


            currentPhotoIndex++;


            if (
                currentPhotoIndex >=
                currentAircraft.fotos.length
            ) {

                currentPhotoIndex = 0;

            }


            viewerImage.src =
                currentAircraft
                    .fotos[currentPhotoIndex]
                    .amostra;

        }
    );

}


/* ==================================================
   ABRIR PEDIDO
================================================== */

if (continueButton) {

    continueButton.addEventListener(
        "click",
        openOrder
    );

}


function openOrder() {

    if (!orderModal) {
        return;
    }


    const list =
        document.getElementById(
            "selectedPhotosList"
        );


    if (!list) {
        return;
    }


    list.innerHTML = "";


    selectedPhotos.forEach(
        index => {

            const photo =
                currentAircraft.fotos[index];


            if (!photo) {
                return;
            }


            const img =
                document.createElement(
                    "img"
                );


            img.src =
                photo.amostra;


            img.alt =
                `Fotografia selecionada ${index + 1}`;


            list.appendChild(img);

        }
    );


    orderModal.classList.add(
        "active"
    );

}


/* ==================================================
   FECHAR PEDIDO
================================================== */

const closeOrderButton =
    document.getElementById(
        "closeOrder"
    );


if (closeOrderButton) {

    closeOrderButton.addEventListener(
        "click",
        () => {

            orderModal.classList.remove(
                "active"
            );

        }
    );

}


/* ==================================================
   VOLTAR
================================================== */

const backToGalleryButton =
    document.getElementById(
        "backToGallery"
    );


if (backToGalleryButton) {

    backToGalleryButton.addEventListener(
        "click",
        () => {

            orderModal.classList.remove(
                "active"
            );

        }
    );

}


/* ==================================================
   FINALIZAR
================================================== */

const finishButton =
    document.getElementById(
        "finishButton"
    );


if (finishButton) {

    finishButton.addEventListener(
        "click",
        () => {

            alert(
                "Sua seleção foi registrada nesta demonstração."
            );

        }
    );

}


/* ==================================================
   TECLADO
================================================== */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            if (
                photoViewer &&
                photoViewer.classList.contains(
                    "active"
                )
            ) {

                closeViewer();

                return;

            }


            if (
                galleryModal &&
                galleryModal.classList.contains(
                    "active"
                )
            ) {

                closeGallery();

                return;

            }

        }


        if (
            !photoViewer ||
            !photoViewer.classList.contains(
                "active"
            )
        ) {

            return;

        }


        if (
            event.key === "ArrowLeft"
        ) {

            if (previousPhotoButton) {

                previousPhotoButton.click();

            }

        }


        if (
            event.key === "ArrowRight"
        ) {

            if (nextPhotoButton) {

                nextPhotoButton.click();

            }

        }

    }
);
```

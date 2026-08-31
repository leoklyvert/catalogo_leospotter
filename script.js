/* ==================================================
   CATÁLOGO LEOSPOTTER
   Versão: 1.1.0

   Os dados das aeronaves são carregados de:

   data/catalogo.json

   Cada fotografia possui:

   amostra  = imagem exibida no catálogo
   original = arquivo de alta resolução

================================================== */


/* ==================================================
   ESTADO DO SISTEMA
================================================== */

let catalogo = null;

let aircraft = [];

let currentAircraft = null;

let currentPhotoIndex = 0;

let selectedPhotos = [];


/* ==================================================
   ELEMENTOS DA PÁGINA
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


        /*
         * Guarda as aeronaves em uma variável
         * usada pelo restante do sistema.
         */

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


    const eventName =
        document.querySelector(
            ".event-heading h2"
        );


    const eventLocation =
        document.querySelector(
            ".event-heading p"
        );


    if (eventName) {

        eventName.textContent =
            catalogo.evento.nome || "";

    }


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
   ERRO NO CATÁLOGO
================================================== */

function showCatalogError() {

    aircraftGrid.innerHTML = `

        <div class="search-empty">

            <strong>
                Não foi possível carregar o catálogo.
            </strong>

            <span>
                Verifique se o arquivo
                data/catalogo.json
                está disponível.
            </span>

        </div>

    `;


    document.getElementById(
        "aircraftCount"
    ).textContent = "0";


    document.getElementById(
        "photoCount"
    ).textContent = "0";

}


/* ==================================================
   RESUMO
================================================== */

function updateSummary() {

    document.getElementById(
        "aircraftCount"
    ).textContent =
        aircraft.length;


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


    document.getElementById(
        "photoCount"
    ).textContent =
        totalPhotos;

}


/* ==================================================
   IMAGEM DE AMOSTRA
================================================== */

function getSamplePhoto(plane) {

    if (
        !plane ||
        !Array.isArray(plane.fotos) ||
        plane.fotos.length === 0
    ) {

        return "";

    }


    return (
        plane.fotos[0].amostra ||
        ""
    );

}


/* ==================================================
   MOSTRAR AERONAVES
================================================== */

function renderAircraft(
    list = aircraft
) {

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
                        ${plane.modelo || "Modelo não informado"}
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
   PESQUISA POR MATRÍCULA
================================================== */

searchInput.addEventListener(
    "input",
    function () {

        const term =
            this.value
                .trim()
                .toLowerCase();


        /* Campo vazio */

        if (term === "") {

            searchResult.innerHTML = "";

            renderAircraft();

            return;

        }


        /* Procura pela matrícula */

        const filtered =
            aircraft.filter(
                plane => {

                    const registration =
                        String(
                            plane.matricula || ""
                        ).toLowerCase();


                    return registration.includes(
                        term
                    );

                }
            );


        /* Nenhum resultado */

        if (filtered.length === 0) {

            searchResult.innerHTML = `

                <div class="search-empty">

                    <strong>
                        Nenhuma aeronave encontrada
                    </strong>

                    <span>
                        Não encontramos
                        "${this.value.toUpperCase()}".
                    </span>

                </div>

            `;


            aircraftGrid.innerHTML = "";

            return;

        }


        /*
         * Mostra o primeiro resultado
         * encontrado.
         */

        const plane =
            filtered[0];


        const originalIndex =
            aircraft.indexOf(plane);


        const photoCount =
            Array.isArray(plane.fotos)
                ? plane.fotos.length
                : 0;


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

                        ${plane.modelo || "Modelo não informado"}

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


        document
            .getElementById(
                "searchAircraftResult"
            )
            .addEventListener(
                "click",
                () => openGallery(originalIndex)
            );


        /*
         * Durante a pesquisa,
         * escondemos os cards.
         */

        aircraftGrid.innerHTML = "";

    }
);


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


    galleryTitle.textContent =
        currentAircraft.matricula;


    galleryModel.textContent =
        currentAircraft.modelo ||
        "Modelo não informado";


    selectedPhotos = [];


    renderPhotos();

    updateSelection();


    galleryModal.classList.add(
        "active"
    );


    document.body.style.overflow =
        "hidden";

}


/* ==================================================
   FECHAR GALERIA
================================================== */

document
    .getElementById("closeGallery")
    .addEventListener(
        "click",
        closeGallery
    );


function closeGallery() {

    galleryModal.classList.remove(
        "active"
    );


    document.body.style.overflow =
        "";

}


/* ==================================================
   RENDERIZAR FOTOS
================================================== */

function renderPhotos() {

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


            /*
             * IMPORTANTE:
             *
             * O catálogo mostra somente
             * a imagem de AMOSTRA.
             *
             * O arquivo ORIGINAL não é
             * carregado aqui.
             */

            card.innerHTML = `

                <img
                    src="${photo.amostra}"
                    alt="Fotografia ${index + 1} da aeronave ${currentAircraft.matricula}"
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


/* ==================================================
   SELECIONAR FOTO
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
     * Também usamos AMOSTRA
     * no visualizador.
     *
     * A alta resolução continua
     * protegida.
     */

    viewerImage.src =
        currentAircraft
            .fotos[index]
            .amostra;


    photoViewer.classList.add(
        "active"
    );

}


/* ==================================================
   FECHAR VISUALIZADOR
================================================== */

document
    .getElementById("closeViewer")
    .addEventListener(
        "click",
        closeViewer
    );


function closeViewer() {

    photoViewer.classList.remove(
        "active"
    );

}


/* ==================================================
   FOTO ANTERIOR
================================================== */

document
    .getElementById("previousPhoto")
    .addEventListener(
        "click",
        () => {

            if (
                !currentAircraft ||
                !currentAircraft.fotos
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


/* ==================================================
   PRÓXIMA FOTO
================================================== */

document
    .getElementById("nextPhoto")
    .addEventListener(
        "click",
        () => {

            if (
                !currentAircraft ||
                !currentAircraft.fotos
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


/* ==================================================
   REVISÃO DA SELEÇÃO
================================================== */

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

            const photo =
                currentAircraft.fotos[index];


            if (!photo) {

                return;

            }


            const img =
                document.createElement(
                    "img"
                );


            /*
             * Sempre mostramos a AMOSTRA.
             */

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
   FECHAR REVISÃO
================================================== */

document
    .getElementById("closeOrder")
    .addEventListener(
        "click",
        () => {

            orderModal.classList.remove(
                "active"
            );

        }
    );


/* ==================================================
   VOLTAR PARA GALERIA
================================================== */

document
    .getElementById("backToGallery")
    .addEventListener(
        "click",
        () => {

            orderModal.classList.remove(
                "active"
            );

        }
    );


/* ==================================================
   FINALIZAR
================================================== */

document
    .getElementById("finishButton")
    .addEventListener(
        "click",
        () => {

            alert(
                "Sua seleção foi registrada nesta demonstração."
            );

        }
    );


/* ==================================================
   TECLADO
================================================== */

document.addEventListener(
    "keydown",
    event => {

        /*
         * ESC fecha o visualizador
         */

        if (
            event.key === "Escape" &&
            photoViewer.classList.contains(
                "active"
            )
        ) {

            closeViewer();

            return;

        }


        /*
         * Setas navegam pelas fotos
         */

        if (
            !photoViewer.classList.contains(
                "active"
            )
        ) {

            return;

        }


        if (
            event.key === "ArrowLeft"
        ) {

            document
                .getElementById(
                    "previousPhoto"
                )
                .click();

        }


        if (
            event.key === "ArrowRight"
        ) {

            document
                .getElementById(
                    "nextPhoto"
                )
                .click();

        }

    }
);

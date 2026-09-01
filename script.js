/* ==================================================
CATÁLOGO LEOSPOTTER
Versão 1.2.1

Dados:
data/catalogo.json

Fotos:
amostra  = imagem pública do catálogo
original = alta resolução, reservada para entrega

IMPORTANTE:
O catálogo NUNCA utiliza a propriedade "original"
para exibição.
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

const closeGalleryButton =
document.getElementById("closeGallery");

const closeViewerButton =
document.getElementById("closeViewer");

const previousPhotoButton =
document.getElementById("previousPhoto");

const nextPhotoButton =
document.getElementById("nextPhoto");

const closeOrderButton =
document.getElementById("closeOrder");

const backToGalleryButton =
document.getElementById("backToGallery");

const finishButton =
document.getElementById("finishButton");

const selectedPhotosList =
document.getElementById("selectedPhotosList");

/* ==================================================
INICIALIZAÇÃO
================================================== */

document.addEventListener(
"DOMContentLoaded",
() => {

```
    loadCatalog();

}
```

);

/* ==================================================
NORMALIZAÇÃO
================================================== */

function normalizeSearch(value) {

```
return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
```

}

/* ==================================================
CARREGAR CATÁLOGO
================================================== */

async function loadCatalog() {

```
try {

    const response =
        await fetch(
            "data/catalogo.json",
            {
                cache: "no-cache"
            }
        );


    if (!response.ok) {

        throw new Error(
            `Erro HTTP ${response.status}`
        );

    }


    const data =
        await response.json();


    if (
        !data ||
        typeof data !== "object"
    ) {

        throw new Error(
            "Formato inválido do catálogo."
        );

    }


    catalogo = data;


    aircraft =
        Array.isArray(
            catalogo.aeronaves
        )
            ? catalogo.aeronaves
            : [];


    updateEventInformation();

    updateSummary();

    renderAircraft();


    console.log(
        "LeoSpotter: catálogo carregado.",
        aircraft.length,
        "aeronaves."
    );


} catch (error) {

    console.error(
        "LeoSpotter: erro ao carregar catálogo:",
        error
    );


    aircraft = [];

    showCatalogError();

}
```

}

/* ==================================================
INFORMAÇÕES DO EVENTO
================================================== */

function updateEventInformation() {

```
if (
    !catalogo ||
    !catalogo.evento
) {

    return;

}


const sectionHeading =
    document.querySelector(
        ".event-heading h2"
    );


if (sectionHeading) {

    sectionHeading.textContent =
        catalogo.evento.nome ||
        "Confira o último evento";

}


const eventLocation =
    document.querySelector(
        ".event-heading p"
    );


if (eventLocation) {

    const local =
        catalogo.evento.local || "";

    const ano =
        catalogo.evento.ano || "";


    if (local && ano) {

        eventLocation.textContent =
            `${local} · ${ano}`;

    } else {

        eventLocation.textContent =
            local || ano;

    }

}
```

}

/* ==================================================
RESUMO
================================================== */

function updateSummary() {

```
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

            if (
                !plane ||
                !Array.isArray(
                    plane.fotos
                )
            ) {

                return total;

            }


            return (
                total +
                plane.fotos.length
            );

        },
        0
    );


if (photoCount) {

    photoCount.textContent =
        totalPhotos;

}
```

}

/* ==================================================
FOTO DE AMOSTRA
================================================== */

function getSamplePhoto(plane) {

```
if (
    !plane ||
    !Array.isArray(plane.fotos)
) {

    return "";

}


const firstPhoto =
    plane.fotos.find(
        photo =>
            photo &&
            typeof photo.amostra === "string" &&
            photo.amostra.trim() !== ""
    );


return firstPhoto
    ? firstPhoto.amostra
    : "";
```

}

/* ==================================================
RENDERIZAR AERONAVES
================================================== */

function renderAircraft(
list = aircraft
) {

```
if (!aircraftGrid) {

    return;

}


aircraftGrid.innerHTML = "";


if (
    !Array.isArray(list) ||
    list.length === 0
) {

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
    plane => {

        if (!plane) {
            return;
        }


        const originalIndex =
            aircraft.indexOf(
                plane
            );


        if (
            originalIndex === -1
        ) {

            return;

        }


        const card =
            document.createElement(
                "article"
            );


        card.className =
            "aircraft-card";


        const samplePhoto =
            getSamplePhoto(
                plane
            );


        const photos =
            Array.isArray(
                plane.fotos
            )
                ? plane.fotos
                : [];


        const photoCount =
            photos.length;


        const image =
            document.createElement(
                "img"
            );


        image.className =
            "aircraft-image";


        image.alt =
            plane.matricula ||
            "Aeronave";


        image.loading =
            "lazy";


        if (samplePhoto) {

            image.src =
                samplePhoto;

        }


        const info =
            document.createElement(
                "div"
            );


        info.className =
            "aircraft-info";


        const registration =
            document.createElement(
                "div"
            );


        registration.className =
            "aircraft-registration";


        registration.textContent =
            plane.matricula ||
            "Matrícula não informada";


        const model =
            document.createElement(
                "div"
            );


        model.className =
            "aircraft-model";


        model.textContent =
            plane.modelo ||
            "Modelo não informado";


        const number =
            document.createElement(
                "div"
            );


        number.className =
            "photo-number";


        number.textContent =
            `${photoCount} ${
                photoCount === 1
                    ? "FOTOGRAFIA"
                    : "FOTOGRAFIAS"
            }`;


        const button =
            document.createElement(
                "button"
            );


        button.className =
            "view-button";


        button.type =
            "button";


        button.textContent =
            "VER FOTOGRAFIAS →";


        info.appendChild(
            registration
        );

        info.appendChild(
            model
        );

        info.appendChild(
            number
        );

        info.appendChild(
            button
        );


        card.appendChild(
            image
        );

        card.appendChild(
            info
        );


        /*
           O botão possui seu próprio evento.
        */

        button.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                openGallery(
                    originalIndex
                );

            }
        );


        /*
           Também permite clicar no card.
        */

        card.addEventListener(
            "click",
            () => {

                openGallery(
                    originalIndex
                );

            }
        );


        aircraftGrid.appendChild(
            card
        );

    }
);
```

}

/* ==================================================
PESQUISA
================================================== */

if (searchInput) {

```
searchInput.addEventListener(
    "input",
    handleSearch
);
```

}

function handleSearch() {

```
const rawTerm =
    searchInput.value.trim();


const term =
    normalizeSearch(
        rawTerm
    );


/*
   Campo vazio.
*/

if (term === "") {

    if (searchResult) {

        searchResult.innerHTML =
            "";

    }


    renderAircraft();

    return;

}


/*
   Procura por matrícula.
*/

const filtered =
    aircraft.filter(
        plane => {

            if (
                !plane ||
                !plane.matricula
            ) {

                return false;

            }


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

if (
    filtered.length === 0
) {

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


    aircraftGrid.innerHTML =
        "";

    return;

}


/*
   Primeiro resultado.
*/

const plane =
    filtered[0];


const originalIndex =
    aircraft.findIndex(
        item =>
            item === plane
    );


if (
    originalIndex === -1
) {

    console.error(
        "Aeronave encontrada na pesquisa, mas não localizada no catálogo."
    );

    return;

}


const photoCount =
    Array.isArray(
        plane.fotos
    )
        ? plane.fotos.length
        : 0;


if (searchResult) {

    searchResult.innerHTML = "";

    const resultElement =
        document.createElement(
            "div"
        );


    resultElement.className =
        "search-result-content";


    resultElement.id =
        "searchAircraftResult";


    const information =
        document.createElement(
            "div"
        );


    const label =
        document.createElement(
            "span"
        );


    label.className =
        "search-result-label";


    label.textContent =
        "AERONAVE ENCONTRADA";


    const registration =
        document.createElement(
            "strong"
        );


    registration.textContent =
        plane.matricula;


    const model =
        document.createElement(
            "span"
        );


    model.className =
        "search-result-model";


    model.textContent =
        `${plane.modelo || "Modelo não informado"} · ${photoCount} ${
            photoCount === 1
                ? "fotografia"
                : "fotografias"
        }`;


    information.appendChild(
        label
    );

    information.appendChild(
        registration
    );

    information.appendChild(
        model
    );


    const arrow =
        document.createElement(
            "div"
        );


    arrow.className =
        "search-result-arrow";


    arrow.textContent =
        "→";


    resultElement.appendChild(
        information
    );

    resultElement.appendChild(
        arrow
    );


    /*
       Clique no resultado.
    */

    resultElement.addEventListener(
        "click",
        () => {

            openGallery(
                originalIndex
            );

        }
    );


    searchResult.appendChild(
        resultElement
    );

}


/*
   Durante a pesquisa,
   escondemos os cards.
*/

aircraftGrid.innerHTML =
    "";
```

}

/* ==================================================
ABRIR GALERIA
================================================== */

function openGallery(index) {

```
if (
    !Number.isInteger(index)
) {

    console.error(
        "Índice inválido:",
        index
    );

    return;

}


if (
    index < 0 ||
    index >= aircraft.length
) {

    console.error(
        "Índice fora do catálogo:",
        index
    );

    return;

}


const plane =
    aircraft[index];


if (!plane) {

    console.error(
        "Aeronave não encontrada:",
        index
    );

    return;

}


currentAircraft =
    plane;


currentPhotoIndex =
    0;


selectedPhotos =
    [];


if (galleryTitle) {

    galleryTitle.textContent =
        plane.matricula ||
        "Aeronave";

}


if (galleryModel) {

    galleryModel.textContent =
        plane.modelo ||
        "Modelo não informado";

}


renderPhotos();

updateSelection();


if (galleryModal) {

    galleryModal.classList.add(
        "active"
    );

}


document.body.style.overflow =
    "hidden";
```

}

/* ==================================================
FECHAR GALERIA
================================================== */

if (closeGalleryButton) {

```
closeGalleryButton.addEventListener(
    "click",
    closeGallery
);
```

}

function closeGallery() {

```
if (galleryModal) {

    galleryModal.classList.remove(
        "active"
    );

}


closeViewer();


if (
    !orderModal ||
    !orderModal.classList.contains(
        "active"
    )
) {

    document.body.style.overflow =
        "";

}
```

}

/* ==================================================
RENDERIZAR FOTOS
================================================== */

function renderPhotos() {

```
if (!photoGrid) {

    return;

}


photoGrid.innerHTML =
    "";


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

        if (
            !photo ||
            !photo.amostra
        ) {

            return;

        }


        const card =
            document.createElement(
                "div"
            );


        card.className =
            "photo-card";


        if (
            selectedPhotos.includes(
                index
            )
        ) {

            card.classList.add(
                "selected"
            );

        }


        const image =
            document.createElement(
                "img"
            );


        image.src =
            photo.amostra;


        image.alt =
            `Fotografia ${index + 1}`;


        image.loading =
            "lazy";


        image.addEventListener(
            "click",
            () => {

                openViewer(
                    index
                );

            }
        );


        const check =
            document.createElement(
                "div"
            );


        check.className =
            "select-check";


        check.title =
            "Selecionar fotografia";


        check.textContent =
            selectedPhotos.includes(
                index
            )
                ? "✓"
                : "+";


        check.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                togglePhoto(
                    index
                );

            }
        );


        card.appendChild(
            image
        );

        card.appendChild(
            check
        );


        photoGrid.appendChild(
            card
        );

    }
);
```

}

/* ==================================================
SELEÇÃO
================================================== */

function togglePhoto(index) {

```
if (
    !currentAircraft ||
    !Array.isArray(
        currentAircraft.fotos
    ) ||
    !currentAircraft.fotos[index]
) {

    return;

}


const selectedIndex =
    selectedPhotos.indexOf(
        index
    );


if (
    selectedIndex !== -1
) {

    selectedPhotos.splice(
        selectedIndex,
        1
    );

} else {

    selectedPhotos.push(
        index
    );

}


renderPhotos();

updateSelection();
```

}

/* ==================================================
ATUALIZAR SELEÇÃO
================================================== */

function updateSelection() {

```
const count =
    selectedPhotos.length;


if (selectedCount) {

    selectedCount.textContent =
        count;

}


if (selectionText) {

    if (count === 0) {

        selectionText.textContent =
            "Nenhuma foto selecionada";

    } else {

        selectionText.textContent =
            `${count} ${
                count === 1
                    ? "foto selecionada"
                    : "fotos selecionadas"
            }`;

    }

}


if (continueButton) {

    continueButton.disabled =
        count === 0;

}
```

}

/* ==================================================
VISUALIZADOR
================================================== */

function openViewer(index) {

```
if (
    !currentAircraft ||
    !Array.isArray(
        currentAircraft.fotos
    )
) {

    return;

}


if (
    index < 0 ||
    index >= currentAircraft.fotos.length
) {

    return;

}


const photo =
    currentAircraft.fotos[index];


if (
    !photo ||
    !photo.amostra
) {

    return;

}


currentPhotoIndex =
    index;


/*
   IMPORTANTE:
   SOMENTE "amostra".
   Nunca utilizamos "original".
*/

viewerImage.src =
    photo.amostra;


if (photoViewer) {

    photoViewer.classList.add(
        "active"
    );

}
```

}

/* ==================================================
FECHAR VISUALIZADOR
================================================== */

if (closeViewerButton) {

```
closeViewerButton.addEventListener(
    "click",
    closeViewer
);
```

}

function closeViewer() {

```
if (photoViewer) {

    photoViewer.classList.remove(
        "active"
    );

}


if (viewerImage) {

    viewerImage.src =
        "";

}
```

}

/* ==================================================
NAVEGAÇÃO DO VISUALIZADOR
================================================== */

function showPreviousPhoto() {

```
if (
    !currentAircraft ||
    !Array.isArray(
        currentAircraft.fotos
    ) ||
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


updateViewerImage();
```

}

function showNextPhoto() {

```
if (
    !currentAircraft ||
    !Array.isArray(
        currentAircraft.fotos
    ) ||
    currentAircraft.fotos.length === 0
) {

    return;

}


currentPhotoIndex++;


if (
    currentPhotoIndex >=
    currentAircraft.fotos.length
) {

    currentPhotoIndex =
        0;

}


updateViewerImage();
```

}

function updateViewerImage() {

```
if (
    !viewerImage ||
    !currentAircraft ||
    !currentAircraft.fotos
) {

    return;

}


const photo =
    currentAircraft.fotos[
        currentPhotoIndex
    ];


if (
    !photo ||
    !photo.amostra
) {

    return;

}


viewerImage.src =
    photo.amostra;
```

}

if (previousPhotoButton) {

```
previousPhotoButton.addEventListener(
    "click",
    showPreviousPhoto
);
```

}

if (nextPhotoButton) {

```
nextPhotoButton.addEventListener(
    "click",
    showNextPhoto
);
```

}

/* ==================================================
PEDIDO
================================================== */

if (continueButton) {

```
continueButton.addEventListener(
    "click",
    openOrder
);
```

}

function openOrder() {

```
if (
    !orderModal ||
    !currentAircraft
) {

    return;

}


if (
    !selectedPhotosList
) {

    return;

}


selectedPhotosList.innerHTML =
    "";


selectedPhotos.forEach(
    index => {

        const photo =
            currentAircraft.fotos[
                index
            ];


        if (
            !photo ||
            !photo.amostra
        ) {

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


        img.loading =
            "lazy";


        selectedPhotosList.appendChild(
            img
        );

    }
);


orderModal.classList.add(
    "active"
);


document.body.style.overflow =
    "hidden";
```

}

/* ==================================================
FECHAR PEDIDO
================================================== */

if (closeOrderButton) {

```
closeOrderButton.addEventListener(
    "click",
    closeOrder
);
```

}

function closeOrder() {

```
if (orderModal) {

    orderModal.classList.remove(
        "active"
    );

}


if (
    galleryModal &&
    galleryModal.classList.contains(
        "active"
    )
) {

    document.body.style.overflow =
        "hidden";

} else {

    document.body.style.overflow =
        "";

}
```

}

/* ==================================================
VOLTAR PARA GALERIA
================================================== */

if (backToGalleryButton) {

```
backToGalleryButton.addEventListener(
    "click",
    () => {

        closeOrder();

    }
);
```

}

/* ==================================================
FINALIZAR
================================================== */

if (finishButton) {

```
finishButton.addEventListener(
    "click",
    () => {

        alert(
            "Sua seleção foi registrada nesta demonstração."
        );

    }
);
```

}

/* ==================================================
TECLADO
================================================== */

document.addEventListener(
"keydown",
event => {

```
    /*
       ESC
    */

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
            orderModal &&
            orderModal.classList.contains(
                "active"
            )
        ) {

            closeOrder();

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


    /*
       Navegação das fotos.
    */

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

        showPreviousPhoto();

    }


    if (
        event.key === "ArrowRight"
    ) {

        showNextPhoto();

    }

}
```

);

/* ==================================================
CLIQUE FORA DO VISUALIZADOR
================================================== */

if (photoViewer) {

```
photoViewer.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            photoViewer
        ) {

            closeViewer();

        }

    }
);
```

}

/* ==================================================
PROTEÇÃO CONTRA ERROS DE IMAGEM
================================================== */

document.addEventListener(
"error",
event => {

```
    const element =
        event.target;


    if (
        element &&
        element.tagName === "IMG"
    ) {

        element.classList.add(
            "image-error"
        );

    }

},
true
```

);

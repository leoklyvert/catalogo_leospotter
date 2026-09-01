/* ==================================================
LEOSPOTTER
CATÁLOGO DE FOTOGRAFIAS
SCRIPT V1.2.2
================================================== */

/* ==================================================
ESTADO
================================================== */

let catalogo = {
evento: {},
aeronaves: []
};

let currentAircraft = null;
let currentPhotoIndex = 0;
let selectedPhotos = [];

/* ==================================================
ELEMENTOS
================================================== */

const aircraftGrid = document.getElementById("aircraftGrid");
const photoGrid = document.getElementById("photoGrid");

const galleryModal = document.getElementById("galleryModal");
const orderModal = document.getElementById("orderModal");

const photoViewer = document.getElementById("photoViewer");
const viewerImage = document.getElementById("viewerImage");

const galleryTitle = document.getElementById("galleryTitle");
const galleryModel = document.getElementById("galleryModel");

const searchInput = document.getElementById("searchInput");
const searchResult = document.getElementById("searchResult");

const selectedCount = document.getElementById("selectedCount");
const selectionText = document.getElementById("selectionText");

const continueButton = document.getElementById("continueButton");

const selectedPhotosList =
document.getElementById("selectedPhotosList");

/* ==================================================
INICIALIZAÇÃO
================================================== */

document.addEventListener(
"DOMContentLoaded",
iniciar
);

async function iniciar() {

```
await carregarCatalogo();
```

}

/* ==================================================
CARREGAR JSON
================================================== */

async function carregarCatalogo() {

```
try {

    const resposta =
        await fetch(
            "data/catalogo.json?versao=122",
            {
                cache: "no-store"
            }
        );


    if (!resposta.ok) {

        throw new Error(
            "HTTP " + resposta.status
        );

    }


    catalogo =
        await resposta.json();


    if (
        !Array.isArray(
            catalogo.aeronaves
        )
    ) {

        throw new Error(
            "O arquivo catalogo.json não possui uma lista de aeronaves."
        );

    }


    atualizarEvento();

    atualizarResumo();

    mostrarAeronaves(
        catalogo.aeronaves
    );


    console.log(
        "CATÁLOGO CARREGADO:",
        catalogo
    );


} catch (erro) {

    console.error(
        "ERRO AO CARREGAR CATÁLOGO:",
        erro
    );


    if (aircraftGrid) {

        aircraftGrid.innerHTML = `

            <div class="search-empty">

                <strong>
                    Erro ao carregar o catálogo.
                </strong>

                <span>
                    Verifique data/catalogo.json.
                </span>

            </div>

        `;

    }

}
```

}

/* ==================================================
EVENTO
================================================== */

function atualizarEvento() {

```
const titulo =
    document.querySelector(
        ".event-heading h2"
    );


const descricao =
    document.querySelector(
        ".event-heading p"
    );


if (titulo) {

    titulo.textContent =
        catalogo.evento?.nome ||
        "Confira o último evento";

}


if (descricao) {

    const local =
        catalogo.evento?.local || "";

    const ano =
        catalogo.evento?.ano || "";


    descricao.textContent =
        `${local} · ${ano}`;

}
```

}

/* ==================================================
RESUMO
================================================== */

function atualizarResumo() {

```
const aircraftCount =
    document.getElementById(
        "aircraftCount"
    );


const photoCount =
    document.getElementById(
        "photoCount"
    );


const aeronaves =
    catalogo.aeronaves || [];


const totalFotos =
    aeronaves.reduce(
        (total, aeronave) => {

            if (
                !Array.isArray(
                    aeronave.fotos
                )
            ) {

                return total;

            }


            return (
                total +
                aeronave.fotos.length
            );

        },
        0
    );


if (aircraftCount) {

    aircraftCount.textContent =
        aeronaves.length;

}


if (photoCount) {

    photoCount.textContent =
        totalFotos;

}
```

}

/* ==================================================
FOTO DE AMOSTRA
================================================== */

function fotoAmostra(aeronave) {

```
if (
    !aeronave ||
    !Array.isArray(
        aeronave.fotos
    )
) {

    return "";

}


for (
    const foto of aeronave.fotos
) {

    if (
        foto &&
        typeof foto.amostra === "string" &&
        foto.amostra.trim() !== ""
    ) {

        return foto.amostra;

    }

}


return "";
```

}

/* ==================================================
MOSTRAR AERONAVES
================================================== */

function mostrarAeronaves(
lista
) {

```
if (!aircraftGrid) {
    return;
}


aircraftGrid.innerHTML =
    "";


if (
    !Array.isArray(lista) ||
    lista.length === 0
) {

    aircraftGrid.innerHTML = `

        <div class="search-empty">

            <strong>
                Nenhuma aeronave encontrada.
            </strong>

        </div>

    `;

    return;

}


lista.forEach(
    aeronave => {

        const card =
            document.createElement(
                "article"
            );


        card.className =
            "aircraft-card";


        const imagem =
            document.createElement(
                "img"
            );


        imagem.className =
            "aircraft-image";


        imagem.alt =
            aeronave.matricula || "Aeronave";


        imagem.loading =
            "lazy";


        imagem.src =
            fotoAmostra(
                aeronave
            );


        const info =
            document.createElement(
                "div"
            );


        info.className =
            "aircraft-info";


        info.innerHTML = `

            <div class="aircraft-registration">
                ${aeronave.matricula || ""}
            </div>

            <div class="aircraft-model">
                ${aeronave.modelo || "Modelo não informado"}
            </div>

            <div class="photo-number">
                ${(aeronave.fotos || []).length}
                ${
                    (aeronave.fotos || []).length === 1
                        ? "FOTOGRAFIA"
                        : "FOTOGRAFIAS"
                }
            </div>

            <button
                type="button"
                class="view-button"
            >
                VER FOTOGRAFIAS →
            </button>

        `;


        const botao =
            info.querySelector(
                ".view-button"
            );


        /*
           BOTÃO
        */

        if (botao) {

            botao.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();

                    event.stopPropagation();

                    abrirGaleria(
                        aeronave
                    );

                }
            );

        }


        /*
           CARD
        */

        card.addEventListener(
            "click",
            function() {

                abrirGaleria(
                    aeronave
                );

            }
        );


        card.appendChild(
            imagem
        );


        card.appendChild(
            info
        );


        aircraftGrid.appendChild(
            card
        );

    }
);
```

}

/* ==================================================
NORMALIZAR PESQUISA
================================================== */

function normalizar(
texto
) {

```
return String(
    texto || ""
)
    .toLowerCase()
    .normalize("NFD")
    .replace(
        /[\u0300-\u036f]/g,
        ""
    )
    .replace(
        /[^a-z0-9]/g,
        ""
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
    pesquisar
);
```

}

function pesquisar() {

```
const textoOriginal =
    searchInput.value.trim();


const termo =
    normalizar(
        textoOriginal
    );


/*
   Pesquisa vazia.
*/

if (!termo) {

    if (searchResult) {

        searchResult.innerHTML =
            "";

    }


    mostrarAeronaves(
        catalogo.aeronaves
    );

    return;

}


/*
   Procura diretamente no JSON.
*/

const encontrada =
    catalogo.aeronaves.find(
        aeronave =>
            normalizar(
                aeronave.matricula
            ).includes(
                termo
            )
    );


/*
   NÃO ENCONTROU
*/

if (!encontrada) {

    if (searchResult) {

        searchResult.innerHTML = `

            <div class="search-empty">

                <strong>
                    Nenhuma aeronave encontrada
                </strong>

                <span>
                    Não encontramos
                    "${textoOriginal.toUpperCase()}".
                </span>

            </div>

        `;

    }


    aircraftGrid.innerHTML =
        "";

    return;

}


/*
   ENCONTROU
*/

const quantidade =
    Array.isArray(
        encontrada.fotos
    )
        ? encontrada.fotos.length
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
                    ${encontrada.matricula}
                </strong>

                <span class="search-result-model">
                    ${
                        encontrada.modelo ||
                        "Modelo não informado"
                    }

                    ·

                    ${quantidade}

                    ${
                        quantidade === 1
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


    const resultado =
        document.getElementById(
            "searchAircraftResult"
        );


    if (resultado) {

        resultado.addEventListener(
            "click",
            function() {

                abrirGaleria(
                    encontrada
                );

            }
        );

    }

}


aircraftGrid.innerHTML =
    "";
```

}

/* ==================================================
ABRIR GALERIA
================================================== */

function abrirGaleria(
aeronave
) {

```
if (!aeronave) {

    console.error(
        "Aeronave inválida."
    );

    return;

}


if (
    !Array.isArray(
        aeronave.fotos
    )
) {

    console.error(
        "A aeronave não possui fotos:",
        aeronave
    );

    return;

}


/*
   GUARDA A AERONAVE DIRETAMENTE.
*/

currentAircraft =
    aeronave;


currentPhotoIndex =
    0;


selectedPhotos =
    [];


/*
   TÍTULO
*/

if (galleryTitle) {

    galleryTitle.textContent =
        aeronave.matricula ||
        "Aeronave";

}


if (galleryModel) {

    galleryModel.textContent =
        aeronave.modelo ||
        "Modelo não informado";

}


/*
   FOTOS
*/

mostrarFotos();


atualizarSelecao();


/*
   ABRIR MODAL
*/

if (galleryModal) {

    galleryModal.classList.add(
        "active"
    );

}


document.body.style.overflow =
    "hidden";


console.log(
    "GALERIA ABERTA:",
    aeronave.matricula
);
```

}

/* ==================================================
FECHAR GALERIA
================================================== */

const closeGallery =
document.getElementById(
"closeGallery"
);

if (closeGallery) {

```
closeGallery.addEventListener(
    "click",
    fecharGaleria
);
```

}

function fecharGaleria() {

```
if (galleryModal) {

    galleryModal.classList.remove(
        "active"
    );

}


fecharVisualizador();


document.body.style.overflow =
    "";
```

}

/* ==================================================
MOSTRAR FOTOS
================================================== */

function mostrarFotos() {

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
    (foto, index) => {

        if (
            !foto ||
            !foto.amostra
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


        const imagem =
            document.createElement(
                "img"
            );


        imagem.src =
            foto.amostra;


        imagem.alt =
            `Fotografia ${index + 1}`;


        imagem.loading =
            "lazy";


        imagem.addEventListener(
            "click",
            function() {

                abrirVisualizador(
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


        check.textContent =
            selectedPhotos.includes(
                index
            )
                ? "✓"
                : "+";


        check.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                event.stopPropagation();

                alternarSelecao(
                    index
                );

            }
        );


        card.appendChild(
            imagem
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

function alternarSelecao(
index
) {

```
const posicao =
    selectedPhotos.indexOf(
        index
    );


if (
    posicao >= 0
) {

    selectedPhotos.splice(
        posicao,
        1
    );

} else {

    selectedPhotos.push(
        index
    );

}


mostrarFotos();

atualizarSelecao();
```

}

function atualizarSelecao() {

```
const quantidade =
    selectedPhotos.length;


if (selectedCount) {

    selectedCount.textContent =
        quantidade;

}


if (selectionText) {

    selectionText.textContent =
        quantidade === 0
            ? "Nenhuma foto selecionada"
            : `${quantidade} ${
                quantidade === 1
                    ? "foto selecionada"
                    : "fotos selecionadas"
            }`;

}


if (continueButton) {

    continueButton.disabled =
        quantidade === 0;

}
```

}

/* ==================================================
VISUALIZADOR
================================================== */

function abrirVisualizador(
index
) {

```
if (
    !currentAircraft ||
    !Array.isArray(
        currentAircraft.fotos
    )
) {

    return;

}


const foto =
    currentAircraft.fotos[
        index
    ];


if (
    !foto ||
    !foto.amostra
) {

    return;

}


currentPhotoIndex =
    index;


viewerImage.src =
    foto.amostra;


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

const closeViewer =
document.getElementById(
"closeViewer"
);

if (closeViewer) {

```
closeViewer.addEventListener(
    "click",
    fecharVisualizador
);
```

}

function fecharVisualizador() {

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
NAVEGAÇÃO
================================================== */

const previousPhoto =
document.getElementById(
"previousPhoto"
);

const nextPhoto =
document.getElementById(
"nextPhoto"
);

if (previousPhoto) {

```
previousPhoto.addEventListener(
    "click",
    fotoAnterior
);
```

}

if (nextPhoto) {

```
nextPhoto.addEventListener(
    "click",
    proximaFoto
);
```

}

function fotoAnterior() {

```
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


atualizarVisualizador();
```

}

function proximaFoto() {

```
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

    currentPhotoIndex =
        0;

}


atualizarVisualizador();
```

}

function atualizarVisualizador() {

```
const foto =
    currentAircraft.fotos[
        currentPhotoIndex
    ];


if (
    foto &&
    foto.amostra &&
    viewerImage
) {

    viewerImage.src =
        foto.amostra;

}
```

}

/* ==================================================
PEDIDO
================================================== */

if (continueButton) {

```
continueButton.addEventListener(
    "click",
    abrirPedido
);
```

}

function abrirPedido() {

```
if (
    !currentAircraft ||
    !orderModal ||
    !selectedPhotosList
) {

    return;

}


selectedPhotosList.innerHTML =
    "";


selectedPhotos.forEach(
    index => {

        const foto =
            currentAircraft.fotos[
                index
            ];


        if (
            !foto ||
            !foto.amostra
        ) {

            return;

        }


        const imagem =
            document.createElement(
                "img"
            );


        imagem.src =
            foto.amostra;


        imagem.alt =
            `Fotografia selecionada ${index + 1}`;


        selectedPhotosList.appendChild(
            imagem
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

const closeOrder =
document.getElementById(
"closeOrder"
);

if (closeOrder) {

```
closeOrder.addEventListener(
    "click",
    fecharPedido
);
```

}

function fecharPedido() {

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
VOLTAR
================================================== */

const backToGallery =
document.getElementById(
"backToGallery"
);

if (backToGallery) {

```
backToGallery.addEventListener(
    "click",
    fecharPedido
);
```

}

/* ==================================================
FINALIZAR
================================================== */

const finishButton =
document.getElementById(
"finishButton"
);

if (finishButton) {

```
finishButton.addEventListener(
    "click",
    function() {

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
function(event) {

```
    if (
        event.key === "Escape"
    ) {

        if (
            photoViewer &&
            photoViewer.classList.contains(
                "active"
            )
        ) {

            fecharVisualizador();

            return;

        }


        if (
            orderModal &&
            orderModal.classList.contains(
                "active"
            )
        ) {

            fecharPedido();

            return;

        }


        if (
            galleryModal &&
            galleryModal.classList.contains(
                "active"
            )
        ) {

            fecharGaleria();

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

        fotoAnterior();

    }


    if (
        event.key === "ArrowRight"
    ) {

        proximaFoto();

    }

}
```

);

/* ==================================================
CLICAR FORA DO VISUALIZADOR
================================================== */

if (photoViewer) {

```
photoViewer.addEventListener(
    "click",
    function(event) {

        if (
            event.target ===
            photoViewer
        ) {

            fecharVisualizador();

        }

    }
);
```

}

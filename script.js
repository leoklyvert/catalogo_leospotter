/* ==================================================
   LEOSPOTTER
   CATÁLOGO DE FOTOGRAFIAS
   SCRIPT V1.2.4
   ================================================== */

"use strict";

/* ==================================================
   ESTADO
   ================================================== */

let catalogo = null;
let aeronaveAtual = null;
let indiceFotoAtual = 0;
let fotosSelecionadas = [];

/* ==================================================
   ELEMENTOS
   ================================================== */

let searchInput;
let searchResult;
let aircraftGrid;

let galleryModal;
let galleryTitle;
let galleryModel;
let photoGrid;
let closeGallery;

let photoViewer;
let viewerImage;
let closeViewer;
let previousPhoto;
let nextPhoto;

let orderModal;
let selectedPhotosList;
let closeOrder;
let backToGallery;
let continueButton;

/* ==================================================
   INICIALIZAÇÃO
   ================================================== */

document.addEventListener("DOMContentLoaded", iniciar);

async function iniciar() {

    console.log("[LeoSpotter] Inicializando V1.2.4");

    obterElementos();

    try {

        const resposta = await fetch(
            "data/catalogo.json?v=1.2.4",
            {
                cache: "no-store"
            }
        );

        if (!resposta.ok) {
            throw new Error(
                `Erro HTTP ${resposta.status}`
            );
        }

        catalogo = await resposta.json();

        console.log(
            "[LeoSpotter] Catálogo carregado:",
            catalogo
        );

        prepararEventos();

        renderizarCatalogo();

        console.log(
            "[LeoSpotter] Sistema pronto."
        );

    } catch (erro) {

        console.error(
            "[LeoSpotter] Erro ao carregar catálogo:",
            erro
        );

        if (searchResult) {

            searchResult.innerHTML = `
                <div class="search-message">
                    Erro ao carregar o catálogo.
                </div>
            `;
        }
    }
}

/* ==================================================
   ELEMENTOS DO HTML
   ================================================== */

function obterElementos() {

    searchInput =
        document.getElementById("searchInput");

    searchResult =
        document.getElementById("searchResult");

    aircraftGrid =
        document.getElementById("aircraftGrid");

    galleryModal =
        document.getElementById("galleryModal");

    galleryTitle =
        document.getElementById("galleryTitle");

    galleryModel =
        document.getElementById("galleryModel");

    photoGrid =
        document.getElementById("photoGrid");

    closeGallery =
        document.getElementById("closeGallery");

    photoViewer =
        document.getElementById("photoViewer");

    viewerImage =
        document.getElementById("viewerImage");

    closeViewer =
        document.getElementById("closeViewer");

    previousPhoto =
        document.getElementById("previousPhoto");

    nextPhoto =
        document.getElementById("nextPhoto");

    orderModal =
        document.getElementById("orderModal");

    selectedPhotosList =
        document.getElementById("selectedPhotosList");

    closeOrder =
        document.getElementById("closeOrder");

    backToGallery =
        document.getElementById("backToGallery");

    continueButton =
        document.getElementById("continueButton");

    console.log(
        "[LeoSpotter] Elementos encontrados:",
        {
            searchInput: !!searchInput,
            searchResult: !!searchResult,
            aircraftGrid: !!aircraftGrid,
            galleryModal: !!galleryModal,
            photoGrid: !!photoGrid,
            photoViewer: !!photoViewer,
            orderModal: !!orderModal
        }
    );
}

/* ==================================================
   EVENTOS
   ================================================== */

function prepararEventos() {

    /* Pesquisa */

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            pesquisarAeronave
        );
    }

    /* Resultado da pesquisa */

    if (searchResult) {

        searchResult.addEventListener(
            "click",
            function (evento) {

                const item =
                    evento.target.closest(
                        "[data-matricula]"
                    );

                if (!item) {
                    return;
                }

                const matricula =
                    item.dataset.matricula;

                console.log(
                    "[LeoSpotter] Resultado clicado:",
                    matricula
                );

                const aeronave =
                    encontrarAeronave(matricula);

                if (!aeronave) {

                    console.error(
                        "[LeoSpotter] Aeronave não encontrada:",
                        matricula
                    );

                    return;
                }

                abrirGaleria(aeronave);
            }
        );
    }

    /* Galeria */

    if (closeGallery) {

        closeGallery.addEventListener(
            "click",
            fecharGaleria
        );
    }

    /* Visualizador */

    if (closeViewer) {

        closeViewer.addEventListener(
            "click",
            fecharVisualizador
        );
    }

    if (previousPhoto) {

        previousPhoto.addEventListener(
            "click",
            fotoAnterior
        );
    }

    if (nextPhoto) {

        nextPhoto.addEventListener(
            "click",
            proximaFoto
        );
    }

    /* Pedido */

    if (continueButton) {

        continueButton.addEventListener(
            "click",
            abrirPedido
        );
    }

    if (closeOrder) {

        closeOrder.addEventListener(
            "click",
            fecharPedido
        );
    }

    if (backToGallery) {

        backToGallery.addEventListener(
            "click",
            function () {

                fecharPedido();

                if (galleryModal) {

                    galleryModal.classList.add(
                        "active"
                    );

                    galleryModal.style.display =
                        "block";
                }

                document.body.style.overflow =
                    "hidden";
            }
        );
    }

    /* ESC */

    document.addEventListener(
        "keydown",
        function (evento) {

            if (evento.key !== "Escape") {
                return;
            }

            fecharVisualizador();
            fecharPedido();
            fecharGaleria();
        }
    );
}

/* ==================================================
   URL DAS IMAGENS
   ================================================== */

function obterUrlFoto(caminho) {

    if (!caminho) {
        return "";
    }

    /*
       O catalogo.json está dentro de:

       /data/catalogo.json

       As fotos estão dentro de:

       /fotos/...

       Portanto o caminho informado no JSON
       é relativo à raiz do site.

       Usamos a raiz atual do site para montar
       a URL corretamente.
    */

    const caminhoLimpo =
        String(caminho)
            .replace(/^\/+/, "");

    const url =
        new URL(
            caminhoLimpo,
            window.location.origin +
            window.location.pathname
                .replace(/\/[^/]*$/, "/")
        );

    console.log(
        "[LeoSpotter] URL da foto:",
        url.href
    );

    return url.href;
}

/* ==================================================
   RENDERIZAR CATÁLOGO
   ================================================== */

function renderizarCatalogo() {

    if (
        !catalogo ||
        !Array.isArray(
            catalogo.aeronaves
        )
    ) {
        return;
    }

    if (!aircraftGrid) {
        return;
    }

    aircraftGrid.innerHTML = "";

    catalogo.aeronaves.forEach(
        function (aeronave) {

            const card =
                document.createElement("div");

            card.className =
                "aircraft-card";

            card.dataset.matricula =
                aeronave.matricula;

            const quantidade =
                Array.isArray(
                    aeronave.fotos
                )
                    ? aeronave.fotos.length
                    : 0;

            card.innerHTML = `
                <div class="aircraft-registration">
                    ${escaparHTML(
                        aeronave.matricula
                    )}
                </div>

                <div class="aircraft-model">
                    ${escaparHTML(
                        aeronave.modelo || ""
                    )}
                </div>

                <div class="aircraft-photo-count">
                    ${quantidade} foto(s)
                </div>
            `;

            card.addEventListener(
                "click",
                function () {

                    abrirGaleria(
                        aeronave
                    );
                }
            );

            aircraftGrid.appendChild(card);
        }
    );

    atualizarResumo();
}

/* ==================================================
   RESUMO
   ================================================== */

function atualizarResumo() {

    if (
        !catalogo ||
        !Array.isArray(
            catalogo.aeronaves
        )
    ) {
        return;
    }

    const aircraftCount =
        document.getElementById(
            "aircraftCount"
        );

    const photoCount =
        document.getElementById(
            "photoCount"
        );

    let totalFotos = 0;

    catalogo.aeronaves.forEach(
        function (aeronave) {

            if (
                Array.isArray(
                    aeronave.fotos
                )
            ) {

                totalFotos +=
                    aeronave.fotos.length;
            }
        }
    );

    if (aircraftCount) {

        aircraftCount.textContent =
            catalogo.aeronaves.length;
    }

    if (photoCount) {

        photoCount.textContent =
            totalFotos;
    }
}

/* ==================================================
   PESQUISA
   ================================================== */

function pesquisarAeronave() {

    if (
        !searchInput ||
        !searchResult
    ) {
        return;
    }

    const termo =
        normalizarMatricula(
            searchInput.value
        );

    searchResult.innerHTML = "";

    if (!termo) {
        return;
    }

    if (
        !catalogo ||
        !Array.isArray(
            catalogo.aeronaves
        )
    ) {
        return;
    }

    const encontrados =
        catalogo.aeronaves.filter(
            function (aeronave) {

                return normalizarMatricula(
                    aeronave.matricula
                ).includes(termo);
            }
        );

    console.log(
        "[LeoSpotter] Pesquisa:",
        termo,
        encontrados
    );

    if (
        encontrados.length === 0
    ) {

        searchResult.innerHTML = `
            <div class="search-message">
                Nenhuma aeronave encontrada.
            </div>
        `;

        return;
    }

    encontrados.forEach(
        function (aeronave) {

            const item =
                document.createElement("div");

            item.className =
                "search-result-item";

            item.dataset.matricula =
                aeronave.matricula;

            item.innerHTML = `
                <strong>
                    ${escaparHTML(
                        aeronave.matricula
                    )}
                </strong>

                <span>
                    ${escaparHTML(
                        aeronave.modelo || ""
                    )}
                </span>
            `;

            searchResult.appendChild(
                item
            );
        }
    );
}

/* ==================================================
   LOCALIZAR AERONAVE
   ================================================== */

function encontrarAeronave(
    matricula
) {

    if (
        !catalogo ||
        !Array.isArray(
            catalogo.aeronaves
        )
    ) {
        return null;
    }

    const procurada =
        normalizarMatricula(
            matricula
        );

    return catalogo.aeronaves.find(
        function (aeronave) {

            return (
                normalizarMatricula(
                    aeronave.matricula
                ) === procurada
            );
        }
    ) || null;
}

/* ==================================================
   ABRIR GALERIA
   ================================================== */

function abrirGaleria(
    aeronave
) {

    console.log(
        "[LeoSpotter] Abrindo galeria:",
        aeronave
    );

    if (!aeronave) {

        console.error(
            "[LeoSpotter] Aeronave inválida."
        );

        return;
    }

    aeronaveAtual =
        aeronave;

    indiceFotoAtual = 0;

    fotosSelecionadas = [];

    if (galleryTitle) {

        galleryTitle.textContent =
            aeronave.matricula || "";
    }

    if (galleryModel) {

        galleryModel.textContent =
            aeronave.modelo || "";
    }

    renderizarFotos();

    atualizarSelecao();

    if (!galleryModal) {

        console.error(
            "[LeoSpotter] galleryModal não encontrado."
        );

        return;
    }

    galleryModal.classList.add(
        "active"
    );

    galleryModal.style.display =
        "block";

    document.body.style.overflow =
        "hidden";

    console.log(
        "[LeoSpotter] Galeria aberta."
    );
}

/* ==================================================
   RENDERIZAR FOTOS
   ================================================== */

function renderizarFotos() {

    if (!photoGrid) {

        console.error(
            "[LeoSpotter] photoGrid não encontrado."
        );

        return;
    }

    photoGrid.innerHTML = "";

    if (
        !aeronaveAtual ||
        !Array.isArray(
            aeronaveAtual.fotos
        )
    ) {

        photoGrid.innerHTML = `
            <div class="search-message">
                Nenhuma foto disponível.
            </div>
        `;

        return;
    }

    if (
        aeronaveAtual.fotos.length === 0
    ) {

        photoGrid.innerHTML = `
            <div class="search-message">
                Nenhuma foto disponível.
            </div>
        `;

        return;
    }

    aeronaveAtual.fotos.forEach(
        function (foto, index) {

            if (!foto.amostra) {

                console.warn(
                    "[LeoSpotter] Foto sem amostra:",
                    foto
                );

                return;
            }

            const urlFoto =
                obterUrlFoto(
                    foto.amostra
                );

            const card =
                document.createElement("div");

            card.className =
                "photo-card";

            card.dataset.index =
                index;

            card.innerHTML = `
                <img
                    src="${escaparHTML(
                        urlFoto
                    )}"
                    alt="${escaparHTML(
                        aeronaveAtual.matricula
                    )}"
                    loading="lazy"
                >

                <div class="photo-select">
                    <input
                        type="checkbox"
                        data-photo-index="${index}"
                    >

                    <span>Selecionar</span>
                </div>
            `;

            const imagem =
                card.querySelector("img");

            if (imagem) {

                imagem.addEventListener(
                    "click",
                    function () {

                        abrirVisualizador(
                            index
                        );
                    }
                );

                imagem.addEventListener(
                    "error",
                    function () {

                        console.error(
                            "[LeoSpotter] ERRO AO CARREGAR:",
                            urlFoto
                        );
                    }
                );

                imagem.addEventListener(
                    "load",
                    function () {

                        console.log(
                            "[LeoSpotter] Foto carregada:",
                            urlFoto
                        );
                    }
                );
            }

            const checkbox =
                card.querySelector(
                    "input[type='checkbox']"
                );

            if (checkbox) {

                checkbox.addEventListener(
                    "change",
                    function (evento) {

                        evento.stopPropagation();

                        alternarSelecao(
                            index
                        );
                    }
                );
            }

            photoGrid.appendChild(
                card
            );
        }
    );
}

/* ==================================================
   SELEÇÃO
   ================================================== */

function alternarSelecao(
    index
) {

    const posicao =
        fotosSelecionadas.indexOf(
            index
        );

    if (posicao >= 0) {

        fotosSelecionadas.splice(
            posicao,
            1
        );

    } else {

        fotosSelecionadas.push(
            index
        );
    }

    atualizarSelecao();
}

function atualizarSelecao() {

    const checkboxes =
        document.querySelectorAll(
            "#photoGrid input[type='checkbox']"
        );

    checkboxes.forEach(
        function (checkbox) {

            const index =
                Number(
                    checkbox.dataset.photoIndex
                );

            const selecionada =
                fotosSelecionadas.includes(index);

            checkbox.checked =
                selecionada;

            const card =
                checkbox.closest(".photo-card");

            if (card) {
                card.classList.toggle(
                    "selected",
                    selecionada
                );
            }
        }
    );

    const selectedCount =
        document.getElementById(
            "selectedCount"
        );

    const selectionText =
        document.getElementById(
            "selectionText"
        );

    if (selectedCount) {

        selectedCount.textContent =
            fotosSelecionadas.length;
    }

    if (selectionText) {

        if (
            fotosSelecionadas.length === 0
        ) {

            selectionText.textContent =
                "Nenhuma foto selecionada";

        } else if (
            fotosSelecionadas.length === 1
        ) {

            selectionText.textContent =
                "1 foto selecionada";

        } else {

            selectionText.textContent =
                `${fotosSelecionadas.length} fotos selecionadas`;
        }
    }

    /* HABILITA / DESABILITA CONTINUAR */

    if (continueButton) {

        continueButton.disabled =
            fotosSelecionadas.length === 0;

        console.log(
            "[LeoSpotter] Botão Continuar:",
            continueButton.disabled
                ? "DESABILITADO"
                : "HABILITADO"
        );
    }
}

/* ==================================================
   VISUALIZADOR
   ================================================== */

function abrirVisualizador(
    index
) {

    if (
        !aeronaveAtual ||
        !Array.isArray(
            aeronaveAtual.fotos
        )
    ) {
        return;
    }

    const foto =
        aeronaveAtual.fotos[index];

    if (!foto) {
        return;
    }

    if (!foto.amostra) {
        return;
    }

    indiceFotoAtual =
        index;

    if (
        !photoViewer ||
        !viewerImage
    ) {
        return;
    }

    viewerImage.src =
        obterUrlFoto(
            foto.amostra
        );

    viewerImage.alt =
        aeronaveAtual.matricula || "";

    photoViewer.classList.add(
        "active"
    );

    photoViewer.style.display =
        "flex";
}

function fecharVisualizador() {

    if (!photoViewer) {
        return;
    }

    photoViewer.classList.remove(
        "active"
    );

    photoViewer.style.display =
        "";
}

function fotoAnterior() {

    if (
        !aeronaveAtual ||
        !Array.isArray(
            aeronaveAtual.fotos
        ) ||
        aeronaveAtual.fotos.length === 0
    ) {
        return;
    }

    indiceFotoAtual--;

    if (
        indiceFotoAtual < 0
    ) {

        indiceFotoAtual =
            aeronaveAtual.fotos.length - 1;
    }

    abrirVisualizador(
        indiceFotoAtual
    );
}

function proximaFoto() {

    if (
        !aeronaveAtual ||
        !Array.isArray(
            aeronaveAtual.fotos
        ) ||
        aeronaveAtual.fotos.length === 0
    ) {
        return;
    }

    indiceFotoAtual++;

    if (
        indiceFotoAtual >=
        aeronaveAtual.fotos.length
    ) {

        indiceFotoAtual = 0;
    }

    abrirVisualizador(
        indiceFotoAtual
    );
}

/* ==================================================
   FECHAR GALERIA
   ================================================== */

function fecharGaleria() {

    if (!galleryModal) {
        return;
    }

    galleryModal.classList.remove(
        "active"
    );

    galleryModal.style.display =
        "";

    document.body.style.overflow =
        "";
}

/* ==================================================
   PEDIDO
   ================================================== */

function abrirPedido() {

    if (
        !orderModal ||
        !aeronaveAtual
    ) {
        return;
    }

    if (
        fotosSelecionadas.length === 0
    ) {

        alert(
            "Selecione pelo menos uma foto."
        );

        return;
    }

    if (selectedPhotosList) {

        selectedPhotosList.innerHTML =
            "";

        fotosSelecionadas.forEach(
            function (index) {

                const foto =
                    aeronaveAtual.fotos[index];

                if (!foto) {
                    return;
                }

                const item =
                    document.createElement("div");

                item.className =
                    "selected-photo-item";

                item.textContent =
                    `Foto ${foto.id || index + 1}`;

                selectedPhotosList.appendChild(
                    item
                );
            }
        );
    }

    fecharGaleria();

    orderModal.classList.add(
        "active"
    );

    orderModal.style.display =
        "block";

    document.body.style.overflow =
        "hidden";
}

function fecharPedido() {

    if (!orderModal) {
        return;
    }

    orderModal.classList.remove(
        "active"
    );

    orderModal.style.display =
        "";

    document.body.style.overflow =
        "";
}

/* ==================================================
   UTILITÁRIOS
   ================================================== */

function normalizarMatricula(
    valor
) {

    return String(
        valor || ""
    )
        .toUpperCase()
        .trim()
        .replace(
            /[\s-]/g,
            ""
        );
}

function escaparHTML(
    valor
) {

    return String(
        valor || ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}

/* ==================================================
   FIM
   ================================================== */

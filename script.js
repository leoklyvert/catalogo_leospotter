```javascript
/* ==================================================
   CATÁLOGO LEOSPOTTER
   Versão 1.2.6

   Sistema:
   - Pesquisa de aeronaves
   - Galeria de fotos
   - Seleção de fotos
   - Revisão da seleção
   - Finalização da seleção

   Dados:
   data/catalogo.json

   Fotos:
   amostra = foto pública em baixa resolução
   original = arquivo privado para entrega posterior
================================================== */

const VERSAO = "1.2.6";

let catalogo = null;
let aeronaveAtual = null;
let fotosSelecionadas = [];
let fotoAtual = 0;

/* ==================================================
   ELEMENTOS DA PÁGINA
================================================== */

let searchInput;
let searchResult;
let aircraftGrid;

let galleryModal;
let galleryTitle;
let galleryModel;
let photoGrid;
let selectedCount;
let selectionText;
let continueButton;

let photoViewer;
let viewerImage;
let closeViewer;
let previousPhoto;
let nextPhoto;

let orderModal;
let selectedPhotosList;
let closeOrder;
let backToGallery;
let finishButton;

/* ==================================================
   INICIALIZAÇÃO
================================================== */

document.addEventListener("DOMContentLoaded", iniciar);

async function iniciar() {

    console.log(
        `[LeoSpotter] Inicializando V${VERSAO}`
    );

    obterElementos();
    prepararEventos();

    await carregarCatalogo();

    console.log(
        "[LeoSpotter] Sistema pronto."
    );
}

/* ==================================================
   OBTER ELEMENTOS
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

    selectedCount =
        document.getElementById("selectedCount");

    selectionText =
        document.getElementById("selectionText");

    continueButton =
        document.getElementById("continueButton");

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

    finishButton =
        document.getElementById("finishButton");

    console.log(
        "[LeoSpotter] Elementos encontrados:",
        {
            searchInput: !!searchInput,
            searchResult: !!searchResult,
            aircraftGrid: !!aircraftGrid,
            galleryModal: !!galleryModal,
            galleryTitle: !!galleryTitle,
            galleryModel: !!galleryModel,
            photoGrid: !!photoGrid,
            selectedCount: !!selectedCount,
            selectionText: !!selectionText,
            continueButton: !!continueButton,
            photoViewer: !!photoViewer,
            viewerImage: !!viewerImage,
            orderModal: !!orderModal,
            selectedPhotosList: !!selectedPhotosList,
            closeOrder: !!closeOrder,
            backToGallery: !!backToGallery,
            finishButton: !!finishButton
        }
    );
}

/* ==================================================
   EVENTOS
================================================== */

function prepararEventos() {

    /* -------------------------------
       PESQUISA
    ------------------------------- */

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            pesquisarAeronave
        );
    }

    /* -------------------------------
       CONTINUAR
    ------------------------------- */

    if (continueButton) {

        continueButton.addEventListener(
            "click",
            abrirPedido
        );
    }

    /* -------------------------------
       FECHAR PEDIDO
    ------------------------------- */

    if (closeOrder) {

        closeOrder.addEventListener(
            "click",
            fecharPedido
        );
    }

    /* -------------------------------
       VOLTAR PARA GALERIA
    ------------------------------- */

    if (backToGallery) {

        backToGallery.addEventListener(
            "click",
            voltarParaGaleria
        );
    }

    /* ==================================================
       FINALIZAR SELEÇÃO

       IMPORTANTE:
       Usamos delegação de evento no document.
       Assim o clique funciona mesmo que o botão
       esteja dentro de um modal manipulado dinamicamente.
    ================================================== */

    document.addEventListener(
        "click",
        function (event) {

            const botao =
                event.target.closest(
                    "#finishButton"
                );

            if (!botao) {
                return;
            }

            console.log(
                "[LeoSpotter] Clique detectado em FINALIZAR SELEÇÃO"
            );

            finalizarSelecao();
        }
    );

    /* -------------------------------
       VISUALIZADOR
    ------------------------------- */

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

    /* -------------------------------
       FECHAR MODAIS CLICANDO FORA
    ------------------------------- */

    if (galleryModal) {

        galleryModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === galleryModal
                ) {

                    fecharGaleria();
                }
            }
        );
    }

    if (orderModal) {

        orderModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === orderModal
                ) {

                    fecharPedido();
                }
            }
        );
    }

    if (photoViewer) {

        photoViewer.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === photoViewer
                ) {

                    fecharVisualizador();
                }
            }
        );
    }

    /* -------------------------------
       TECLADO
    ------------------------------- */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape"
            ) {

                fecharGaleria();
                fecharPedido();
                fecharVisualizador();
            }

            if (
                photoViewer &&
                photoViewer.classList.contains("active")
            ) {

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
        }
    );
}

/* ==================================================
   CARREGAR CATÁLOGO
================================================== */

async function carregarCatalogo() {

    try {

        const resposta =
            await fetch(
                `data/catalogo.json?v=${VERSAO}`,
                {
                    cache: "no-store"
                }
            );

        if (!resposta.ok) {

            throw new Error(
                `Erro HTTP ${resposta.status}`
            );
        }

        catalogo =
            await resposta.json();

        console.log(
            "[LeoSpotter] Catálogo carregado:",
            catalogo
        );

        renderizarAeronaves();

    } catch (erro) {

        console.error(
            "[LeoSpotter] Erro ao carregar catálogo:",
            erro
        );

        if (aircraftGrid) {

            aircraftGrid.innerHTML = `
                <div class="error-message">
                    Não foi possível carregar o catálogo.
                </div>
            `;
        }
    }
}

/* ==================================================
   RENDERIZAR AERONAVES
================================================== */

function renderizarAeronaves() {

    if (
        !catalogo ||
        !catalogo.aeronaves ||
        !aircraftGrid
    ) {
        return;
    }

    aircraftGrid.innerHTML = "";

    catalogo.aeronaves.forEach(
        function (aeronave) {

            const card =
                document.createElement("div");

            card.className =
                "aircraft-card";

            card.innerHTML = `
                <div class="aircraft-registration">
                    ${aeronave.matricula}
                </div>

                <div class="aircraft-model">
                    ${aeronave.modelo || ""}
                </div>

                <div class="aircraft-photo-count">
                    ${
                        aeronave.fotos
                            ? aeronave.fotos.length
                            : 0
                    }
                    foto(s)
                </div>
            `;

            card.addEventListener(
                "click",
                function () {

                    abrirGaleria(aeronave);
                }
            );

            aircraftGrid.appendChild(card);
        }
    );
}

/* ==================================================
   PESQUISA
================================================== */

function pesquisarAeronave() {

    if (!searchInput || !searchResult) {
        return;
    }

    const termo =
        searchInput.value
            .trim()
            .toUpperCase();

    searchResult.innerHTML = "";

    if (termo.length === 0) {

        searchResult.style.display =
            "none";

        return;
    }

    if (
        !catalogo ||
        !catalogo.aeronaves
    ) {

        return;
    }

    const resultados =
        catalogo.aeronaves.filter(
            function (aeronave) {

                return (
                    aeronave.matricula
                        .toUpperCase()
                        .includes(termo)
                );
            }
        );

    console.log(
        "[LeoSpotter] Pesquisa:",
        termo,
        resultados
    );

    if (resultados.length === 0) {

        searchResult.innerHTML = `
            <div class="search-result-item">
                <span>Nenhuma aeronave encontrada.</span>
            </div>
        `;

        searchResult.style.display =
            "block";

        return;
    }

    resultados.forEach(
        function (aeronave) {

            const item =
                document.createElement("div");

            item.className =
                "search-result-item";

            item.innerHTML = `
                <div>
                    <strong>
                        ${aeronave.matricula}
                    </strong>

                    <span>
                        ${aeronave.modelo || ""}
                    </span>
                </div>

                <span>
                    ${aeronave.fotos
                        ? aeronave.fotos.length
                        : 0}
                    foto(s)
                </span>
            `;

            item.addEventListener(
                "click",
                function () {

                    console.log(
                        "[LeoSpotter] Resultado clicado:",
                        aeronave.matricula
                    );

                    abrirGaleria(aeronave);

                    searchResult.style.display =
                        "none";

                    searchInput.value =
                        aeronave.matricula;
                }
            );

            searchResult.appendChild(item);
        }
    );

    searchResult.style.display =
        "block";
}

/* ==================================================
   ABRIR GALERIA
================================================== */

function abrirGaleria(aeronave) {

    if (!aeronave) {
        return;
    }

    aeronaveAtual =
        aeronave;

    fotosSelecionadas = [];

    console.log(
        "[LeoSpotter] Abrindo galeria:",
        aeronave
    );

    if (galleryTitle) {

        galleryTitle.textContent =
            aeronave.matricula;
    }

    if (galleryModel) {

        galleryModel.textContent =
            aeronave.modelo || "";
    }

    if (photoGrid) {

        photoGrid.innerHTML = "";
    }

    if (
        aeronave.fotos &&
        Array.isArray(aeronave.fotos)
    ) {

        aeronave.fotos.forEach(
            function (foto, indice) {

                criarFoto(
                    foto,
                    indice
                );
            }
        );
    }

    atualizarSelecao();

    if (galleryModal) {

        galleryModal.classList.add(
            "active"
        );
    }

    document.body.classList.add(
        "modal-open"
    );

    console.log(
        "[LeoSpotter] Galeria aberta."
    );
}

/* ==================================================
   CRIAR FOTO
================================================== */

function criarFoto(
    foto,
    indice
) {

    if (!photoGrid) {
        return;
    }

    const card =
        document.createElement("div");

    card.className =
        "photo-card";

    card.dataset.index =
        indice;

    const imagem =
        document.createElement("img");

    imagem.src =
        foto.amostra;

    imagem.alt =
        `Foto ${indice + 1}`;

    imagem.loading =
        "lazy";

    imagem.addEventListener(
        "load",
        function () {

            console.log(
                "[LeoSpotter] Foto carregada:",
                foto.amostra
            );
        }
    );

    imagem.addEventListener(
        "error",
        function () {

            console.error(
                "[LeoSpotter] Erro ao carregar foto:",
                foto.amostra
            );
        }
    );

    card.appendChild(imagem);

    /* -------------------------------
       BOTÃO DE SELEÇÃO
    ------------------------------- */

    const select =
        document.createElement("div");

    select.className =
        "photo-select";

    select.innerHTML = `
        <input
            type="checkbox"
            aria-label="Selecionar foto"
        >

        <span>
            Selecionar
        </span>
    `;

    select.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            alternarSelecao(indice);
        }
    );

    card.appendChild(select);

    /* -------------------------------
       ABRIR FOTO
    ------------------------------- */

    imagem.addEventListener(
        "click",
        function () {

            abrirVisualizador(indice);
        }
    );

    photoGrid.appendChild(card);
}

/* ==================================================
   ALTERNAR SELEÇÃO
================================================== */

function alternarSelecao(indice) {

    const posicao =
        fotosSelecionadas.indexOf(
            indice
        );

    if (posicao === -1) {

        fotosSelecionadas.push(
            indice
        );

    } else {

        fotosSelecionadas.splice(
            posicao,
            1
        );
    }

    atualizarSelecao();
}

/* ==================================================
   ATUALIZAR SELEÇÃO
================================================== */

function atualizarSelecao() {

    if (
        !aeronaveAtual ||
        !photoGrid
    ) {
        return;
    }

    const cards =
        photoGrid.querySelectorAll(
            ".photo-card"
        );

    cards.forEach(
        function (card) {

            const indice =
                Number(
                    card.dataset.index
                );

            const selecionada =
                fotosSelecionadas.includes(
                    indice
                );

            card.classList.toggle(
                "selected",
                selecionada
            );

            const checkbox =
                card.querySelector(
                    'input[type="checkbox"]'
                );

            if (checkbox) {

                checkbox.checked =
                    selecionada;
            }
        }
    );

    const quantidade =
        fotosSelecionadas.length;

    if (selectedCount) {

        selectedCount.textContent =
            quantidade;
    }

    if (selectionText) {

        if (quantidade === 0) {

            selectionText.textContent =
                "Nenhuma foto selecionada";

        } else {

            selectionText.textContent =
                `${quantidade} foto(s) selecionada(s)`;
        }
    }

    /* -------------------------------
       HABILITAR CONTINUAR
    ------------------------------- */

    if (continueButton) {

        continueButton.disabled =
            quantidade === 0;
    }

    console.log(
        "[LeoSpotter] Seleção atualizada:",
        fotosSelecionadas
    );
}

/* ==================================================
   ABRIR PEDIDO
================================================== */

function abrirPedido() {

    if (
        !aeronaveAtual ||
        fotosSelecionadas.length === 0
    ) {

        alert(
            "Selecione pelo menos uma foto."
        );

        return;
    }

    console.log(
        "[LeoSpotter] Abrindo revisão da seleção."
    );

    if (selectedPhotosList) {

        selectedPhotosList.innerHTML = "";

        fotosSelecionadas.forEach(
            function (indice) {

                const foto =
                    aeronaveAtual.fotos[
                        indice
                    ];

                const item =
                    document.createElement("div");

                item.className =
                    "selected-photo-item";

                item.textContent =
                    `Foto ${indice + 1}`;

                selectedPhotosList.appendChild(
                    item
                );
            }
        );
    }

    if (galleryModal) {

        galleryModal.classList.remove(
            "active"
        );
    }

    if (orderModal) {

        orderModal.classList.add(
            "active"
        );
    }

    document.body.classList.add(
        "modal-open"
    );

    /* -------------------------------
       GARANTIR BOTÃO HABILITADO
    ------------------------------- */

    if (finishButton) {

        finishButton.disabled =
            false;

        console.log(
            "[LeoSpotter] Botão Finalizar Seleção: HABILITADO"
        );
    }
}

/* ==================================================
   FINALIZAR SELEÇÃO
================================================== */

function finalizarSelecao() {

    console.log(
        "[LeoSpotter] Executando finalizarSelecao()"
    );

    if (
        !aeronaveAtual ||
        fotosSelecionadas.length === 0
    ) {

        alert(
            "Selecione pelo menos uma foto."
        );

        return;
    }

    console.log(
        "[LeoSpotter] Seleção finalizada:",
        {
            matricula:
                aeronaveAtual.matricula,

            fotos:
                fotosSelecionadas
        }
    );

    alert(
        `Seleção finalizada!\n\n` +
        `Aeronave: ${aeronaveAtual.matricula}\n` +
        `Fotos selecionadas: ${fotosSelecionadas.length}\n\n` +
        `A próxima etapa será o pagamento.`
    );
}

/* ==================================================
   VOLTAR PARA GALERIA
================================================== */

function voltarParaGaleria() {

    if (orderModal) {

        orderModal.classList.remove(
            "active"
        );
    }

    if (galleryModal) {

        galleryModal.classList.add(
            "active"
        );
    }
}

/* ==================================================
   FECHAR PEDIDO
================================================== */

function fecharPedido() {

    if (orderModal) {

        orderModal.classList.remove(
            "active"
        );
    }

    document.body.classList.remove(
        "modal-open"
    );
}

/* ==================================================
   FECHAR GALERIA
================================================== */

function fecharGaleria() {

    if (galleryModal) {

        galleryModal.classList.remove(
            "active"
        );
    }

    document.body.classList.remove(
        "modal-open"
    );
}

/* ==================================================
   VISUALIZADOR DE FOTO
================================================== */

function abrirVisualizador(indice) {

    if (
        !aeronaveAtual ||
        !aeronaveAtual.fotos ||
        !aeronaveAtual.fotos[indice]
    ) {
        return;
    }

    fotoAtual =
        indice;

    mostrarFotoAtual();

    if (photoViewer) {

        photoViewer.classList.add(
            "active"
        );
    }

    document.body.classList.add(
        "modal-open"
    );
}

/* ==================================================
   MOSTRAR FOTO ATUAL
================================================== */

function mostrarFotoAtual() {

    if (
        !aeronaveAtual ||
        !viewerImage
    ) {
        return;
    }

    const foto =
        aeronaveAtual.fotos[
            fotoAtual
        ];

    if (!foto) {
        return;
    }

    viewerImage.src =
        foto.amostra;

    viewerImage.alt =
        `Foto ${fotoAtual + 1}`;
}

/* ==================================================
   FOTO ANTERIOR
================================================== */

function fotoAnterior() {

    if (
        !aeronaveAtual ||
        !aeronaveAtual.fotos ||
        aeronaveAtual.fotos.length === 0
    ) {
        return;
    }

    fotoAtual--;

    if (fotoAtual < 0) {

        fotoAtual =
            aeronaveAtual.fotos.length - 1;
    }

    mostrarFotoAtual();
}

/* ==================================================
   PRÓXIMA FOTO
================================================== */

function proximaFoto() {

    if (
        !aeronaveAtual ||
        !aeronaveAtual.fotos ||
        aeronaveAtual.fotos.length === 0
    ) {
        return;
    }

    fotoAtual++;

    if (
        fotoAtual >=
        aeronaveAtual.fotos.length
    ) {

        fotoAtual = 0;
    }

    mostrarFotoAtual();
}

/* ==================================================
   FECHAR VISUALIZADOR
================================================== */

function fecharVisualizador() {

    if (photoViewer) {

        photoViewer.classList.remove(
            "active"
        );
    }

    document.body.classList.remove(
        "modal-open"
    );
}

/* ==================================================
   FIM
================================================== */
```

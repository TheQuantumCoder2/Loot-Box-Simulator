// Configuración y Estado inicial
const rarities = [
    { id: 'common', name: 'COMÚN', weight: 80, color: '#cbd5e1' },
    { id: 'rare', name: 'RARO', weight: 50, color: '#3b82f6' },
    { id: 'epic', name: 'ÉPICO', weight: 20, color: '#a855f7' },
    { id: 'legendary', name: 'LEGENDARIO', weight: 5, color: '#eab308' }
];

const cardNames = {
    common: ["Soldado Raso", "Espada Oxidada", "Poción Menor", "Escudo de Madera", "Hierba Curativa"],
    rare: ["Caballero de Élite", "Arco de Roble", "Poción de Fuerza", "Escudo de Acero", "Anillo de Plata"],
    epic: ["Mago Arcano", "Daga Sombría", "Amuleto de Fuego", "Armadura Plateada", "Capa de Invisibilidad"],
    legendary: ["Dragón Dorado", "Excalibur", "Gema del Infinito", "Fénix Eterno", "Corona del Rey"]
};

let state = {
    chips: 1000,
    packsBought: 0,
    cardsRevealed: 0,
    hasLegendary: false,
    isOpening: false
};

// Elementos del DOM
const chipsEl = document.getElementById('chips-count');
const packsEl = document.getElementById('packs-count');
const cardsEl = document.getElementById('cards-count');
const progressBar = document.getElementById('progress-bar-fill');
const progressText = document.getElementById('progress-text');
const lootBox = document.getElementById('loot-box');
const cardReveal = document.getElementById('card-reveal');
const cardRarityText = document.getElementById('card-rarity-text');
const cardNameText = document.getElementById('card-name-text');
const historyGrid = document.getElementById('history-grid');
const btnBuy1 = document.getElementById('btn-buy-1');
const btnBuy10 = document.getElementById('btn-buy-10');
const overlay = document.getElementById('overlay');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const btnRestart = document.getElementById('btn-restart');

// Funciones Principales
function updateUI() {
    chipsEl.textContent = state.chips;
    packsEl.textContent = state.packsBought;
    cardsEl.textContent = state.cardsRevealed;
    
    btnBuy1.disabled = state.chips < 10 || state.isOpening;
    btnBuy10.disabled = state.chips < 90 || state.isOpening;
}

function getRandomCard() {
    const totalWeight = rarities.reduce((acc, rarity) => acc + rarity.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const rarity of rarities) {
        if (random < rarity.weight) {
            const namePool = cardNames[rarity.id];
            const name = namePool[Math.floor(Math.random() * namePool.length)];
            return { ...rarity, name };
        }
        random -= rarity.weight;
    }
}

async function openPackSequence(numPacks) {
    state.isOpening = true;
    updateUI();
    
    const numCards = numPacks * 10;
    const cardsToOpen = [];
    
    for (let i = 0; i < numCards; i++) {
        cardsToOpen.push(getRandomCard());
    }

    lootBox.classList.add('shaking');
    progressText.textContent = `Abriendo ${numCards} cartas...`;
    
    for (let i = 0; i < numCards; i++) {
        const card = cardsToOpen[i];
        
        // Animación de revelación
        await new Promise(resolve => setTimeout(resolve, 300));
        
        showCard(card);
        state.cardsRevealed++;
        if (card.id === 'legendary') state.hasLegendary = true;
        
        // Actualizar barra de progreso
        const progress = ((i + 1) / numCards) * 100;
        progressBar.style.width = `${progress}%`;
        cardsEl.textContent = state.cardsRevealed;
        
        addToHistory(card);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (i === numCards - 1) {
            cardReveal.classList.remove('show');
        }
    }
    
    lootBox.classList.remove('shaking');
    state.isOpening = false;
    progressBar.style.width = '0%';
    progressText.textContent = "¡Mazo abierto!";
    
    updateUI();
    checkGameOver();
}

function showCard(card) {
    cardReveal.className = `card-reveal show ${card.id}`;
    cardRarityText.textContent = card.name_rarity || card.name.toUpperCase(); // Fallback
    cardRarityText.textContent = card.name.split(' ')[0] === card.name ? card.name : card.name; // Logic fix
    
    // Ajuste de textos según diseño
    cardRarityText.textContent = rarities.find(r => r.id === card.id).name;
    cardRarityText.style.backgroundColor = card.color;
    cardRarityText.style.color = card.id === 'common' ? '#1e293b' : 'white';
    cardNameText.textContent = card.name;
}

function addToHistory(card) {
    const miniCard = document.createElement('div');
    miniCard.className = `mini-card ${card.id}`;
    miniCard.style.backgroundColor = card.color;
    miniCard.style.color = card.id === 'common' ? '#1e293b' : 'white';
    miniCard.textContent = card.id.substring(0, 3);
    
    historyGrid.prepend(miniCard);
    
    if (historyGrid.children.length > 50) {
        historyGrid.removeChild(historyGrid.lastChild);
    }
}

function checkGameOver() {
    if (state.hasLegendary) {
        showModal(
            "¡Objeto Legendario Encontrado!",
            `Te tomó abrir ${state.cardsRevealed} cartas (${state.packsBought} mazos) para conseguirlo. Aunque lo lograste, nota que muchos otros jugadores gastarían sus 1000 fichas sin éxito. La probabilidad del 5% (ajustada por peso) no garantiza nada en pocos intentos.`
        );
    } else if (state.chips < 10) {
        showModal(
            "¡Te has quedado sin fichas!",
            `Has abierto ${state.cardsRevealed} cartas y NO conseguiste el Legendario. Esto demuestra el mito: comprar muchas cajas NO garantiza el premio. La probabilidad es independiente en cada tiro; no "se acumula" para forzar un resultado.`
        );
    }
}

function showModal(title, message) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    overlay.classList.remove('hidden');
}

// Event Listeners
btnBuy1.addEventListener('click', () => {
    if (state.chips >= 10 && !state.isOpening) {
        state.chips -= 10;
        state.packsBought += 1;
        openPackSequence(1);
    }
});

btnBuy10.addEventListener('click', () => {
    if (state.chips >= 90 && !state.isOpening) {
        state.chips -= 90;
        state.packsBought += 10;
        openPackSequence(10);
    }
});

btnRestart.addEventListener('click', () => {
    state = {
        chips: 1000,
        packsBought: 0,
        cardsRevealed: 0,
        hasLegendary: false,
        isOpening: false
    };
    historyGrid.innerHTML = '';
    overlay.classList.add('hidden');
    updateUI();
    progressText.textContent = "Esperando apertura...";
});

// Inicialización
updateUI();

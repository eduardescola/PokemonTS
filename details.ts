// Colores e íconos de los tipos
const typeStyles2: { [key: string]: { color: string; icon: string } } = {
    fire: { color: '#f08030', icon: 'fas fa-fire' },
    water: { color: '#6390f0', icon: 'fas fa-tint' },
    grass: { color: '#7ac74c', icon: 'fas fa-leaf' },
    electric: { color: '#f7d02c', icon: 'fas fa-bolt' },
    bug: { color: '#a8b820', icon: 'fas fa-bug' },
    normal: { color: '#a8a878', icon: 'fas fa-paw' },
    poison: { color: '#a040a0', icon: 'fas fa-skull-crossbones' },
    ice: { color: '#98d8d8', icon: 'fas fa-snowflake' },
    fighting: { color: '#c22e28', icon: 'fas fa-dumbbell' },
    flying: { color: '#a890f0', icon: 'fas fa-fighter-jet' },
    psychic: { color: '#f85888', icon: 'fas fa-brain' },
    rock: { color: '#b8a038', icon: 'fas fa-gem' },
    ghost: { color: '#7b62a3', icon: 'fas fa-ghost' },
    dragon: { color: '#6f35fc', icon: 'fas fa-dragon' },
    steel: { color: '#b7b7b7', icon: 'fas fa-cogs' },
    fairy: { color: '#f4b1e1', icon: 'fas fa-gem' },
    dark: { color: '#705848', icon: 'fas fa-moon' },
    ground: { color: '#e0c068', icon: 'fas fa-mountain' },
};

function displayPokemonDetails(id: number): void {
    const pokemonDetailsContainer = document.getElementById('pokemon-details')!;
    pokemonDetailsContainer.innerHTML = '';

    const storedPokemons = JSON.parse(localStorage.getItem('pokemons') || '[]');
    const pokemon = storedPokemons.find((p: Pokemon) => p.id === id);

    if (!pokemon) {
        pokemonDetailsContainer.innerHTML = "<p class='error-message'>Pokémon no encontrado.</p>";
        return;
    }

    // Crear la tarjeta con los estilos correctos
    const detailsCard = document.createElement('div');
    detailsCard.classList.add('pokemon-details-card'); // Aplicamos la clase CSS correcta

    detailsCard.innerHTML = `
        <img src="${pokemon.sprite}" alt="${pokemon.name}" class="pokemon-img">
        <h2>${pokemon.name}</h2>
        <div class="types-container">
            ${pokemon.types.map(
                (type: string) => `
                <div class="type" style="background-color: ${typeStyles2[type].color}">
                    <i class="${typeStyles2[type].icon}"></i> ${type}
                </div>`
            ).join('')}
        </div>
        <div class="pokemon-info">
            <p><strong>ID:</strong> ${pokemon.id}</p>
            <p><strong>Tipos:</strong> ${pokemon.types.join(', ')}</p>
        </div>
        <button class="back-button" onclick="window.location.href = 'index.html'">Volver</button>
    `;

    pokemonDetailsContainer.appendChild(detailsCard);
}

// Obtener ID del Pokémon desde la URL
window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const pokemonId = parseInt(urlParams.get('id') || '0', 10);

    if (pokemonId) {
        displayPokemonDetails(pokemonId);
    }
};

// Definir la estructura de los datos de los Pokémon
interface Pokemon {
    name: string;
    url: string;
    id?: number;
    sprite?: string;
    types: string[];
}

// Datos globales
let pokemonData: Pokemon[] = [];
let filteredPokemons: Pokemon[] = [];
let currentPage: number = 1;
const perPage: number = 20;

// Colores e íconos de los tipos
const typeStyles: { [key: string]: { color: string; icon: string } } = {
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

// Agregar un event listener al botón de eliminar cache y actualizar
const clearCacheBtn = document.getElementById('clear-cache');
if (clearCacheBtn) {
    clearCacheBtn.addEventListener('click', clearCacheAndUpdate);
}

// Función para obtener los Pokémon de la API
async function fetchPokemons(): Promise<void> {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
    const data = await response.json();
    pokemonData = data.results;

    const pokemonDetailsPromises = pokemonData.map((pokemon) => fetch(pokemon.url).then((res) => res.json()));
    const pokemonDetails = await Promise.all(pokemonDetailsPromises);

    pokemonData = pokemonData.map((pokemon, index) => ({
        ...pokemon,
        id: pokemonDetails[index].id,
        sprite: pokemonDetails[index].sprites.front_default,
        types: pokemonDetails[index].types.map((type: { type: { name: string } }) => type.type.name),
    }));

    localStorage.setItem('pokemons', JSON.stringify(pokemonData));
    filteredPokemons = [...pokemonData];
    displayPokemons(pokemonData);
}

function displayPokemons(pokemons: Pokemon[]) {
    const pokemonList = document.getElementById('pokemon-list');
    if (!pokemonList) return;
    pokemonList.innerHTML = ''; // Limpiar la lista antes de mostrar

    const start = (currentPage - 1) * perPage;
    const end = start + perPage;
    const paginatedPokemons = pokemons.slice(start, end);

    if (paginatedPokemons.length === 0) {
        pokemonList.innerHTML = "No hay Pokémon disponibles para mostrar en esta página.";
        return;
    }

    paginatedPokemons.forEach((pokemon) => {
        const pokemonCard = document.createElement('div');
        pokemonCard.classList.add('pokemon-card');

        pokemonCard.innerHTML = `        
            <div class="card" onclick="window.location.href='pokemon-details.html?id=${pokemon.id}'">
                <div class="pokemon-actions">
                    <button class="edit-btn" data-id="${pokemon.id}">
                        <i class="fas fa-pencil-alt"></i>
                    </button>
                    <button class="delete-btn" data-id="${pokemon.id}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
                <img src="${pokemon.sprite}" alt="${pokemon.name}" class="pokemon-img">
                <h2>${pokemon.name}</h2>
                <div class="types-container">
                    ${pokemon.types
                        .map(
                            (type) =>
                                `<div class="type" style="background-color: ${typeStyles[type].color}">
                                    <i class="${typeStyles[type].icon}"></i> ${type}
                                </div>`
                        )
                        .join('')}
                </div>
            </div>
        `;

        pokemonList.appendChild(pokemonCard);
    });

    // Agregar eventos a los botones "Editar" y "Borrar"
    document.querySelectorAll('.edit-btn').forEach((btn) => {
        btn.addEventListener('click', (event) => {
            event.stopPropagation(); // Evita que se active el onclick de la card
            const id = (event.target as HTMLElement).closest('button')?.dataset.id;
            if (id) editPokemon(parseInt(id, 10));
        });
    });

    document.querySelectorAll('.delete-btn').forEach((btn) => {
        btn.addEventListener('click', (event) => {
            event.stopPropagation();
            const id = (event.target as HTMLElement).closest('button')?.dataset.id;
            if (id) deletePokemon(parseInt(id, 10));
        });
    });
}

// Función para editar un Pokémon
function editPokemon(id: number): void {
    window.location.href = `edit.html?id=${id}`; // Redirigir a la página de edición
}

// Función para eliminar un Pokémon
function deletePokemon(id: number): void {
    const confirmDelete = confirm('¿Estás seguro de que quieres eliminar este Pokémon?');
    if (confirmDelete) {
        // Filtrar la lista de Pokémon para eliminar el seleccionado
        pokemonData = pokemonData.filter((pokemon) => pokemon.id !== id);
        filteredPokemons = filteredPokemons.filter((pokemon) => pokemon.id !== id);

        // Actualizar el localStorage
        localStorage.setItem('pokemons', JSON.stringify(pokemonData));

        // Asegurar que la página actual es válida después de la eliminación
        const maxPages = Math.max(1, Math.ceil(filteredPokemons.length / perPage));
        if (currentPage > maxPages) {
            currentPage = maxPages; // Ajustar la página actual
        }

        displayPokemons(filteredPokemons); // Actualizar la visualización
    }
}

function searchPokemons(): void {
    const searchInput = (document.getElementById('search') as HTMLInputElement).value.toLowerCase();
    const suggestionsContainer = document.getElementById('suggestions') as HTMLDivElement;
    
    // Limpiar las sugerencias previas
    suggestionsContainer.innerHTML = '';

    if (searchInput === '') {
        // Si no hay texto, ocultamos las sugerencias
        suggestionsContainer.style.display = 'none';
        return;
    }

    // Filtrar los Pokémon que coinciden con la búsqueda
    const suggestions = pokemonData.filter((pokemon) =>
        pokemon.name.toLowerCase().includes(searchInput)
    );

    // Si hay sugerencias, las mostramos
    if (suggestions.length > 0) {
        suggestionsContainer.style.display = 'block'; // Mostrar el contenedor
        suggestions.forEach((pokemon) => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = pokemon.name;

            // Agregar un evento de clic para llenar el input con la sugerencia
            suggestionItem.addEventListener('click', () => {
                // Poner el nombre de la sugerencia en el campo de búsqueda
                (document.getElementById('search') as HTMLInputElement).value = pokemon.name;
                suggestionsContainer.innerHTML = ''; // Limpiar las sugerencias
                suggestionsContainer.style.display = 'none'; // Ocultar las sugerencias
            });

            suggestionsContainer.appendChild(suggestionItem);
        });
    } else {
        suggestionsContainer.style.display = 'none'; // Ocultar las sugerencias si no hay coincidencias
    }
    filterPokemons();
}

// Función para filtrar Pokémon por nombre y tipo
function filterPokemons() {
    const searchInput = (document.getElementById('search') as HTMLInputElement).value.toLowerCase();
    const selectedType = document.querySelector('.type-buttons .nes-btn.selected')?.id || 'all';

    filteredPokemons = pokemonData.filter((pokemon) => {
        // Filtrar por nombre
        const nameMatch = pokemon.name.toLowerCase().includes(searchInput);

        // Filtrar por tipo
        const typeMatch = selectedType === 'all' || pokemon.types.includes(selectedType);

        return nameMatch && typeMatch;
    });

    // Mostrar los Pokémon filtrados
    displayPokemons(filteredPokemons);
}

// Función para manejar el cambio de selección de tipo
function toggleTypeFilter(event: Event) {
    const button = event.target as HTMLButtonElement;
    if (button.classList.contains('nes-btn')) {
        // Alternar la clase "selected" en los botones de tipo
        document.querySelectorAll('.type-buttons .nes-btn').forEach((btn) => btn.classList.remove('selected'));
        button.classList.add('selected');

        // Llamar a la función de filtrado después de seleccionar un tipo
        filterPokemons();
    }
}

// Asignar los eventos de click a los botones de tipo
document.querySelectorAll('.type-buttons .nes-btn').forEach((button) => {
    button.addEventListener('click', toggleTypeFilter);
});

// Función para limpiar el localStorage y recargar la página
function clearCacheAndUpdate() {
    if (confirm('¿Estás seguro de que deseas eliminar el cache y actualizar la página?')) {
        localStorage.removeItem('pokemons'); // Limpiar el cache
        location.reload(); // Recargar la página
    }
}


function goToPage(): void {
    const pageInput = document.getElementById('page-input') as HTMLInputElement;
    const pageNumber = parseInt(pageInput.value.trim(), 10);

    if (isNaN(pageNumber) || pageNumber < 1 || pageNumber > Math.ceil(filteredPokemons.length / perPage)) {
        alert('Número de página inválido. Ingresa un número de página válido.');
        return;
    }

    // Actualizar la página actual
    currentPage = pageNumber;

    // Mostrar los Pokémon de la página correspondiente
    displayPokemons(filteredPokemons);

    // Actualizar el texto de la página actual
    const currentPageElement = document.getElementById('current-page');
    if (currentPageElement) {
        currentPageElement.textContent = `Página Actual: ${currentPage}`;
    }

    // Limpiar el input de la página
    pageInput.value = '';
}

// Función para mostrar un Pokémon aleatorio
function showRandomPokemon(): void {
    // Verificar que haya Pokémon en la lista filtrada
    if (filteredPokemons.length === 0) {
        alert('No hay Pokémon para mostrar. Filtra o carga los Pokémon primero.');
        return;
    }

    // Seleccionar un Pokémon aleatorio de la lista filtrada
    const randomPokemon = filteredPokemons[Math.floor(Math.random() * filteredPokemons.length)];

    // Redirigir a la página de detalles del Pokémon seleccionado
    window.location.href = `pokemon-details.html?id=${randomPokemon.id}`;
}

window.onload = async () => {
    const loadingContainer = document.getElementById('loading');
    if (loadingContainer) {
        loadingContainer.style.display = 'flex'; // Muestra el loader
    }

    // Intenta obtener los Pokémon desde localStorage
    const storedPokemons = JSON.parse(localStorage.getItem('pokemons') || '[]');

    if (storedPokemons.length > 0) {
        pokemonData = storedPokemons;
        filteredPokemons = [...pokemonData];
        displayPokemons(pokemonData);
    } else {
        await fetchPokemons(); // Espera a que termine de cargar los Pokémon
    }

    // Asegurar que el loader desaparezca tras cargar los Pokémon
    if (loadingContainer) {
        setTimeout(() => {
            loadingContainer.style.display = 'none';
        }, 1000); // Reducido a 1 segundo para mejor experiencia
    }

    // Si estamos en la página de detalles, cargar el Pokémon correspondiente
    const urlParams = new URLSearchParams(window.location.search);
    const pokemonId = parseInt(urlParams.get('id') || '0', 10);

    if (pokemonId && document.getElementById('pokemon-details')) {
        displayPokemonDetails(pokemonId);
    }
};

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Datos globales
let pokemonData = [];
let filteredPokemons = [];
let currentPage = 1;
const perPage = 20;
// Colores e íconos de los tipos
const typeStyles = {
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
// Función para obtener los Pokémon de la API
function fetchPokemons() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
        const data = yield response.json();
        pokemonData = data.results;
        const pokemonDetailsPromises = pokemonData.map((pokemon) => fetch(pokemon.url).then((res) => res.json()));
        const pokemonDetails = yield Promise.all(pokemonDetailsPromises);
        pokemonData = pokemonData.map((pokemon, index) => (Object.assign(Object.assign({}, pokemon), { id: pokemonDetails[index].id, sprite: pokemonDetails[index].sprites.front_default, types: pokemonDetails[index].types.map((type) => type.type.name) })));
        localStorage.setItem('pokemons', JSON.stringify(pokemonData));
        filteredPokemons = [...pokemonData];
        displayPokemons(pokemonData);
    });
}
function displayPokemons(pokemons) {
    const pokemonList = document.getElementById('pokemon-list');
    if (!pokemonList)
        return;
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
            .map((type) => `<div class="type" style="background-color: ${typeStyles[type].color}">
                                    <i class="${typeStyles[type].icon}"></i> ${type}
                                </div>`)
            .join('')}
                </div>
            </div>
        `;
        pokemonList.appendChild(pokemonCard);
    });
    // Agregar eventos a los botones "Editar" y "Borrar"
    document.querySelectorAll('.edit-btn').forEach((btn) => {
        btn.addEventListener('click', (event) => {
            var _a;
            event.stopPropagation(); // Evita que se active el onclick de la card
            const id = (_a = event.target.closest('button')) === null || _a === void 0 ? void 0 : _a.dataset.id;
            if (id)
                editPokemon(parseInt(id, 10));
        });
    });
    document.querySelectorAll('.delete-btn').forEach((btn) => {
        btn.addEventListener('click', (event) => {
            var _a;
            event.stopPropagation();
            const id = (_a = event.target.closest('button')) === null || _a === void 0 ? void 0 : _a.dataset.id;
            if (id)
                deletePokemon(parseInt(id, 10));
        });
    });
}
// Función para editar un Pokémon
function editPokemon(id) {
    window.location.href = `edit.html?id=${id}`; // Redirigir a la página de edición
}
// Función para eliminar un Pokémon
function deletePokemon(id) {
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
// Función para buscar Pokémon
function searchPokemons() {
    const searchInput = document.getElementById('search').value.toLowerCase();
    if (searchInput === '') {
        filteredPokemons = [...pokemonData];
        displayPokemons(filteredPokemons);
        return;
    }
    filteredPokemons = pokemonData.filter((pokemon) => pokemon.name.toLowerCase().includes(searchInput));
    displayPokemons(filteredPokemons);
}
window.onload = () => __awaiter(void 0, void 0, void 0, function* () {
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
    }
    else {
        yield fetchPokemons(); // Espera a que termine de cargar los Pokémon
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
});

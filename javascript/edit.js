"use strict";
// Función para obtener el Pokémon desde el localStorage
function getPokemonFromLocalStorage(id) {
    const storedPokemons = JSON.parse(localStorage.getItem('pokemons') || '[]');
    return storedPokemons.find((pokemon) => pokemon.id === id);
}
// Función para guardar el Pokémon actualizado en el localStorage
function savePokemonToLocalStorage(updatedPokemon) {
    let storedPokemons = JSON.parse(localStorage.getItem('pokemons') || '[]');
    // Actualizamos el Pokémon en el array
    storedPokemons = storedPokemons.map((pokemon) => pokemon.id === updatedPokemon.id ? updatedPokemon : pokemon);
    // Guardamos de nuevo el array en el localStorage
    localStorage.setItem('pokemons', JSON.stringify(storedPokemons));
}
// Función que inicializa el formulario con los datos del Pokémon
function initializeEditForm(id) {
    const pokemon = getPokemonFromLocalStorage(id);
    if (!pokemon) {
        alert("Pokémon no encontrado.");
        return;
    }
    const nameInput = document.getElementById('edit-name');
    const typeInput = document.getElementById('edit-type');
    // Prellenamos el formulario con los datos actuales del Pokémon
    nameInput.value = pokemon.name;
    typeInput.value = pokemon.types.join(', '); // Si hay múltiples tipos, los unimos en un string separado por comas
}
function handleFormSubmit(event, id) {
    event.preventDefault();
    const nameInput = document.getElementById('edit-name');
    const typeInput = document.getElementById('edit-type');
    // Obtenemos los nuevos valores del formulario
    const updatedName = nameInput.value.trim();
    const updatedType = typeInput.value.trim();
    if (updatedName === '' || updatedType === '') {
        alert("Por favor, ingresa un nombre y tipo válidos.");
        return;
    }
    // Obtenemos el Pokémon original desde el localStorage
    const pokemon = getPokemonFromLocalStorage(id);
    if (!pokemon) {
        alert("Pokémon no encontrado.");
        return;
    }
    // Crear el objeto actualizado del Pokémon, manteniendo el sprite y URL
    const updatedPokemon = {
        id,
        name: updatedName,
        types: updatedType.split(',').map(type => type.trim()), // Convertimos los tipos en un array
        sprite: pokemon.sprite, // Mantener el sprite original
        url: pokemon.url // Mantener la URL original
    };
    // Guardamos el Pokémon actualizado
    savePokemonToLocalStorage(updatedPokemon);
    // Redirigimos al usuario a la página de detalles del Pokémon
    window.location.href = `pokemon-details.html?id=${id}`;
}
// Obtener el ID del Pokémon desde la URL
function getPokemonIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return parseInt(urlParams.get('id') || '0', 10);
}
// Inicializamos el formulario con los datos del Pokémon
const pokemonId = getPokemonIdFromUrl();
initializeEditForm(pokemonId);
// Añadimos el event listener para el formulario
const form = document.getElementById('edit-pokemon-form');
form.addEventListener('submit', (event) => handleFormSubmit(event, pokemonId));

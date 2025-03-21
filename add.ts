document.getElementById('add-pokemon-form')!.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevenir el comportamiento por defecto de enviar el formulario

    // Obtener los valores de los campos
    const name = (document.getElementById('name') as HTMLInputElement).value.trim().toLowerCase();
    const types = (document.getElementById('types') as HTMLInputElement).value.trim().split(',').map(type => type.trim().toLowerCase());
    const sprite = (document.getElementById('sprite') as HTMLInputElement).value.trim();

    // Validación básica de los campos
    if (!name || !types.length || !sprite) {
        alert('Por favor, completa todos los campos.');
        return;
    }

    // Crear el objeto del nuevo Pokémon
    const newPokemon: Pokemon = {
        name: name,
        types: types,
        sprite: sprite,
        id: Date.now(), // Usar el timestamp como ID único
        url: '', // Puedes asignar la URL aquí si la necesitas más adelante
    };

    // Obtener los datos actuales de Pokémon desde el localStorage
    const pokemonData: Pokemon[] = JSON.parse(localStorage.getItem('pokemons') || '[]');

    // Añadir el nuevo Pokémon a la lista
    pokemonData.push(newPokemon);

    // Guardar los datos actualizados en el localStorage
    localStorage.setItem('pokemons', JSON.stringify(pokemonData));

    // Redirigir a la Pokedex o página principal
    window.location.href = 'index.html';
});
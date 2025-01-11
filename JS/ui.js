

export function displayRecipes(recipes, listOfRecipes, onRecipeClick) {
    listOfRecipes.innerHTML = '';

    if (!recipes || recipes.length === 0) {
        listOfRecipes.innerHTML = '<p>No recipes found, please try a different search.</p>';
        return;
    }

    recipes.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.classList.add('recipe-item');
        recipeCard.innerHTML = `
            <div class="recipe-card">
                <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image">
                <h3 class="recipe-title">${recipe.title}</h3>
            </div>
        `;

        recipeCard.addEventListener('click', () => onRecipeClick(recipe.id));
        listOfRecipes.appendChild(recipeCard);
    });
}

export function displayRecipeDetails(recipe, recipeDisplay, onServingsChange, onAddToFavorites) {
    const ingredients = (recipe.extendedIngredients && recipe.extendedIngredients.length > 0)
        ? recipe.extendedIngredients.map(ingredient => `
            <li>${ingredient.amount} ${ingredient.unit} ${ingredient.name}</li>
        `).join('')
        : '<li>No ingredients available</li>';

    recipeDisplay.innerHTML = `
        <h2>${recipe.title}</h2>
        <img src="${recipe.image}" alt="${recipe.title}">
        <p><strong>Ready in:</strong> ${recipe.readyInMinutes || 'Unknown'} minutes</p>
        <p><strong>Servings:</strong> <span id="servings">${recipe.servings || 'Unknown'}</span> people</p>

        <div class="adjust-servings">
            <button id="minusButton">-</button>
            <button id="plusButton">+</button>
        </div>

        <div class="ingredients">
            <h3>Ingredients:</h3>
            <ul>
                ${ingredients}
            </ul>
        </div>

        <button id="favoriteButton">Add to Favorites</button>
    `;

    document.getElementById('minusButton').addEventListener('click', () => onServingsChange(-1));
    document.getElementById('plusButton').addEventListener('click', () => onServingsChange(1));
    document.getElementById('favoriteButton').addEventListener('click', onAddToFavorites);
}

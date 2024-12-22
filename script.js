const inputSearch = document.getElementById('input_search'); 
const buttonSearch = document.getElementById('button_search'); 
const listOfRecipes = document.querySelector('.list_of_recipes');
const recipeDisplay = document.querySelector('.recipe_display'); 
const favoritesDropdown = document.querySelector('.favorites_dropdown');

const API_KEY = '1be9d900c48144a8a1b17d893735b06b';

let currentRecipe = null;  // משתנה לאחסן את המתכון שנבחר

// פונקציה לשליחת בקשת החיפוש למתכונים
async function fetchRecipes(query) {
    try {
        const response = await fetch(
            `https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&query=${query}&number=100`
        );
        if (!response.ok) {
            throw new Error('Failed to fetch recipes');
        }
        const data = await response.json();
        return data.results;
    } catch (error) {
        listOfRecipes.innerHTML = 'משהו השתבש. אנא נסה שוב מאוחר יותר.';
        return [];
    }
}

// פונקציה לקבלת פרטי מתכון מלאים
async function fetchRecipeDetails(recipeId) {
    try {
        const response = await fetch(
            `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${API_KEY}`
        );
        if (!response.ok) {
            throw new Error('Failed to fetch recipe details');
        }
        const data = await response.json();
        console.log(data);
        
        return data;
    } catch (error) {
        console.error('Error fetching recipe details:', error);
        return null;
    }
}

// פונקציה להצגת המתכונים שנמצאו בחיפוש
function displayRecipes(recipes) {
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

        // הוספת מאזין להצגת פרטי מתכון מלאים
        recipeCard.addEventListener('click', async () => {
            console.log("Recipe clicked", recipe);
            const fullRecipeDetails = await fetchRecipeDetails(recipe.id);
            if (fullRecipeDetails) {
                displayRecipeDetails(fullRecipeDetails);
            } else {
                recipeDisplay.innerHTML = '<p>Failed to load recipe details. Please try again.</p>';
            }
        });

        listOfRecipes.appendChild(recipeCard);
    });
}

// פונקציה להצגת המתכון המלא במרכז
function displayRecipeDetails(recipe) {
    currentRecipe = recipe;  // שמירת המתכון שנבחר

    const ingredients = (recipe.extendedIngredients && recipe.extendedIngredients.length > 0)
        ? recipe.extendedIngredients.map(ingredient => `
            <li>${ingredient.amount} ${ingredient.unit} ${ingredient.name}</li>
        `).join('')
        : '<li>No ingredients available</li>';  // אם אין מרכיבים

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

    // הוספת מאזיני כפתור פלוס ומינוס לעדכון כמות האנשים
    document.getElementById('minusButton').addEventListener('click', updateServings(-1));
    document.getElementById('plusButton').addEventListener('click', updateServings(1));

    // הוספת מאזין לכפתור הוספה לרשימת המועדפים
    document.getElementById('favoriteButton').addEventListener('click', () => addToFavorites(recipe));
}

// פונקציה לעדכון כמות האנשים במתכון (פלוס ומינוס)
function updateServings(change) {
    return function() {
        if (currentRecipe) {
            let newServings = currentRecipe.servings + change;
            if (newServings > 0) {
                currentRecipe.servings = newServings;
                document.getElementById('servings').textContent = newServings;
                updateIngredients();
            }
        }
    };
}

// פונקציה לעדכון המרכיבים בהתאם לכמות האנשים
function updateIngredients() {
    const ingredientsList = currentRecipe.extendedIngredients.map(ingredient => {
        const adjustedAmount = (ingredient.amount * currentRecipe.servings) / currentRecipe.originalServings;
        return `<li>${adjustedAmount.toFixed(2)} ${ingredient.unit} ${ingredient.name}</li>`;
    }).join('');

    const ingredientsContainer = recipeDisplay.querySelector('.ingredients ul');
    ingredientsContainer.innerHTML = ingredientsList;
}

// פונקציה להוספת המתכון לרשימת המועדפים
function addToFavorites(recipe) {
    const favoriteItem = document.createElement('div');
    favoriteItem.classList.add('favorite-item');
    favoriteItem.innerHTML = `
        <img src="${recipe.image}" alt="${recipe.title}">
        <h3>${recipe.title}</h3>
    `;
    favoritesDropdown.appendChild(favoriteItem);
}

// מאזין לחיפוש המתכון
buttonSearch.addEventListener('click', async () => {
    const query = inputSearch.value.trim();
    if (query) {
        const recipes = await fetchRecipes(query);
        displayRecipes(recipes);
    } else {
        listOfRecipes.innerHTML = '<p>Please enter something</p>';
    }
});

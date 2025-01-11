import { fetchRecipes, fetchRecipeDetails } from './api.js';

const inputSearch = document.getElementById('input_search');
const buttonSearch = document.getElementById('button_search');
const listOfRecipes = document.querySelector('.list_of_recipes');
const recipeDisplay = document.querySelector('.recipe_display');
const favoritesDropdown = document.querySelector('.favorites_dropdown');
const shoppingListContainer = document.querySelector('.shopping_list');

let currentRecipe = null; // המתכון הנוכחי
let originalServings = null; // מספר המנות המקורי למתכון הנוכחי
let shoppingList = []; // רשימת הקניות הכללית


// פונקציה להצגת מתכונים בעמוד השמאלי
function displayRecipes(recipes) {
    listOfRecipes.innerHTML = '';

    if (!recipes || recipes.length === 0) {
        listOfRecipes.innerHTML = '<p>No recipes found, please try a different search.</p>';
        return;
    }

    recipes.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.classList.add('recipe-item');

        const recipeContainer = document.createElement('div');
        recipeContainer.classList.add('recipe-card');

        const recipeImage = document.createElement('img');
        recipeImage.src = recipe.image;
        recipeImage.alt = recipe.title;
        recipeImage.classList.add('recipe-image');

        const recipeTitle = document.createElement('h3');
        recipeTitle.textContent = recipe.title;
        recipeTitle.classList.add('recipe-title');

        // בניית הכרטיסייה
        recipeContainer.appendChild(recipeImage);
        recipeContainer.appendChild(recipeTitle);
        recipeCard.appendChild(recipeContainer);

        // הוספת אירוע קליק עבור המתכון
        recipeCard.addEventListener('click', async () => {
            const fullRecipeDetails = await fetchRecipeDetails(recipe.id);
            if (fullRecipeDetails) {
                displayRecipeDetails(fullRecipeDetails);
            } else {
                recipeDisplay.innerHTML = '<p>Failed to load recipe details. Please try again.</p>';
            }
        });

        // הוספת הכרטיסייה לרשימה
        listOfRecipes.appendChild(recipeCard);
    });
}


function displayRecipeDetails(recipe) {
    currentRecipe = recipe;
    originalServings = recipe.servings;

    // יצירת אלמנטים
    const h2 = document.createElement('h2');
    h2.textContent = recipe.title;

    const img = document.createElement('img');
    img.src = recipe.image;
    img.alt = recipe.title;

    const readyIn = document.createElement('p');
    readyIn.innerHTML = `<strong>Ready in:</strong> ${recipe.readyInMinutes || 'Unknown'} minutes`;

    const servings = document.createElement('p');
    servings.innerHTML = `<strong>Servings:</strong> <span id="servings">${recipe.servings || 'Unknown'}</span> people`;

    const adjustServings = document.createElement('div');
    adjustServings.classList.add('adjust-servings');
    const buttonMinus = document.createElement('button');
    buttonMinus.id = 'minusButton';
    buttonMinus.textContent = '-';
    const buttonPlus = document.createElement('button');
    buttonPlus.id = 'plusButton';
    buttonPlus.textContent = '+';
    adjustServings.appendChild(buttonMinus);
    adjustServings.appendChild(buttonPlus);

    const ingredientsDiv = document.createElement('div');
    ingredientsDiv.classList.add('ingredients');
    const ingredientsHeader = document.createElement('h3');
    ingredientsHeader.textContent = 'Ingredients:';
    const ingredientsList = document.createElement('ul');
    if (recipe.extendedIngredients && recipe.extendedIngredients.length > 0) {
        recipe.extendedIngredients.forEach(ingredient => {
            const li = document.createElement('li');
            li.textContent = `${ingredient.amount} ${ingredient.unit || ''} ${ingredient.name}`;
            ingredientsList.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = 'No ingredients available';
        ingredientsList.appendChild(li);
    }
    ingredientsDiv.appendChild(ingredientsHeader);
    ingredientsDiv.appendChild(ingredientsList);

    // יצירת כפתורים
    const addToShoppingListButton = document.createElement('button');
    addToShoppingListButton.id = 'addToShoppingListButton';
    addToShoppingListButton.textContent = 'Add to Shopping List';

    const favoriteButton = document.createElement('button');
    favoriteButton.id = 'favoriteButton';
    favoriteButton.textContent = 'Add to Favorites';

    const watchRecipeButton = document.createElement('button');
    if (recipe.spoonacularSourceUrl) {
        watchRecipeButton.textContent = 'Go to Recipe';
        watchRecipeButton.id = 'watchRecipeButton';
        watchRecipeButton.classList.add('watch-recipe-button');
        watchRecipeButton.addEventListener('click', () => {
            window.open(recipe.spoonacularSourceUrl, '_blank');
        });
    }

    // יצירת קבוצה לכפתורים
    const buttonGroup = document.createElement('div');
    buttonGroup.classList.add('button-group-center'); // מחלקה לעיצוב

    // הוספת כפתורים לקבוצה
    buttonGroup.appendChild(addToShoppingListButton);
    buttonGroup.appendChild(favoriteButton);
    if (recipe.spoonacularSourceUrl) {
        buttonGroup.appendChild(watchRecipeButton);
    }

    // ניקוי התצוגה והוספת אלמנטים חדשים
    recipeDisplay.innerHTML = '';
    recipeDisplay.appendChild(h2);
    recipeDisplay.appendChild(img);
    recipeDisplay.appendChild(readyIn);
    recipeDisplay.appendChild(servings);
    recipeDisplay.appendChild(adjustServings);
    recipeDisplay.appendChild(ingredientsDiv);
    recipeDisplay.appendChild(buttonGroup); 

    // מאזינים
    buttonMinus.addEventListener('click', () => {
        if (currentRecipe.servings > 1) {
            updateServings(-1);
        }
    });

    buttonPlus.addEventListener('click', () => {
        updateServings(1);
    });

    addToShoppingListButton.addEventListener('click', () => {
        handleShoppingListAddition(currentRecipe.extendedIngredients);
    });

    favoriteButton.addEventListener('click', () => addToFavorites(recipe));
}

function updateServings(change) {
    if (currentRecipe) {
        let newServings = currentRecipe.servings + change;
        if (newServings > 0) {
            currentRecipe.servings = newServings;
            document.getElementById('servings').textContent = newServings;
            updateIngredients(newServings);
        }
    }
}

function updateIngredients(newServings) {
    if (!currentRecipe || !currentRecipe.extendedIngredients) return;

    const ingredientsList = currentRecipe.extendedIngredients.map(ingredient => {
        const adjustedAmount = (ingredient.amount * newServings) / originalServings;
        return `<li>${adjustedAmount.toFixed(2)} ${ingredient.unit || ''} ${ingredient.name}</li>`;
    }).join('');

    const ingredientsContainer = recipeDisplay.querySelector('.ingredients ul');
    if (ingredientsContainer) {
        ingredientsContainer.innerHTML = ingredientsList;
    }
}

function addToFavorites(recipe) {
    // מחיקת הפסקה "אין מועדפים" אם קיימת
    const noFavoritesMessage = favoritesDropdown.querySelector('.no-favorites');
    if (noFavoritesMessage) {
        noFavoritesMessage.remove();
    }

    // יצירת פריט מועדף
    const favoriteItem = document.createElement('div');
    favoriteItem.classList.add('favorite-item');

    // יצירת כרטיס
    const favoriteCard = document.createElement('div');
    favoriteCard.classList.add('favorite-card');

    // יצירת תמונה
    const favoriteImage = document.createElement('img');
    favoriteImage.src = recipe.image;
    favoriteImage.alt = recipe.title;
    favoriteImage.classList.add('favorite-image');

    // יצירת כותרת
    const favoriteTitle = document.createElement('h3');
    favoriteTitle.textContent = recipe.title;
    favoriteTitle.classList.add('favorite-title');

    // כפתור מחיקה לפריט בודד
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Remove';
    deleteButton.classList.add('delete-favorite');
    deleteButton.addEventListener('click', () => {
        favoriteItem.remove();
        if (favoritesDropdown.querySelectorAll('.favorite-item').length === 0) {
            showNoFavoritesMessage(); // מציג הודעה "אין מועדפים" אם הרשימה ריקה
        }
    });

    // הוספת התמונה והכותרת לכרטיס
    favoriteCard.appendChild(favoriteImage);
    favoriteCard.appendChild(favoriteTitle);

    // הוספת הכרטיס וכפתור המחיקה לפריט
    favoriteItem.appendChild(favoriteCard);
    favoriteItem.appendChild(deleteButton);

    // הוספת הפריט לרשימת המועדפים לפני הכפתור "Clear All"
    const clearButton = document.getElementById('clearFavoritesButton');
    if (clearButton) {
        favoritesDropdown.insertBefore(favoriteItem, clearButton);
    } else {
        favoritesDropdown.appendChild(favoriteItem);
        showClearFavoritesButton(); // יצירת כפתור ריקון אם הוא לא קיים
    }

    favoritesDropdown.scrollTo({ top: favoritesDropdown.scrollHeight, behavior: 'smooth' });
}

function showNoFavoritesMessage() {
    const message = document.createElement('p');
    message.textContent = 'No favorites yet!';
    message.classList.add('no-favorites');
    favoritesDropdown.appendChild(message);
}

function showClearFavoritesButton() {
    // בדיקה אם הכפתור כבר קיים
    if (document.getElementById('clearFavoritesButton')) return;

    const clearButton = document.createElement('button');
    clearButton.textContent = 'Clear All';
    clearButton.id = 'clearFavoritesButton';
    clearButton.classList.add('clear-favorites');
    clearButton.addEventListener('click', () => {
        favoritesDropdown.innerHTML = ''; // מוחק את כל הרשימה
        showNoFavoritesMessage();
    });

    favoritesDropdown.appendChild(clearButton);
}


function handleShoppingListAddition(newIngredients) {
    if (!newIngredients || newIngredients.length === 0) return;

    if (shoppingList.length > 0) {
        const userChoice = confirm(
            'You already have a shopping list. Do you want to clear the existing list and add the new ingredients? (Click "Cancel" to add them to the existing list.)'
        );

        if (userChoice) {
            shoppingList = []; // מחיקת הרשימה הקודמת אם המשתמש בחר "אישור"
        }
    }

    addToShoppingList(newIngredients);
}

function addToShoppingList(ingredients) {
    if (!ingredients || ingredients.length === 0) return;

    ingredients.forEach(ingredient => {
        const adjustedAmount = (ingredient.amount * currentRecipe.servings) / originalServings;
        const existingItem = shoppingList.find(item => item.name === ingredient.name && item.unit === ingredient.unit);

        if (existingItem) {
            existingItem.amount += adjustedAmount;
        } else {
            shoppingList.push({
                name: ingredient.name,
                amount: adjustedAmount,
                unit: ingredient.unit || ''
            });
        }
    });

    renderShoppingList();
}

function renderShoppingList() {
    shoppingListContainer.innerHTML = '';

    if (shoppingList.length === 0) {
        shoppingListContainer.innerHTML = '<p>Your shopping list is empty.</p>';
        return;
    }

    const list = document.createElement('ul');

    shoppingList.forEach((item, index) => {
        const listItem = document.createElement('li');

        // טקסט הפריט
        const itemText = document.createElement('span');
        itemText.textContent = `${item.amount.toFixed(2)} ${item.unit} ${item.name}`;

        // קבוצת כפתורים
        const buttonGroup = document.createElement('div');
        buttonGroup.classList.add('button-group');

        // כפתור להגדלת הכמות
        const addButton = document.createElement('button');
        addButton.textContent = '+';
        addButton.classList.add('add-item');
        addButton.addEventListener('click', () => {
            item.amount += 0.25; // מגדיל את הכמות ב-0.25
            renderShoppingList();
        });

        // כפתור להקטנת הכמות
        const subtractButton = document.createElement('button');
        subtractButton.textContent = '-';
        subtractButton.classList.add('subtract-item');
        subtractButton.addEventListener('click', () => {
            if (item.amount > 1) { // הכמות לא יכולה לרדת מתחת ל-1
                item.amount -= 0.25;
                renderShoppingList();
            }
        });

        // כפתור למחיקת הפריט
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '🗑️';
        deleteButton.classList.add('delete-item');
        deleteButton.addEventListener('click', () => {
            shoppingList.splice(index, 1); // מסיר את הפריט מהמערך
            renderShoppingList();
        });

        // הוספת כפתורים לקבוצה
        buttonGroup.appendChild(addButton);
        buttonGroup.appendChild(subtractButton);
        buttonGroup.appendChild(deleteButton);

        // הוספת טקסט וכפתורים לפריט
        listItem.appendChild(itemText);
        listItem.appendChild(buttonGroup);

        // הוספת הפריט לרשימה
        list.appendChild(listItem);
    });

    shoppingListContainer.innerHTML = `
        <h3>Shopping List:</h3>
    `;
    shoppingListContainer.appendChild(list);

    // כפתור לניקוי כל הרשימה
    const clearButton = document.createElement('button');
    clearButton.textContent = 'Clear Shopping List';
    clearButton.id = 'clearShoppingList';
    clearButton.addEventListener('click', clearShoppingList);

    shoppingListContainer.appendChild(clearButton);
}

function clearShoppingList() {
    shoppingList = [];
    renderShoppingList();
}

// Event listener for search
buttonSearch.addEventListener('click', async () => {
    const query = inputSearch.value.trim();
    if (query) {
        const recipes = await fetchRecipes(query);
        displayRecipes(recipes);
    } else {
        listOfRecipes.innerHTML = '<p>Please enter something</p>';
    }
});

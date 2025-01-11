

export let currentRecipe = null;
export let originalServings = null;

export function setCurrentRecipe(recipe) {
    currentRecipe = recipe;
    originalServings = recipe.servings;
}

export function updateServings(newServings) {
    if (currentRecipe) {
        currentRecipe.servings = newServings;
    }
}

export function getCurrentRecipe() {
    return currentRecipe;
}

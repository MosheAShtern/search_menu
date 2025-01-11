

const API_KEY = '1be9d900c48144a8a1b17d893735b06b';

export async function fetchRecipes(query) {
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
        throw new Error('Error fetching recipes: ' + error.message);
    }
}

export async function fetchRecipeDetails(recipeId) {
    try {
        const response = await fetch(
            `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${API_KEY}`
        );
        if (!response.ok) {
            throw new Error('Failed to fetch recipe details');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error('Error fetching recipe details: ' + error.message);
    }
}

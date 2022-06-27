const mealsEl = document.querySelector('.meals');
const categoryList = document.querySelector('.categoryList');
const searchTerm = document.querySelector('.search-term');
const searchBtn = document.querySelector('.search');
const barsBtn = document.querySelector('.bars');
const sidebar = document.querySelector('.sidebar');
const sidebarClose = document.querySelector('body');
const homepage = document.querySelector('.homepage');
const popupClose = document.querySelector('.popup-close');
const popup =document.querySelector('.popup-container');
const mealInfoEl = document.querySelector('.meal-info');

getRandomMeal();
makeCategoryList();

async function getRandomMeal() {
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
    const respData = await resp.json();
    const randomMeal = respData.meals[0];
    mealsEl.innerHTML = '';
    addMeal(randomMeal, true);
}

async function getMealById(id) {
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id);

    const respData = await resp.json();
    const meal = respData.meals[0];
    return meal;
}

async function makeCategoryList() {
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/categories.php');
    const respData = await resp.json();
    const categoryArr = respData.categories;

    addCategoryList(categoryArr);
}

async function getMealByCategory(category) {
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/filter.php?c=' + category);
    const respData = await resp.json();
    const categoryArr = respData.meals;

    return categoryArr;
}

async function searchingMeal(term) {
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=' + term);
    const respData = await resp.json();
    const meals = respData.meals;

    return meals;
}

function addCategoryList(categoryData) {
    let str = '';
    categoryData.forEach((item) => {
        str += `<li data-category="${item.strCategory}">
                    <img src="${item.strCategoryThumb}" alt="${item.strCategory}">
                    <div>${item.strCategory}</div>
                </li>`
    })
    categoryList.innerHTML = str;
}



function addMeal(mealData, random = false) {
    console.log(mealData);
    const meal = document.createElement('div');
    meal.classList.add('meal');
    meal.innerHTML = `
        <div class="meal-header">
            ${random ? 
            `<span class="random">
                Random Recipe : ${mealData.strCategory}
            </span>` : ''}
            <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
            </div>
        <div class="meal-body">
            <h4>${mealData.strMeal}</h4>
            <button class="fav-btn"><i class="fa-solid fa-star"></i></button>
        </div>
    `;
    const favBtn = meal.querySelector('.meal-body .fav-btn');
    const favMeals = getFavMealLS();
    favMeals.forEach(id => {
        if(id === mealData.idMeal){
            favBtn.classList.add('active');
        }
    })
    favBtn.addEventListener('click', () => {
        if(favBtn.classList.contains('active')){
            removeFavMealLS(mealData.idMeal);
            favBtn.classList.remove('active');
        }else{
            addFavMealLS(mealData.idMeal);
            favBtn.classList.add('active');
        }
    })
    const hisBtn = meal.querySelector('.meal-header');
    hisBtn.addEventListener('click', () => {
        addHistoryMealLS(mealData.idMeal);
        showRecipe(mealData.idMeal);
    })
    mealsEl.appendChild(meal);
}




function addFavMealLS(mealId){
    const mealIds = getFavMealLS();
    localStorage.setItem('favMealIds', JSON.stringify([...mealIds, mealId]));
}

function removeFavMealLS(mealId){
    const mealIds = getFavMealLS();
    localStorage.setItem('favMealIds', JSON.stringify(mealIds.filter(id => id !== mealId)));
}

function getFavMealLS(){
    const mealIds = JSON.parse(localStorage.getItem('favMealIds'));
    return mealIds === null ? [] : mealIds;
}

async function fetchFavMeals() {
    const mealIds = getFavMealLS();
    const meals = [];

    for (let i = 0; i < mealIds.length; i++) {
        const mealId = mealIds[i];
        let meal = await getMealById(mealId);
        meals.push(meal);
    }
    meals.forEach(meal => {
        addMeal(meal);
    })
}

async function fetchHistoryMeals() {
    const mealIds = getHistoryMealLS();
    const meals = [];

    for (let i = 0; i < mealIds.length; i++) {
        const mealId = mealIds[i];
        let meal = await getMealById(mealId);
        meals.push(meal);
    }
    meals.forEach(meal => {
        addMeal(meal);
    })
}



function addHistoryMealLS(mealId){
    const mealIds = getHistoryMealLS();
    mealIds.unshift(mealId);
    const newMealIds = mealIds.filter((id, index, arr) => {
        return arr.indexOf(id) === index;
    })
    if(newMealIds.length > 10) {
        newMealIds.pop();
    }
    localStorage.setItem('historyMealIds', JSON.stringify([...newMealIds]));
}

function getHistoryMealLS(){
    const mealIds = JSON.parse(localStorage.getItem('historyMealIds'));
    return mealIds === null ? [] : mealIds;
}

async function searchMeal() {
    mealsEl.innerHTML = '';
    const search = searchTerm.value;
    const meals = await searchingMeal(search);
    if (meals) {
        meals.forEach(meal => {
            addMeal(meal);
        })
    }
}


async function showRecipe(mealId){
    const meal = await getMealById(mealId);
    let ingredients = []
    for (let i = 0; i <= 20; i++) {
        if (meal['strIngredient'+i]) {
            ingredients.push(`${meal['strIngredient'+i]} - ${meal['strMeasure'+i]}`)
        }
    }
    console.log(ingredients);
    // cleanup 
    mealInfoEl.innerHTML = '';
    const mealEl = document.createElement('div');
    mealEl.innerHTML = `
            <h2>${meal.strMeal}</h2>
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <h3>Instuctions:</h3>
            <p>
                ${meal.strInstructions}
            </p>
            <h3>Ingredients:</h3>
            <ul>
                ${ingredients.map(ing => 
                    `<li>
                    ${ing}
                    </li>`
                ).join('')}
            </ul>`
    popup.classList.remove('hidden')
    mealInfoEl.appendChild(mealEl)
}

categoryList.addEventListener('click', async (e) => {
    if (e.target.nodeName === "UL") {
        return;
    }
    mealsEl.innerHTML = '';
    const category = e.target.closest('li').dataset.category
    const meals = await getMealByCategory(category);
    meals.forEach(meal => {
        console.log(meal);
        addMeal(meal);
    })
})

searchBtn.addEventListener('click', searchMeal);

sidebarClose.addEventListener('click', () => {
    if (sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
    }
})

barsBtn.addEventListener('click', () => {
    setTimeout(() => {
        sidebar.classList.add('active');
    }, 0);
})

sidebar.addEventListener('click', (e) => {
    mealsEl.innerHTML = '';
    const userClick = e.target.textContent;
    if (userClick === "Favorite") {
        fetchFavMeals();
    } else if (userClick === "History"){
        fetchHistoryMeals();
    }
})

homepage.addEventListener('click', getRandomMeal);

popupClose.addEventListener('click', () => {
    popup.classList.add('hidden');
})

// 優化鍵盤
searchTerm.addEventListener('keypress', (e) => {
    if(e.key === "Enter"){
        searchMeal();
    }
})
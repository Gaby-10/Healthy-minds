import { useState } from "react";
import FoodSearch from "./FoodSearch";
import MealCard from "./MealCard";
import { saveDailyLog } from "../utils/SaveDailyLog";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const FOOD_DB = [
  { id: "banana", name: "Banana", calories: 105, protein: 7 },
  { id: "apple", name: "Apple", calories: 95, protein: 5 },
  { id: "milk", name: "Milk", calories: 100, protein: 5 },
  { id: "oats", name: "Oats", calories: 125, protein: 10 },
];

function CalorieTracker() {

  const {user} = useAuth();

  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [proteinGoal, setProteinGoal] = useState(100);
  const [currentMeal, setCurrentMeal] = useState("breakfast");

  const [meals, setMeals] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
    other: [],
  });


  useEffect(()=> {
    if(!user) return;

    saveDailyLog(user.uid, {
      meals,
      calorieGoal,
      proteinGoal,
    });
  }, [meals, calorieGoal, proteinGoal, user]);
  /* ---------------- ADD MEAL ---------------- */

 const addMealFromSearch = (food) => {
  setMeals((prev) => ({
    ...prev,
    [currentMeal]: [
      ...prev[currentMeal],
      { foodId: food.id, servings: 1, food },
    ],
  }));
};

  /* ---------------- INCREASE ---------------- */

  const increaseServings = (mealType, foodId) => {
    setMeals((prev) => {
      if (!prev[mealType]) return prev;

      return {
        ...prev,
        [mealType]: prev[mealType].map((meal) =>
          meal.foodId === foodId
            ? { ...meal, servings: meal.servings + 1 }
            : meal,
        ),
      };
    });
  };

  /* ---------------- DECREASE ---------------- */

  const decreaseServings = (mealType, foodId) => {
    setMeals((prev) => {
      if (!prev[mealType]) return prev;
      return {
        ...prev,
        [mealType]: prev[mealType]
          .map((meal) =>
            meal.foodId === foodId
              ? { ...meal, servings: meal.servings - 1 }
              : meal,
          )
          .filter((meal) => meal.servings > 0),
      };
    });
  };

  /* ---------------- TOTAL ---------------- */

  const totalCalories = Object.values(meals)
  .flat()
  .reduce((sum, meal) => {
    return sum + meal.food.calories * meal.servings;
  }, 0);

  const totalProtein = Object.values(meals)
     .flat()
  .reduce((sum, meal) => {
    return sum + meal.food.protein * meal.servings;
  }, 0);

  /* PROGRESS BAR */

  const caloriePercent = Math.min(
    (totalCalories / calorieGoal) * 100,
     100
    );

  const proteinPercent = Math.min(
    (totalProtein / proteinGoal) * 100,
     100
    );

  return (
    <div className="tracker-container">
      {/* HEADER */}
      <div className="tracker-header">
        <h1 className="tracker-title">Diet Tracker</h1>
      </div>

      {/* ADD MEALS */}
      <div className="add-meals-box">
        <h2>Add meals</h2>

        <div className="track-calandpro">
          <label>Calorie goal</label>
          <input
            type="number"
            value={calorieGoal}
            onChange={(e) => setCalorieGoal(Number(e.target.value))}
          />

          <label>Protein goal </label>
          <input
            type="number"
            value={proteinGoal}
            onChange={(e) => setProteinGoal(Number(e.target.value))}
          />
        </div>
        
        <div className="progress-section">
          {/* CALORIES */}

          <div className="progress-item">
            <div className="progress-label">
              Calories: {totalCalories} / {calorieGoal} kcal
            </div>

            <div className="progress-bar">
              <div className="progress-fill calorie" 
              style={{width: `${caloriePercent}%`}}
              /> 
            </div>
          </div>

           {/* PROTEIN*/}

           <div className="progress-item">
             <div className="progress-label">
              Protein: {totalProtein} / {proteinGoal} g
             </div>

             <div className="progress-bar">
              <div className="progress-fill protein" style={{width: `${proteinPercent}%`}}>
                  </div>
             </div>
           </div>
        </div>



        <div className="meal-select">
          <label>Meal type :</label>
          <select
            value={currentMeal}
            onChange={(e) => setCurrentMeal(e.target.value)}
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="other">Other</option>
          </select>
        </div>

        <FoodSearch
          foodsData={FOOD_DB}
          meals={meals}
          currentMeal={currentMeal}
          onAdd={addMealFromSearch}
          onIncrease={increaseServings}
          onDecrease={decreaseServings}
        />
      </div>

      {/* MEALS GRID */}
      <div className="meals-grid">
        <MealCard
          title="Breakfast"
          mealType="breakfast"
          mealItems={meals.breakfast}
          foods={FOOD_DB}
          onIncrease={increaseServings}
          onDecrease={decreaseServings}
        />
        <MealCard
          title="Lunch"
          mealType="lunch"
          mealItems={meals.lunch}
          foods={FOOD_DB}
          onIncrease={increaseServings}
          onDecrease={decreaseServings}
        />
        <MealCard
          title="Dinner"
          mealType="dinner"
          mealItems={meals.dinner}
          foods={FOOD_DB}
          onIncrease={increaseServings}
          onDecrease={decreaseServings}
        />
        <MealCard
          title="Other"
          mealType="other"
          mealItems={meals.other}
          foods={FOOD_DB}
          onIncrease={increaseServings}
          onDecrease={decreaseServings}
        />
      </div>
    </div>
  );
}

export default CalorieTracker;

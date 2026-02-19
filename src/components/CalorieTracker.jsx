import { useState, useEffect } from "react";
import FoodSearch from "./FoodSearch";
import MealCard from "./MealCard";
import { saveDailyLog } from "../utils/SaveDailyLog";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc } from "firebase/firestore"; // Add this import
import { db } from "../firebase/firebase"; // Add this import

const FOOD_DB = [
  { id: "banana", name: "Banana", calories: 105, protein: 7 },
  { id: "apple", name: "Apple", calories: 95, protein: 5 },
  { id: "milk", name: "Milk", calories: 100, protein: 5 },
  { id: "oats", name: "Oats", calories: 125, protein: 10 },
];

function CalorieTracker() {
  const { user } = useAuth();

  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [proteinGoal, setProteinGoal] = useState(100);
  const [currentMeal, setCurrentMeal] = useState("breakfast");
  const [loading, setLoading] = useState(true); // Add loading state

  const [meals, setMeals] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
    other: [],
  });

  // 🔥 FIX: Load meals from Firebase when component mounts
  useEffect(() => {
    if (!user) return;

    async function loadTodayMeals() {
      try {
        const today = new Date().toISOString().split('T')[0];
        const logRef = doc(db, "dailyLogs", user.uid, "logs", today);
        const logSnap = await getDoc(logRef);
        
        if (logSnap.exists()) {
          const data = logSnap.data();
          console.log("📥 Loading saved meals from Firebase:", data.meals);
          setMeals(data.meals || {
            breakfast: [],
            lunch: [],
            dinner: [],
            other: [],
          });
          setCalorieGoal(data.calorieGoal || 2000);
          setProteinGoal(data.proteinGoal || 100);
        } else {
          console.log("📥 No saved meals found, using empty state");
        }
      } catch (error) {
        console.error("Error loading meals:", error);
      } finally {
        setLoading(false);
      }
    }

    loadTodayMeals();
  }, [user]); // Only run when user changes

  // Save meals whenever they change
  useEffect(() => {
    if (!user || loading) return; // Don't save while loading

    console.log("💾 Saving daily log for user:", user.uid);
    saveDailyLog(user.uid, {
      meals,
      calorieGoal,
      proteinGoal,
    });
  }, [meals, calorieGoal, proteinGoal, user, loading]);

  const addMealFromSearch = (food) => {
    console.log("➕ Adding meal:", food.name);
    setMeals((prev) => ({
      ...prev,
      [currentMeal]: [
        ...prev[currentMeal],
        { foodId: food.id, servings: 1, food },
      ],
    }));
  };

  const increaseServings = (mealType, foodId) => {
    setMeals((prev) => {
      if (!prev[mealType]) return prev;
      return {
        ...prev,
        [mealType]: prev[mealType].map((meal) =>
          meal.foodId === foodId
            ? { ...meal, servings: meal.servings + 1 }
            : meal
        ),
      };
    });
  };

  const decreaseServings = (mealType, foodId) => {
    setMeals((prev) => {
      if (!prev[mealType]) return prev;
      return {
        ...prev,
        [mealType]: prev[mealType]
          .map((meal) =>
            meal.foodId === foodId
              ? { ...meal, servings: meal.servings - 1 }
              : meal
          )
          .filter((meal) => meal.servings > 0),
      };
    });
  };

  const totalCalories = Object.values(meals)
    .flat()
    .reduce((sum, meal) => sum + meal.food.calories * meal.servings, 0);

  const totalProtein = Object.values(meals)
    .flat()
    .reduce((sum, meal) => sum + meal.food.protein * meal.servings, 0);

  const caloriePercent = Math.min((totalCalories / calorieGoal) * 100, 100);
  const proteinPercent = Math.min((totalProtein / proteinGoal) * 100, 100);

  if (loading) {
    return <div className="tracker-container">Loading your meals...</div>;
  }

  return (
    <div className="tracker-container">
      <div className="tracker-header">
        <h1 className="tracker-title">Diet Tracker</h1>
      </div>

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
          <div className="progress-item">
            <div className="progress-label">
              Calories: {totalCalories} / {calorieGoal} kcal
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill calorie"
                style={{ width: `${caloriePercent}%` }}
              />
            </div>
          </div>

          <div className="progress-item">
            <div className="progress-label">
              Protein: {totalProtein} / {proteinGoal} g
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill protein"
                style={{ width: `${proteinPercent}%` }}
              />
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
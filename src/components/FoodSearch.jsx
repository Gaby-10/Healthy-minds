import { useState } from "react";
import "../styles/foodSearch.css";
import { searchFood } from "../api/foodApi";

function FoodSearch({ meals, currentMeal, onAdd, onIncrease, onDecrease }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Check if food already exists in current meal
  const getMealForFood = (foodId) => {
    return meals[currentMeal]?.find((m) => m.foodId === foodId);
  };

  const handleSearch = async (value) => {
    setQuery(value);

    if (value.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);

    try {
      const apiFoods = await searchFood(value);

      const normalizedFoods = apiFoods.map((food) => {
        const calories = food.foodNutrients.find(
          (n) => n.nutrientName === "Energy"
        )?.value || 0;

        const protein = food.foodNutrients.find(
          (n) => n.nutrientName === "Protein"
        )?.value || 0;

        return {
          id: food.fdcId,
          name: food.description,
          calories: Math.round(calories),
          protein: Math.round(protein),
          image: "/foods/default.png",
        };
      });

      setResults(normalizedFoods);
    } catch (err) {
      console.error("USDA search error:", err);
    }

    setLoading(false);
  };

  return (
    <div className="food-search">
      <div className="flex-search">
        <label>Search food :</label>
        <input
          type="text"
          placeholder="Search food (e.g. banana)"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {loading && <p style={{ color: "gray" }}>Searching…</p>}

      {results.map((food) => {
        const meal = getMealForFood(food.id);

        return (
          <div
            key={food.id}
            className="search-item"
            onClick={() => {
              if (meal) {
                onIncrease(currentMeal, food.id);
              } else {
                onAdd(food);
              }
            }}
          >
            <div className="search-item-left">
              <img src={food.image} alt={food.name} />
              <div>
                <div className="search-item-name">{food.name}</div>
                <div className="search-item-calories">
                  {food.calories} kcal · {food.protein} g protein
                </div>
              </div>
            </div>

            <div
              className="search-controls"
              onClick={(e) => e.stopPropagation()}
            >
              {meal ? (
                <>
                  <button
                    onClick={() =>
                      onDecrease(currentMeal, food.id)
                    }
                  >
                    −
                  </button>
                  <span>{meal.servings}</span>
                  <button onClick={()=> {
                    if(meal) {
                      onIncrease(currentMeal, food.id);

                    }else {
                      onAdd(food);
                    }
        
                  }}>
                    +
                  </button>
                </>
              ) : (
                <button>+</button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default FoodSearch;

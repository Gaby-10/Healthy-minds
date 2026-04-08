import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import CustomFoodManager from "./CustomFoodManager";
import "../styles/foodSearch.css";

function FoodSearch({ foodsData, meals, currentMeal, onAdd, onIncrease, onDecrease }) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [customFoods, setCustomFoods] = useState([]);
  const [showCustomManager, setShowCustomManager] = useState(false);

  // Load custom foods
  useEffect(() => {
    if (user) {
      loadCustomFoods();
    }
  }, [user]);

  const loadCustomFoods = async () => {
    try {
      const foodsRef = collection(db, "users", user.uid, "customFoods");
      const snapshot = await getDocs(foodsRef);
      const foods = snapshot.docs.map(doc => ({
        id: `custom_${doc.id}`,
        name: doc.data().name,
        calories: doc.data().calories,
        protein: doc.data().protein,
        isFavorite: doc.data().isFavorite || false,
        isCustom: true
      }));
      setCustomFoods(foods);
    } catch (error) {
      console.error("Error loading custom foods:", error);
    }
  };

  // Search function
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    
    // Search in API foods
    const apiResults = foodsData.filter(food => 
      food.name.toLowerCase().includes(term)
    ).map(food => ({ ...food, isCustom: false }));

    // Search in custom foods
    const customResults = customFoods.filter(food => 
      food.name.toLowerCase().includes(term)
    ).map(food => ({ ...food, isCustom: true }));

    // Combine results (custom foods first)
    setSearchResults([...customResults, ...apiResults]);
  };

  const handleAddCustomToMeal = (food) => {
    onAdd(food);
  };

  return (
    <div className="food-search">
      <div className="search-header">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search food (e.g., banana)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
        <button 
          className="manage-custom-btn"
          onClick={() => setShowCustomManager(!showCustomManager)}
        >
          {showCustomManager ? "Hide Custom Foods" : "📝 My Custom Foods"}
        </button>
      </div>

      {/* Custom Food Manager */}
      {showCustomManager && (
        <CustomFoodManager onAddToMeal={handleAddCustomToMeal} />
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="search-results">
          <h4>Search Results:</h4>
          <div className="results-list">
            {searchResults.map((food) => (
              <div key={food.id} className="result-item">
                <div className="result-info">
                  <span className="food-name">
                    {food.isCustom && "🏠 "}{food.name}
                    {food.isFavorite && " ⭐"}
                  </span>
                  <span className="food-nutrition">
                    {food.calories} kcal | {food.protein}g protein
                  </span>
                </div>
                <button 
                  className="add-btn"
                  onClick={() => onAdd(food)}
                >
                  Add to {currentMeal}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Meal Items */}
      <div className="current-meal-items">
        <h4>Current {currentMeal}:</h4>
        {meals[currentMeal]?.length === 0 ? (
          <p className="no-items">No items added yet</p>
        ) : (
          <div className="meal-items-list">
            {meals[currentMeal].map((item, index) => (
              <div key={index} className="meal-item-row">
                <span className="item-name">
                  {item.food?.name}
                  {item.food?.isCustom && " 🏠"}
                </span>
                <span className="item-nutrition">
                  {item.food?.calories * item.servings} cal | {item.food?.protein * item.servings}g
                </span>
                <div className="item-controls">
                  <button onClick={() => onDecrease(currentMeal, item.foodId)}>-</button>
                  <span>{item.servings}</span>
                  <button onClick={() => onIncrease(currentMeal, item.foodId)}>+</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FoodSearch;
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import "../styles/CustomFoodManager.css";

function CustomFoodManager({ onAddToMeal }) {
  const { user } = useAuth();
  const [customFoods, setCustomFoods] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  
  // Form state
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load custom foods on mount
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
        id: doc.id,
        ...doc.data()
      }));
      setCustomFoods(foods);
    } catch (error) {
      console.error("Error loading custom foods:", error);
    }
  };

  const resetForm = () => {
    setFoodName("");
    setCalories("");
    setProtein("");
    setIsFavorite(false);
    setEditingFood(null);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!foodName || !calories || !protein) {
      setError("Please fill all fields");
      return;
    }

    if (isNaN(calories) || isNaN(protein) || calories <= 0 || protein <= 0) {
      setError("Calories and protein must be positive numbers");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const foodData = {
        name: foodName,
        calories: Number(calories),
        protein: Number(protein),
        isFavorite,
        updatedAt: new Date().toISOString()
      };

      if (editingFood) {
        // Update existing food
        const foodRef = doc(db, "users", user.uid, "customFoods", editingFood.id);
        await updateDoc(foodRef, foodData);
      } else {
        // Add new food
        const foodsRef = collection(db, "users", user.uid, "customFoods");
        await addDoc(foodsRef, {
          ...foodData,
          createdAt: new Date().toISOString()
        });
      }

      resetForm();
      setShowForm(false);
      loadCustomFoods(); // Reload list
    } catch (error) {
      setError("Failed to save food: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (foodId) => {
    if (!window.confirm("Delete this food?")) return;
    
    try {
      const foodRef = doc(db, "users", user.uid, "customFoods", foodId);
      await deleteDoc(foodRef);
      loadCustomFoods(); // Reload list
    } catch (error) {
      alert("Failed to delete: " + error.message);
    }
  };

  const handleEdit = (food) => {
    setEditingFood(food);
    setFoodName(food.name);
    setCalories(food.calories);
    setProtein(food.protein);
    setIsFavorite(food.isFavorite || false);
    setShowForm(true);
  };

  const handleAddToMeal = (food) => {
    // Convert custom food to format expected by CalorieTracker
    const mealFood = {
      id: `custom_${food.id}`,
      name: food.name,
      calories: food.calories,
      protein: food.protein
    };
    onAddToMeal(mealFood);
  };

  return (
    <div className="custom-food-container">
      <div className="custom-food-header">
        <h3>🏠 My Custom Foods</h3>
        <button 
          className="add-custom-btn"
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
        >
          {showForm ? "Cancel" : "+ Add Custom Food"}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="custom-food-form">
          <h4>{editingFood ? "Edit Food" : "Add New Food"}</h4>
          
          <div className="form-group">
            <label>Food Name:</label>
            <input
              type="text"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              placeholder="e.g., Homemade Egg"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Calories:</label>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="155"
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label>Protein (g):</label>
              <input
                type="number"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="13"
                min="1"
                required
              />
            </div>
          </div>

          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={isFavorite}
                onChange={(e) => setIsFavorite(e.target.checked)}
              />
              ⭐ Add to favorites
            </label>
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? "Saving..." : (editingFood ? "Update Food" : "Save Food")}
            </button>
            <button type="button" onClick={resetForm}>
              Reset
            </button>
          </div>
        </form>
      )}

      {/* Custom Foods List */}
      <div className="custom-foods-list">
        {customFoods.length === 0 ? (
          <p className="no-foods">No custom foods yet. Add your first one!</p>
        ) : (
          <>
            {/* Favorites First */}
            {customFoods.filter(f => f.isFavorite).map(food => (
              <div key={food.id} className="custom-food-item favorite">
                <div className="food-info">
                  <span className="food-name">⭐ {food.name}</span>
                  <span className="food-details">
                    {food.calories} cal | {food.protein}g protein
                  </span>
                </div>
                <div className="food-actions">
                  <button onClick={() => handleAddToMeal(food)} title="Add to meal">
                    ➕
                  </button>
                  <button onClick={() => handleEdit(food)} title="Edit">
                    ✏️
                  </button>
                  <button onClick={() => handleDelete(food.id)} title="Delete">
                    🗑️
                  </button>
                </div>
              </div>
            ))}

            {/* Other Foods */}
            {customFoods.filter(f => !f.isFavorite).map(food => (
              <div key={food.id} className="custom-food-item">
                <div className="food-info">
                  <span className="food-name">{food.name}</span>
                  <span className="food-details">
                    {food.calories} cal | {food.protein}g protein
                  </span>
                </div>
                <div className="food-actions">
                  <button onClick={() => handleAddToMeal(food)} title="Add to meal">
                    ➕
                  </button>
                  <button onClick={() => handleEdit(food)} title="Edit">
                    ✏️
                  </button>
                  <button onClick={() => handleDelete(food.id)} title="Delete">
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default CustomFoodManager;
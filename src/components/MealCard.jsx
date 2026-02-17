function MealCard({
  title,
  mealType,
  mealItems,
  onIncrease,
  onDecrease,
}) {
  // Total calories for this meal
  const totalCalories = mealItems.reduce((sum, meal) => {
    return sum + meal.food.calories * meal.servings;
  }, 0);

  // Total protein for this meal
  const totalProtein = mealItems.reduce((sum, meal) => {
    return sum + meal.food.protein * meal.servings;
  }, 0);

  return (
    <div className="meal-card">
      <h3>{title}</h3>

      {mealItems.length === 0 && <p>No food added</p>}

      {mealItems.map((meal) => (
        <div key={meal.foodId} className="meal-item">
          <div>
            <strong>{meal.food.name}</strong>

            <div className="meal-sub">
              {meal.food.calories * meal.servings} kcal
            </div>

            <div className="meal-sub">
              {meal.food.protein * meal.servings} g protein
            </div>
          </div>

          <div className="meal-controls">
            <button
              onClick={() => onDecrease(mealType, meal.foodId)}
            >
              −
            </button>

            <span>{meal.servings}</span>

            <button
              onClick={() => onIncrease(mealType, meal.foodId)}
            >
              +
            </button>
          </div>
        </div>
      ))}

      <div className="meal-total">
        <div>Total kcal: {totalCalories}</div>
        <div>Total protein: {totalProtein} g</div>
      </div>
    </div>
  );
}

export default MealCard;

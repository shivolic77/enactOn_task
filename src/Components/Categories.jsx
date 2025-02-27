import React, { useEffect, useState } from "react";
import { fetchCategories } from "../api";
import { toast } from "react-toastify";

const Categories = ({ className, category, setCategory }) => {
  // State to store fetched category data
  const [data, setData] = useState([]);

  // State to track the currently selected category
  const [selectedCategory, setSelectedCategory] = useState(category);

  // Update selectedCategory when the parent category prop changes
  useEffect(() => {
    setSelectedCategory(category);
  }, [category]);

  // Fetch categories from API when the component mounts
  useEffect(() => {
    const getCategoriesData = async () => {
      try {
        const categories = await fetchCategories(); // Fetch data from API
        setData(categories.data); // Store fetched data in state
      } catch (error) {
        // Display an error message if fetching fails
        toast.error(
          error?.response?.message ||
            error?.message ||
            "Failed to fetch categories. Please try again!"
        );
        console.error("Error fetching categories:", error);
      }
    };
    getCategoriesData();
  }, []);

  // Handle category selection
  const handleCategoryClick = (id) => {
    // Toggle category selection: If already selected, deselect it; otherwise, select it
    setSelectedCategory((prev) => (prev !== null && prev === id ? null : id));
    setCategory((prev) => (prev !== null && prev === id ? null : id));
  };

  return (
    <div className={`${className} overflow-y-auto max-h-[100vh] my-6 p-4`}>
      {/* Section title */}
      <span className="mx-3 font-bold text-lg">Store Categories</span>

      {/* Category list container */}
      <div className="mt-3 rounded-lg p-4 flex flex-col gap-3 bg-gray-100 shadow-md">
        {data.map((obj) => (
          <span
            key={obj?.id}
            onClick={() => handleCategoryClick(obj?.id)}
            className={`cursor-pointer p-2 rounded-md text-sm md:text-base transition-all duration-300 text-center
              ${
                selectedCategory == obj?.id
                  ? "!bg-blue-500 text-white font-semibold border-2 border-blue-700" // Selected category styling
                  : "bg-white text-gray-700 hover:bg-gray-200 border border-gray-300" // Default styling
              }`}
          >
            {obj?.name}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Categories;

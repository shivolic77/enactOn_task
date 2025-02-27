import React, { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { fetchStores } from "../api";
import { useLocation, useNavigate } from "react-router-dom";

const AllStores = ({ className = "", setCategory, category }) => {
  // Component state to manage store data, filters, and pagination
  const [state, setState] = useState({
    data: [],
    likedStores: [],
    hasMore: true,
    page: 1,
    searchQuery: "",
    status: "",
    alphabetOrder: "",
    isCashbackEnabled: false,
    isPromoted: false,
    isSharable: false,
    sortBy: "",
  });

  const location = useLocation();
  const navigate = useNavigate();
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  // Sync category changes with URL query params
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);

    if (category) {
      queryParams.set("cats", category);
    } else {
      queryParams.delete("cats");
    }
    navigate({ search: queryParams.toString() });
  }, [category]);

  // Update component state based on URL parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    setCategory(queryParams.get("cats") || "");

    setState((prevState) => ({
      ...prevState,
      status: queryParams.get("status") || "",
      alphabetOrder: queryParams.get("name_like") || "",
      isCashbackEnabled: queryParams.get("isCashbackEnabled") == "1",
      isPromoted: queryParams.get("isPromoted") == "1",
      isSharable: queryParams.get("isSharable") == "1",
      sortBy: queryParams.get("_sort") || "",
    }));
  }, [location.search]);

  // Fetch stores based on filters and pagination
  const fetchStoresData = async (currentPage = 1, query = "") => {
    const queryParams = new URLSearchParams(location.search);
    const queryParamsObj = {};

    queryParams.forEach((value, key) => {
      if (key === "isCashbackEnabled") {
        queryParamsObj["cashback_enabled"] = value;
      } else if (key === "isPromoted") {
        queryParamsObj["is_promoted"] = value;
      } else if (key === "isSharable") {
        queryParamsObj["is_sharable"] = value;
      } else {
        queryParamsObj[key] = key === "name_like" ? `^${value}` : value;
      }
    });

    try {
      const response = await fetchStores(currentPage, query, queryParamsObj);
      const newStores = response?.data || [];

      setState((prevState) => ({
        ...prevState,
        data: currentPage === 1 ? newStores : [...prevState.data, ...newStores],
        hasMore: newStores.length > 0,
      }));
    } catch (err) {
      console.log(err);
    }
  };

  // Re-fetch stores when search query or filters change
  useEffect(() => {
    setState((prevState) => ({ ...prevState, page: 1 }));
    fetchStoresData(1, state.searchQuery);
  }, [state.searchQuery, location.search]);

  // Handle checkbox filter changes
  const handleCheckboxChange = (event, key) => {
    const isChecked = event.target.checked;
    const queryParams = new URLSearchParams(location.search);

    if (isChecked) {
      queryParams.set(key, 1);
    } else {
      queryParams.delete(key);
    }

    setState((prevState) => ({ ...prevState, [key]: isChecked }));
    navigate({ search: queryParams.toString() });
  };

  // Handle sorting selection
  const handleSortChange = (event) => {
    const newSortBy = event.target.value;
    const queryParams = new URLSearchParams(location.search);

    if (newSortBy) {
      queryParams.set("_sort", newSortBy);
    } else {
      queryParams.delete("_sort");
    }

    setState((prevState) => ({ ...prevState, sortBy: newSortBy }));
    navigate({ search: queryParams.toString() });
  };

  // Handle alphabet filter selection
  const handleAlphabetOrderChange = (letter) => {
    const queryParams = new URLSearchParams(location.search);
    const newAlphabetOrder = letter !== state.alphabetOrder ? letter : "";

    if (newAlphabetOrder) {
      queryParams.set("name_like", newAlphabetOrder);
    } else {
      queryParams.delete("name_like");
    }

    setState((prevState) => ({
      ...prevState,
      alphabetOrder: newAlphabetOrder,
    }));
    navigate({ search: queryParams.toString() });
  };

  // Load more stores on infinite scroll
  const fetchMoreData = () => {
    const nextPage = state.page + 1;
    setState((prevState) => ({ ...prevState, page: nextPage }));
    fetchStoresData(nextPage, state.searchQuery);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setState({
      ...state,
      searchQuery: e.target.value,
      page: 1,
      hasMore: true,
      data: [],
    });
  };

  // Toggle store like functionality
  const toggleLike = (e, storeId) => {
    e.stopPropagation();
    const updatedLikedStores = state.likedStores.includes(storeId)
      ? state.likedStores.filter((id) => id !== storeId)
      : [...state.likedStores, storeId];

    setState((prevState) => ({
      ...prevState,
      likedStores: updatedLikedStores,
    }));
    localStorage.setItem("likedStores", JSON.stringify(updatedLikedStores));
  };

  // Load liked stores from local storage
  useEffect(() => {
    const storedLikes = JSON.parse(localStorage.getItem("likedStores")) || [];
    setState((prevState) => ({ ...prevState, likedStores: storedLikes }));
  }, []);

  return (
    <div className={`${className} my-[50px] p-4`}>
      {/* Search & Filters */}
      <div className="flex justify-between gap-5">
        {/* Status dropdown and search input */}
        <div className="flex gap-5">
          <select
            className="h-8 rounded-lg px-2"
            onChange={(e) => {
              const statusValue = e.target.value;
              const queryParams = new URLSearchParams(location.search);

              if (statusValue === "") {
                queryParams.delete("status");
              } else {
                queryParams.set("status", statusValue);
              }

              navigate({ search: queryParams.toString() });
            }}
            value={state.status}
          >
            <option value="">All Status</option>
            <option value="publish">Active</option>
            <option value="draft">Coming Soon</option>
            <option value="trash">Discontinued</option>
          </select>

          {/* Store search input */}
          <input
            type="text"
            placeholder="Search stores by name..."
            value={state.searchQuery}
            onChange={handleSearchChange}
            className="w-full max-w-md px-4 py-2 h-8 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
          />
        </div>

        {/* Sorting dropdown */}
        <select
          onChange={handleSortChange}
          className="h-8 rounded-lg px-2"
          value={state.sortBy}
        >
          <option value="">Sort by</option>
          <option value="name">Name</option>
          <option value="featured">Featured</option>
          <option value="clicks">Popularity</option>
          <option value="cashback">Cashback</option>
        </select>
      </div>

      {/* Alphabetical Filter */}
      <div className="flex flex-wrap justify-center gap-2 my-4">
        {alphabet.map((letter) => (
          <div
            key={letter}
            className={`px-2 py-1 text-sm md:text-base cursor-pointer rounded transition-all duration-300 
        ${
          state.alphabetOrder === letter
            ? "bg-green-500 text-white"
            : "bg-[#61fb] text-black"
        }
      `}
            onClick={() => handleAlphabetOrderChange(letter)}
          >
            {letter}
          </div>
        ))}
      </div>

      {/* Checkbox Filters */}
      <div className="flex flex-wrap gap-4 my-5">
        {[
          { label: "Cashback Enabled", key: "isCashbackEnabled" },
          { label: "Promoted", key: "isPromoted" },
          { label: "Share & Earn", key: "isSharable" },
        ].map(({ label, key }) => (
          <label
            key={key}
            className="flex items-center space-x-2 cursor-pointer text-gray-700"
          >
            <input
              type="checkbox"
              checked={state[key]}
              onChange={(e) => handleCheckboxChange(e, key)}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="font-medium">{label}</span>
          </label>
        ))}
      </div>

      {/* Infinite Scroll Store Listing */}
      <InfiniteScroll
        dataLength={state.data.length}
        next={fetchMoreData}
        hasMore={state.hasMore}
        height="70vh"
        loader={
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-blue-500"></div>
            <span className="ml-2 text-lg font-semibold text-blue-600">
              Loading more stores...
            </span>
          </div>
        }
        endMessage={
          <div className="text-center text-gray-500 font-semibold mt-4">
            🎉 You have seen all the stores.
          </div>
        }
      >
        <div className="flex flex-wrap gap-6 justify-center">
          {state?.data.map((obj, index) => (
            <div
              key={index}
              onClick={() => window.open(obj.homepage, "_blank")}
              className="w-52 h-64 rounded-3xl cursor-pointer bg-white p-4 shadow-lg flex flex-col justify-between transition-transform transform hover:scale-105 hover:shadow-2xl border border-gray-200"
            >
              {/* Like Button */}
              <div className="flex justify-end">
                <button
                  onClick={(e) => toggleLike(e, obj.id)}
                  className={`p-2 rounded-full transition-all ${
                    state?.likedStores.includes(obj.id)
                      ? "bg-red-500 text-white"
                      : "bg-gray-300 text-gray-700 hover:bg-red-400 hover:text-white"
                  }`}
                >
                  ❤️
                </button>
              </div>

              {/* Store Logo */}
              <div className="flex justify-center">
                <img
                  src={obj.logo}
                  alt={obj.name}
                  className="w-24 h-24 object-contain rounded-full bg-gray-100 p-2 shadow-md"
                />
              </div>

              {/* Store Name */}
              <div className="text-lg font-semibold mt-3 text-center text-gray-800 truncate">
                {obj.name}
              </div>

              {/* Cashback Info */}
              <div
                className={`text-sm font-semibold mt-1 text-center px-2 py-1 rounded-lg ${
                  obj?.cashback_enabled
                    ? "bg-green-500 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                {!obj?.cashback_enabled ? (
                  "No cashback available"
                ) : (
                  <>
                    {obj?.rate_type}{" "}
                    {obj?.amount_type === "fixed"
                      ? `$${parseFloat(obj?.cashback_amount || 0).toFixed(
                          2
                        )} Cashback`
                      : obj?.amount_type === "percent"
                      ? `${parseFloat(obj?.cashback_amount || 0).toFixed(
                          2
                        )}% Cashback`
                      : "Invalid cashback data"}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>{" "}
      </InfiniteScroll>
    </div>
  );
};

export default AllStores;

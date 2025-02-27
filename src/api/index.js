import axios from "axios";

const API_URL = "http://localhost:3001";

export const fetchStores = async (currentPage, query, queryParamsObj) => {
  try {
    const { status, data } = await axios.get(`${API_URL}/stores`, {
      params: { _page: currentPage, name_like: query, ...queryParamsObj },
    });

    return {
      status,
      success: true,
      data: data || [],
      message: data?.message || "Fetched successfully",
    };
  } catch ({ response }) {
    return {
      status: response?.status || 500,
      success: false,
      data: [],
      message: response?.data?.message || "An error occurred",
    };
  }
};

export const fetchCategories = async () => {
  try {
    const { status, data } = await axios.get(API_URL + "/categories");
    return {
      status,
      success: true,
      data: data || [],
      message: data?.message || "Fetched successfully",
    };
  } catch ({ response }) {
    return {
      status: response?.status || 500,
      success: false,
      data: [],
      message: response?.data?.message || "An error occurred",
    };
  }
};
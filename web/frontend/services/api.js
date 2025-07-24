// frontend/services/api.js
import { useAppBridge } from "@shopify/app-bridge-react";
import { getSessionToken } from "@shopify/app-bridge-utils";

const createSliderAPI = (app) => {
  const baseURL = "/api/sliders";

  const request = async (endpoint, options = {}) => {
    const url = `${baseURL}${endpoint}`;
    const sessionToken = await getSessionToken(app);

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionToken}`,
          ...options.headers,
        },
        ...options,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
      alert("its unser services api response" + response)
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Request failed");
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${error.message}`);
      throw error;
    }
  };

  return {
    getAllSliders: () => request(""),
    getSliderById: (id) => request(`/${id}`),
    createSlider: (data) => request("", { method: "POST", body: data }),
    updateSlider: (id, data) => request(`/${id}`, { method: "PUT", body: data }),
    deleteSlider: (id) => request(`/${id}`, { method: "DELETE" }),
    addSlide: (sliderId, data) => request(`/${sliderId}/slides`, { method: "POST", body: data }),
    updateSlide: (slideId, data) => request(`/slides/${slideId}`, { method: "PUT", body: data }),
    deleteSlide: (slideId) => request(`/slides/${slideId}`, { method: "DELETE" }),
  };
};

export const useSliderAPI = () => {
  const app = useAppBridge();
  return createSliderAPI(app);
};
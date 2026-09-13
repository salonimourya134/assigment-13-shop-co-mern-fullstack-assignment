const { successResponse, errorResponse } = require("../utils/response");
const reverseLocation = async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return errorResponse(res, 400, "valid latitude and longitude are required");
    }

    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("lat", lat);
    url.searchParams.set("lon", lon);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("addressdetails", "1");

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "SHOP.CO-MERN-Assignment/1.0",
      },
    });

    if (!response.ok) {
      return errorResponse(res, 502, "location service failed");
    }

    const data = await response.json();
    const address = data.address || {};
    const city = address.city || address.town || address.village || address.municipality || address.county || "";
    const state = address.state || "";
    const pincode = address.postcode || "";
    const road = address.road || "";
    const area = address.suburb || address.neighbourhood || address.locality || "";
    const house = address.house_number || "";
    const line = [house, road, area].filter(Boolean).join(", ");

    return successResponse(res, 200, "location found", {
      location: {
        latitude: lat,
        longitude: lon,
        address: line || data.display_name || "",
        locality: area,
        city,
        state,
        pincode,
        country: address.country || "India",
        display: data.display_name || [city, state, pincode].filter(Boolean).join(", "),
      },
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "failed to find current location");
  }
};

module.exports = { reverseLocation };

const DELIVERY_DAYS_BY_POSTAL_ZONE = {
  "1": 2,
  "2": 3,
  "3": 4,
  "4": 4,
  "5": 5,
  "6": 5,
  "7": 6,
  "8": 4,
  "9": 5,
};

const getDeliveryDays = (pincode) => {
  const zone = String(pincode || "").trim().charAt(0);
  return DELIVERY_DAYS_BY_POSTAL_ZONE[zone] || 5;
};

const calculateDeliveryDate = (pincode, fromDate = new Date()) => {
  const deliveryDate = new Date(fromDate);
  deliveryDate.setHours(0, 0, 0, 0);
  deliveryDate.setDate(deliveryDate.getDate() + getDeliveryDays(pincode));
  return deliveryDate;
};

module.exports = { getDeliveryDays, calculateDeliveryDate };

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

export const getDeliveryDays = (pincode) => {
    const zone = String(pincode || "").trim().charAt(0);
    return DELIVERY_DAYS_BY_POSTAL_ZONE[zone] || 5;
};

export const getDeliveryDate = (pincode, fromDate = new Date()) => {
    const date = new Date(fromDate);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + getDeliveryDays(pincode));
    return date;
};

export const formatDeliveryDate = (pincode) => {
    const date = getDeliveryDate(pincode);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

import { useCallback, useEffect, useState } from "react";
import API from "../services/api";
import "./LocationModal.scss";

const LocationModal = ({ onConfirm, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [location, setLocation] = useState(null);

    const findLocation = useCallback(() => {
        setLoading(true);
        setError("");
        if (!navigator.geolocation) {
            setLoading(false);
            setError("Current location is not supported by this browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(async ({ coords }) => {
            try {
                const { data } = await API.get("/api/location/reverse", {
                    params: { lat: coords.latitude, lon: coords.longitude },
                });
                if (!data?.success) throw new Error(data?.message || "Location not found");
                setLocation(data.location);
            } catch (err) {
                setError(err.response?.data?.message || err.message || "Unable to find location.");
            } finally {
                setLoading(false);
            }
        }, (err) => {
            setLoading(false);
            setError(err.code === 1 ? "Location permission was denied." : "Unable to find your current location.");
        }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
    }, []);

    useEffect(() => { findLocation(); }, [findLocation]);

    return (
        <div className="location-modal" role="dialog" aria-modal="true">
            <div className="location-modal__card">
                <button type="button" className="location-modal__close" onClick={onClose} aria-label="Close">×</button>
                <div className="location-modal__icon">●</div>
                <h2 className="location-modal__title">{loading ? "Finding location..." : location ? "Location found" : "Location unavailable"}</h2>
                {loading && <p className="location-modal__text">Please allow location access.</p>}
                {location && (
                    <p className="location-modal__text">{location.display || `${location.city}, ${location.state} - ${location.pincode}`}</p>
                )}
                {error && <p className="location-modal__error">{error}</p>}
                <div className="location-modal__actions">
                    {location && <button type="button" className="location-modal__confirm" onClick={() => onConfirm(location)}>CONFIRM ADDRESS</button>}
                    {error && <button type="button" className="location-modal__retry" onClick={findLocation}>TRY AGAIN</button>}
                    <button type="button" className="location-modal__cancel" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default LocationModal;

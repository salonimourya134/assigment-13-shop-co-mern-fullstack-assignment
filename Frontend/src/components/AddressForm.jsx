import { useEffect, useState } from "react";
import LocationModal from "./LocationModal";
import "./AddressForm.scss";

const emptyAddress = {
    name: "",
    phone: "",
    pincode: "",
    locality: "",
    address: "",
    city: "",
    state: "",
    landmark: "",
    alternatePhone: "",
    type: "Home",
};

const AddressForm = ({ value, onSave, onCancel, showLocation = true }) => {
    const [form, setForm] = useState({ ...emptyAddress, ...value });
    const [locationOpen, setLocationOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setForm({ ...emptyAddress, ...value });
    }, [value]);

    const change = (key, next) => setForm((prev) => ({ ...prev, [key]: next }));

    const save = async (event) => {
        event.preventDefault();
        setSaving(true);
        try {
            await onSave(form);
        } finally {
            setSaving(false);
        }
    };

    const useLocation = (location) => {
        setForm((prev) => ({
            ...prev,
            address: location.address || prev.address,
            locality: location.locality || prev.locality,
            city: location.city || prev.city,
            state: location.state || prev.state,
            pincode: location.pincode || prev.pincode,
        }));
        setLocationOpen(false);
    };

    return (
        <>
            <form className="address-form" noValidate onSubmit={save}>
                {showLocation && (
                    <button type="button" className="address-form__location" onClick={() => setLocationOpen(true)}>
                        ◎ Use my current location
                    </button>
                )}

                <div className="address-form__grid">
                    <label className="address-form__field">
                        <span className="address-form__label">Name</span>
                        <input className="address-form__input" value={form.name} onChange={(e) => change("name", e.target.value)} />
                    </label>
                    <label className="address-form__field">
                        <span className="address-form__label">10-digit mobile number</span>
                        <input className="address-form__input" value={form.phone} onChange={(e) => change("phone", e.target.value)} />
                    </label>
                    <label className="address-form__field">
                        <span className="address-form__label">Pincode</span>
                        <input className="address-form__input" value={form.pincode} onChange={(e) => change("pincode", e.target.value)} />
                    </label>
                    <label className="address-form__field">
                        <span className="address-form__label">Locality</span>
                        <input className="address-form__input" value={form.locality} onChange={(e) => change("locality", e.target.value)} />
                    </label>
                    <label className="address-form__field address-form__field--full">
                        <span className="address-form__label">Address (Area and Street)</span>
                        <textarea className="address-form__input address-form__input--area" value={form.address} onChange={(e) => change("address", e.target.value)} />
                    </label>
                    <label className="address-form__field">
                        <span className="address-form__label">City/District/Town</span>
                        <input className="address-form__input" value={form.city} onChange={(e) => change("city", e.target.value)} />
                    </label>
                    <label className="address-form__field">
                        <span className="address-form__label">State</span>
                        <input className="address-form__input" value={form.state} onChange={(e) => change("state", e.target.value)} />
                    </label>
                    <label className="address-form__field">
                        <span className="address-form__label">Landmark (Optional)</span>
                        <input className="address-form__input" value={form.landmark} onChange={(e) => change("landmark", e.target.value)} />
                    </label>
                    <label className="address-form__field">
                        <span className="address-form__label">Alternate Phone (Optional)</span>
                        <input className="address-form__input" value={form.alternatePhone} onChange={(e) => change("alternatePhone", e.target.value)} />
                    </label>
                </div>

                <div className="address-form__type">
                    <span className="address-form__label">Address Type</span>
                    <div className="address-form__options">
                        <label className="address-form__radio"><input type="radio" name="address-type" checked={form.type === "Home"} onChange={() => change("type", "Home")} /><span className="element-span">Home</span></label>
                        <label className="address-form__radio"><input type="radio" name="address-type" checked={form.type === "Work"} onChange={() => change("type", "Work")} /><span className="element-span">Work</span></label>
                    </div>
                </div>

                <div className="address-form__actions">
                    <button type="submit" className="address-form__save" disabled={saving}>{saving ? "Saving..." : "SAVE"}</button>
                    <button type="button" className="address-form__cancel" onClick={onCancel}>CANCEL</button>
                </div>
            </form>

            {locationOpen && <LocationModal onConfirm={useLocation} onClose={() => setLocationOpen(false)} />}
        </>
    );
};

export default AddressForm;

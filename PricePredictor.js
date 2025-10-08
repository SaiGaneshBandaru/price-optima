import React, { useState } from "react";
import axios from "axios";
import "./PricePredictor.css";

function PricePredictor() {
  const [formData, setFormData] = useState({
    Number_of_Riders: 0,
    Number_of_Drivers: 0,
    Location_Category: "Urban",
    Customer_Loyalty_Status: "Silver",
    Number_of_Past_Rides: 0,
    Average_Ratings: 0,
    Time_of_Booking: "Morning",
    Vehicle_Type: "Standard",
    Expected_Ride_Duration: 0
  });

  const [prediction, setPrediction] = useState(null);

  const handleChange = (e) => {
    const value = e.target.type === "number" ? parseFloat(e.target.value) : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://127.0.0.1:8000/predict", formData);
      setPrediction(res.data.predicted_price);
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Error making prediction! Check console for details.");
    }
  };

  return (
    <div className="card">
      <h2>🚗 PriceOptima - Ride Price Optimizer</h2>
      <form onSubmit={handleSubmit}>

        {["Number_of_Riders", "Number_of_Drivers", "Number_of_Past_Rides", "Average_Ratings", "Expected_Ride_Duration"].map(field => (
          <div className="form-group" key={field}>
            <div className="input-heading">{field.replace(/_/g, " ")}</div>
            <input
              type={field === "Average_Ratings" ? "number" : "number"}
              step={field === "Average_Ratings" ? "0.1" : "1"}
              min="0"
              name={field}
              value={formData[field]}
              onChange={handleChange}
              required
            />
          </div>
        ))}

        {/* Dropdowns */}
        <div className="form-group">
          <div className="input-heading">Location Category</div>
          <select name="Location_Category" value={formData.Location_Category} onChange={handleChange}>
            <option value="Urban">Urban</option>
            <option value="Suburban">Suburban</option>
            <option value="Rural">Rural</option>
          </select>
        </div>

        <div className="form-group">
          <div className="input-heading">Customer Loyalty Status</div>
          <select name="Customer_Loyalty_Status" value={formData.Customer_Loyalty_Status} onChange={handleChange}>
            <option value="Bronze">Bronze</option>
            <option value="Silver">Silver</option>
            <option value="Gold">Gold</option>
            <option value="Platinum">Platinum</option>
          </select>
        </div>

        <div className="form-group">
          <div className="input-heading">Time of Booking</div>
          <select name="Time_of_Booking" value={formData.Time_of_Booking} onChange={handleChange}>
            <option value="Morning">Morning</option>
            <option value="Afternoon">Afternoon</option>
            <option value="Evening">Evening</option>
            <option value="Night">Night</option>
          </select>
        </div>

        <div className="form-group">
          <div className="input-heading">Vehicle Type</div>
          <select name="Vehicle_Type" value={formData.Vehicle_Type} onChange={handleChange}>
            <option value="Standard">Standard</option>
            <option value="Premium">Premium</option>
            <option value="Luxury">Luxury</option>
          </select>
        </div>

        <button type="submit">Predict Price</button>
      </form>

      {prediction !== null && <h3>Predicted Ride Price: ₹{prediction.toFixed(2)}</h3>}
    </div>
  );
}

export default PricePredictor;

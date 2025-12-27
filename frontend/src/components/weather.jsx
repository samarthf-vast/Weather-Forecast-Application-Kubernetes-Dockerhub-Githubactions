import { useState } from "react";
import axios from "axios";
import { MapPin, Wind, Cloud, Users, Mountain } from "lucide-react";
import "./Weather.css";

function Weather() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [cityInfo, setCityInfo] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getWeather = async () => {
    if (!city) return;

    setLoading(true);
    setError("");

    try {
      const res = await axios.get(
        `http://localhost:5000/weather/${city}`
      );

      setWeather(res.data);
      setCityInfo(res.data.cityInfo);
    } catch {
      setError("City not found");
      setWeather(null);
      setCityInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (code) => {
    if (code <= 3) return "☀️";
    if (code <= 48) return "☁️";
    if (code <= 67) return "🌧️";
    if (code <= 77) return "❄️";
    return "⛈️";
  };

 return (
  <div className="weather-container">
    {/* Animated Clouds */}
    <div className="cloud cloud1"></div>
    <div className="cloud cloud2"></div>
    <div className="cloud cloud3"></div>

    <h1 className="title">Weather Forecast App</h1>
    <p className="subtitle">Search any city in the world 🌍</p>

    {/* Search */}
    <div className="search-box">
      <input
  type="text"
  placeholder="Enter city name..."
  value={city}
  onChange={(e) => {
    setCity(e.target.value);
    if (e.target.value === "") {
      // Clear data when input is empty
      setWeather(null);
      setCityInfo(null);
      setError("");
    }
  }}
  onKeyDown={(e) => e.key === "Enter" && getWeather()}
/>

      <button onClick={getWeather} disabled={loading}>
        {loading ? "Loading..." : "Search"}
      </button>
    </div>

    {error && <p className="error">{error}</p>}

    {/* Weather Card */}
    {weather && cityInfo && (
      <div className="card fade-in">
        <h2>
          <MapPin size={18} /> {cityInfo.name}, {cityInfo.admin1}
        </h2>
        <p className="country">{cityInfo.country}</p>

        <div className="temp">
          {getWeatherIcon(weather.weathercode)} {weather.temperature}°C
        </div>

        <div className="details">
          <p><Wind size={16} /> Wind: {weather.windspeed} km/h</p>
          <p><Cloud size={16} /> Code: {weather.weathercode}</p>
        </div>

        <hr />

        <div className="info-grid">
          <div>
            <Users size={16} />
            <span>Population</span>
            <strong>{cityInfo.population.toLocaleString()}</strong>
          </div>

          <div>
            {/* Evevation : It means the height of the location above sea level, measured in meters (m). */}
            <Mountain size={16} />
            <span>Elevation</span>
            <strong>{cityInfo.elevation} m</strong>
          </div>

          <div>📍 Lat: {cityInfo.latitude}</div>
          <div>📍 Long: {cityInfo.longitude}</div>
        </div>

        <small>Updated: {weather.time}</small>
      </div>
    )}
  </div>
);

}

export default Weather;

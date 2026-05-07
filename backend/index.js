
// import express from "express";
// import axios from "axios";
// import cors from "cors";
// import connectDB from "./db.js";
// import Weather from "./models/weather.js";

// //  Prometheus client
// import client from "prom-client";

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // ===============================
// //  PROMETHEUS SETUP
// // ===============================

// // Collect default system metrics (CPU, memory, etc.)
// client.collectDefaultMetrics();

// // Custom metric: count HTTP requests
// const httpRequestCounter = new client.Counter({
//   name: "http_requests_total",
//   help: "Total number of HTTP requests",
//   labelNames: ["method", "route", "status"],
// });

// // Middleware to track all requests
// app.use((req, res, next) => {
//   res.on("finish", () => {
//     httpRequestCounter.inc({
//       method: req.method,
//       route: req.originalUrl,
//       status: res.statusCode,
//     });
//   });
//   next();
// });

// // ===============================
// //  DATABASE CONNECTION
// // ===============================
// connectDB();

// // ===============================
// //  WEATHER API ROUTE
// // ===============================
// app.get("/weather/:city", async (req, res) => {
//   try {
//     const city = req.params.city;

//     // 1️ Get latitude & longitude
//     const geoRes = await axios.get(
//       `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
//     );

//     if (!geoRes.data.results || geoRes.data.results.length === 0) {
//       return res.status(404).json({ message: "City not found" });
//     }

//     const cityInfo = geoRes.data.results[0];

//     // 2️ Get weather data
//     const weatherRes = await axios.get(
//       `https://api.open-meteo.com/v1/forecast?latitude=${cityInfo.latitude}&longitude=${cityInfo.longitude}&current_weather=true`
//     );

//     // 3️ Save to MongoDB
//     const newWeather = new Weather({
//       city: cityInfo.name,
//       country: cityInfo.country,
//       temperature: weatherRes.data.current_weather.temperature,
//       windspeed: weatherRes.data.current_weather.windspeed,
//       weathercode: weatherRes.data.current_weather.weathercode,
//       latitude: cityInfo.latitude,
//       longitude: cityInfo.longitude,
//     });

//     await newWeather.save();

//     // 4️ Send response
//     res.json({
//       city: cityInfo.name,
//       country: cityInfo.country,
//       temperature: weatherRes.data.current_weather.temperature,
//       windspeed: weatherRes.data.current_weather.windspeed,
//       weathercode: weatherRes.data.current_weather.weathercode,
//       time: weatherRes.data.current_weather.time,
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // ===============================
// // PROMETHEUS METRICS ENDPOINT
// // ===============================
// app.get("/metrics", async (req, res) => {
//   try {
//     res.set("Content-Type", client.register.contentType);
//     res.end(await client.register.metrics());
//   } catch (error) {
//     res.status(500).end(error);
//   }
// });

// // ===============================
// // START SERVER
// // ===============================
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });





import express from "express";
import axios from "axios";
import cors from "cors";
import connectDB from "./db.js";
import Weather from "./models/weather.js";
import client from "prom-client";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ===============================
//  PROMETHEUS SETUP
// ===============================
client.collectDefaultMetrics();

const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"],
});

app.use((req, res, next) => {
  res.on("finish", () => {
    httpRequestCounter.inc({
      method: req.method,
      route: req.route?.path || req.originalUrl,
      status: res.statusCode,
    });
  });
  next();
});

// ===============================
//  DATABASE CONNECTION
// ===============================
connectDB();

// ===============================
//  WEATHER API ROUTE (FIXED)
// ===============================
app.get("/weather/:city", async (req, res) => {
  try {
    const city = req.params.city.trim();

    console.log(" Requested city:", city);

    //  1. Call Geo API safely
    let geoRes;
    try {
      geoRes = await axios.get(
        "https://geocoding-api.open-meteo.com/v1/search",
        {
          params: {
            name: city,
            count: 1,
          },
        }
      );
    } catch (err) {
      console.error("Geo API failed:", err.message);
      return res.status(500).json({ message: "Geo API failed" });
    }

    console.log(" Geo API Response:", geoRes.data);

    //  If city not found
    if (!geoRes.data.results || geoRes.data.results.length === 0) {
      return res.status(404).json({ message: "City not found" });
    }

    const cityInfo = geoRes.data.results[0];

    // 2. Call Weather API
    let weatherRes;
    try {
      weatherRes = await axios.get(
        "https://api.open-meteo.com/v1/forecast",
        {
          params: {
            latitude: cityInfo.latitude,
            longitude: cityInfo.longitude,
            current_weather: true,
          },
        }
      );
    } catch (err) {
      console.error(" Weather API failed:", err.message);
      return res.status(500).json({ message: "Weather API failed" });
    }

    console.log(" Weather API Response:", weatherRes.data);

    //  Check if weather data exists
    if (!weatherRes.data.current_weather) {
      return res.status(500).json({ message: "Weather data not available" });
    }

    // 3. Save to MongoDB
    const newWeather = new Weather({
      city: cityInfo.name,
      country: cityInfo.country,
      temperature: weatherRes.data.current_weather.temperature,
      windspeed: weatherRes.data.current_weather.windspeed,
      weathercode: weatherRes.data.current_weather.weathercode,
      latitude: cityInfo.latitude,
      longitude: cityInfo.longitude,
    });

    await newWeather.save();

    // 4. Send response
    res.json({
      city: cityInfo.name,
      country: cityInfo.country,
      temperature: weatherRes.data.current_weather.temperature,
      windspeed: weatherRes.data.current_weather.windspeed,
      weathercode: weatherRes.data.current_weather.weathercode,
      time: weatherRes.data.current_weather.time,
    });

  } catch (error) {
    console.error(" Server Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ===============================
//  PROMETHEUS METRICS
// ===============================
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

// ===============================
// START SERVER
// ===============================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const cityInput = document.getElementById("city-input");
const citiesList = document.getElementById("cities-list");
const spinnerEl = document.getElementById("loading-spinner");
const countryEl = document.getElementById("country");
const cityEl = document.getElementById("city");
const tempEl = document.getElementById("temp");
const windSpeedEl = document.getElementById("wind-speed");
const weatherConditionEl = document.getElementById("weather-condition");
const tomorrowTempEl = document.getElementById("tomorrow-temp");
const weeklyTrendEl = document.getElementById("weekly-trend");

// تحكم شاشة الافتتاح
window.addEventListener("load", () => {
  const introOverlay = document.getElementById("intro-overlay");
  setTimeout(() => {
    introOverlay.classList.add("fade-out");
  }, 1800);
});

// دالة تحويل أكواد الطقس إلى أيقونات
function getWeatherIcon(code) {
  if (code === 0) return '<i class="fa-solid fa-sun"></i> Clear';
  if (code >= 1 && code <= 3)
    return '<i class="fa-solid fa-cloud-sun"></i> Cloudy';
  if (code >= 51 && code <= 67)
    return '<i class="fa-solid fa-cloud-rain"></i> Rain';
  if (code >= 71 && code <= 77)
    return '<i class="fa-solid fa-snowflake"></i> Snow';
  if (code >= 95) return '<i class="fa-solid fa-cloud-bolt"></i> Storm';
  return '<i class="fa-solid fa-cloud"></i> Normal';
}

// دالة جلب الطقس مع LocalStorage وتفعيل الـ Spinner
async function fetchWeather(cityName) {
  spinnerEl.classList.remove("hidden");

  try {
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1`,
    );
    const geoData = await geoRes.json();

    if (!geoData.results) {
      alert("لم يتم العثور على المدينة");
      spinnerEl.classList.add("hidden");
      return;
    }

    const { latitude, longitude, name, country } = geoData.results[0];

    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=auto`,
    );
    const weatherData = await weatherRes.json();

    countryEl.textContent = country || "N/A";
    cityEl.textContent = name;
    tempEl.textContent = `${Math.round(weatherData.current_weather.temperature)} °C`;
    windSpeedEl.textContent = `${weatherData.current_weather.windspeed} km/h`;

    weatherConditionEl.innerHTML = getWeatherIcon(
      weatherData.current_weather.weathercode,
    );

    const tomorrowMax = Math.round(weatherData.daily.temperature_2m_max[1]);
    const tomorrowMin = Math.round(weatherData.daily.temperature_2m_min[1]);
    tomorrowTempEl.textContent = `${tomorrowMax}° / ${tomorrowMin}°C`;

    const weeklyMax = Math.round(weatherData.daily.temperature_2m_max[0]);
    weeklyTrendEl.textContent = `High: ${weeklyMax}°C`;

    localStorage.setItem("lastCity", name);
  } catch (error) {
    console.error(error);
    alert("حدث خطأ أثناء جلب البيانات");
  } finally {
    spinnerEl.classList.add("hidden");
  }
}

// الاقتراحات الحية
cityInput.addEventListener("input", async () => {
  const query = cityInput.value.trim();
  if (query.length < 2) return;

  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5`,
    );
    const data = await res.json();

    if (data.results) {
      citiesList.innerHTML = "";
      data.results.forEach((city) => {
        const option = document.createElement("option");
        option.value = city.country
          ? `${city.name}, ${city.country}`
          : city.name;
        citiesList.appendChild(option);
      });
    }
  } catch (error) {
    console.error("خطأ في جلب الاقتراحات:", error);
  }
});

// الضغط على Enter للبحث
cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && cityInput.value.trim() !== "") {
    const rawValue = cityInput.value.trim();
    const cityName = rawValue.split(",")[0].trim();
    fetchWeather(cityName);
  }
});

// استرجاع آخر مدينة عند بدء التشغيل
window.addEventListener("DOMContentLoaded", () => {
  const savedCity = localStorage.getItem("lastCity");
  if (savedCity) {
    cityInput.value = savedCity;
    fetchWeather(savedCity);
  }
});

// --- أنيميشن الجزيئات المتصاعدة (Particles Canvas) ---
const canvas = document.getElementById("particles-canvas");
const ctx = canvas.getContext("2d");

let particlesArray = [];
const numberOfParticles = 45;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = canvas.height + Math.random() * 100;
    this.size = Math.random() * 2 + 0.5;
    this.speedY = Math.random() * 0.7 + 0.2;
    this.speedX = (Math.random() - 0.5) * 0.3;
    this.opacity = Math.random() * 0.5 + 0.1;
  }

  update() {
    this.y -= this.speedY;
    this.x += this.speedX;

    if (this.y < -10) {
      this.reset();
    }
  }

  draw() {
    ctx.fillStyle = `rgba(255, 255, 25, ${this.opacity})`; // تم ضبط لون خفيف
    ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function initParticles() {
  particlesArray = [];
  for (let i = 0; i < numberOfParticles; i++) {
    particlesArray.push(new Particle());
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particlesArray.forEach((particle) => {
    particle.update();
    particle.draw();
  });
  requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();

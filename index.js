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

// دالة لتحويل أرقام أكواد الطقس إلى أيقونات ونصوص معبرة
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

// دالة رئيسية لجلب بيانات الطقس
async function fetchWeather(cityName) {
  spinnerEl.classList.remove("hidden"); // إظهار دائرة التحميل

  try {
    // 1. جلب الإحداثيات والدولة
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

    // 2. جلب تفاصيل الطقس الحالي وتوقعات الأيام
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=auto`,
    );
    const weatherData = await weatherRes.json();

    // 3. عرض البيانات في الواجهة
    countryEl.textContent = country || "N/A";
    cityEl.textContent = name;
    tempEl.textContent = `${Math.round(weatherData.current_weather.temperature)} °C`;
    windSpeedEl.textContent = `${weatherData.current_weather.windspeed} km/h`;

    // وضع الأيقونة والحالة
    weatherConditionEl.innerHTML = getWeatherIcon(
      weatherData.current_weather.weathercode,
    );

    // طقس الغد
    const tomorrowMax = Math.round(weatherData.daily.temperature_2m_max[1]);
    const tomorrowMin = Math.round(weatherData.daily.temperature_2m_min[1]);
    tomorrowTempEl.textContent = `${tomorrowMax}° / ${tomorrowMin}°C`;

    // نظرة عامة للأسبوع
    const weeklyMax = Math.round(weatherData.daily.temperature_2m_max[0]);
    weeklyTrendEl.textContent = `High: ${weeklyMax}°C`;

    // 4. حفظ المدينة الحالية في LocalStorage
    localStorage.setItem("lastCity", name);
  } catch (error) {
    console.error(error);
    alert("حدث خطأ أثناء جلب البيانات");
  } finally {
    spinnerEl.classList.add("hidden"); // إخفاء دائرة التحميل في كلتا الحالتين
  }
}

// نظام الاقتراحات الحية أثناء الكتابة
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

// تنفيذ البحث عند الضغط على Enter
cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && cityInput.value.trim() !== "") {
    const rawValue = cityInput.value.trim();
    const cityName = rawValue.split(",")[0].trim();
    fetchWeather(cityName);
  }
});

// استرجاع آخر مدينة تم البحث عنها عند فتح الصفحة (LocalStorage)
window.addEventListener("DOMContentLoaded", () => {
  const savedCity = localStorage.getItem("lastCity");
  if (savedCity) {
    cityInput.value = savedCity;
    fetchWeather(savedCity);
  }
});

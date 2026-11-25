// Weather app - Vanilla JS + Open-Meteo API (free, no API key).
const $ = id => document.getElementById(id);
const CODES = {0:'Clear sky',1:'Mostly clear',2:'Partly cloudy',3:'Overcast',45:'Fog',48:'Fog',51:'Light drizzle',53:'Drizzle',55:'Heavy drizzle',61:'Light rain',63:'Rain',65:'Heavy rain',71:'Light snow',73:'Snow',75:'Heavy snow',80:'Rain showers',81:'Rain showers',82:'Heavy showers',95:'Thunderstorm',96:'Thunderstorm',99:'Thunderstorm'};
let unitC = true, data = null;

// Sample data shows instantly; live data replaces it once the API answers.
const SAMPLE = { place: 'Sample city (demo data)', temp: 30, code: 2, hum: 68, wind: 12,
  days: [[31,25,2],[32,25,1],[29,24,63],[28,24,80],[30,25,3]].map((d, i) => ({ date: new Date(Date.now() + (i + 1) * 864e5), max: d[0], min: d[1], code: d[2] })) };

const conv = c => unitC ? Math.round(c) : Math.round(c * 9 / 5 + 32);
const U = () => unitC ? '°C' : '°F';

function render() {
  const d = data; $('place').textContent = d.place; $('cond').textContent = CODES[d.code] || 'Unknown';
  $('temp').textContent = conv(d.temp) + U(); $('hum').textContent = d.hum + '%'; $('wind').textContent = d.wind + ' km/h';
  $('days').innerHTML = d.days.map(x => `<div class="day"><b>${x.date.toLocaleDateString('en-IN', { weekday: 'short' })}</b><small>${CODES[x.code] || ''}</small><span>${conv(x.max)}° / ${conv(x.min)}°</span></div>`).join('');
  $('unit').textContent = U();
}

async function load(city) {
  $('status').textContent = 'Loading...';
  try {
    const g = await (await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`)).json();
    if (!g.results) { $('status').textContent = `City "${city}" not found. Check the spelling.`; return; }
    const { latitude, longitude, name, country } = g.results[0];
    const w = await (await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`)).json();
    data = { place: `${name}, ${country}`, temp: w.current.temperature_2m, code: w.current.weather_code, hum: w.current.relative_humidity_2m, wind: Math.round(w.current.wind_speed_10m),
      days: w.daily.time.slice(1, 6).map((t, i) => ({ date: new Date(t), max: w.daily.temperature_2m_max[i + 1], min: w.daily.temperature_2m_min[i + 1], code: w.daily.weather_code[i + 1] })) };
    $('status').textContent = ''; render();
  } catch { $('status').textContent = 'Could not reach the weather service. Showing sample data. Check your internet connection.'; }
}

$('form').addEventListener('submit', e => { e.preventDefault(); load($('city').value.trim()); });
$('unit').addEventListener('click', () => { unitC = !unitC; render(); });
data = SAMPLE; render(); load('Chennai');

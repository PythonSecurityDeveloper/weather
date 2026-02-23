import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  Wind, 
  Droplets, 
  Thermometer, 
  Navigation,
  RefreshCw,
  Search,
  MapPin,
  X
} from 'lucide-react';

/**
 * Enhanced Dynamic Background Component
 */
const DynamicBackground = ({ theme }) => {
  // Stable random values for particles
  const particles = useMemo(() => Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDuration: `${Math.random() * 2 + 1.5}s`,
    animationDelay: `${Math.random() * 2}s`,
    opacity: Math.random() * 0.5 + 0.2,
    size: Math.random() * 4 + 2,
  })), []);

  // Enhanced clouds with more variety
  const clouds = useMemo(() => Array.from({ length: 8 }).map((_, i) => ({
    id: i,
    top: `${Math.random() * 60}%`,
    animationDuration: `${Math.random() * 40 + 20}s`,
    animationDelay: `-${Math.random() * 40}s`,
    scale: Math.random() * 1.5 + 0.5,
    opacity: Math.random() * 0.3 + 0.1,
    floatOffset: `${Math.random() * 100}px`
  })), []);

  // Rays for the sun
  const sunRays = Array.from({ length: 12 }).map((_, i) => (
    <div 
      key={`ray-${i}`}
      className="absolute top-1/2 left-1/2 w-[150vw] h-[20px] bg-gradient-to-r from-yellow-200/20 to-transparent origin-left"
      style={{ transform: `rotate(${i * 30}deg) translateY(-50%)` }}
    />
  ));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 transition-all duration-1000">
      
      {/* SUNNY: Multiple rotating ray layers */}
      {theme === 'sunny' && (
        <div className="absolute top-[-10%] right-[-10%] w-0 h-0">
           <div className="absolute w-[100vw] h-[100vw] animate-spin-slow-ccw opacity-60">
            {sunRays}
           </div>
           <div className="absolute w-[100vw] h-[100vw] animate-spin-slow opacity-40 scale-125">
            {sunRays}
           </div>
           <div className="absolute w-[40vw] h-[40vw] bg-yellow-200/30 blur-[100px] rounded-full animate-pulse" />
        </div>
      )}

      {/* CLOUDY / FOGGY: Layered rolling clouds */}
      {(theme === 'cloudy' || theme === 'foggy' || theme === 'rainy' || theme === 'stormy') && (
        <div className={`absolute inset-0 ${theme === 'foggy' ? 'opacity-100' : 'opacity-70'}`}>
          {clouds.map(cloud => (
            <div 
              key={`cloud-${cloud.id}`}
              className="absolute left-[-50%] w-[600px] h-[200px] bg-white rounded-[100%] animate-rolling-cloud"
              style={{
                top: cloud.top,
                animationDuration: cloud.animationDuration,
                animationDelay: cloud.animationDelay,
                transform: `scale(${cloud.scale})`,
                opacity: cloud.opacity,
                filter: `blur(${theme === 'foggy' ? '80px' : '40px'})`,
                '--float-y': cloud.floatOffset
              }}
            />
          ))}
        </div>
      )}

      {/* RAINY: Dense streaks */}
      {(theme === 'rainy' || theme === 'stormy') && (
        particles.map(drop => (
          <div
            key={`rain-${drop.id}`}
            className="absolute top-[-10%] w-[1px] bg-blue-100/40 animate-fall"
            style={{
              left: drop.left,
              height: `${drop.size * 8}px`,
              animationDuration: `${parseFloat(drop.animationDuration) / 4}s`,
              animationDelay: drop.animationDelay,
            }}
          />
        ))
      )}

      {/* STORMY: Lightning */}
      {theme === 'stormy' && (
        <div className="absolute inset-0 bg-white/0 animate-lightning mix-blend-overlay" />
      )}

      {/* SNOWY: Soft flakes */}
      {theme === 'snowy' && (
        particles.map(flake => (
          <div
            key={`snow-${flake.id}`}
            className="absolute top-[-10%] bg-white rounded-full animate-fall-sway"
            style={{
              left: drop.left,
              width: `${flake.size}px`,
              height: `${flake.size}px`,
              animationDuration: `${parseFloat(flake.animationDuration) * 1.5}s`,
              animationDelay: flake.animationDelay,
              opacity: flake.opacity,
              filter: 'blur(1px)'
            }}
          />
        ))
      )}

      {/* Ambient Depth Glow */}
      <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-white/5 blur-[120px] rounded-full" />
    </div>
  );
};

const App = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchCity, setSearchCity] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [locationName, setLocationName] = useState('Current Location');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  const STORAGE_KEY = 'weather_app_last_location';

  const getWeatherConfig = (code) => {
    if (code === 0) return { label: 'Clear Sky', icon: Sun, theme: 'sunny' };
    if ([1, 2, 3].includes(code)) return { label: 'Partly Cloudy', icon: Cloud, theme: 'cloudy' };
    if ([45, 48].includes(code)) return { label: 'Foggy', icon: Wind, theme: 'foggy' };
    if ([51, 53, 55, 61, 63, 65].includes(code)) return { label: 'Rainy', icon: CloudRain, theme: 'rainy' };
    if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: 'Snowy', icon: CloudSnow, theme: 'snowy' };
    if ([95, 96, 99].includes(code)) return { label: 'Thunderstorm', icon: CloudLightning, theme: 'stormy' };
    return { label: 'Unknown', icon: Cloud, theme: 'cloudy' };
  };

  const activeTheme = weather ? getWeatherConfig(weather.current.weather_code).theme : 'cloudy';

  const themeStyles = useMemo(() => {
    const themes = {
      sunny: 'from-blue-500 via-sky-400 to-amber-200',
      cloudy: 'from-slate-500 via-gray-400 to-blue-300',
      rainy: 'from-slate-800 via-blue-900 to-slate-900',
      snowy: 'from-indigo-100 via-slate-200 to-blue-100',
      stormy: 'from-gray-900 via-purple-950 to-black',
      foggy: 'from-gray-300 via-slate-400 to-gray-500'
    };
    return themes[activeTheme] || themes.cloudy;
  }, [activeTheme]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchCity.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchCity)}&count=5&language=en&format=json`;
        const res = await fetch(geoUrl);
        const data = await res.json();
        setSuggestions(data.results || []);
      } catch (err) { console.error(err); }
    };
    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [searchCity]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchWeather = async (lat, lon, name, save = true) => {
    setLoading(true);
    setError(null);
    setShowSuggestions(false);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=auto`;
      const response = await fetch(url);
      const data = await response.json();
      setWeather(data);
      setLocationName(name);
      if (save) localStorage.setItem(STORAGE_KEY, JSON.stringify({ lat, lon, name }));
    } catch (err) { setError("Could not update weather."); }
    finally { setLoading(false); }
  };

  const getPosition = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const { lat, lon, name } = JSON.parse(saved);
      fetchWeather(lat, lon, name, false);
      return;
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude, 'Your Location', false),
        () => fetchWeather(40.7128, -74.0060, 'New York, NY', false)
      );
    } else {
      fetchWeather(40.7128, -74.0060, 'New York, NY', false);
    }
  };

  useEffect(() => { getPosition(); }, []);

  if (loading && !weather) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-900 text-white">
        <RefreshCw className="w-12 h-12 animate-spin text-blue-400" />
      </div>
    );
  }

  const currentConfig = weather ? getWeatherConfig(weather.current.weather_code) : null;
  const WeatherIcon = currentConfig?.icon || Sun;

  return (
    <div className={`min-h-screen w-full transition-colors duration-1000 bg-gradient-to-br ${themeStyles} flex flex-col items-center justify-center p-4 md:p-8 font-sans overflow-hidden relative`}>
      
      <DynamicBackground theme={activeTheme} />

      <div className="w-full max-w-4xl backdrop-blur-2xl bg-white/10 border border-white/20 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-20">
        
        <div className="w-full md:w-3/5 p-8 md:p-12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/10">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-white/80">
                <MapPin size={18} />
                <h2 className="text-xl font-medium tracking-wide truncate max-w-[200px]">{locationName}</h2>
              </div>
              <p className="text-white/60 text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
            
            <div className="relative" ref={searchRef}>
              <div className="relative group">
                <input 
                  type="text" 
                  value={searchCity}
                  onChange={(e) => { setSearchCity(e.target.value); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search City..."
                  className="bg-white/10 hover:bg-white/20 focus:bg-white/20 border border-white/10 rounded-full px-4 py-2 text-white placeholder-white/40 outline-none w-32 md:w-48 transition-all focus:w-44 md:focus:w-64"
                />
                <Search size={18} className="absolute right-3 top-2.5 text-white/50" />
              </div>

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                  {suggestions.map((city) => (
                    <button
                      key={city.id}
                      onClick={() => { setSearchCity(''); fetchWeather(city.latitude, city.longitude, `${city.name}, ${city.admin1 || city.country}`); }}
                      className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex flex-col border-b border-white/5 last:border-0"
                    >
                      <span className="font-medium text-sm">{city.name}</span>
                      <span className="text-white/50 text-xs">{city.admin1 ? `${city.admin1}, ` : ''}{city.country}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-12 py-8 flex flex-col items-center md:items-start">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-md border border-white/20">
                <WeatherIcon size={84} className="text-white drop-shadow-xl animate-pulse" />
              </div>
              <div>
                <h1 className="text-8xl md:text-9xl font-bold text-white tracking-tighter leading-none">
                  {Math.round(weather.current.temperature_2m)}°
                </h1>
                <p className="text-2xl text-white/80 font-light mt-2">{currentConfig.label}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col items-center">
              <Thermometer className="text-white/60 mb-2" size={20} />
              <span className="text-white font-medium">{Math.round(weather.current.apparent_temperature)}°F</span>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col items-center">
              <Droplets className="text-white/60 mb-2" size={20} />
              <span className="text-white font-medium">{weather.current.relative_humidity_2m}%</span>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col items-center">
              <Wind className="text-white/60 mb-2" size={20} />
              <span className="text-white font-medium">{weather.current.wind_speed_10m} <small>km/h</small></span>
            </div>
          </div>
        </div>

        <div className="w-full md:w-2/5 p-8 bg-black/10 backdrop-blur-md flex flex-col gap-6">
          <h3 className="text-white/80 font-semibold tracking-wide flex items-center gap-2">
            7-DAY FORECAST
          </h3>
          
          <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
            {weather.daily.time.map((time, index) => {
              const config = getWeatherConfig(weather.daily.weather_code[index]);
              const Icon = config.icon;
              return (
                <div key={time} className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-colors group">
                  <span className="text-white/70 w-12 font-medium">
                    {index === 0 ? 'Today' : new Date(time).toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <div className="flex items-center gap-3">
                    <Icon size={20} className="text-white group-hover:scale-110 transition-transform" />
                    <span className="text-white/40 text-xs w-24 truncate text-center">{config.label}</span>
                  </div>
                  <div className="flex gap-3 w-16 justify-end">
                    <span className="text-white font-semibold">{Math.round(weather.daily.temperature_2m_max[index])}°</span>
                    <span className="text-white/40">{Math.round(weather.daily.temperature_2m_min[index])}°</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-auto pt-6 border-t border-white/10 flex justify-end">
            <button onClick={() => { localStorage.removeItem(STORAGE_KEY); getPosition(); }} className="text-white/30 hover:text-white transition-colors flex items-center gap-1 text-xs">
              <RefreshCw size={12} /> Reset & Sync
            </button>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }

        @keyframes rolling-cloud {
          0% { transform: translate(-20%, var(--float-y)) scale(1); opacity: 0; }
          10% { opacity: var(--opacity); }
          50% { transform: translate(50%, calc(var(--float-y) + 50px)) scale(1.1); }
          90% { opacity: var(--opacity); }
          100% { transform: translate(120%, var(--float-y)) scale(1); opacity: 0; }
        }

        @keyframes lightning {
          0%, 94%, 96%, 100% { opacity: 0; }
          95%, 97% { opacity: 1; background: #fff; }
        }

        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes spin-slow-ccw { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }

        @keyframes fall {
          from { transform: translateY(-10vh); }
          to { transform: translateY(110vh); }
        }

        @keyframes fall-sway {
          0% { transform: translate(0, -10vh); }
          25% { transform: translate(15px, 20vh); }
          50% { transform: translate(-15px, 50vh); }
          75% { transform: translate(15px, 80vh); }
          100% { transform: translate(0, 110vh); }
        }

        .animate-rolling-cloud { animation: rolling-cloud linear infinite; }
        .animate-spin-slow { animation: spin-slow 60s linear infinite; }
        .animate-spin-slow-ccw { animation: spin-slow-ccw 45s linear infinite; }
        .animate-lightning { animation: lightning 5s infinite; }
        .animate-fall { animation: fall linear infinite; }
        .animate-fall-sway { animation: fall-sway linear infinite; }
      `}} />
    </div>
  );
};

export default App;

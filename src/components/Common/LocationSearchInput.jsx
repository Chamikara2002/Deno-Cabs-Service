import React, { useState, useEffect, useRef } from 'react';
import { searchLocations, reverseGeocode } from '../../services/mapService';
import { MapPin, Search, Crosshair, X, Check, Loader2 } from 'lucide-react';
import './LocationSearchInput.css';

const LocationSearchInput = ({
  label,
  placeholder = 'Search pickup or drop-off location...',
  value = '',
  onChange,
  onSelectCoordinate,
  onPickOnMap,
  isSelectingOnMap = false,
  required = false,
  type = 'pickup' // 'pickup' | 'dropoff'
}) => {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const wrapperRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Sync external value
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Click outside to close suggestion dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Input Changes with Debounced Search
  const handleInputChange = (e) => {
    const text = e.target.value;
    setQuery(text);
    if (onChange) onChange(text);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!text || text.trim().length < 2) {
      searchLocations('').then((res) => {
        setResults(res);
        setIsOpen(true);
      });
      return;
    }

    setIsLoading(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const matches = await searchLocations(text);
        setResults(matches);
        setIsOpen(true);
      } catch (err) {
        console.warn('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 280);
  };

  const handleSelect = (item) => {
    const selectedName = item.name;
    setQuery(selectedName);
    setIsOpen(false);
    if (onChange) onChange(selectedName);
    if (onSelectCoordinate) {
      onSelectCoordinate({
        name: item.name,
        address: item.address,
        lat: item.lat,
        lng: item.lng
      });
    }
  };

  // Browser GPS Geolocation
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const rev = await reverseGeocode(latitude, longitude);
          const locName = rev?.name || `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
          setQuery(locName);
          if (onChange) onChange(locName);
          if (onSelectCoordinate) {
            onSelectCoordinate({
              name: locName,
              address: rev?.address || '',
              lat: latitude,
              lng: longitude
            });
          }
        } catch {
          const raw = `GPS Position (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
          setQuery(raw);
          if (onChange) onChange(raw);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        alert('Could not retrieve GPS location: ' + err.message);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="location-search-input-wrapper" ref={wrapperRef}>
      {label && (
        <div className="loc-label-row">
          <label className="loc-field-label">
            {type === 'pickup' ? '🟢 ' : '🔴 '}
            {label}
          </label>
          <div className="loc-label-actions">
            {onPickOnMap && (
              <button
                type="button"
                className={`loc-action-pill ${isSelectingOnMap ? 'active-pin' : ''}`}
                onClick={onPickOnMap}
                title="Click to pinpoint location directly on the OpenStreetMap"
              >
                <MapPin size={12} />
                <span>{isSelectingOnMap ? 'Clicking on Map...' : 'Pick on Map'}</span>
              </button>
            )}
            <button
              type="button"
              className="loc-action-pill"
              onClick={handleUseCurrentLocation}
              title="Use your current GPS coordinates"
              disabled={isLocating}
            >
              {isLocating ? <Loader2 size={12} className="spin-icon" /> : <Crosshair size={12} />}
              <span>{isLocating ? 'Locating...' : 'GPS'}</span>
            </button>
          </div>
        </div>
      )}

      <div className="loc-input-box">
        <div className="loc-input-icon-col">
          {type === 'pickup' ? (
            <span className="dot-icon green" />
          ) : (
            <span className="dot-icon red" />
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (!query) {
              searchLocations('').then((res) => {
                setResults(res);
                setIsOpen(true);
              });
            } else {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          required={required}
          className="loc-text-input"
        />

        {isLoading ? (
          <Loader2 size={16} className="loc-spinner" />
        ) : query ? (
          <button
            type="button"
            className="loc-clear-btn"
            onClick={() => {
              setQuery('');
              if (onChange) onChange('');
            }}
          >
            <X size={14} />
          </button>
        ) : (
          <Search size={15} className="loc-search-icon" />
        )}
      </div>

      {/* Suggestion Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="loc-suggestions-dropdown">
          <div className="loc-suggestions-header">
            <span>⚡ OpenStreetMap Verified Locations ({results.length})</span>
          </div>

          <div className="loc-suggestions-list">
            {results.map((item, idx) => (
              <button
                type="button"
                key={item.name + idx}
                className="loc-suggestion-item"
                onClick={() => handleSelect(item)}
              >
                <div className="sugg-icon-col">
                  <MapPin size={14} className="sugg-pin-icon" />
                </div>
                <div className="sugg-meta">
                  <div className="sugg-top-row">
                    <strong className="sugg-name">{item.name}</strong>
                    <span className="sugg-category-pill">{item.category || 'Location'}</span>
                  </div>
                  <span className="sugg-address">{item.address || 'Sri Lanka'}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSearchInput;

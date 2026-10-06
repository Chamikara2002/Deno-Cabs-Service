import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { calculateDrivingRoute, findLocationByName, reverseGeocode } from '../../services/mapService';
import { Navigation, MapPin, Radio, Compass, RefreshCw, ZoomIn, ZoomOut, Check } from 'lucide-react';
import './LeafletRouteMap.css';

// Fix Leaflet Default Icon issue in Vite / Webpack Bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

// Custom Modern SVG Icon Creators
const createPickupIcon = (label = 'PICKUP') =>
  L.divIcon({
    className: 'custom-leaflet-pin-wrapper',
    html: `
      <div class="leaflet-pin pickup-pin">
        <div class="pin-pulse green-pulse"></div>
        <div class="pin-body green-body">
          <span class="pin-dot-inner"></span>
        </div>
        <div class="pin-label-pill pickup-label">${label}</div>
      </div>
    `,
    iconSize: [36, 42],
    iconAnchor: [18, 40]
  });

const createDropoffIcon = (label = 'DROP-OFF') =>
  L.divIcon({
    className: 'custom-leaflet-pin-wrapper',
    html: `
      <div class="leaflet-pin dropoff-pin">
        <div class="pin-pulse red-pulse"></div>
        <div class="pin-body red-body">
          <span class="pin-dot-inner"></span>
        </div>
        <div class="pin-label-pill dropoff-label">${label}</div>
      </div>
    `,
    iconSize: [36, 42],
    iconAnchor: [18, 40]
  });

const createVehicleIcon = (plate = 'WP CAB-8829', status = 'In Transit') =>
  L.divIcon({
    className: 'custom-leaflet-pin-wrapper',
    html: `
      <div class="leaflet-pin vehicle-pin">
        <div class="pin-pulse gold-pulse"></div>
        <div class="pin-body gold-body">
          <span class="vehicle-icon-symbol">🚖</span>
        </div>
        <div class="pin-label-pill vehicle-label">${plate}</div>
      </div>
    `,
    iconSize: [40, 44],
    iconAnchor: [20, 42]
  });

const LeafletRouteMap = ({
  pickupLocation,
  dropoffLocation,
  pickupCoords,
  dropoffCoords,
  onLocationSelected,
  selectingTarget = null, // 'pickup' | 'dropoff' | null
  height = '260px',
  theme = 'light', // 'light' | 'dark'
  interactive = true,
  showTelemetry = false,
  telemetryVehicles = [],
  className = ''
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routeLayerRef = useRef(null);
  const markersGroupRef = useRef(null);

  const [routeInfo, setRouteInfo] = useState({
    distanceKm: 0,
    durationMinutes: 0,
    loading: false
  });

  const [activePinCoords, setActivePinCoords] = useState({
    pickup: null,
    dropoff: null
  });

  // Resolve coordinate objects from text or props
  useEffect(() => {
    let pCoord = pickupCoords;
    if (!pCoord && pickupLocation) {
      const match = findLocationByName(pickupLocation);
      pCoord = { lat: match.lat, lng: match.lng, name: match.name };
    }

    let dCoord = dropoffCoords;
    if (!dCoord && dropoffLocation) {
      const match = findLocationByName(dropoffLocation);
      dCoord = { lat: match.lat, lng: match.lng, name: match.name };
    }

    setActivePinCoords({
      pickup: pCoord,
      dropoff: dCoord
    });
  }, [pickupLocation, dropoffLocation, pickupCoords, dropoffCoords]);

  // 1. Initialize Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default centered on Sri Lanka
      const defaultCenter = [7.8731, 80.7718]; // Sri Lanka geographic center
      const defaultZoom = 8;

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: defaultZoom,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: interactive,
        dragging: interactive,
        touchZoom: interactive
      });

      // Tile Layer: Official 100% Free OpenStreetMap Standard (Zero API Key required)
      const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

      L.tileLayer(tileUrl, {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c']
      }).addTo(map);

      // Attribution small banner in corner
      L.control
        .attribution({
          position: 'bottomright',
          prefix: '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap</a> • Deno Cabs'
        })
        .addTo(map);

      // Create Layer Groups
      const routeLayer = L.layerGroup().addTo(map);
      const markersGroup = L.layerGroup().addTo(map);

      routeLayerRef.current = routeLayer;
      markersGroupRef.current = markersGroup;
      mapInstanceRef.current = map;

      // Handle map click for precise location selection
      map.on('click', async (e) => {
        if (!interactive || !selectingTarget) return;

        const { lat, lng } = e.latlng;
        const rev = await reverseGeocode(lat, lng);

        if (onLocationSelected) {
          onLocationSelected({
            target: selectingTarget,
            lat,
            lng,
            name: rev.name,
            address: rev.address
          });
        }
      });
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [theme, interactive, selectingTarget, onLocationSelected]);

  // 2. Render Markers and Calculate Routing
  useEffect(() => {
    const map = mapInstanceRef.current;
    const routeLayer = routeLayerRef.current;
    const markersGroup = markersGroupRef.current;

    if (!map || !routeLayer || !markersGroup) return;

    // Clear previous layers
    markersGroup.clearLayers();
    routeLayer.clearLayers();

    const { pickup, dropoff } = activePinCoords;
    const boundsPoints = [];

    // Add Pickup Pin
    if (pickup && pickup.lat && pickup.lng) {
      const pMarker = L.marker([pickup.lat, pickup.lng], {
        icon: createPickupIcon(pickup.name?.split(',')[0]?.slice(0, 18) || 'PICKUP'),
        draggable: !!selectingTarget && selectingTarget === 'pickup'
      }).addTo(markersGroup);

      pMarker.bindPopup(`
        <div class="map-popup-card">
          <strong style="color: #10b981;">🟢 Pickup Location</strong>
          <p>${pickup.name || 'Selected Pickup Point'}</p>
          <small>${pickup.lat.toFixed(4)}, ${pickup.lng.toFixed(4)}</small>
        </div>
      `);

      if (selectingTarget === 'pickup') {
        pMarker.on('dragend', async (e) => {
          const { lat, lng } = e.target.getLatLng();
          const rev = await reverseGeocode(lat, lng);
          if (onLocationSelected) {
            onLocationSelected({ target: 'pickup', lat, lng, name: rev.name, address: rev.address });
          }
        });
      }

      boundsPoints.push([pickup.lat, pickup.lng]);
    }

    // Add Dropoff Pin
    if (dropoff && dropoff.lat && dropoff.lng) {
      const dMarker = L.marker([dropoff.lat, dropoff.lng], {
        icon: createDropoffIcon(dropoff.name?.split(',')[0]?.slice(0, 18) || 'DROP-OFF'),
        draggable: !!selectingTarget && selectingTarget === 'dropoff'
      }).addTo(markersGroup);

      dMarker.bindPopup(`
        <div class="map-popup-card">
          <strong style="color: #ef4444;">🔴 Drop-off Destination</strong>
          <p>${dropoff.name || 'Selected Destination Point'}</p>
          <small>${dropoff.lat.toFixed(4)}, ${dropoff.lng.toFixed(4)}</small>
        </div>
      `);

      if (selectingTarget === 'dropoff') {
        dMarker.on('dragend', async (e) => {
          const { lat, lng } = e.target.getLatLng();
          const rev = await reverseGeocode(lat, lng);
          if (onLocationSelected) {
            onLocationSelected({ target: 'dropoff', lat, lng, name: rev.name, address: rev.address });
          }
        });
      }

      boundsPoints.push([dropoff.lat, dropoff.lng]);
    }

    // Add Telemetry Vehicles if requested
    if (showTelemetry && Array.isArray(telemetryVehicles) && telemetryVehicles.length > 0) {
      telemetryVehicles.forEach((veh) => {
        if (veh.lat && veh.lng) {
          const vMarker = L.marker([veh.lat, veh.lng], {
            icon: createVehicleIcon(veh.plate, veh.status)
          }).addTo(markersGroup);

          vMarker.bindPopup(`
            <div class="map-popup-card">
              <strong style="color: #d97706;">🚖 ${veh.plate || 'Fleet Telemetry'}</strong>
              <p>${veh.model || 'Executive Luxury Class'}</p>
              <small>${veh.route || 'En-Route Expressway'}</small>
            </div>
          `);

          boundsPoints.push([veh.lat, veh.lng]);
        }
      });
    }

    // If both Pickup and Dropoff exist -> calculate driving route and draw road polyline
    if (pickup && dropoff && pickup.lat && dropoff.lat) {
      setRouteInfo((prev) => ({ ...prev, loading: true }));

      calculateDrivingRoute(pickup, dropoff).then((route) => {
        if (route && route.coordinates && route.coordinates.length > 0) {
          // 1. Glow Background Line
          L.polyline(route.coordinates, {
            color: '#ffb800',
            weight: 7,
            opacity: 0.55,
            lineCap: 'round',
            lineJoin: 'round'
          }).addTo(routeLayer);

          // 2. Main High-contrast Driving Route Line
          L.polyline(route.coordinates, {
            color: theme === 'dark' ? '#38bdf8' : '#2563eb',
            weight: 4,
            opacity: 0.95,
            dashArray: '1, 8',
            className: 'leaflet-animated-route'
          }).addTo(routeLayer);

          setRouteInfo({
            distanceKm: route.distanceKm,
            durationMinutes: route.durationMinutes,
            loading: false
          });
        }
      });
    }

    // Auto-fit bounds
    if (boundsPoints.length > 1) {
      const bounds = L.latLngBounds(boundsPoints);
      map.fitBounds(bounds, {
        padding: [40, 40],
        maxZoom: 14,
        animate: true
      });
    } else if (boundsPoints.length === 1) {
      map.setView(boundsPoints[0], 13, { animate: true });
    }
  }, [activePinCoords, showTelemetry, telemetryVehicles, selectingTarget, onLocationSelected, theme]);

  // Recalculate size on container resize
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
      const { pickup, dropoff } = activePinCoords;
      if (pickup && dropoff && pickup.lat && dropoff.lat) {
        const bounds = L.latLngBounds([[pickup.lat, pickup.lng], [dropoff.lat, dropoff.lng]]);
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
      } else if (pickup && pickup.lat) {
        mapInstanceRef.current.setView([pickup.lat, pickup.lng], 13);
      }
    }
  };

  return (
    <div className={`leaflet-route-map-root ${theme}-theme ${className}`} style={{ height }}>
      {/* Real-time Map Canvas */}
      <div ref={mapContainerRef} className="leaflet-map-canvas" style={{ width: '100%', height: '100%' }} />

      {/* Floating Info Overlay Header */}
      <div className="leaflet-map-overlay-header">
        <div className="overlay-title-group">
          <span className="live-gps-pill">
            <span className="pulsing-green-dot" /> LIVE GPS ROUTE
          </span>
          <span className="map-route-text">
            {activePinCoords.pickup?.name?.split(',')[0] || 'Pickup'} ➔ {activePinCoords.dropoff?.name?.split(',')[0] || 'Destination'}
          </span>
        </div>

        {routeInfo.distanceKm > 0 && (
          <div className="overlay-dist-pill">
            <Navigation size={13} />
            <strong>{routeInfo.distanceKm} km</strong>
            <span>• ~{Math.floor(routeInfo.durationMinutes / 60) > 0 ? `${Math.floor(routeInfo.durationMinutes / 60)}h ` : ''}{routeInfo.durationMinutes % 60}m</span>
          </div>
        )}
      </div>

      {/* Interactive Selecting Mode Banner */}
      {selectingTarget && (
        <div className="leaflet-selecting-banner">
          <MapPin size={14} color={selectingTarget === 'pickup' ? '#10b981' : '#ef4444'} />
          <span>
            Click anywhere on the map to set <strong>{selectingTarget.toUpperCase()}</strong> location accurately
          </span>
        </div>
      )}

      {/* Floating Map Controls */}
      <div className="leaflet-custom-controls">
        <button
          className="map-ctrl-btn"
          onClick={() => mapInstanceRef.current?.zoomIn()}
          title="Zoom In"
          type="button"
        >
          <ZoomIn size={15} />
        </button>
        <button
          className="map-ctrl-btn"
          onClick={() => mapInstanceRef.current?.zoomOut()}
          title="Zoom Out"
          type="button"
        >
          <ZoomOut size={15} />
        </button>
        <button
          className="map-ctrl-btn"
          onClick={handleRecenter}
          title="Re-center Route Bounds"
          type="button"
        >
          <Compass size={15} />
        </button>
      </div>
    </div>
  );
};

export default LeafletRouteMap;

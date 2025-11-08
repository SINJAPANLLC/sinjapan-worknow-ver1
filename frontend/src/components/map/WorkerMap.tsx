import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { useEffect } from 'react';

// Fix Leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom user location icon (Apple Maps style)
const userIcon = new L.DivIcon({
  className: 'custom-user-marker',
  html: `<div style="
    width: 20px;
    height: 20px;
    background: #007AFF;
    border: 4px solid rgba(255, 255, 255, 0.95);
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0, 122, 255, 0.4), 0 0 0 1px rgba(0, 0, 0, 0.1);
  "></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Custom job marker icon (Apple Maps style pin)
const jobIcon = new L.DivIcon({
  className: 'custom-job-marker',
  html: `<div style="
    position: relative;
    width: 32px;
    height: 40px;
  ">
    <div style="
      position: absolute;
      width: 32px;
      height: 32px;
      background: #FF3B30;
      border: 3px solid rgba(255, 255, 255, 0.95);
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 3px 10px rgba(255, 59, 48, 0.4), 0 0 0 1px rgba(0, 0, 0, 0.1);
    "></div>
    <div style="
      position: absolute;
      top: 6px;
      left: 6px;
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 50%;
    "></div>
  </div>`,
  iconSize: [32, 40],
  iconAnchor: [16, 40],
});

interface Job {
  id: string;
  title: string;
  location?: string;
  hourly_rate?: number;
}

interface Assignment {
  id: string;
  status: string;
  pickup_location?: string;
  delivery_location?: string;
  pickup_lat?: number;
  pickup_lng?: number;
  delivery_lat?: number;
  delivery_lng?: number;
}

interface WorkerMapProps {
  center: [number, number];
  jobs?: Job[];
  isOnline: boolean;
  activeDelivery?: Assignment | null;
}

function RoutingControl({ pickup, delivery }: { pickup: [number, number]; delivery: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const routingControl = L.Routing.control({
      waypoints: [L.latLng(pickup[0], pickup[1]), L.latLng(delivery[0], delivery[1])],
      routeWhileDragging: false,
      addWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      lineOptions: {
        styles: [{ color: '#00CED1', weight: 6, opacity: 0.8 }],
        extendToWaypoints: true,
        missingRouteTolerance: 0,
      },
      createMarker: () => null,
      show: false,
    } as any).addTo(map);

    return () => {
      if (map && routingControl) {
        map.removeControl(routingControl);
      }
    };
  }, [map, pickup, delivery]);

  return null;
}

// Pickup marker icon
const pickupIcon = new L.DivIcon({
  className: 'custom-pickup-marker',
  html: `<div style="
    position: relative;
    width: 36px;
    height: 44px;
  ">
    <div style="
      position: absolute;
      width: 36px;
      height: 36px;
      background: #FF9500;
      border: 3px solid rgba(255, 255, 255, 0.95);
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 3px 10px rgba(255, 149, 0, 0.5), 0 0 0 1px rgba(0, 0, 0, 0.1);
    "></div>
    <div style="
      position: absolute;
      top: 8px;
      left: 8px;
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 50%;
    "></div>
  </div>`,
  iconSize: [36, 44],
  iconAnchor: [18, 44],
});

// Delivery marker icon
const deliveryIcon = new L.DivIcon({
  className: 'custom-delivery-marker',
  html: `<div style="
    position: relative;
    width: 36px;
    height: 44px;
  ">
    <div style="
      position: absolute;
      width: 36px;
      height: 36px;
      background: #00CED1;
      border: 3px solid rgba(255, 255, 255, 0.95);
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 3px 10px rgba(0, 206, 209, 0.5), 0 0 0 1px rgba(0, 0, 0, 0.1);
    "></div>
    <div style="
      position: absolute;
      top: 8px;
      left: 8px;
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 50%;
    "></div>
  </div>`,
  iconSize: [36, 44],
  iconAnchor: [18, 44],
});

export default function WorkerMap({ center, jobs = [], isOnline, activeDelivery }: WorkerMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={14}
      className="h-full w-full"
      zoomControl={false}
      attributionControl={false}
      style={{ background: '#F5F5F7' }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        maxZoom={19}
      />
      
      {/* User location marker */}
      <Marker position={center} icon={userIcon}>
        <Popup>あなたの現在地</Popup>
      </Marker>

      {/* User location radius circle */}
      <Circle
        center={center}
        radius={1000}
        pathOptions={{
          fillColor: '#00CED1',
          fillOpacity: 0.1,
          color: '#00CED1',
          weight: 2,
          opacity: 0.5,
        }}
      />

      {/* Delivery route and markers */}
      {activeDelivery && activeDelivery.pickup_lat && activeDelivery.pickup_lng && activeDelivery.delivery_lat && activeDelivery.delivery_lng && (
        <>
          <Marker position={[activeDelivery.pickup_lat, activeDelivery.pickup_lng]} icon={pickupIcon}>
            <Popup>
              <div className="text-sm p-1">
                <p className="font-bold text-orange-600 text-base">受取場所</p>
                <p className="text-xs text-gray-900 mt-1">{activeDelivery.pickup_location}</p>
              </div>
            </Popup>
          </Marker>
          <Marker position={[activeDelivery.delivery_lat, activeDelivery.delivery_lng]} icon={deliveryIcon}>
            <Popup>
              <div className="text-sm p-1">
                <p className="font-bold text-[#00CED1] text-base">配達先</p>
                <p className="text-xs text-gray-900 mt-1">{activeDelivery.delivery_location}</p>
              </div>
            </Popup>
          </Marker>
          <RoutingControl 
            pickup={[activeDelivery.pickup_lat, activeDelivery.pickup_lng]} 
            delivery={[activeDelivery.delivery_lat, activeDelivery.delivery_lng]} 
          />
        </>
      )}

      {/* Job markers */}
      {!activeDelivery && isOnline && jobs.slice(0, 5).map((job, index) => {
        const offset = 0.01 * (index + 1);
        const jobPosition: [number, number] = [
          center[0] + (Math.random() - 0.5) * offset,
          center[1] + (Math.random() - 0.5) * offset,
        ];
        
        return (
          <Marker key={job.id} position={jobPosition} icon={jobIcon}>
            <Popup>
              <div className="text-sm p-1">
                <p className="font-bold text-gray-900 text-base">{job.title}</p>
                <p className="text-xs text-gray-600 mt-1">{job.location}</p>
                {job.hourly_rate && (
                  <p className="text-[#FF3B30] font-bold mt-2 text-base">¥{job.hourly_rate.toLocaleString()}/時</p>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

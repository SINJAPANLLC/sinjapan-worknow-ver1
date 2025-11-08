import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

interface WorkerMapProps {
  center: [number, number];
  jobs?: Job[];
  isOnline: boolean;
}

export default function WorkerMap({ center, jobs = [], isOnline }: WorkerMapProps) {
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

      {/* Job markers */}
      {isOnline && jobs.slice(0, 5).map((job, index) => {
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

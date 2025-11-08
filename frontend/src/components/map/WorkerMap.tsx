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

// Custom user location icon
const userIcon = new L.DivIcon({
  className: 'custom-user-marker',
  html: `<div style="
    width: 24px;
    height: 24px;
    background: linear-gradient(135deg, #00CED1, #009999);
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
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
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
          <Marker key={job.id} position={jobPosition}>
            <Popup>
              <div className="text-sm">
                <p className="font-bold text-gray-900">{job.title}</p>
                <p className="text-xs text-gray-600 mt-1">{job.location}</p>
                {job.hourly_rate && (
                  <p className="text-[#00CED1] font-bold mt-2">¥{job.hourly_rate.toLocaleString()}/時</p>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

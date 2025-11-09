import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { User } from '../../lib/api';
import { Users } from 'lucide-react';

interface OnlineWorkersMapProps {
  workers: User[];
  className?: string;
}

const customIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function OnlineWorkersMap({ workers, className = '' }: OnlineWorkersMapProps) {
  const [center, setCenter] = useState<[number, number]>([35.6762, 139.6503]); // Tokyo

  const workersWithLocation = workers.filter(
    (worker) => worker.latitude != null && worker.longitude != null
  );

  useEffect(() => {
    if (workersWithLocation.length > 0) {
      const avgLat = workersWithLocation.reduce((sum, w) => sum + (w.latitude || 0), 0) / workersWithLocation.length;
      const avgLng = workersWithLocation.reduce((sum, w) => sum + (w.longitude || 0), 0) / workersWithLocation.length;
      setCenter([avgLat, avgLng]);
    }
  }, [workersWithLocation]);

  if (workersWithLocation.length === 0) {
    return (
      <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-8 ${className}`}>
        <div className="text-center">
          <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">現在位置情報を持つオンラインワーカーはいません</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">オンラインワーカーマップ</h3>
        <p className="text-sm text-gray-500 mt-1">
          {workersWithLocation.length}人のワーカーがオンラインです
        </p>
      </div>
      <div className="h-[500px] relative">
        <MapContainer
          center={center}
          zoom={10}
          className="h-full w-full"
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {workersWithLocation.map((worker) => (
            <Marker
              key={worker.id}
              position={[worker.latitude!, worker.longitude!]}
              icon={customIcon}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-center gap-3 mb-2">
                    {worker.avatar_url ? (
                      <img
                        src={worker.avatar_url}
                        alt={worker.full_name || 'Worker'}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00CED1] to-[#009999] flex items-center justify-center text-white font-bold">
                        {worker.full_name?.charAt(0) || 'W'}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{worker.full_name || '名前未設定'}</p>
                      {worker.work_style && (
                        <p className="text-xs text-gray-500">{worker.work_style}</p>
                      )}
                    </div>
                  </div>
                  {worker.preferred_prefecture && (
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">希望エリア:</span> {worker.preferred_prefecture}
                    </p>
                  )}
                  {worker.qualifications && worker.qualifications.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-700 mb-1">資格:</p>
                      <div className="flex flex-wrap gap-1">
                        {worker.qualifications.slice(0, 3).map((qual, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-0.5 bg-[#00CED1]/10 text-[#00CED1] text-xs rounded"
                          >
                            {qual}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

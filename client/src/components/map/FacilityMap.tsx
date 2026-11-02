import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import type { FacilityDto, FacilityType } from '@mobilitiq/shared';

function createPinIcon(type: FacilityType, selected: boolean) {
  const color =
    type === 'SPKLU' ? '#2563eb' : type === 'SPBKLU' ? '#10b981' : '#f59e0b';
  const size = selected ? 38 : 30;
  const ring = selected ? '0 0 0 4px rgba(37,99,235,0.28)' : '0 2px 6px rgba(15,23,42,0.28)';
  const glyph = type === 'SPKLU' ? '⚡' : type === 'SPBKLU' ? '🔋' : '🏢';

  return L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    html: `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${color};border:2.5px solid #ffffff;box-shadow:${ring};display:flex;align-items:center;justify-content:center;font-size:${selected ? 16 : 13}px;color:#fff;cursor:pointer;">${glyph}</div>`,
  });
}

function createPickerIcon() {
  return L.divIcon({
    className: '',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    html: `<div style="width:34px;height:34px;border-radius:9999px;background:#1e40af;border:3px solid #ffffff;box-shadow:0 3px 10px rgba(15,23,42,0.35);display:flex;align-items:center;justify-content:center;font-size:15px;color:#fff;">📍</div>`,
  });
}

function ViewportController({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [map, center[0], center[1], zoom]);
  return null;
}

function ClickCoordinatePicker({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPick(
        Number(e.latlng.lat.toFixed(6)),
        Number(e.latlng.lng.toFixed(6)),
      );
    },
  });
  return null;
}

export function FacilityMap({
  center,
  zoom = 12,
  facilities,
  selectedId,
  onSelectFacility,
  pickedLatLng,
  onPickLatLng,
  heightClassName = 'h-[440px]',
}: {
  center: [number, number];
  zoom?: number;
  facilities: FacilityDto[];
  selectedId?: string | null;
  onSelectFacility?: (fac: FacilityDto) => void;
  pickedLatLng?: [number, number] | null;
  onPickLatLng?: (lat: number, lng: number) => void;
  heightClassName?: string;
}) {
  return (
    <div className={`relative w-full overflow-hidden rounded-2xl border border-line ${heightClassName}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ViewportController center={center} zoom={zoom} />
        {onPickLatLng && <ClickCoordinatePicker onPick={onPickLatLng} />}

        {facilities.map((fac) => (
          <Marker
            key={fac.id}
            position={[fac.latitude, fac.longitude]}
            icon={createPinIcon(fac.facilityType, fac.id === selectedId)}
            eventHandlers={{
              click: () => onSelectFacility?.(fac),
            }}
          >
            <Popup>
              <div className="min-w-[190px] space-y-1 text-xs">
                <div className="font-bold text-slate-900">{fac.facilityName}</div>
                <div className="text-slate-600">{fac.fullAddress}</div>
                <div className="font-semibold text-blue-700">
                  {fac.powerOrSlotSpec} · {fac.tariffDisplay}
                </div>
                <div className="text-slate-500">
                  {fac.distanceKm} km · ~{fac.travelMinutes} mnt · {fac.operatingHours}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {pickedLatLng && (
          <Marker position={pickedLatLng} icon={createPickerIcon()}>
            <Popup>
              <div className="text-xs font-semibold">
                Titik dipilih: {pickedLatLng[0]}, {pickedLatLng[1]}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}


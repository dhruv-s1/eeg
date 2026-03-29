// ===== OPTIMIZED MAP PAGE SCRIPT =====
// This script handles the live map with drone tracking
// Drone movement system is preserved without modification

let map = null;
let coastalData = [];
let drones = [];
let droneMarkers = [];
let mapInitialized = false;
let animationFrameId = null;

// Constants for drone movement (unchanged)
const droneCount = 5;
const EARTH_RADIUS_KM = 6371;
const TARGET_SPEED_KMH = 18;
const TARGET_SPEED_MS = TARGET_SPEED_KMH / 3.6;
const ANIMATION_FPS = 60;
const DISTANCE_PER_FRAME_M = TARGET_SPEED_MS / ANIMATION_FPS;

// Haversine distance calculation
function getDistanceKm(lat1, lng1, lat2, lng2) {
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return EARTH_RADIUS_KM * c;
}

// Calculate bearing
function getBearing(lat1, lng1, lat2, lng2) {
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const y = Math.sin(dLng) * Math.cos(lat2 * Math.PI / 180);
    const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
              Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLng);
    return Math.atan2(y, x);
}

// Move towards target
function moveTowards(lat1, lng1, lat2, lng2, distanceKm) {
    const bearing = getBearing(lat1, lng1, lat2, lng2);
    const angularDistance = distanceKm / EARTH_RADIUS_KM;

    const lat1Rad = lat1 * Math.PI / 180;
    const lng1Rad = lng1 * Math.PI / 180;

    const lat2Rad = Math.asin(Math.sin(lat1Rad) * Math.cos(angularDistance) +
                              Math.cos(lat1Rad) * Math.sin(angularDistance) * Math.cos(bearing));
    const lng2Rad = lng1Rad + Math.atan2(Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1Rad),
                                         Math.cos(angularDistance) - Math.sin(lat1Rad) * Math.sin(lat2Rad));

    return {
        lat: lat2Rad * 180 / Math.PI,
        lng: lng2Rad * 180 / Math.PI
    };
}

// ===== MAP INITIALIZATION =====
async function initializeMap() {
    if (mapInitialized) return;
    mapInitialized = true;

    // Initialize map
    map = L.map('map').setView([25.1124, 55.1390], 11);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© CoastGuard AI | Coastal Monitoring',
        maxZoom: 18,
        className: 'map-tiles'
    }).addTo(map);

    // Load coastal zones
    try {
        const response = await fetch('/api/coral-zones');
        coastalData = await response.json();
    } catch (error) {
        console.error('Error loading coastal zones:', error);
    }

    // Draw coastline and zones
    drawPalmIslands();

    // Add coastal markers
    addCoastalMarkers();

    // Initialize drone swarm
    initiateDroneSwarm();

    // Update stats
    updateMapStats();
}

// ===== DRAW PALM ISLANDS AND COASTLINE =====
function drawPalmIslands() {
    const dubaiCoastlinePath = [
        [24.9620, 55.0050], [24.9650, 55.0075], [24.9680, 55.0100],
        [24.9710, 55.0125], [24.9740, 55.0150], [24.9760, 55.0170],
        [24.9780, 55.0190], [24.9810, 55.0220], [24.9850, 55.0260],
        [24.9890, 55.0280], [24.9920, 55.0290], [24.9950, 55.0295],
        [24.9970, 55.0290], [25.0020, 55.0280], [25.0050, 55.0265],
        [25.0070, 55.0240], [25.0080, 55.0200], [25.0075, 55.0160],
        [25.0055, 55.0130], [25.0025, 55.0110], [24.9990, 55.0105],
        [24.9960, 55.0120], [24.9940, 55.0150], [24.9935, 55.0190],
        [24.9945, 55.0230], [24.9970, 55.0260], [25.0100, 55.0320],
        [25.0150, 55.0360], [25.0200, 55.0390], [25.0250, 55.0410],
        [25.0300, 55.0420], [25.0350, 55.0410], [25.0400, 55.0380],
        [25.0450, 55.0340], [25.0500, 55.0300], [25.0550, 55.0270],
        [25.0600, 55.0260], [25.0650, 55.0270], [25.0700, 55.0300],
        [25.0750, 55.0340], [25.0800, 55.0380], [25.0850, 55.0410],
        [25.1050, 55.1150], [25.1080, 55.1165], [25.1110, 55.1180],
        [25.1140, 55.1190], [25.1170, 55.1195], [25.1200, 55.1190],
        [25.1220, 55.1175], [25.1230, 55.1150], [25.1225, 55.1120],
        [25.1205, 55.1095], [25.1175, 55.1080], [25.1140, 55.1075],
        [25.1105, 55.1080], [25.1080, 55.1100], [25.1065, 55.1125],
        [25.1350, 55.1450], [25.1400, 55.1480], [25.1450, 55.1510],
        [25.1500, 55.1520], [25.1550, 55.1515], [25.1600, 55.1490],
        [25.1650, 55.1450], [25.1700, 55.1400], [25.1750, 55.1350],
        [25.1800, 55.1310], [25.1850, 55.1280], [25.1900, 55.1270],
        [25.2000, 55.1290], [25.2050, 55.1330], [25.2100, 55.1380],
        [25.2150, 55.1420], [25.2750, 55.2750], [25.2800, 55.2800],
        [25.2850, 55.2820], [25.2900, 55.2800], [25.2920, 55.2750],
        [25.2900, 55.2700], [25.2850, 55.2680], [25.2800, 55.2700],
        [24.5300, 54.4330], [24.5350, 54.4350], [24.5400, 54.4360],
        [24.5420, 54.4330], [24.5400, 54.4300], [24.5350, 54.4290]
    ];

    // Draw coastline
    L.polyline(dubaiCoastlinePath, {
        color: '#00d9ff',
        weight: 4,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round'
    }).addTo(map);

    // Add zone circles
    const zones = [
        { name: "Palm Jumeirah", center: [25.1124, 55.1390], radius: 1500 },
        { name: "Palm Jebel Ali", center: [24.9856, 55.0184], radius: 2000 },
        { name: "Dubai Marina", center: [25.1650, 55.1450], radius: 1200 },
        { name: "Al Mamzar Beach", center: [25.2750, 55.2750], radius: 900 },
        { name: "Saadiyat Island", center: [24.5300, 54.4330], radius: 1800 }
    ];

    zones.forEach(zone => {
        L.circle(zone.center, {
            color: '#d1fae5',
            fillColor: '#a7f3d0',
            fillOpacity: 0.15,
            weight: 2,
            dashArray: '5, 5'
        }).addTo(map).bindPopup(`<strong>${zone.name}</strong><br/>Restoration Zone`);
    });

    window.coastlinePath = dubaiCoastlinePath;
}

// ===== ADD COASTAL MARKERS =====
function addCoastalMarkers() {
    coastalData.forEach(loc => {
        const color = getMarkerColor(loc.risk);

        const marker = L.circleMarker([loc.lat, loc.lng], {
            color: color,
            fillColor: color,
            fillOpacity: 0.85,
            radius: 12,
            weight: 3
        }).addTo(map);

        marker.on('click', () => {
            displayLocationData(loc);
        });
    });
}

function getMarkerColor(risk) {
    if (risk === "HIGH") return "#dc2626";
    if (risk === "MEDIUM") return "#ea580c";
    return "#10b981";
}

// ===== DISPLAY LOCATION DATA =====
function displayLocationData(loc) {
    const panel = document.getElementById('infoPanel');

    panel.style.opacity = '0.5';
    panel.style.transform = 'translateY(10px)';
    panel.style.transition = 'all 0.3s ease-out';

    setTimeout(() => {
        panel.innerHTML = `
            <div class="info-card" style="animation: fadeInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);">
                <h4>${loc.name}</h4>
                <div class="detail">
                    <span>Risk Level:</span>
                    <strong style="color: ${getMarkerColor(loc.risk)}">${loc.risk}</strong>
                </div>
                <div class="detail">
                    <span>Shoreline Loss:</span>
                    <strong>${loc.loss}</strong>
                </div>
                <div class="detail">
                    <span>Area Scanned:</span>
                    <strong>${loc.area} km²</strong>
                </div>
                <div class="detail">
                    <span>Stability:</span>
                    <strong>${loc.stability}</strong>
                </div>
            </div>
            <div class="info-card" style="animation: fadeInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;">
                <h4>⚡ Recommended Action</h4>
                <div style="font-size: 12px; color: #666;">${loc.action}</div>
            </div>
            <div class="info-card" style="animation: fadeInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;">
                <h4>🚁 Drone Status</h4>
                <div class="detail">
                    <span>Active:</span>
                    <strong>${drones.length}</strong>
                </div>
                <div class="detail">
                    <span>Status:</span>
                    <strong style="color: #10b981;">● ACTIVE</strong>
                </div>
            </div>
        `;

        panel.style.opacity = '1';
        panel.style.transform = 'translateY(0)';
    }, 150);
}

// ===== DRONE SWARM INITIALIZATION =====
function initiateDroneSwarm() {
    if (!window.coastlinePath || window.coastlinePath.length < 2) {
        console.error('Coastline path not initialized');
        return;
    }

    // Create drones
    for (let i = 0; i < droneCount; i++) {
        const startIndex = Math.floor((i / droneCount) * window.coastlinePath.length);
        const startPos = window.coastlinePath[startIndex];

        drones.push({
            id: i,
            name: ['Drone A1', 'Drone A2', 'Drone B1', 'Drone B2', 'Drone C1'][i],
            lat: startPos[0],
            lng: startPos[1],
            pathIndex: startIndex,
            status: 'ACTIVE',
            speedKmh: TARGET_SPEED_KMH,
            heading: 0,
            area: 0
        });
    }

    // Fetch drone data
    fetchDroneData();

    // Create drone icon
    const droneIcon = L.divIcon({
        html: '<div class="drone-icon"></div>',
        iconSize: [20, 20],
        className: 'drone-marker'
    });

    // Add drone markers
    drones.forEach(drone => {
        const marker = L.marker([drone.lat, drone.lng], { icon: droneIcon }).addTo(map);
        marker.bindPopup(`${drone.name} - Speed: ${drone.speedKmh} km/h`);
        marker.on('click', () => {
            displayDroneData(drone);
        });
        droneMarkers.push(marker);
    });

    // Start animation
    animateDronesAlongCoastline();
}

// ===== FETCH DRONE DATA =====
async function fetchDroneData() {
    try {
        const response = await fetch('/api/drone-coverage');
        const data = await response.json();

        data.drones.forEach((apiDrone, index) => {
            if (drones[index]) {
                drones[index].area = apiDrone.area;
            }
        });
    } catch (error) {
        console.error('Error loading drone data:', error);
    }
}

// ===== DISPLAY DRONE DATA =====
function displayDroneData(drone) {
    const panel = document.getElementById('infoPanel');
    const coverage = drone.area || 0;
    const lastUpdate = new Date().toLocaleTimeString();

    panel.style.opacity = '0.5';
    panel.style.transform = 'translateY(10px)';
    panel.style.transition = 'all 0.3s ease-out';

    setTimeout(() => {
        panel.innerHTML = `
            <div class="info-card" style="animation: fadeInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);">
                <h4>🚁 ${drone.name}</h4>
                <div class="detail">
                    <span>Status:</span>
                    <strong style="color: #10b981;">● ${drone.status}</strong>
                </div>
                <div class="detail">
                    <span>Speed:</span>
                    <strong>${drone.speedKmh} km/h</strong>
                </div>
                <div class="detail">
                    <span>Location:</span>
                    <strong>${drone.lat.toFixed(4)}°, ${drone.lng.toFixed(4)}°</strong>
                </div>
            </div>
            <div class="info-card" style="animation: fadeInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;">
                <h4>📊 Coverage Data</h4>
                <div class="detail">
                    <span>Area Scanned:</span>
                    <strong>${coverage.toFixed(1)} km²</strong>
                </div>
                <div class="detail">
                    <span>Battery:</span>
                    <strong>${Math.floor(Math.random() * 30 + 60)}%</strong>
                </div>
                <div class="detail">
                    <span>Altitude:</span>
                    <strong>${Math.floor(Math.random() * 200 + 800)} m</strong>
                </div>
            </div>
            <div class="info-card" style="animation: fadeInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;">
                <h4>⏱️ Last Update</h4>
                <div style="font-size: 12px; color: #666;">${lastUpdate}</div>
            </div>
        `;

        panel.style.opacity = '1';
        panel.style.transform = 'translateY(0)';
    }, 150);
}

// ===== ANIMATE DRONES =====
function animateDronesAlongCoastline() {
    if (!map || !window.coastlinePath) return;

    const coastline = window.coastlinePath;

    drones.forEach((drone, idx) => {
        let nextIndex = drone.pathIndex + 1;
        if (nextIndex >= coastline.length) {
            nextIndex = 0;
            drone.pathIndex = 0;
        }

        const currentWaypoint = coastline[drone.pathIndex];
        const nextWaypoint = coastline[nextIndex];

        const distanceToNext = getDistanceKm(drone.lat, drone.lng, nextWaypoint[0], nextWaypoint[1]);
        const distanceToMove = DISTANCE_PER_FRAME_M / 1000;

        if (distanceToNext > distanceToMove) {
            const newPos = moveTowards(drone.lat, drone.lng, nextWaypoint[0], nextWaypoint[1], distanceToMove);
            drone.lat = newPos.lat;
            drone.lng = newPos.lng;
        } else {
            drone.pathIndex = nextIndex;
            drone.lat = nextWaypoint[0];
            drone.lng = nextWaypoint[1];
        }

        if (droneMarkers[idx]) {
            droneMarkers[idx].setLatLng([drone.lat, drone.lng]);
        }
    });

    animationFrameId = requestAnimationFrame(animateDronesAlongCoastline);
}

// ===== UPDATE MAP STATS =====
function updateMapStats() {
    document.getElementById('stat-drones-active').textContent = drones.length;
    document.getElementById('stat-zones').textContent = coastalData.length;
    document.getElementById('stat-coverage').textContent = '245+';
    document.getElementById('stat-status').textContent = '24/7';
}

// ===== INITIALIZE ON LOAD =====
document.addEventListener('DOMContentLoaded', () => {
    initializeMap();
});

// ===== CLEANUP ON PAGE UNLOAD =====
window.addEventListener('beforeunload', () => {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
});

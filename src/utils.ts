import circle from "@turf/circle";

export function createGeoJSONCircle(center, radius) {
    const options = { steps: 64, units: 'meters'} as any;
    return circle(center, radius, options);
}
import axios from 'axios';
import { Feature } from 'geojson';
import { createGeoJSONCircle } from './utils';
import booleanIntersects from '@turf/boolean-intersects';
import { sendMailAboutNewAlerts } from './mail';

const URL = "https://warnungen.at-alert.at/api/filteredAlerts?from=2024-10-01&to=2024-11-05&limit=100&offset=0";
const URL_PATTERN = "https://warnungen.at-alert.at/api/filteredAlerts";

interface SearchParams {
    from: string;
    to: string;
    showExpired?: boolean;
    showMonthlyTest?: boolean;
};

export async function getData(searchParams: SearchParams) {
    
    const params = new URLSearchParams();
    params.append('from', searchParams.from);
    params.append('to', searchParams.to);
    const url = `${URL_PATTERN}?${params.toString()}`;

    const response = await axios.get(url);
    const data = response.data;

    let alerts = data.alerts;
    if(!searchParams.showExpired) {
        alerts = alerts.filter((alert) => { return new Date(alert.info_expires) > new Date(searchParams.to) });
    }

    if(!searchParams.showMonthlyTest) {
        alerts = alerts.filter((alert) => { return alert.alert_level !== 'MonthlyTest' });
    }

    return alerts;
}

export async function prepareResult(data, type) {
    const alerts = data.alerts;

    if(type === 'geojson') {
        const geoJSONAlerts = {
            type: 'FeatureCollection',
            features: []
        };

        const center = data.center;
        const radius = data.radius;

        alerts.forEach((alert) => {
            const feature = {
                type: 'Feature',
                properties: {
                    alert_level: alert.alert_level,
                    consolidation_identifier: alert.consolidation_identifier,
                    info_area_description: alert.info_area_description,
                    info_description: alert.info_description,
                    info_expires: alert.info_expires,
                    sender: alert.sender,
                    sent: alert.sent,
                    begin_date: alert.begin_date,
                    end_date: alert.end_date,
                    title: alert.title,
                    description: alert.description
                },
                geometry: {
                    type: 'Polygon',
                    coordinates: alert.polygons.map(polygon => polygon.map(([lat, lon]) => [lon, lat]))
                }
            } as Feature;

            let validToShow = true;
            if(center && radius){
                const centerCoords = center.split(',').map(Number);
                const radiusNum = Number(radius || 50);
                
                const circle = createGeoJSONCircle(centerCoords, radiusNum);
                validToShow = booleanIntersects(feature, circle);
            }

            if(validToShow){
                geoJSONAlerts.features.push(feature);
            }
        });

        return geoJSONAlerts;
    } else {
        const alertObj = {
            totalCount: alerts.length,
            alerts: alerts
        };

        return alertObj;
    }
}


let lastCallDate = new Date();
let alertCache = new Set();
let alertCacheDate = null;
export async function getNewAlerts() {
    const toDate = new Date();
    const toDateString = toDate.toISOString().split('T')[0];

    // clear the cache if the date has changed, no need to keep old alerts
    if(alertCacheDate !== toDateString) {
        alertCache.clear();
        alertCacheDate = toDateString;
    }

    let alerts = await getData({
        from: toDateString,
        to: toDateString,
        showExpired: true
    });

    alerts = alerts.filter((alert) => {
        return new Date(alert.sent) > lastCallDate;
    });

    alerts = alerts.filter((alert) => {
        if (!alertCache.has(alert.consolidation_identifier)) {
            alertCache.add(alert.consolidation_identifier);
            return true;
        }
        return false;
    });

    const result = await prepareResult({
        alerts: alerts,
    }, null) as any;

    result.lastCallDate = lastCallDate;
    result.currentCallDate = toDate;

    lastCallDate = toDate;

    sendMailAboutNewAlerts(result);
};
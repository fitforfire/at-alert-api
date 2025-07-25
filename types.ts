import { Feature } from "geojson"

export interface ATAlert {
    totalCount: number
    alerts: Alert[]
}

export interface Alert {
    alert_level: string
    consolidation_identifier: string
    info_area_description: string
    info_description: string
    info_expires: string
    polygons: number[][][]
    sender: string
    sent: string
    begin_date: string
    end_date: string
    title: string
    description: string
}
  
export interface ATAlertGeoJSON {
    type: 'FeatureCollection'
    features: Feature[]
}
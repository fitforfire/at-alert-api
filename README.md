# AT-Alert

A service for retrieving and managing at-alert data, including spatial and temporal filtering, and automated email notifications for new alerts.

## API Endpoints

### `/api/getData`
Retrieves all alert data.

**Parameters:**  
- `from` (string, optional): Start date for filtering alerts (format: `YYYY-MM-DD`). Defaults to today if not provided.
- `to` (string, optional): End date for filtering alerts (format: `YYYY-MM-DD`). Defaults to today if not provided.
- `expired` (boolean, optional): Whether to include expired alerts. Defaults to `true`.
- `center` (string, optional): Center point for radius-based filtering.
- `radius` (number, optional): Radius (in kilometers/meters) for spatial filtering.
- `type` (string, optional): If set to `"geojson"`, the response will be in [GeoJSON](https://geojson.org/) format; otherwise, alerts are returned as a standard JSON array.


### `/api/getActive`
Retrieves the not expired alerts.

**Parameters:**  
- `center` (string, optional): Center point for radius-based filtering.
- `radius` (number, optional): Radius (in kilometers/meters) for spatial filtering.
- `type` (string, optional): If set to `"geojson"`, the response will be in [GeoJSON](https://geojson.org/) format; otherwise, alerts are returned as a standard JSON array.

### Response:

```js
interface Alert {
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
```

---

## Cronjob: Sending New Alerts via Email

The cronjob is scheduled using the `CRONJOB_SCHEDULE` environment variable. At each scheduled interval, the system checks for new alerts and sends them via email to all registered users.

**How it works:**
- The cronjob runs automatically based on the defined schedule.
- It queries for new alerts since the last run.
- All users receive an email containing the details of these new alerts.

**Configuration:**
- Set the `CRONJOB_SCHEDULE` variable to define how often the job runs (e.g., `0 * * * *` for every hour).
- Ensure mail server settings are configured for email delivery.

---

## Startup

- `npm run dev`: Starts the node server in watch mode
- `npm run build`: Builds the dist files
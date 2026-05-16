import React, { useMemo } from "react";
import "./DataTable.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend);

function DataTable({ dataResponse, isLoading }) {
  if (isLoading) {
    return <p className="muted">Loading data...</p>;
  }

  if (!dataResponse || !dataResponse.data) {
    return <p className="muted">No data available.</p>;
  }

  const { role, device_id, data } = dataResponse;

  if (data.length === 0) {
    return (
      <div>
        <p className="muted">No records found for {device_id || "your account"}.</p>
        <p className="text-secondary">
          Role: <strong>{role}</strong>
        </p>
      </div>
    );
  }

  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  const charts = useMemo(() => {
    const rows = data || [];
    const sorted = rows.slice().sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const labels = sorted.map((r) => {
      try {
        return new Date(r.timestamp).toLocaleString();
      } catch (e) {
        return String(r.timestamp || "");
      }
    });
    const values = sorted.map((r) => Number(r.kwh) || 0);

    const agg = {};
    rows.forEach((r) => {
      const id = r.device_id || "(unknown)";
      if (!agg[id]) agg[id] = { sum: 0, count: 0 };
      agg[id].sum += Number(r.kwh) || 0;
      agg[id].count += 1;
    });
    const devices = Object.keys(agg);
    const avgValues = devices.map((d) => (agg[d].sum / agg[d].count) || 0);

    return {
      timeSeries: {
        labels: labels.slice(0, 200),
        datasets: [
          {
            label: "kWh",
            data: values.slice(0, 200),
            borderColor: "#4f46e5",
            backgroundColor: "rgba(79,70,229,0.15)",
            tension: 0.2,
            pointRadius: 1,
          },
        ],
      },
      deviceAvg: {
        labels: devices,
        datasets: [
          {
            label: "Average kWh",
            data: avgValues,
            backgroundColor: "#16a34a",
          },
        ],
      },
    };
  }, [data]);

  const formatCellValue = (value, columnName) => {
    if (typeof value === "number") {
      if (columnName === "kwh") {
        return value.toFixed(3);
      }
      return value;
    }
    if (typeof value === "object") {
      return JSON.stringify(value);
    }
    return String(value);
  };

  return (
    <div className="data-table-container">
      <div className="charts-row">
        <div className="card-chart">
          <h3>kWh Over Time</h3>
          <div className="chart-canvas">
            <Line
              data={charts.timeSeries}
              options={{
                plugins: { legend: { display: false } },
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>

        <div className="card-chart">
          <h3>Average kWh per Device</h3>
          <div className="chart-canvas">
            <Bar
              data={charts.deviceAvg}
              options={{
                plugins: { legend: { display: false } },
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>
      </div>
      <div className="data-table-info">
        <span className="badge">Role: {role}</span>
        {device_id && <span className="badge">Device: {device_id}</span>}
        <span className="badge badge-count">{data.length} records</span>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="table-row">
                {columns.map((col) => (
                  <td key={`${idx}-${col}`} className="table-cell">
                    {formatCellValue(row[col], col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;

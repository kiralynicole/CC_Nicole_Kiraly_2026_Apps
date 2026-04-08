import React from "react";
import "./DataTable.css";

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
        <p className="text-secondary">Role: <strong>{role}</strong></p>
      </div>
    );
  }

  const columns = data.length > 0 ? Object.keys(data[0]) : [];

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

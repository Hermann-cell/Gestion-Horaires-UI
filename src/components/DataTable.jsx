// src/components/DataTable.jsx
import React, { useState } from "react";
import { FiMoreHorizontal } from "react-icons/fi";
import ActionMenu from "./ActionMenu.jsx";

export default function DataTable({
  data,
  columns,
  onEdit,
  onDelete,
  onView,
  emptyMessage = "Aucune donnée trouvée",
}) {
  const [openRow, setOpenRow] = useState(null);

  return (
    <div className="table-container">
      <table className="users-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            <th></th>
          </tr>
        </thead>

        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(item) : item[col.key]}
                </td>
              ))}

              <td className="menu-cell">
                <button
                  className="menu-btn"
                  onClick={() =>
                    setOpenRow(openRow === item.id ? null : item.id)
                  }
                >
                  <FiMoreHorizontal />
                </button>

                {openRow === item.id && (
                  <ActionMenu
                    onClose={() => setOpenRow(null)}
                    onEdit={() => onEdit(item)}
                    onDelete={() => onDelete(item.id)}
                    onView={() => onView?.(item)}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {data.length === 0 && (
        <div className="empty-state">{emptyMessage}</div>
      )}
    </div>
  );
}
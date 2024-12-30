import React from 'react';
import styles from './crud.module.css';

interface EditableTableProps {
  records: any[];
  editingCell: { id: string; column: string } | null;
  handleCellDoubleClick: (id: string, column: string) => void;
  handleCellChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    id: string,
    column: string
  ) => void;
  handleCellBlur: (id: string, column: string, value: string) => void;
}

const EditableTable: React.FC<EditableTableProps> = ({
  records,
  editingCell,
  handleCellDoubleClick,
  handleCellChange,
  handleCellBlur,
}) => {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th className={styles.tableHeader}>ID</th>
          <th className={styles.tableHeader}>Date</th>
          <th className={styles.tableHeader}>Vendor</th>
          <th className={styles.tableHeader}>Team</th>
          <th className={styles.tableHeader}>Pickup Details</th>
          <th className={styles.tableHeader}>Drop Details</th>
          <th className={styles.tableHeader}>PB Amount</th>
          <th className={styles.tableHeader}>DC Amount</th>
          <th className={styles.tableHeader}>TSB</th>
          <th className={styles.tableHeader}>CID</th>
          <th className={styles.tableHeader}>Status</th>
        </tr>
      </thead>
      <tbody>
        {records.map((record) => (
          <tr key={record.id} className={styles.tableRow}>
            {/* ID (Non-editable) */}
            <td className={styles.tableCell}>{record.id}</td>

            {/* Date */}
            <td
              className={styles.tableCell}
              onDoubleClick={() => handleCellDoubleClick(record.id, 'date')}
            >
              {editingCell?.id === record.id && editingCell?.column === 'date' ? (
                <input
                  type="date"
                  value={record.date}
                  onChange={(e) => handleCellChange(e, record.id, 'date')}
                  onBlur={(e) => handleCellBlur(record.id, 'date', e.target.value)}
                  className={styles.inputField}
                  autoFocus
                />
              ) : (
                record.date
              )}
            </td>

            {/* Vendor */}
            <td
              className={styles.tableCell}
              onDoubleClick={() => handleCellDoubleClick(record.id, 'vendor')}
            >
              {editingCell?.id === record.id && editingCell?.column === 'vendor' ? (
                <input
                  type="text"
                  value={record.vendor}
                  onChange={(e) => handleCellChange(e, record.id, 'vendor')}
                  onBlur={(e) => handleCellBlur(record.id, 'vendor', e.target.value)}
                  className={styles.inputField}
                  autoFocus
                />
              ) : (
                record.vendor
              )}
            </td>

            {/* Team */}
            <td
              className={styles.tableCell}
              onDoubleClick={() => handleCellDoubleClick(record.id, 'team')}
            >
              {editingCell?.id === record.id && editingCell?.column === 'team' ? (
                <input
                  type="text"
                  value={record.team}
                  onChange={(e) => handleCellChange(e, record.id, 'team')}
                  onBlur={(e) => handleCellBlur(record.id, 'team', e.target.value)}
                  className={styles.inputField}
                  autoFocus
                />
              ) : (
                record.team
              )}
            </td>

            {/* Pickup Details */}
            <td className={styles.tableCell}>
              <div
                onDoubleClick={() => handleCellDoubleClick(record.id, 'pickup_name')}
              >
                {editingCell?.id === record.id && editingCell?.column === 'pickup_name' ? (
                  <input
                    type="text"
                    value={record.pickup_name || ''}
                    onChange={(e) => handleCellChange(e, record.id, 'pickup_name')}
                    onBlur={(e) => handleCellBlur(record.id, 'pickup_name', e.target.value)}
                    className={styles.inputField}
                    autoFocus
                  />
                ) : (
                  record.pickup_name || ''
                )}
              </div>
              <div
                onDoubleClick={() => handleCellDoubleClick(record.id, 'pickup_address')}
              >
                {editingCell?.id === record.id && editingCell?.column === 'pickup_address' ? (
                  <input
                    type="text"
                    value={record.pickup_address || ''}
                    onChange={(e) =>
                      handleCellChange(e, record.id, 'pickup_address')
                    }
                    onBlur={(e) =>
                      handleCellBlur(record.id, 'pickup_address', e.target.value)
                    }
                    className={styles.inputField}
                    autoFocus
                  />
                ) : (
                  record.pickup_address || ''
                )}
              </div>
              <div
                onDoubleClick={() => handleCellDoubleClick(record.id, 'pickup_phone')}
              >
                {editingCell?.id === record.id && editingCell?.column === 'pickup_phone' ? (
                  <input
                    type="text"
                    value={record.pickup_phone || ''}
                    onChange={(e) => handleCellChange(e, record.id, 'pickup_phone')}
                    onBlur={(e) =>
                      handleCellBlur(record.id, 'pickup_phone', e.target.value)
                    }
                    className={styles.inputField}
                    autoFocus
                  />
                ) : (
                  record.pickup_phone || ''
                )}
              </div>
            </td>

            {/* Drop Details */}
            <td className={styles.tableCell}>
              <div
                onDoubleClick={() => handleCellDoubleClick(record.id, 'drop_name')}
              >
                {editingCell?.id === record.id && editingCell?.column === 'drop_name' ? (
                  <input
                    type="text"
                    value={record.drop_name || ''}
                    onChange={(e) => handleCellChange(e, record.id, 'drop_name')}
                    onBlur={(e) => handleCellBlur(record.id, 'drop_name', e.target.value)}
                    className={styles.inputField}
                    autoFocus
                  />
                ) : (
                  record.drop_name || ''
                )}
              </div>
              <div
                onDoubleClick={() => handleCellDoubleClick(record.id, 'drop_address')}
              >
                {editingCell?.id === record.id && editingCell?.column === 'drop_address' ? (
                  <input
                    type="text"
                    value={record.drop_address || ''}
                    onChange={(e) =>
                      handleCellChange(e, record.id, 'drop_address')
                    }
                    onBlur={(e) =>
                      handleCellBlur(record.id, 'drop_address', e.target.value)
                    }
                    className={styles.inputField}
                    autoFocus
                  />
                ) : (
                  record.drop_address || ''
                )}
              </div>
              <div
                onDoubleClick={() => handleCellDoubleClick(record.id, 'drop_phone')}
              >
                {editingCell?.id === record.id && editingCell?.column === 'drop_phone' ? (
                  <input
                    type="text"
                    value={record.drop_phone || ''}
                    onChange={(e) => handleCellChange(e, record.id, 'drop_phone')}
                    onBlur={(e) =>
                      handleCellBlur(record.id, 'drop_phone', e.target.value)
                    }
                    className={styles.inputField}
                    autoFocus
                  />
                ) : (
                  record.drop_phone || ''
                )}
              </div>
            </td>

            {/* PB Amount and PB */}
          <td
            className={styles.tableCell}
            onDoubleClick={() => handleCellDoubleClick(record.id, 'pbAmt')}
          >
            {editingCell?.id === record.id && editingCell?.column === 'pbAmt' ? (
              <div className={styles.editableCell}>
                <input
                  type="number"
                  value={record.pbAmt || ''}
                  onChange={(e) => handleCellChange(e, record.id, 'pbAmt')}
                  onBlur={(e) => handleCellBlur(record.id, 'pbAmt', e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Tab') {
                      e.preventDefault();
                      handleCellDoubleClick(record.id, 'pb');
                    }
                  }}
                  className={styles.inputField}
                  autoFocus
                  tabIndex={0}
                />
              </div>
            ) : editingCell?.id === record.id && editingCell?.column === 'pb' ? (
              <div className={styles.editableCell}>
                <select
                  value={record.pb || ''}
                  onChange={(e) => handleCellChange(e, record.id, 'pb')}
                  onBlur={(e) => {
                    handleCellBlur(record.id, 'pb', e.target.value);
                    const nextRow = records[records.findIndex((r) => r.id === record.id) + 1];
                    if (nextRow) {
                      handleCellDoubleClick(nextRow.id, 'pbAmt');
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Tab' && !e.shiftKey) {
                      e.preventDefault();
                      const nextRow = records[records.findIndex((r) => r.id === record.id) + 1];
                      if (nextRow) {
                        handleCellDoubleClick(nextRow.id, 'pbAmt');
                      }
                    } else if (e.key === 'Tab' && e.shiftKey) {
                      e.preventDefault();
                      handleCellDoubleClick(record.id, 'pbAmt');
                    }
                  }}
                  className={styles.inputField}
                  tabIndex={0}
                  autoFocus
                >
                  <option value="">Select</option>
                  <option value="COD">COD</option>
                  <option value="Prepaid">Prepaid</option>
                  <option value="Due">Due</option>
                </select>
              </div>
            ) : (
              `${record.pbAmt || ''} (${record.pb || ''})`
            )}
          </td>
          {/* DC Amount and DC */}
          <td
            className={styles.tableCell}
            onDoubleClick={() => handleCellDoubleClick(record.id, 'dcAmt')}
          >
            {editingCell?.id === record.id && editingCell?.column === 'dcAmt' ? (
              <div className={styles.editableCell}>
                <input
                  type="number"
                  value={record.dcAmt || ''}
                  onChange={(e) => handleCellChange(e, record.id, 'dcAmt')}
                  onBlur={(e) => handleCellBlur(record.id, 'dcAmt', e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Tab') {
                      e.preventDefault();
                      handleCellDoubleClick(record.id, 'dc');
                    }
                  }}
                  className={styles.inputField}
                  autoFocus
                  tabIndex={0}
                />
              </div>
            ) : editingCell?.id === record.id && editingCell?.column === 'dc' ? (
              <div className={styles.editableCell}>
                <select
                  value={record.dc || ''}
                  onChange={(e) => handleCellChange(e, record.id, 'dc')}
                  onBlur={(e) => {
                    handleCellBlur(record.id, 'dc', e.target.value);
                    const nextRow = records[records.findIndex((r) => r.id === record.id) + 1];
                    if (nextRow) {
                      handleCellDoubleClick(nextRow.id, 'dcAmt');
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Tab' && !e.shiftKey) {
                      e.preventDefault();
                      const nextRow = records[records.findIndex((r) => r.id === record.id) + 1];
                      if (nextRow) {
                        handleCellDoubleClick(nextRow.id, 'dcAmt');
                      }
                    } else if (e.key === 'Tab' && e.shiftKey) {
                      e.preventDefault();
                      handleCellDoubleClick(record.id, 'dcAmt');
                    }
                  }}
                  className={styles.inputField}
                  tabIndex={0}
                  autoFocus
                >
                  <option value="">Select</option>
                  <option value="COD">COD</option>
                  <option value="Prepaid">Prepaid</option>
                  <option value="Due">Due</option>
                </select>
              </div>
            ) : (
              `${record.dcAmt || ''} (${record.dc || ''})`
            )}
          </td>


            {/* TSB (Non-editable) */}
            <td className={styles.tableCell}>{record.tsb}</td>

            {/* CID (Non-editable) */}
            <td className={styles.tableCell}>{record.cid}</td>

            {/* Status */}
            <td
              className={styles.tableCell}
              onDoubleClick={() => handleCellDoubleClick(record.id, 'status')}
            >
              {editingCell?.id === record.id && editingCell?.column === 'status' ? (
                <select
                  value={record.status}
                  onChange={(e) => handleCellChange(e, record.id, 'status')}
                  onBlur={(e) => handleCellBlur(record.id, 'status', e.target.value)}
                  className={styles.inputField}
                  autoFocus
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              ) : (
                record.status
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default EditableTable;

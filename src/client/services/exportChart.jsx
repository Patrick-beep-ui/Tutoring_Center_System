import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const exportToExcel = (data, filename, chartType) => {
  try {
      // Prepare data: optionally add chart type as metadata
  const wsData = [
    [`Chart Type: ${chartType}`],
    Object.keys(data[0]), // headers
    ...data.map(row => Object.values(row))
  ];

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Create workbook and append worksheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Chart Data");

  // Write workbook and trigger download
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], { type: "application/octet-stream" });
  saveAs(blob, `${filename}.xlsx`);
  }
  catch (error) {
    console.error("Error exporting to Excel:", error);
  }
};

export default exportToExcel;

export const exportToCSV = (rows, headers, filename) => {
    const csvContent = [
        headers.join(','), // Create the header row
        ...rows.map(row => row.join(',')) // Map each row to a string, joining columns by commas
    ].join('\n'); // Join all rows with newlines
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.target = "_blank";
    link.download = filename; // Download the CSV with the provided filename
    link.click();
};

export const exportToCSV = (data, filename, chartType) => {
    const csvRows = []
  
    // Add chart type as metadata
    csvRows.push(`Chart Type: ${chartType}`)
  
    // Get headers from keys of the first object
    const headers = Object.keys(data[0])
    csvRows.push(headers.join(","))
  
    // Convert each row to CSV
    for (const row of data) {
      const values = headers.map(header => {
        const escaped = ("" + row[header]).replace(/"/g, '\\"')
        return `"${escaped}"`
      })
      csvRows.push(values.join(","))
    }
  
    // Create Blob and trigger download
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${filename}.csv`
    a.click()
    URL.revokeObjectURL(url)
}

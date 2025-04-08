// Function to export chart as different formats
import html2canvas from "html2canvas"

export const exportChartAsImage = (format = "png", type) => {
    html2canvas(type).then((canvas) => {
      let imageURL;
  
      switch (format) {
        case "jpeg":
          imageURL = canvas.toDataURL("image/jpeg", 0.9);  // Optional quality argument
          break;
        case "webp":
          imageURL = canvas.toDataURL("image/webp");
          break;
        case "bmp":
          imageURL = canvas.toDataURL("image/bmp");
          break;
        default:
          imageURL = canvas.toDataURL("image/png");
          break;
      }
  
      const link = document.createElement("a");
      link.href = imageURL;
      link.download = `chart.${format}`;  // Filename with the desired extension
      link.click();  // Trigger the download
    });
  }
  
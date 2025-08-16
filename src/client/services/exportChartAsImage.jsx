import html2canvas from "html2canvas"

export const exportChartAsImage = (element, format = "png", name="chart") => {
  if (!element) return;
  html2canvas(element).then((canvas) => {
    let imageURL;

    switch (format) {
      case "jpeg":
        imageURL = canvas.toDataURL("image/jpeg", 0.9);
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
    link.download = `${name}.${format}`;
    link.click();
  });
};

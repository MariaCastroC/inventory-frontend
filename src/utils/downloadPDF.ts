export const downloadPDF = (url: string, fileName: string) => {
    // Descarga directa de PDF
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
}
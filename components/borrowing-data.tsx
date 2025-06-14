import axios from "axios";
import { getCookie } from "cookies-next";
import { Button } from "./ui/button";

export default function GetBorrowingData() {
  const handleDownload = async () => {
    try {
      const token = getCookie("token");
      const url =
        process.env.NEXT_PUBLIC_API_URL + "/api/admin/export/borrowings";

      const response = await axios.get(url, {
        responseType: "blob", // Penting untuk file biner
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Buat URL untuk blob
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));

      // Buat link untuk download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", "borrowings.xlsx");
      document.body.appendChild(link);

      // Trigger download
      link.click();

      // Bersihkan
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed. Please check console for details.");
    }
  };

  return (
    <Button className="w-full" onClick={handleDownload}>
      Download Borrowing Data
    </Button>
  );
}

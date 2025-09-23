import { CircularProgress } from "@mui/material";
export default function isLoadingSpinner() {
  return (
        <div className="flex justify-center items-center h-screen">
          <CircularProgress size="xl" />
        </div>
      );
}

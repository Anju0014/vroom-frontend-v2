

import { toast } from "react-hot-toast";

export const showSuccessToast = (message: string) => {
  toast.success(message, {
    duration: 5000,
    position: "top-right",
    style: {
      borderRadius: "8px",
      background: "#4CAF50",
      color: "#fff",
    },
  });
};

export const showErrorToast = (message: string) => {
  toast.error(message, {
    duration: 5000,
    position: "top-right",
    style: {
      borderRadius: "8px",
      background: "#F44336",
      color: "#fff",
    },
  });
};


export const closeToast = (toastId: string) => {
  toast.dismiss(toastId);
};


export const closeAllToasts = () => {
  toast.dismiss();
};

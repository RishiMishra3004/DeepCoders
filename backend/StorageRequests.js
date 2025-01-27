import axios from "axios";
import ErrorHandler from "./middlewares/error.js";

export const createNewUserDir = async (id) => {
  try {
    const response = await axios.post(
      "http://localhost:4001/userStorage/userDir",
      { id },
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      }
    );

    return response.data;

  } catch (error) {
    console.error("Error creating user directory:", error.message);
    throw new ErrorHandler(`${error.message}`, 400);
  }
};
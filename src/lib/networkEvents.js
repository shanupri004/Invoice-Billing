// Lets non-UI code (e.g. the Supabase client) ask the NetworkStatusModal to open.
const listeners = new Set();

export const onNetworkFailure = listener => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const reportNetworkFailure = () => {
  listeners.forEach(listener => listener());
};

// fetch() rejects with a TypeError ("Network request failed") when the
// request never reaches the server, e.g. Wi-Fi/data dropped mid-request.
export const fetchWithNetworkReporting = async (...args) => {
  try {
    return await fetch(...args);
  } catch (error) {
    if (error instanceof TypeError) reportNetworkFailure();
    throw error;
  }
};

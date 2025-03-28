// filepath: /taxfile-pro-mobile/taxfile-pro-mobile/src/utils/validators.js
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const validatePassword = (password) => {
  return password.length >= 6; // Example: Password must be at least 6 characters long
};

export const validateRequiredField = (value) => {
  return value.trim() !== ''; // Check if the field is not empty
};
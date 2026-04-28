const sanitizeInput = (input) => {
  if (!input) return "";
  return input
    .replace(/[<>]/g, "") // remove html
    .replace(/\s+/g, " ") // normalize space
    .trim()
    .slice(0, 50); // max length
};
export default sanitizeInput;

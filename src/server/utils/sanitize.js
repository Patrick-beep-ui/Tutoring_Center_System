export const sanitizeUserInput = (input) => {
    input = input.trim();
    input = input.replace(/['"]/g, "");
  
    return input;
  };
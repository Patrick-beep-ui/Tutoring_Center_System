export const sanitizeUserInput = (input) => {
  if (typeof input !== 'string') return '';

  // Recorta espacios
  let clean = input.trim();

  // Elimina caracteres peligrosos comunes
  clean = clean.replace(/[<>{};]/g, "");
  
  return clean;
};

// Telefonos de Guatemala: 8 digitos. Formato visual "1234 5678".
export function limpiarTelefono(valor) {
  return (valor || "").replace(/\D/g, "").slice(0, 8);
}

export function formatearTelefono(valor) {
  const limpio = limpiarTelefono(valor);
  return [limpio.slice(0, 4), limpio.slice(4, 8)].filter(Boolean).join(" ");
}

export function telefonoIncompleto(valor) {
  const limpio = limpiarTelefono(valor);
  return limpio.length > 0 && limpio.length < 8;
}

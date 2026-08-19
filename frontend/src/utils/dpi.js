// Validacion del DPI/CUI de Guatemala: 13 digitos = 8 (correlativo) +
// 1 (digito verificador) + 2 (departamento) + 2 (municipio).
// El verificador es el residuo modulo 11 de la suma de los primeros 8
// digitos, cada uno multiplicado por su posicion + 2 (pesos 2..9).
export function limpiarDPI(valor) {
  return (valor || "").replace(/\D/g, "").slice(0, 13);
}

// Formato visual "1234 56789 0101", igual al que trae la cedula/DPI física.
export function formatearDPI(valor) {
  const limpio = limpiarDPI(valor);
  return [limpio.slice(0, 4), limpio.slice(4, 9), limpio.slice(9, 13)].filter(Boolean).join(" ");
}

export function validarDPI(valor) {
  const limpio = limpiarDPI(valor);
  if (limpio.length === 0) return { estado: "vacio", mensaje: "" };
  if (limpio.length < 13) return { estado: "incompleto", mensaje: "El DPI debe tener 13 dígitos." };

  const digitos = limpio.split("").map(Number);
  let suma = 0;
  for (let i = 0; i < 8; i++) suma += digitos[i] * (i + 2);
  const verificadorCalculado = suma % 11;
  const verificadorIngresado = digitos[8];
  const departamento = Number(limpio.slice(9, 11));

  if (verificadorCalculado !== verificadorIngresado) {
    return { estado: "invalido", mensaje: "El DPI no es válido: el dígito verificador no coincide." };
  }
  if (departamento < 1 || departamento > 22) {
    return { estado: "invalido", mensaje: "El DPI no es válido: el código de departamento está fuera de rango." };
  }
  return { estado: "valido", mensaje: "DPI válido." };
}

export const getCurrentDateFormatted = () => {
    const fechaActual = new Date(); // Obtiene la fecha y hora actuales

    const anio = fechaActual.getFullYear();
    const mes = String(fechaActual.getMonth() + 1).padStart(2, '0'); // Los meses son 0-indexados (0=Enero)
    const dia = String(fechaActual.getDate()).padStart(2, '0');

    const fechaFormateada = `${anio}${mes}${dia}`;
    return fechaFormateada;
}
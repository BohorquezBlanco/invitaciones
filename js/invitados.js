// Acceso a datos del admin (tablas invitados y configuracion)
window.Invitados = {
  async listar() {
    const { data, error } = await db.from('invitados').select('*').order('creado_en', { ascending: false });
    if (error) throw error; return data;
  },
  async crear(i) {
    const { error } = await db.from('invitados').insert(i);
    if (error) throw error;
  },
  async actualizar(id, cambios) {
    const { error } = await db.from('invitados').update(cambios).eq('id', id);
    if (error) throw error;
  },
  async eliminar(id) {
    const { error } = await db.from('invitados').delete().eq('id', id);
    if (error) throw error;
  },
  cambiarReserva(id, reserva) {
    return this.actualizar(id, { reserva, fecha_reserva: new Date().toISOString() });
  },
  enlace(token) { return `${CONFIG.URL_INVITACION}?t=${token}`; },
  async fechaLimite() {
    const { data } = await db.from('configuracion').select('fecha_limite').eq('id', 1).single();
    return data ? new Date(data.fecha_limite) : null;
  },
  async guardarFechaLimite(iso) {
    const { error } = await db.from('configuracion').update({ fecha_limite: iso }).eq('id', 1);
    if (error) throw error;
  }
};

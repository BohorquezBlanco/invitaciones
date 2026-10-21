// Página pública del invitado (sin login, acceso por token)
const $ = (s) => document.querySelector(s);
const token = new URLSearchParams(location.search).get('t');
let datos;
const fmt = (f) => new Date(f).toLocaleString('es-BO', { dateStyle: 'long', timeStyle: 'short' });

async function cargar() {
  if (!token) return mostrarError();
  const { data, error } = await db.rpc('obtener_invitado', { p_token: token });
  if (error || !data?.length) return mostrarError();
  datos = data[0]; pintar();
}

function mostrarError() { $('#cargando').hidden = true; $('#error').hidden = false; }

function pintar() {
  $('#cargando').hidden = true; $('#contenido').hidden = false;
  $('#nombre').textContent = `${datos.nombres} ${datos.apellidos}`;
  $('#estado').textContent = !datos.fecha_reserva ? 'Aún no has respondido'
    : datos.reserva ? 'Asistencia confirmada' : 'Has indicado que no asistirás';
  $('#limite').textContent = datos.puede_modificar
    ? `Puedes cambiar tu respuesta hasta el ${fmt(datos.fecha_limite)}.`
    : 'El plazo para responder ya terminó.';
  $('#botones').hidden = !datos.puede_modificar;
}

async function responder(valor) {
  const { error } = await db.rpc('confirmar_reserva', { p_token: token, p_reserva: valor });
  $('#mensaje').textContent = error ? error.message : valor ? '¡Gracias por confirmar!' : 'Respuesta registrada.';
  if (!error) await cargar();
}

$('#btn-si').onclick = () => responder(true);
$('#btn-no').onclick = () => responder(false);
cargar();

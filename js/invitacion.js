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

  const comp = $('#complemento');
  comp.textContent = datos.complemento ?? '';
  comp.hidden = !datos.complemento;

  console.log(datos.nombres);
  

  const n = datos.cantidad ?? 1;
  $('#cantidad').textContent = n === 1 ? 'Invitación para 1 persona' : `Invitación para ${n} personas`;

  $('#estado').textContent = !datos.fecha_reserva ? 'Confirmar porfavor su asistencia presionando el boton'
    : datos.reserva ? 'Asistencia confirmada con éxito.' : 'Lamentamos que no puedas acompañarnos.';
  $('#limite').textContent = datos.puede_modificar
    ? `Puedes cambiar tu respuesta hasta el ${fmt(datos.fecha_limite)}.`
    : 'El plazo para responder ya terminó.';
  $('#botones').hidden = !datos.puede_modificar;
}


async function responder(valor) {
  const { error } = await db.rpc('confirmar_reserva', { p_token: token, p_reserva: valor });
  $('#mensaje').textContent = error ? error.message : valor ? ' Agradecemos tu confirmación y nos vemos muy pronto para celebrar juntos.' : 'Agradecemos sinceramente que nos hayas notificado.';
  if (!error) await cargar();
}

$('#btn-si').onclick = () => responder(true);
$('#btn-no').onclick = () => responder(false);
cargar();

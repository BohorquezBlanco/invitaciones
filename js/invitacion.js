// Página pública del invitado (sin login, acceso por token)
const $ = (s) => document.querySelector(s);
const token = new URLSearchParams(location.search).get('t');
let datos;
const fmt = (f) => new Date(f).toLocaleString('es-BO', { dateStyle: 'long', timeStyle: 'short' });

async function cargar() {
  if (!token) { $('#cargando').hidden=true; $('#error').hidden=false; $('#error h1').textContent='Nos encantará verte'; $('#error p').textContent='Para confirmar tu asistencia, abre el enlace personal que te enviamos.'; return; }
  let resultado; try { resultado=await db.rpc('obtener_invitado', { p_token: token }); } catch { return mostrarError(); }
  const { data, error } = resultado;
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
  const botones=Array.from(document.querySelectorAll('#botones button'));
  botones.forEach(b=>b.disabled=true);
  $('#mensaje').textContent='Guardando tu respuesta…';
  try {
    const { error } = await db.rpc('confirmar_reserva', { p_token: token, p_reserva: valor });
    if(error) throw error;
    await cargar();
    const texto=valor?'Agradecemos tu confirmación. ¡Nos vemos muy pronto para celebrar juntos!':'Agradecemos sinceramente que nos hayas notificado.';
    $('#mensaje').textContent=texto;
  } catch(error) { $('#mensaje').textContent=error.message || 'No pudimos guardar la respuesta. Intenta nuevamente.'; }
  finally { botones.forEach(b=>b.disabled=false); }
}

$('#btn-si').onclick = () => responder(true);
$('#btn-no').onclick = () => responder(false);
cargar();

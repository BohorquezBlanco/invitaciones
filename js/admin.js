// Interfaz del centro admin
const $ = (s) => document.querySelector(s);
let lista = [], filtro = '', estado = 'todos';

const esc = (t) => String(t ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = (f) => f ? new Date(f).toLocaleString('es-BO', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

function aviso(msg, error) {
  const t = $('#aviso'); t.textContent = msg; t.className = 'aviso ' + (error ? 'error' : 'ok') + ' visible';
  clearTimeout(aviso.t); aviso.t = setTimeout(() => t.classList.remove('visible'), 3000);
}

async function iniciar() {
  const s = await Auth.sesion();
  $('#vista-login').hidden = !!s;
  $('#vista-panel').hidden = !s;
  if (s) { $('#usuario').textContent = s.user.email; await cargar(); }
}

async function cargar() {
  try {
    lista = await Invitados.listar();
    const lim = await Invitados.fechaLimite();
    if (lim) $('#fecha-limite').value = new Date(lim.getTime() - lim.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    pintar();
  } catch (e) { aviso(e.message, true); }
}

function pintar() {
  const conf = lista.filter(i => i.reserva).length;
  $('#total').textContent = lista.length;
  $('#confirmados').textContent = conf;
  $('#no-confirmados').textContent = lista.length - conf;

  const q = filtro.toLowerCase();
  const filas = lista.filter(i =>
    (estado === 'todos' || (estado === 'si') === i.reserva) &&
    `${i.nombres} ${i.apellidos} ${i.telefono ?? ''}`.toLowerCase().includes(q));

  $('#tabla').innerHTML = filas.length ? filas.map(i => `
    <tr>
      <td><strong>${esc(i.nombres)} ${esc(i.apellidos)}</strong></td>
      <td>${esc(i.telefono) || '—'}</td>
      <td><button class="estado ${i.reserva ? 'si' : 'no'}" data-accion="estado" data-id="${i.id}">
        ${i.reserva ? 'Confirmado' : 'No confirmado'}</button></td>
      <td class="tenue">${fmt(i.fecha_reserva)}</td>
      <td class="acciones">
        <button data-accion="enlace" data-id="${i.id}">Copiar enlace</button>
        <button data-accion="editar" data-id="${i.id}">Editar</button>
        <button class="peligro" data-accion="eliminar" data-id="${i.id}">Eliminar</button>
      </td>
    </tr>`).join('') : '<tr><td colspan="5" class="vacio">No hay invitados. Agrega el primero con “Agregar invitado”.</td></tr>';
}

function abrirModal(i) {
  $('#modal-titulo').textContent = i ? 'Editar invitado' : 'Agregar invitado';
  $('#f-id').value = i?.id ?? '';
  $('#f-nombres').value = i?.nombres ?? '';
  $('#f-apellidos').value = i?.apellidos ?? '';
  $('#f-telefono').value = i?.telefono ?? '';
  $('#f-reserva').checked = !!i?.reserva;
  $('#modal').showModal();
}

$('#form-invitado').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = $('#f-id').value;
  const datos = {
    nombres: $('#f-nombres').value.trim(),
    apellidos: $('#f-apellidos').value.trim(),
    telefono: $('#f-telefono').value.trim() || null,
    reserva: $('#f-reserva').checked
  };
  try {
    if (id) {
      if (lista.find(x => x.id === id).reserva !== datos.reserva) datos.fecha_reserva = new Date().toISOString();
      await Invitados.actualizar(id, datos);
    } else {
      if (datos.reserva) datos.fecha_reserva = new Date().toISOString();
      await Invitados.crear(datos);
    }
    $('#modal').close(); aviso('Invitado guardado'); await cargar();
  } catch (err) { aviso(err.message, true); }
});

$('#tabla').addEventListener('click', async (e) => {
  const b = e.target.closest('button'); if (!b) return;
  const i = lista.find(x => x.id === b.dataset.id); if (!i) return;
  try {
    if (b.dataset.accion === 'estado') { await Invitados.cambiarReserva(i.id, !i.reserva); await cargar(); }
    if (b.dataset.accion === 'editar') abrirModal(i);
    if (b.dataset.accion === 'enlace') { await navigator.clipboard.writeText(Invitados.enlace(i.token)); aviso('Enlace copiado'); }
    if (b.dataset.accion === 'eliminar' && confirm(`¿Eliminar a ${i.nombres} ${i.apellidos}?`)) {
      await Invitados.eliminar(i.id); aviso('Invitado eliminado'); await cargar();
    }
  } catch (err) { aviso(err.message, true); }
});

$('#btn-agregar').onclick = () => abrirModal();
$('#btn-cancelar').onclick = () => $('#modal').close();
$('#buscar').oninput = (e) => { filtro = e.target.value; pintar(); };
$('#filtro-estado').onchange = (e) => { estado = e.target.value; pintar(); };
$('#btn-salir').onclick = async () => { await Auth.salir(); iniciar(); };

$('#btn-guardar-limite').onclick = async () => {
  const v = $('#fecha-limite').value; if (!v) return;
  try { await Invitados.guardarFechaLimite(new Date(v).toISOString()); aviso('Fecha límite actualizada'); }
  catch (err) { aviso(err.message, true); }
};

$('#form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  try { await Auth.entrar($('#email').value, $('#password').value); iniciar(); }
  catch { $('#login-error').textContent = 'Correo o contraseña incorrectos'; }
});

iniciar();

// Sesión del administrador
window.Auth = {
  async sesion() { return (await db.auth.getSession()).data.session; },
  async entrar(email, password) {
    const { error } = await db.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },
  async salir() { await db.auth.signOut(); }
};

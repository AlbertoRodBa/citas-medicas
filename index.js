const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const _ = require('lodash');
const chalk = require('chalk');

const app = express();
app.use(express.json());

const usuarios = [];

// Función registro usuario
function registrarUsuario(data) {
  const { name, gender } = data;
  const nombre = name.first;
  const apellido = name.last;
  const genero = gender;

  // Código identificador único 
  const codigoIdentificador = uuidv4();

  // Hora de registro - Moment.js
  const horaRegistro = moment().format('YYYY-MM-DD HH:mm:ss');

  const nuevoUsuario = {
    nombre,
    apellido,
    genero,
    horaRegistro,
    codigoIdentificador,
  };

  usuarios.push(nuevoUsuario);

  return nuevoUsuario;
}

// Ruta para mostrar la lista de usuarios
app.get('/usuarios', (req, res) => {
  const usuariosPorGenero = _.groupBy(usuarios, 'genero');
  const usuariosMale = usuariosPorGenero.male || [];
  const usuariosFemale = usuariosPorGenero.female || [];

  let listaUsuariosMale = usuariosMale 
    .map((usuario, index) => {
      return chalk.blue.bgWhite(`\t${index + 1}. ${usuario.nombre} ${usuario.apellido} - Registrado el ${usuario.horaRegistro}`);  // \t = Tabulador en cadena
    })
    .join('\n');

  let listaUsuariosFemale = usuariosFemale
    .map((usuario, index) => {
      return chalk.blue.bgWhite(`\t${index + 1}. ${usuario.nombre} ${usuario.apellido} - Registrado el ${usuario.horaRegistro}`);
    })
    .join('\n');

  console.log(chalk.bold.bgWhite.blue('Hombres:'));
  console.log(listaUsuariosMale);
  console.log(chalk.bold.bgWhite.blue('Mujeres:'));
  console.log(listaUsuariosFemale);

  let contenido = `
    <h1>Hombres:</h1>
    <ul>${usuariosMale.map(usuario => `<li>${usuario.nombre} ${usuario.apellido} - Registrado el ${usuario.horaRegistro}</li>`).join('')}</ul>
    <h1>Mujeres:</h1>
    <ul>${usuariosFemale.map(usuario => `<li>${usuario.nombre} ${usuario.apellido} - Registrado el ${usuario.horaRegistro}</li>`).join('')}</ul>
    <form action="/usuarios" method="post">
      <button type="submit">Crear Usuario</button>
    </form>
  `;

  res.send(contenido);
});

// Ruta para registrar un nuevo usuario
app.post('/usuarios', (req, res) => {
  axios
    .get('https://randomuser.me/api/')
    .then((response) => {
      const usuarioRandom = response.data.results[0];
      const nuevoUsuario = registrarUsuario(usuarioRandom);

      // Redirige de vuelta a página de usuarios después de crear uno
      res.redirect('/usuarios');
    })
    .catch((error) => {
      console.error('Error al obtener datos del usuario aleatorio:', error.response.data);
      res.status(500).json({ error: 'Error al obtener datos del usuario aleatorio' }); // 500 = Error interno
    });
});

// Escuchar conexiones http en puerto 3000
app.listen(3000, () => {
  console.log('Servidor iniciado en puerto 3000');
});

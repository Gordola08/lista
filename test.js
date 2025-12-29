const handler = require('./netlify/functions/lista.js').handler;

handler().then(result => {
  console.log('Status:', result.statusCode);
  console.log('Content-Type:', result.headers['Content-Type']);
  console.log('\nConteúdo (primeiras 500 caracteres):\n');
  console.log(result.body.substring(0, 500));
}).catch(err => {
  console.error('Erro:', err.message);
});

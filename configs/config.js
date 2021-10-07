const URL = 'https://dkneu.airzonecloud.com/api/v1/history/events';
// const URL = 'https://predkneu.airzonecloud.com:8443/api/v1/history/events';
const URL_INSTALLATIONS = 'https://dkneu.airzonecloud.com/api/v1/installations/dknEU';
// const URL_INSTALLATIONS = 'https://predkneu.airzonecloud.com:8443/api/v1/installations/dknEU';
// const INSTALLATION = '5d303c3e035590649fb161aa';

const USUARIO = 'dfernandez@altracorporacion.es';
const PASSWORD = 'password';

process.env.PORT = process.env.PORT || 3000;

module.exports = {URL,URL_INSTALLATIONS,USUARIO,PASSWORD}
const { Console } = require('console');
const https = require('https');
const CONFIG = require('./../configs/config')

//Localiza un valor dentro del rango de valores, el del momento concreto
Localizar_valor_pm25 = (datos, momento) => {
    muestra = 0;
    if (momento > Date.parse(datos[datos.length - 1].date)) { //Si no hay muestras posteriores al momento, nos quedamos con la última
        return datos[datos.length - 1].value;
    }
    while(momento > Date.parse(datos[muestra].date))
    {
        muestra++;
    }
    if (muestra > 0) {
        return datos[muestra - 1].value;//LUEGO HAY QUE CAMBIAR ESTO A LA MUESTRA ANTERIOR

    }else{
        return datos[muestra].value;//No debe ocurrir nunca, ya que cogemos un día antes para evitar esto.
    }

}

Localizar_indice_pm25 = (datos, momento) => {
    muestra = 0;
    if (momento > Date.parse(datos[datos.length - 1].date)) { //Si no hay muestras posteriores al momento, nos quedamos con la última
        return datos.length - 1;
    }
    // console.log('Momento:',momento)
    // console.log('fffff:',datos[muestra].date)
    // console.log('Fehca:', Date.parse(datos[muestra].date))
    while(momento > Date.parse(datos[muestra].date))
    { 
        muestra++;
        // console.log('Muestra:',muestra)
        // console.log('Momento:',momento)
    }
    if (muestra > 0) {
        return muestra - 1;//LUEGO HAY QUE CAMBIAR ESTO A LA MUESTRA ANTERIOR

    }else{
        return 0;//No debe ocurrir nunca, ya que cogemos un día antes para evitar esto.
    }

}

Obtener_array_completo = (datos, fechaInicial, fechaFinal, tiempo, fechaLocal) => {
    valoresNuevos = [];
    fechasNuevas = [];
    if (datos.length > 0)
    {
        if (fechaInicial)
        {
            fecha = new Date(Date.parse(fechaInicial));
        }else{
            fecha = new Date(Date.parse(datos[0].date));
        }
        if (fechaFinal) {
            fechaFin = new Date(Date.parse(fechaFinal));
        }else{
            fechaFin = new Date(Date.parse(datos[datos.length - 1].date));
        }
        if (!tiempo){
            if (datos.length < 500)
            {
                tiempo = 1;
            }else{
                auxT = fechaFin.getTime() - fecha.getTime();
                tiempo = auxT / 500000;
            }
        }
        console.log(`${fecha}-${fechaFin} con tiempo ${tiempo}`)

        let array = Crear_array_25 (datos, fechaInicial, fechaFinal, 30);
        let fechaServer = new Date();
        console.log('Fecha Local rec:', fechaLocal)
        let fechaLocalDate = new Date(Date.parse(fechaLocal));
        console.log('fechaLocalDate:', fechaLocalDate);
        console.log('fechaServer:', fechaServer)
        let diferencia = fechaLocalDate.getTime() - fechaServer.getTime();
        console.log(array.fechas.length);

        for(let i=0; i < array.fechas.length; i++) {
            let fechaMuestra = new Date(Date.parse(array.fechas[i]));
            // console.log(`Fecha de ${i}/${array.fechas.length}:${fechaMuestra}`)
            fechaMuestra.setTime(fechaMuestra.getTime() + diferencia); 
            fechasNuevas.push(`${fechaMuestra.getHours()}:${fechaMuestra.getMinutes()}:${fechaMuestra.getSeconds()}`);
            valoresNuevos.push(array.valores[i]);
        }

        console.log('Fin del while:')
    }
    return {
        valores: valoresNuevos,
        fechas: fechasNuevas
    }
}

Crear_array_25 = (datos, fechaInicial, fechaFinal, tiempo) => {
        valores = [];
        fechas = [];
        if (datos.length > 0)
        {
            if (fechaInicial)
            {
                fecha = new Date(Date.parse(fechaInicial));
            }else{
                fecha = new Date(Date.parse(datos[0].fecha));
            }
            if (fechaFinal) {
                fechaFin = new Date(Date.parse(fechaFinal));
            }else{
                fechaFin = new Date(Date.parse(datos[datos.length - 1].fecha));
            }
            console.log('Datos lenght:', datos.length)
            if (!tiempo){
                auxT = fechaFin.getTime() - fecha.getTime();
                tiempo = auxT / 500000;
                if (tiempo < 1) tiempo = 1;
            }

            console.log(`${fecha}-${fechaFin} con tiempo ${tiempo}`)
            while (fecha < fechaFin) {
                valor = Localizar_valor_pm25(datos, fecha);
                valores.push(valor);
                // fechas.push(`${fecha.getHours()}:${fecha.getMinutes()}`);
                fechas.push(fecha.toISOString());
                fecha.setSeconds(fecha.getSeconds() + tiempo);
                // console.log(fecha)
            }
            console.log('Fin del while:')
        }
        return {
            valores,
            fechas
        }
}

Obtener_instalacion_y_datos = async(mac, fechaInicio, fechaFin, parametro,tokenActual) => {
    try{
        const instalacionId = await Obtener_installation_id (mac,tokenActual);
        const datos = await Obtener_datos (mac, fechaInicio, fechaFin, parametro,tokenActual,instalacionId);
        return datos;
    }catch(error)
    {
        console.log('Error aqui:', error)
        throw new Error(error);
    }
}

Obtener_datos = (mac, fechaInicio, fechaFin, parametro,tokenActual,instalacionId) => {
    return new Promise((resolve,reject)=>{
        https.get(`${CONFIG.URL}/${mac}/dknEU?start=${fechaInicio}&params=${parametro}&finish=${fechaFin}&installationId=${instalacionId}`
                    ,{headers: {Authorization: `Bearer ${tokenActual}`}}
                    , (res)=>{
                        let data='';
                        res.on("data", (chunk)=>{
                            data += chunk;
                        })
                        res.on("end", ()=>{
                            console.log('Descarga Ok')
                            resolve(JSON.parse(data));
                        })
                        res.on("error", (error) => {
                            console.log('Error:', error)
                            reject(error);
                        })
                    });
    })
}

Login = () => {
    var options = {
        hostname: 'dkneu.airzonecloud.com',
        // port: 8443,
        path: '/api/v1/auth/login/dknEU',
        method: 'POST',
        headers: {
             'Content-Type': 'application/json'
           }
      };  
      const postData = JSON.stringify({"email": CONFIG.USUARIO, "password": CONFIG.PASSWORD});  
    //   console.log('Login:')
    //   console.log('Options:', options);
    //   console.log('Postdata:', postData)
    return new Promise ((resolve, reject) => {
        var req = https.request(options, (res) => {
            // console.log('statusCode:', res.statusCode);
            // console.log('headers:', res.headers);
          
            res.on('data', (d) => {
            //   process.stdout.write(d);
                // console.log(JSON.parse(d));
                resolve(JSON.parse(d));
            });
          });
          
          req.on('error', (e) => {
            console.error(e);
            reject(true);
          });
          
          req.write(postData);
          req.end();        
    })
}

function Obtener_installation_id (mac, tokenActual) {
    console.log('Paso 1');
    return new Promise((resolve,reject)=>{
        https.get(`${CONFIG.URL_INSTALLATIONS}`
        ,{headers: {Authorization: `Bearer ${tokenActual}`}}
        , (res)=>{
            let data='';
            res.on("data", (chunk)=>{
                data += chunk;
            })
            res.on("end", ()=>{
                console.log('Descarga instalación Ok:', data);
                if (data.indexOf('Bad token') > -1) {
                    resolve(data);
                    return;
                }
                let instalaciones = JSON.parse(data);

                console.log(instalaciones)
                for (let i = 0; i < instalaciones.length; i++)
                {
                    for (let j = 0; j < instalaciones[i].devices.length; j++)
                    {
                        if (instalaciones[i].devices[j].mac == mac)
                        {
                            console.log('Instalacion localizada:', instalaciones[i]._id)
                            resolve(instalaciones[i]._id);
                            return;
                        }
                        
                    }
                }
                reject('MAC no encontrada')
            })
            res.on("error", (error) => {
                console.log('Error:', error)
                reject(error);
            })
        });


    })
}

module.exports = {Obtener_datos,Crear_array_25,Obtener_array_completo,Login,Obtener_instalacion_y_datos}
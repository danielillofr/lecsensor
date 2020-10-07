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
    console.log('Momento:',momento)
    console.log('fffff:',datos[muestra].date)
    console.log('Fehca:', Date.parse(datos[muestra].date))
    while(momento > Date.parse(datos[muestra].date))
    {
        muestra++;
        console.log('Muestra:',muestra)
        console.log('Momento:',momento)
    }
    if (muestra > 0) {
        return muestra - 1;//LUEGO HAY QUE CAMBIAR ESTO A LA MUESTRA ANTERIOR

    }else{
        return 0;//No debe ocurrir nunca, ya que cogemos un día antes para evitar esto.
    }

}

Obtener_array_completo = (datos, fechaInicial, fechaFinal, tiempo, fechaLocal) => {
    valores = [];
    fechas = [];
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

        primera = Localizar_indice_pm25(datos,fecha);
        ultima = Localizar_indice_pm25(datos,fechaFin);
        console.log('Primera:',primera)
        console.log('ultima:',ultima)
        let fechaServer = new Date();
        console.log(fechaLocal)
        let fechaLocalDate = new Date(Date.parse(fechaLocal));
        console.log(fechaLocalDate);
        console.log(fechaServer)
        let diferencia = fechaLocalDate.getTime() - fechaServer.getTime();
        console.log(diferencia);
        for(i=primera; i < ultima; i++) {
            let fechaMuestra = new Date(Date.parse(datos[i].date));
            //console.log(fechaMuestra)
            fechaMuestra.setTime(fechaMuestra.getTime() + diferencia); 
            // console.log(fechaMuestra)
            fechas.push(`${fechaMuestra.getHours()}:${fechaMuestra.getMinutes()}:${fechaMuestra.getSeconds()}`);
            valores.push(datos[i].value);
        }

        console.log('Fin del while:')
    }
    return {
        valores,
        fechas
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
            while (fecha < fechaFin) {
                valor = Localizar_valor_pm25(datos, fecha);
                valores.push(valor);
                // fechas.push(`${fecha.getHours()}:${fecha.getMinutes()}`);
                fechas.push(fecha.toISOString());
                fecha.setSeconds(fecha.getSeconds() + tiempo);
                console.log(fecha)
            }
            console.log('Fin del while:')
        }
        return {
            valores,
            fechas
        }
}

Obtener_datos = (mac, fechaInicio, fechaFin, parametro) => {
    return new Promise((resolve,reject)=>{
        https.get(`${CONFIG.URL}/${mac}/aidoo?start=${fechaInicio}&param=${parametro}&finish=${fechaFin}&installationId=${CONFIG.INSTALLATION}`
                    ,{headers: {Authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiI1MlJkWFcyS3FJS3lTc0N6N3Z6N1BoaXIxSWdHVHpvOSIsInRva2VuSWQiOiIyMDVhZjI3ZC02MzM3LTQ3ODAtYjc4ZS0zZjYyNWJlNDkyYWIiLCJqdGkiOiIwYzNiZDZhOC1jYjZjLTRiMGItOGEyZS1kODMxM2Y1YWNhZGYiLCJpYXQiOjE2MDE5ODU5MTUsImV4cCI6MTYwMjE1ODcxNX0.I7Rnc6v1N5Sx-uaDo5lmznkX03k7Qyccx5OQ2ubEs00'}}
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

module.exports = {Obtener_datos,Crear_array_25,Obtener_array_completo}
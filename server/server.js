const Datos = require('./../utils/datos')
const Config = require('./../configs/config')
const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const app = express();
const datosLogin = require('./../configs/usuarios.json')

let tokenActual = datosLogin.token;


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json());


app.use(express.static( './public'));    


app.get('/csv/:mac', (req,res)=>{
    const mac=req.params.mac;
    if(!req.query.start)
    {
        return res.json({
            ok: false,
            error: 'start es obligatorio'
        })
    }
    const start = req.query.start;
    if(!req.query.finish)
    {
        return res.json({
            ok: false,
            error: 'finish es obligatorio'
        })
    }
    const finish = req.query.finish;
    if(!req.query.fechaLocal)
    {
        return res.json({
            ok: false,
            error: 'fechaLocal es obligatorio'
        })
    }
    const fechaLocal = req.query.fechaLocal;
    if(!req.query.param)
    {
        return res.json({
            ok: false,
            error: 'param es obligatorio'
        })
    }
    const param = req.query.param;    
    console.log('fechaLocal:', fechaLocal);
    // Datos.Obtener_datos(mac,start,finish,param,tokenActual)
    Datos.Obtener_instalacion_y_datos(mac,start,finish,param,tokenActual)
    .then((resultado)=>{
        // console.log('Resultado:', resultado);
        array = Datos.Obtener_array_completo(resultado,start,finish,1,fechaLocal);
        // console.log(array)
        console.log('Enviando el fichero')
    
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', 'attachment; filename=datos.csv');
        fila=[];
        for (i=0; i < array.fechas.length;i++) {
            // console.log(array.fechas[i])
            fila.push(`${array.fechas[i]};${array.valores[i]}`);
        }
        res.write(fila.join('\n'));
        res.end();

    })
    .catch((error)=>{
        console.log('Error en la descarga')
        console.log(error)
    });

})

Obtener_datos_login = async(mac,start,param,finish) => {
    try {
        // datos = await Datos.Obtener_datos(mac,start,finish,param,tokenActual);
        // console.log('Token Actual:', tokenActual);
        console.log('Intengo datos login')
        datos = await Datos.Obtener_instalacion_y_datos(mac,start,finish,param,tokenActual);
        console.log('Datos:',datos);
        if ((datos.exp) || (datos.msg === 'Not authorized') || (datos.message === 'Bad token; invalid JSON')) {
            console.log('A logearse de nuevo');
            logued = await Datos.Login();
            tokenActual = logued.token;
            console.log('Token actualizado:', tokenActual)
            // datos = await Datos.Obtener_datos(mac,start,finish,param,tokenActual);
            datos = await Datos.Obtener_instalacion_y_datos(mac,start,finish,param,tokenActual);
            if ((datos.exp) || (datos.msg === 'Not authorized')) {
                console.log('Token no valido');
                throw new Error('Token no valido')
            }
        }else{
            console.log('Datos correctos')
        }
        array = Datos.Crear_array_25(datos,start,finish,null);
        // console.log(array);
        return array;
    }catch(error){
        throw new Error(error);
    }
}

Obtener_todo = async(mac,start,finish) => {
    try{
        particulas = await Obtener_datos_login (mac,start,'aqpm2_5',finish);
        temperatura = await Obtener_datos_login (mac,start,'work_temp',finish);
        return {
            particulas,
            temperatura
        }
    }catch(error) {
        console.log(error)
        throw new Error(error);
    }
}

app.get('/datos/todo/:mac', (req,res)=>{
    const mac=req.params.mac;
    if(!req.query.start)
    {
        return res.json({
            ok: false,
            error: 'start es obligatorio'
        })
    }
    const start = req.query.start;
    if(!req.query.finish)
    {
        return res.json({
            ok: false,
            error: 'finish es obligatorio'
        })
    }
    const finish = req.query.finish;
    Obtener_todo (mac,start,finish)
    .then((objeto)=>{
        // console.log(array)
        res.json({
            objeto
        });
    })
    .catch((error)=>{
        console.log(error)
        res.json({
            ok: false,
            error
        })
    })  
})

app.get('/datos/:mac', (req,res)=>{
    const mac=req.params.mac;
    if(!req.query.start)
    {
        return res.json({
            ok: false,
            error: 'start es obligatorio'
        })
    }
    const start = req.query.start;
    if(!req.query.finish)
    {
        return res.json({
            ok: false,
            error: 'finish es obligatorio'
        })
    }
    const finish = req.query.finish;
    if(!req.query.param)
    {
        return res.json({
            ok: false,
            error: 'param es obligatorio'
        })
    }
    const param = req.query.param;

    // console.log('param:', param)

    Obtener_datos_login (mac,start,param,finish)
    .then((array)=>{
        // console.log(array)
        res.json({
            array
        });
    })
    .catch((error)=>{
        console.log(error)
        res.json({
            ok: false,
            error
        })
    })


})

Datos.Login()
    .then((ok) => {
        console.log('Bien');
        tokenActual = ok.token;
        // console.log('Token actualizado a :', tokenActual)

    })
    .catch((mal)=>{
        console.log('Mal')
    })

app.listen(process.env.PORT, () => {
    console.log('Escuchando puerto: ', 3000);
});
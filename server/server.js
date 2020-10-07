const Datos = require('./../utils/datos')
const Config = require('./../configs/config')
const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const app = express();

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
    Datos.Obtener_datos(mac,start,finish,'aqpm2_5')
    .then((resultado)=>{

        array = Datos.Obtener_array_completo(resultado,start,finish,1,fechaLocal);
        //console.log(array)
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
        // res.json({
        //     ok: false,
        //     error
        // })
    });

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
    Datos.Obtener_datos(mac,start,finish,'aqpm2_5')
    .then((resultado)=>{

        array = Datos.Crear_array_25(resultado,start,finish,null);
        console.log(array)
        res.json({
            array
        });
        // console.log(array25);

        // res.json({
        //     ok: true,
        //     array25: array25
        // })
        // console.log(resultado)
    })
    .catch((error)=>{
        console.log(error)
        res.json({
            ok: false,
            error
        })
    });
})

app.listen(process.env.PORT, () => {
    console.log('Escuchando puerto: ', 3000);
});
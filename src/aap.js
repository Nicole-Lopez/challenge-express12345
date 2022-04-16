var express = require("express");
var server = express();
var bodyParser = require("body-parser");


server.use(bodyParser.json());

						
// MODEL --> CLIENTS 
// 				|
// 				--> 'LUNA'
// 						|	  
// 						----->	[
// 									{DATE, STATUS}, 
// 									{DATE, STATUS}, 
// 									{DATE, STATUS}
// 								]


var model = {
	clients: {},


// =========================================
// ================RESETEA==================
// =========================================

// resetea en 0 a los clientes
// model.clients={'luna', 'Daniela', 'maria'} --------> model.clients={}
	reset: ()=>{
		return model.clients={}
	},


// ======================================================
// ==============AÑADE FECHA A LOS CLIENTES==================
// ===========================================================

// debe agregar clientes como propiedades
// debe agregar clientes como una matriz
// debe estar agregando múltiples citas en el orden a medida que se agregan
// , y debe estar manejando múltiples clientes
// las citas deben tener un estado inicial, y ser 'pendientes'

	addAppointment: function addAppointment(nombre, fecha) {
		fecha.status='pending'

		if (this.clients[nombre]) {
			return this.clients[nombre].push(fecha)
		} 
		else {
			return this.clients[nombre] = [fecha]
		}
	},

// ======================================================
// ====================CAMBIA EL ESTADO==================
// ===============ATTEND - EXPIRE - CANCEL==================
// ===========================================================

	attend: function attend(nombre, fecha) {
		let appoint


		if (this.clients[nombre]) {

			this.clients[nombre].forEach(e => {
        	    if(e.date === fecha){
        	        e.status = 'attended';
        	        appoint = e;
        	    }
        	});
		}
		return appoint
	},

	expire: function expire(nombre, fecha) {
		let appointExpire;

		if (this.clients[nombre]) {

			this.clients[nombre].forEach(e => {
        	    if(e.date === fecha){
        	        e.status = 'expired';

        	        appointExpire = e;
        	    }
        	});
		}
		return appointExpire;
	},

	cancel: function cancel(nombre, fecha) {
		let appoint

		if (this.clients[nombre]) {

			this.clients[nombre].forEach(e => {
        	    if(e.date === fecha){
        	        e.status = 'cancelled';
        	        appoint = e;
        	    }
        	});
		}
		return appoint
	},
// ======================================================
// ====================BORRA FECHA==================
// ===========================================================

	erase: function erase(client, dateStatus){
    	// EN EL ARREGLO ESTAN LOS ESTADOS DISPONIBLES. 
    	// SI EL USUARIO PASA UN ESTADO SE GUARDA EN dateStatus 
    	// EL INCLUDE LO DETECTA
    	// erase('Luna', 'expired') ---> ['pending','attended',****'expired'****,'cancelled'] ---> ENTRA AL IF

        if(['pending','attended','expired','cancelled'].includes(dateStatus)){
        	// FILTRA LA FECHA CON ESE ESTATUS Y LO GUARDA
            let eliminateDate = this.clients[client].filter(e => e.status === dateStatus);

            // CAMBIA EL ARREGLO FILTRANDO A TODAS LA FECHAS QUE NO TENGAN EL ESTATUS PASADO
            this.clients[client] = this.clients[client].filter(e => e.status !== dateStatus); 

            // MUESTRA LA FECHA ELIMINADA
            return eliminateDate;
        } 

        // SI EL dateStatus ES UNA FECHA (EL '' NO ES DE RUTA, ES DE FECHA (5/2/2033)) ---> ENTRA AL IF
        else if(dateStatus.includes("/")){
            let eliminateDate = this.clients[client].filter(e => e.status === dateStatus);
            
            this.clients[client] = this.clients[client].filter(e => e.date !== dateStatus); 
            return eliminateDate;
        }
    },


// ======================================================================
// ====================MUESTRA LAS FECHAS DE LA PERSONA==================
// ======================================================================

// debe tener un método getAppointments, para ver las citas de un cliente
// debe devolver una matriz con las citas del cliente
// si se pasó un estado, solo debe devolver las citas con ese estado


	getAppointments: function getAppointments(nombre, estado) {
		if (estado) {
            let filtro = this.clients[nombre].filter(e => e.status === estado);
            return filtro
		}

		return this.clients[nombre]
	},


// ======================================================================
// ====================MUESTRA LOS NOMBRES DE LAS PERSONAS==================
// ======================================================================

// debe tener un método getClients
// debe devolver una matriz con los nombres de los clientes

	getClients: function getClients() {

	// Object.keys DEVUELVE EL NOMBRE DE LAS PROPIEDADES
	// var obj = { 100: 'a', 
	// 		   	2: 'b', 
	// 		   	7: 'c' 
	// 		  }

	// console.log(Object.keys(obj)); // console: ['2', '7', '100']

		let arr2=Object.keys(this.clients);
		// let arr2=Object.getOwnPropertyNames(this.clients)
		console.log(arr2)
        return arr2
	}







};


// ************************************************
// *******************RUTAS***********************
// ***********************************************

server.get('/api', async (req, res) =>{
	
	res.status(200).send(await model.clients);
});



// responde con un estado 400 (solicitud incorrecta) y un mensaje de cadena, si el cliente no se pasó
// responde con un estado 400 (solicitud incorrecta) y un mensaje de cadena, si el cliente no era una cadena
// Agregar una cita a un cliente
// responde la cita después de la adición

server.post('/api/Appointments', async (req, res) => {
    let { client, appointment } = req.body
    
	if (!client) {
		return res.status(400).send('the body must have a client property');
	}
	else if (typeof client !== 'string') {
		return res.status(400).send('client must be a string');
	}

	let data = await model.addAppointment(client, appointment);
    
    res.status(200).send(data[0]);
  
});



// responde con un estado 400 (solicitud incorrecta) y un mensaje de cadena, si el cliente no existe
// responde con un estado 400 (solicitud incorrecta) y un mensaje de cadena,
// si el cliente no tiene una cita para esta fecha
// responde con un estado 400 (solicitud incorrecta) y un mensaje de cadena, 
// si la opción es no atender, caducar o cancelar

server.get('/api/Appointments/:name', async (req, res) => {
	const { name } = req.params;
    const { date, option } = req.query;

    const clientExist = await model.getClients();

	if (!clientExist.includes(name)) {
		return res.status(400).send('the client does not exist');
	}

	const clientAppointment = await model.getAppointments(name);
    
    const existAppointment = clientAppointment.filter(e => e.date === date);


    if(existAppointment.length === 0){
        return res.status(400).send('the client does not have a appointment for that date');
    } 


    if(!['attend','expire','cancel'].includes(option)){
        return res.status(400).send('the option must be attend, expire or cancel');
    }

    let data;
    if (option==='attend') {
    	data= await model.attend(name, date)
    } 
    else if (option==='expire') {
    	data= await model.expire(name, date)
    } 
    else if (option==='cancel'){
    	data= await model.cancel(name, date)
    }

	res.status(200).send(data);


    // let data
    //     option === 'attend'
    //         ? data = model.attend(name, date)
    //         : option === 'expire'
    //             ? data = model.expire(name, date)
    //             : option === 'cancel'
    //                 ? data = model.cancel(name, date)
    //                 : null
    //     res.status(200).send(data);

});


server.get('/api/Appointments/:name/erase', async (req, res) => {
	const {name}=req.params
	const {date}=req.query

	const clientExist = await model.getClients();

	if (!clientExist.includes(name)) {
		return res.status(400).send('the client does not exist');
	}


	res.status(200).send(await model.erase(name, date));

});



server.get('/api/Appointments/getAppointments/:name', async (req, res) => {
	const {name}=req.params
	const {status}=req.query

	res.status(200).send(await model.getAppointments(name, status));
	
});



server.get('/api/Appointments/clients', async (req, res) => {
	let pi= await model.getClients()
	console.log(pi)
	res.status(200).json(pi);
	
});






server.listen(3000);
module.exports = { model, server };

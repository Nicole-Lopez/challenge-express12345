var express = require("express");
var server = express();
var bodyParser = require("body-parser");

var model = {

    clients: {},

    reset: function () {this.clients = {}},

    addAppointment : function (name, date) { // 'javier',    '22/10/2020 14:00'
        if(!name) {
            // return 'the body must have a client property';
            throw new Error('the body must have a client property');
        }
        if(typeof name !== 'string') {
            // return 'the body must have a client property';
            throw new Error("client must be a string");
        }

        if(this.clients[name]) { // Si no existe el cliente, crealo!
            this.clients[name].push({date: date.date, status: 'pending'});
            return this.clients[name];
        }

        if(!this.clients[name]) { // Si no existe el cliente, crealo!
            this.clients[name] = [{date: date.date, status: 'pending' }];
            return this.clients[name];
        }
        // console.log(model.clients, 'esto es clients en model')
    },



    

    attend : function (name, date) { // 'javier',    '22/10/2020 14:00'

        if (this.clients[name] ) {
            let filterDate = this.clients[name].filter(d => d.date === date);
            filterDate[0].status = 'attended';
            // console.log(filterDate, ', esto es filterDate!')
            //return filterDate[0];
        }
    },

    expire : function (name, date) {
        if (this.clients[name] ) {
            let filterDate = this.clients[name].filter(d => d.date === date);
            filterDate[0].status = 'expired';
            return filterDate[0];
        }
    },

    cancel : function (name, date) {
        if (this.clients[name] ) {
            let filterDate = this.clients[name].filter(d => d.date === date);
            filterDate[0].status = 'cancelled';
            return filterDate[0];
        }
    },

    erase : function (name, argument ) {
        // console.log(name, argument, 'todos los argumentos')        
        if(argument === "attended" || argument === "cancelled" || argument === "expired") {
            let filterDelete = [...this.clients[name]];
            this.clients[name] = this.clients[name].filter(d => d.status !== argument);
            
            filterDelete = filterDelete.filter(d => d.status === argument); 
            // console.log(filterDelete, 'mi filterDelete');
            return filterDelete;

        }
        // console.log(this.clients[name], 'esto es name')                        
        this.clients[name] = this.clients[name].filter(d => d.date !== argument);             
    },

    getAppointments : function(name, status) {
        // console.log(name, status, 'mis argumentos')
        if (name && status) {
            let filterStatus = this.clients[name].filter(s => s.status === status);
            return filterStatus;
        }

        if(name && !status && this.clients[name]) return this.clients[name];

        return this.clients;


    },
    
    getClients : function( name, date, option ) {
        // { name: 'javier' } params!
        // { date: '23/10/2020 14:00', option: 'attend' } query!
        // console.log(Object.getOwnPropertyNames(this.clients), 'estas son mis propiedades')
        // console.log(name, date, option, 'lo que llega a la función');
        
        if (!name && !date && !option) {
            // console.log(Object.getOwnPropertyNames(this.clients), 'está entrando acá!')
            return Object.keys(this.clients)
        }

        if (name && !date && !option) { // Me llega solo name
            
            if(!this.clients[name]) throw new Error ('the client does not exist'); // Si no lo encuentro

            return this.clients[name];
        } 

        if (name && date && !option) {
            if(!this.clients[name]) throw new Error ('the client does not exist'); // Si no lo encuentro
 
            return model.erase(name, date);

        }
  

        if (name && date && option) { // Me llegan los tres
            if(option === "attend" || option === "expire" || option === "cancel" ) {
                
                if(!this.clients.hasOwnProperty(name)) { // Si no encuentro name
                    throw new Error ('the client does not exist');
                }      
                
                if(this.clients.hasOwnProperty(name)) {
                    // console.log(option, "esto es option cuando existe la persona")
                    
                    let filterResul =  this.clients[name].filter(f => f.date === date);
                    
                    // console.log(filterResul, "esto es filterResul!");

                    if (filterResul.length === 0 ) { // Si no encuentro la búsqueda
                        throw new Error ('the client does not have a appointment for that date');
                    }
                    
                    if(option === "attend") return model.attend (name, date);
                    if(option === "expire") return model.expire (name, date);
                    if(option === "cancel") return model.cancel (name, date);
                    if (filterResul.length > 0 ) { // Si encuentro algo

                        return filterResul;                        
                    }                    
                }        
                        
            } else {

                throw new Error ('the option must be attend, expire or cancel');

            }           
            
        }
        
        
    }
    
    // clients {
    //     javier: [
    //         { status: 'pending', date: '22/10/2020 14:00' },
    //         { status: 'pending', date: '22/10/2020 16:00' }
    //       ],
    //     alejandro: [
    //         { status: 'pending', date: '22/10/2020 11:00' },
    //         { status: 'pending', date: '22/10/2020 12:00' }
    //       ]
    //     } esto es clients en model
    // }

};


server.use(bodyParser.json());

server.get('/api', (req, res) => {
//server.get('/api', async (req, res) => {
  // let resul = await model.getAppointments(); 
  // res.json(resul);
  // let resul = await ; 
  res.json(model.getAppointments());

});

server.post('/api/Appointments', async (req, res) => {
    // { client: 5, appointment: { date: '22/10/2020 11:00' } } me llega por body
    let { client, appointment } = req.body
    
    // console.log(client, appointment, 'me llega por body (luego de destructuring)');
    try {
        let resul = await model.addAppointment(client, appointment);
        // console.log(resul, 'cuando sale bien!')
        res.json(resul[0]);

    } catch (err) {
        //let {message} = err;
        //res.status(400).json(err.message);
        res.status(400).send(err.message);
    }
  
});

server.get('/api/Appointments/clients',  async (req, res) => {
    try {
        let resul = await model.getClients();
        // console.log(resul, 'se está haciendo este get y esto me retorna la función')
        res.json(resul);
    } catch (err) {
        // console.log('esto teniendo un error!')
    }    
});

server.get('/api/Appointments/getAppointments/:name', async (req, res) => {
    const { name } = req.params;
    // console.log(req.params, 'mis params');
    let resul2 = await model.getClients(name);
    // console.log(resul2, 'lo que retorna la fn')
    res.json(resul2);
    
});

server.get('/api/Appointments/:name/erase', async (req, res) => {
    
    // console.log(req.params, 'params!')
    // console.log(req.query, 'querys!')
    const { name } = req.params;
    const { date } = req.query;

    try {
        let resul3 = await model.getClients(name, date); 
        res.json(resul3);

    } catch (err) {
        res.status(400).send(err.message);

    }


});

server.get('/api/Appointments/:name', async (req, res) => { //GET /api/Appointments/:name
    // '/api/Appointments/pepe?date=22/10/2020%2014:00&option=attend'
    // console.log(req.query, 'query!')
    // { name: 'javier' } params!
    // { date: '23/10/2020 14:00', option: 'attend' } query!
    let { name } = req.params;
    let { date, option} = req.query;

    // if (name, date, option) {
    //     console.log(name, date, option, ' adentro del if')
    //     if (option === "attend") {res.json(model.attend(name, date))}
    //     if (option === "expire") {res.json(model.expire(name, date))}
    //     if (option === "cancel") {res.json(model.cancel(name,date))}
    //     else {res.status(400).send('the option must be attend, expire or cancel')}
    // }
    // console.log(name, date, option, ' afuera del if')

    try {
        let resul = await model.getClients( name, date, option );
        // console.log(resul, 'resul del try!')
        res.json(resul);
        
    } catch (err) {
        res.status(400).send(err.message);
        
    }
});





// server.listen(3000);
module.exports = { model, server };

const express = require("express");
const dotenv = require('dotenv/config.js')
const bodyParser = require('body-parser');
const validator = require("email-validator");
const cors = require('cors');
const app = express();
const port = process.env.port || 3001;
const emailvalidator = require("email-validator")
const { Client } = require('pg');

const USER_BD = process.env.USER_BD
const HOST = process.env.HOST
const DATABASE = process.env.DATABASE
const PASSWORD_BD = process.env.PASSWORD_BD
const PORT_CLIENT = process.env.PORT_CLIENT

const client = new Client({
  user: USER_BD,
  host: HOST,
  database: DATABASE,
  password: PASSWORD_BD,
  port: PORT_CLIENT,
})

client.connect()


app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '1mb' }));


app.get('/client', (req, res) => {
    res.send(`<h1>servidor Rodando na porta ${port}...<h1/>`)
    console.log('chegou aq')
    res.status(200).json("Welcome ");
})

app.post('/client', (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const cpf = req.body.cpf;
    const phone = req.body.phone;
    const created_at = req.body.data;
    if (emailvalidator.validate(email)) {
   client.query(`select * from client WHERE email = $1`, [email])
        .then(results => {
            const resultadoBuscaEmail = results
            if (resultadoBuscaEmail.rowCount === 1) {
                res.json({ "error": "E-mail já utilizado" })
            } else {
                    client.query(`INSERT INTO client (name,email,cpf,phone,created_at) VALUES ($1, $2, $3, $4, $5)`, [name, email, cpf, phone, created_at])
                        .then(results => {
                            const resultado = results
                            if (resultado.rowCount === 1) {
                                return res.json({ "message": "Registrado com sucesso" });
                            } else {
                                return res.json({ "error": "Erro ao Registrar" });
                            }
                        })
            }
        });
    } else {
        return res.json({"message": "email inválido."})
        console.log('invalidMail')
    }
})


app.post('/client/interval', (req, res) => { 
    const initialDate = req.body.initialDate;
    const finalDate = req.body.finalDate;
    res.status(200)
    console.log('chegou',initialDate,finalDate)
    client.query(`select * from client WHERE created_at BETWEEN $1 AND $2`, [initialDate,finalDate])
    .then(results => {
          const resultado = results.rows
          console.log(resultado)
          return res.json({"resultado" : resultado});
     })
})

app.listen(port, () => console.log(`Rodando na porta: ${port}!`));

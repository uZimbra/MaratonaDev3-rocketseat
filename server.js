const express = require('express')
const server = express()
const nunjucks = require('nunjucks')
const nocache = require('nocache')


const Pool = require('pg').Pool
const db = new Pool({
    user: 'postgres',
    password: '0000',
    host: 'localhost',
    port: '5432',
    database: 'doe'
})

nunjucks.configure('./', {
    express: server,
    noCache: true
})

server.use(express.static('public'))

server.use(express.urlencoded({
    extended: true
}))

server.use(nocache())

server.get('/', function (req, res) {
    db.query('SELECT * FROM donors ORDER BY id desc LIMIT 8', function (err, result) {
        if (err) {
            console.log(err)
            const mensagem = {
                msg: 'Erro no banco de dados.'
            }
            return res.render('index.html', {
                mensagem
            })
        }
        const donors = result.rows
        return res.render('index.html', {
            donors
        })
    })
})

server.post('/', function (req, res) {
    const name = req.body.name
    const email = req.body.email
    const blood = req.body.blood

    if (name && email && blood) {
        const query = `INSERT INTO donors ("name", "email", "blood") 
        VALUES ($1, $2, $3)`
        const values = [name, email, blood]
        db.query(query, values, function (err) {
            if (err) {
                console.log(err)
                const mensagem = {
                    msg: 'Erro no banco de dados.'
                }
                return res.render('index.html', {
                    mensagem
                })
            }
            db.query('SELECT * FROM donors ORDER BY id desc LIMIT 8', function (err, result) {
                const donors = result.rows
                const mensagem = {
                    msg: 'Cadastro realizado com sucesso!'
                }
                return res.render('index.html', {
                    mensagem,
                    donors
                })
            })
        })
    } else {
        db.query('SELECT * FROM donors ORDER BY id desc LIMIT 8', function (err, result) {
            if (err) {
                console.log(err)
                const mensagem = {
                    msg: 'Erro no banco de dados.'
                }
                return res.render('index.html', {
                    mensagem
                })
            }
            const donors = result.rows
            const mensagem = {
                msg: 'Todos os campos são obrigatórios.'
            }
            return res.render('index.html', {
                mensagem,
                donors
            })
        })
    }
})

server.listen(3000, function () {
    console.log('Express server executando em http://localhost:3000')
})
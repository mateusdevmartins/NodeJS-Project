//Base do Setup da Aplicação:

/* Chamada das Packages que iremos precisar para a nossa aplicação */
var express = require('express'); //chamando o pacote express
var app = express(); //definção da nossa aplicação através do express
var bodyParser = require('body-parser'); //chamando o pacote body-parser
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var session = require('express-session');
app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: true,
    saveUninitialized: true
}));
var crypto = require("crypto")
var key = "supersecretkey";

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.use(express.static('/site/views'));


mongoose.connect('mongodb://localhost:27017', {
    useMongoClient: true
});
var Usuario = require('./app/models/usuario');

/** Configuração da variável 'app' para usar o 'bodyParser()'.
 * Ao fazermos isso nos permitirá retornar os dados a partir de um POST
 */
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


/** Definição da porta onde será executada a nossa aplicação */
var port = process.env.PORT || 8000;


//Rotas da nossa API:
//==============================================================

/* Aqui o 'router' irá pegar as instâncias das Rotas do Express */
var router = express.Router();


/* Middleware para usar em todos os requests enviados para a nossa API- Mensagem Padrão */
router.use(function (req, res, next) {
    console.log('Algo está acontecendo aqui........');
    next(); //aqui é para sinalizar de que prosseguiremos para a próxima rota. E que não irá parar por aqui!!!
});
/* Rota de Teste para sabermos se tudo está realmente funcionando (acessar através: GET: http://localhost:8000/api) */
router.get('/', function (req, res) {
    res.json({
        message: 'YEAH! Seja Bem-Vindo a nossa API'
    });
});

function encrypt(key, data) {
    var cipher = crypto.createCipher('aes-256-cbc', key);
    var crypted = cipher.update(data, 'utf-8', 'hex');
    crypted += cipher.final('hex');

    return crypted;
}

function decrypt(key, data) {
    var decipher = crypto.createDecipher('aes-256-cbc', key);
    var decrypted = decipher.update(data, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');

    return decrypted;
}


// Authentication and Authorization Middleware
// Authentication and Authorization Middleware




router.route('/login')
    /* 1) Método: Criar Usuario (acessar em: POST http://localhost:8080/api/usuarios */
    .post(function (req, res) {

        var usuario = new Usuario();
        var sendUsuario = new Usuario();
        //aqui setamos os campos do usuario (que virá do request)

        usuario.login = req.body.login;
        usuario.senha = encrypt(key, req.body.senha);

        Usuario.findOne({
            login: usuario.login,
            senha: usuario.senha
        }, function (error, usuario) {
            if (!usuario) {
                res.json({
                    message: 'Usuário ou senha incorreta!'
                });
            }
            if (usuario) {
                res.json({
                    usuario,
                    message: 'Login Efetuado com Sucesso!'

                });
            }
        });
    });



// Logout endpoint
app.get('/logout', function (req, res) {
    req.session.destroy();
    res.send("logout success!");
});



/* TODO - Definir futuras rotas aqui!!! */
// Rotas que irão terminar em '/usuarios' - (servem tanto para: GET All &amp; POST)
router.route('/usuarios')
    /* 1) Método: Criar Usuario (acessar em: POST http://localhost:8080/api/usuarios */
    .post(function (req, res) {
        var usuario = new Usuario();

        //aqui setamos os campos do usuario (que virá do request)

        usuario.senha = encrypt(key, req.body.senha);
        usuario.nome = req.body.nome;
        usuario.login = req.body.login;

        if (usuario.senha != encrypt(key, req.body.confirm)) {
            res.json({
                message: 'Senha diferente da confirmação!'
            });
        }
        else usuario.save(function (error) {
            res.json({
                message: 'Usuário criado!'
            });
        });

    });


router.route('/usuarios')
    .get(function (req, res) {

        //Função para Selecionar Todos os 'usuarios' e verificar se há algum erro:
        Usuario.find(function (err, usuarios) {
            if (err)
                res.send(err);

            res.json(usuarios);
        });
    });

router.route('/usuarios')
    /* 4) Método: Atualizar (acessar em: PUT http://localhost:8080/api/usuarios/:usuario_id) */
    .put(function (req, res) {

        //Primeiro: Para atualizarmos, precisamos primeiro achar o Usuario. Para isso, vamos selecionar por id:
        Usuario.findById(req.params.usuario_id, function (error, usuario) {
            if (error)
                res.send(error);

            //Segundo: Diferente do Selecionar Por Id... a resposta será a atribuição do que encontramos na classe modelo:
            usuario.nome = req.body.nome;
            usuario.login = req.body.login;
            usuario.senha = req.body.senha;

            //Terceiro: Agora que já atualizamos os campos, precisamos salvar essa alteração....
            usuario.save(function (error) {
                if (error)
                    res.send(error);

                res.json({
                    message: 'Usuário Atualizado!'
                });
            });
        });
    });

// Rotas que irão terminar em '/usuarios/:usuario_id' - (servem tanto para GET by Id, PUT, &amp; DELETE)
router.route('/usuarios/:usuario_id')

    /* 3) Método: Selecionar Por Id (acessar em: GET http://localhost:8080/api/usuarios/:usuario_id) */
    .get(function (req, res) {

        //Função para Selecionar Por Id e verificar se há algum erro:
        Usuario.findById(req.params.usuario_id, function (error, usuario) {
            if (error)
                res.send(error);

            res.json(usuario);
        });
    });

router.route('/user/:username')


    .get(function (req, res) {

        //Função para Selecionar Por username e verificar se há algum erro:
        Usuario.findOne({
            login: req.params.username
        }, function (error, usuario) {
            if (error)
                res.send(error);

            res.json(usuario);
        });
    });
router.route('/usuarios/:usuario_id')

    /* 3) Método: Selecionar Por Id (acessar em: GET http://localhost:8080/api/usuarios/:usuario_id) */
    .delete(function (req, res) {

        //Função para excluir os dados e também verificar se há algum erro no momento da exclusão:
        Usuario.remove({
            _id: req.params.usuario_id
        }, function (error) {
            if (error)
                res.send(error);

            res.json({
                message: 'Usuário excluído com Sucesso! '
            });
        });
    });

router.route('/usuarios/:usuario_id')
    .put(function (req, res) {

        //Primeiro: Para atualizarmos, precisamos primeiro achar o Usuario. Para isso, vamos selecionar por id:
        Usuario.findById(req.params.usuario_id, function (error, usuario) {
            if (error)
                res.send(error);

            //Segundo: Diferente do Selecionar Por Id... a resposta será a atribuição do que encontramos na classe modelo:
            usuario.nome = req.body.nome;
            usuario.login = req.body.login;
            usuario.senha = req.body.senha;

            //Terceiro: Agora que já atualizamos os campos, precisamos salvar essa alteração....
            usuario.save(function (error) {
                if (error)
                    res.send(error);

                res.json({
                    message: 'Usuário Atualizado!'
                });
            });
        });
    });

router.route('/usuarios/:usuario_id')
    .put(function (req, res) {
        //Primeiro: Para atualizarmos, precisamos primeiro achar o Usuario. Para isso, vamos selecionar por id:
        Usuario.findById(req.params.usuario_id, function (error, usuario) {
            if (error)
                res.send(error);

            //Segundo: Diferente do Selecionar Por Id... a resposta será a atribuição do que encontramos na classe modelo:
            usuario.nome = req.body.nome;
            usuario.login = req.body.login;
            usuario.senha = req.body.senha;

            //Terceiro: Agora que já atualizamos os campos, precisamos salvar essa alteração....
            usuario.save(function (error) {
                if (error)
                    res.send(error);

                res.json({
                    message: 'Usuário Atualizado!'
                });
            });
        });
    });



/* Todas as nossas rotas serão prefixadas com '/api' */
app.use('/api', router);

//Iniciando o Servidor (Aplicação):
//==============================================================
app.listen(8000);
console.log('Iniciando a aplicação na porta ' + 8000);
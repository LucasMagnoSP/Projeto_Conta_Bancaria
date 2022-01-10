//Modulos Externos
const chalk = require('chalk')
const inquirer = require('inquirer')

//Modulos Internos
const fs = require('fs')


//Inicio Programa
operacoes()

//Menu
function operacoes(){
    inquirer.prompt({
        type:'list',
        name:'action',
        message:'Escolha uma das operções a baixo :',
        choices:['Criar Conta','Extrato','Depositar','Sacar','Sair da Conta'],
    }).then((anwser =>{
        const choice = anwser['action']
        if(choice =='Criar Conta'){
            criar_conta()
        }
        else if(choice =='Extrato'){
            tirarExtrato()
        }
        else if(choice =='Depositar'){
            depositar()
        }
        else if(choice =='Sacar'){
            sacar()
        }
        else if(choice =='Sair da Conta'){
            console.log(chalk.bgBlue.black.bold('Obrigado por usar nosso banco, volte sempre !'))
            process.exit()
        }
        else{

        }
    })).catch(err => console.log(err))
}

//Criação de Conta
function criar_conta(){
    console.log(chalk.bgGreenBright.black.bold('Obrigado por escolher nosso banco !'))
    console.log(chalk.green.bold('Por gentileza, responda todas as perguntas a baixo :'))
    contruir_conta()
}

//Contrução da Conta
function contruir_conta(){
    inquirer.prompt([
        {
            name:'nomeConta',
            message:'Escolha um nome para sua conta :'
        }
    ]).then((anwser)=>{
        const nomeConta = anwser['nomeConta']
        console.log(nomeConta)

        if(!fs.existsSync('registro_de_contas')){
            fs.mkdirSync('registro_de_contas')
        }

        if(fs.existsSync(`registro_de_contas/${nomeConta}.json`)){
            console.log(chalk.bgRed.white.bold(`O nome ${nomeConta} está indisponivel, tente outro...`))
            contruir_conta()
            return
        }

        fs.writeFileSync(`registro_de_contas/${nomeConta}.json`,'{"saldo" : 0}',function(err){
            console.log(err)
        })
        
        console.log(chalk.bgGreenBright.black.bold("Sua conta foi criada com sucesso !"))
        operacoes()

    }).catch((err)=>console.log(err))
}

//Deposito em Conta
function depositar(){
    inquirer.prompt([
        {
            name:'nomeConta',
            message:'Digite o nome da sua conta :'
        }
    ]).then((anwser)=>{
        const nomeConta = anwser['nomeConta']

        //Verificação de nome de conta
        if(!checar_conta(nomeConta)){
            return depositar()
        }

        inquirer.prompt([
            {
                name:'valorDeposito',
                message:'Digite o valor que sera depositado :'
            }
        ]).then((anwser)=>{

            const valorDeposito = anwser['valorDeposito']
            adicionar_saldo_conta(nomeConta, valorDeposito)
            operacoes()

        }).catch((err)=>err)

    }).catch((err)=>console.log(err))
}

//Verificar Contas Existentes
function checar_conta(nomeConta){
    if(!fs.existsSync(`registro_de_contas/${nomeConta}.json`)){
        console.log(chalk.bgRed.white.bold(`A conta ${nomeConta} não está cadastrada em nosso sitema, tente novamente.`))
        return false
    }
    return true
}

//Adicinar Saldo em conta
function adicionar_saldo_conta(nomeConta,valorDeposito){
    const saldoConta = getConta(nomeConta)

    //Validação de conta no deposito
    if(!valorDeposito){
        console.log(chalk.bgRed.white.bold("Ocorreu um erro, tente novamente !"))
        return depositar()
    }
    saldoConta.saldo = parseFloat(valorDeposito)+parseFloat(saldoConta.saldo)
    
    fs.writeFileSync(
        `registro_de_contas/${nomeConta}.json`,
        JSON.stringify(saldoConta),
        function(err){
            console.log(err)
        }
    )
    console.log(chalk.bgGreenBright.black.bold(`O deposito no valor de R$${valorDeposito} foi realizado com sucesso !`))
}

//Informações de conta no registro
function getConta(nomeConta){
    const contaJSON = fs.readFileSync(`registro_de_contas/${nomeConta}.json`,{
        encoding : 'utf-8',
        flag: 'r',
    })
    return JSON.parse(contaJSON)
}

//Extrato
function tirarExtrato(){
    inquirer.prompt([
        {
            name:'nomeConta',
            message:'Para extrato, digite o nome da sua conta :'
        }
    ]).then((anwser)=>{
        const nomeConta = anwser['nomeConta']

        //Validação de conta no extrato
        if (!checar_conta(nomeConta)){
            return tirarExtrato()
        }

        const conta = getConta(nomeConta)
        console.log(chalk.bgBlue.white.bold(`Olá ${nomeConta}, o saldo da sua conta é de R$${conta.saldo}`))
        operacoes()

    }).catch((err=>err))
}

function sacar(){
    inquirer.prompt([
        {
            name:'nomeConta',
            message:'Para sacar, digite o nome da sua conta :'
        }
    ]).then((anwser)=>{
        const nomeConta = anwser['nomeConta']
        if(!checar_conta(nomeConta)){
            return sacar()
        }

        inquirer.prompt([
            {
                name:'quantia',
                message:`Olá ${nomeConta}, digite o valor que deseja sacar :`
            }
        ]).then((anwser)=>{
            const quantia = anwser['quantia']

            retirar_saldo_conta(nomeConta,quantia)


        }).catch((err)=>err)
    
    }).catch((err)=>err)
}

function retirar_saldo_conta(nomeConta,quantia){

    const conta = getConta(nomeConta)

    if(!quantia){
        console.log(chalk.bgRed.white.bold(`Ocorreu um erro, tente novamente mais tarde`))
        return sacar()
    }

    if(conta.saldo < quantia){
        console.log(chalk.bgRed.white.bold('Você não possui saldo suficiente para esse saque, tente novamente mais tarde.'))
        return sacar()
    }

    conta.saldo= parseFloat(conta.saldo) - parseFloat(quantia)
    fs.writeFileSync(`registro_de_contas/${nomeConta}.json`,
    JSON.stringify(conta),
    function(err){
        console.log(err)
    })

    console.log(chalk.bgGreen.black.bold(`Saque no valor de R$${quantia} foi realizado com sucesso !`))
    operacoes()  
    
}

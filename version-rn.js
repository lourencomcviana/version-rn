// pequeno programa para reordenar arquivos sqls
const fs = require('fs');
const prompt = require('prompt');
const argv = require('minimist')(process.argv.slice(2));
const chalk = require('chalk');
const i18n = require("i18n");
const config = require('./default-config.json');


i18n.configure({
    locales:['en', 'pt'],
    directory: __dirname + '/locales',
    objectNotation:true
});

const language = getLanguage();
const dbPath = getPath();
const versionRegex = getVersionRegex();


prompt.message='rename';
prompt.override = argv;


prompt.start();

const x = "Esteja {red.bold SEMPRE} preparado para dar {bold git checkout} nos arquivos alterados caso algo de errado. {bold.red SEMPRE} pode dar errado";
console.log(chalk.bold(i18nStr('titleWarning',null)))

const promptSchema = {
    properties: {
        version:{
            description: i18nStr('promptSchema.version',null),
            message:  i18nStr('promptSchema.versionError',null),
            pattern: /^\d*[1-9]\d*$/,
            required: true
        },
        qtd:{
            description:i18nStr('promptSchema.qtd',null),
            message:i18nStr('promptSchema.qtdError',null),
            pattern: /^\d*-?[1-9]\d*$/,
            required: true
        }
    }
};

const confirmPrompt = {
    properties: {
        confirm: {
            description: i18nStr('confirmPrompt.confirm',null),
            message: i18nStr('confirmPrompt.confirmError',null),
            pattern: /^[ynYN]$/,
            required: true
        }
    }
};

// início da aplicação
showDefaultPrompt(exec);

function showDefaultPrompt(callback) {
    showPrompt(promptSchema,callback)
}
function showConfirmPrompt(callback) {
    showPrompt(confirmPrompt,callback)
}

function showPrompt(schema,callback) {
    try{
        prompt.get(schema, function (err, result) {
            if (err) { return onErr(err); }
            callback(result)
        });
    }catch (e) {
        console.log(i18nStr('closeApp',null));
    }
}

function exec(param) {
    const files = read()
        .map(item =>parse(item,param.qtd))
        .filter(item => item != null && item.version >= param.version)
        .sort((a,b)=> a.version-b.version);



    if(files.length === 0){
        console.log(i18nStr('noFileFound',null));
        showDefaultPrompt(exec)
    } else {
        files.forEach(item => logFile(item));
        console.log(argv)
        if(argv.confirm){
            renameFiles(files);
        } else {
            showConfirmPrompt(function (result) {
                if (result.confirm.toString().toLowerCase() === 'y') {
                    renameFiles(files);
                } else {
                    console.log(chalk.red(i18nStr('confirmPrompt.cancel', null)));
                    showDefaultPrompt(exec);
                }
            })
        }
    }
}

function renameFiles(files) {
    console.log(chalk.bold(chalk.blue(files.length)) +" "+i18nStr('exec.fileQtd',null));
    //renomear da maior versao para a menor
    files.sort((a,b)=> b.version-a.version)
        .forEach(item =>{
            const path = dbPath+"/"+item.file;
            const newPath = dbPath+"/"+item.newFile;
            const content = fs.readFileSync(path,{encoding:'UTF-8'});
            const newContent = content.replace( new RegExp(getVersionRegex(),'mg'),`$1${item.newVersion}$3`);
            fs.writeFileSync(path,newContent,{encoding:'UTF-8'});

            fs.renameSync(path,newPath);
        });

    console.log('arquivos processados com sucesso!')

}

process.on('SIGINT',fim );
process.on('exit',fim );

function fim() {
    console.log(chalk.blue(i18nStr('closeApp')))
}
function parse(file,qtd) {
    let match = versionRegex.exec(file);
    if(match != null ){
        const saida = {
            file: match[0],
            prefix:  match.groups.prefix ? match.groups.prefix : match[1],
            versionStr:  match.groups.version ? match.groups.version : match[2],
            sufix: match.groups.sufix ? match.groups.sufix : match[3],

        };
        saida.version = parseInt(saida.versionStr);
        saida.newVersion = pad(saida.version+ parseInt(qtd),getOrSaveConfig('pad'));
        saida.newFile=
            saida.prefix +
            saida.newVersion +
            saida.sufix;
        return saida;
    }
    return null;
}

function logFile(item) {
    console.log(`${chalk.red(item.file)} -> ${chalk.green(item.newFile)}`)
}
function read() {
    try {
        return fs.readdirSync(dbPath )
    }catch (e) {
        return []
    }
}

function onErr(err) {
    console.log(err);
    return 1;
}

function pad(entrada,size) {
    var s = String(entrada);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
}

function i18nStr(phrase,parameters,otherLang) {
    if(!otherLang){
        otherLang = language;
    }
    return  i18n.__({phrase: phrase, locale:otherLang},parameters);
}
function getPath() {
    if(argv.folder){

        console.log(i18nStr('customFolderWarning',argv.folder));
        if(!fs.existsSync(argv.folder)){
            console.log(chalk.red(i18nStr('customFolderError',argv.folder)));
            console.log(chalk.red(i18nStr("customFolderError",null)))
        }
        return argv.folder
    } else{
        return  process.cwd()
    }
}

function getVersionRegex() {
    if(argv.regex){
        config.regex=argv.regex;
        saveConfig(config)
        console.log(i18nStr('customRegexWarning',argv.regex));
        return new RegExp(argv.regex)
    } else{
        return new RegExp(config.regex)
    }
}

function getLanguage() {
    if(argv.language){
        config.language=argv.language;
        saveConfig(config)
        console.log(i18nStr('customLanguageWarning',argv.language,argv.language));

        return argv.language
    } else{
        return config.language
    }
}

function getOrSaveConfig(str) {
    if(argv[str]){
        config[str]=argv[str];
        saveConfig(config)
    }
    return config[str]
}

function saveConfig(config) {

    if(argv.s===true)
    {
        fs.writeFile('./default-config.json', JSON.stringify(config, null, 2), 'utf8', function (err) {
            if (err) {
                console.log(chalk.red(err))
            }
        });
    }
}


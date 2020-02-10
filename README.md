# version-rn
Upgrade or downgrade version of files that version is controlled by file name. Like database updates

Usefull when you have a lot of files named 0001,0002, ... ,0234 for example 
and you want to insert one extra file in the middle of them, normally you would give up and
find a desktop program but most of them arent bash/cmd friendly.

You can use this one to automate stuff for you.

## Parameters
All parameters ara optional. If not informed they will be asked by prompt when needed for easyer use.

The 'wizard' also helps identify if what you are doing is what yo want to do.

| parameter | description |
| --------- | ----------- |
| --language=(en,us)  | change app language, only pt (portugues) and en (english) are avaliable |
| --version=(number) | since what file version do you want to start | 
| --qtd=(number) | how many versions do you want to skip (can be negative) |
| --folder=(directory) | inform if the current folder is not where do you want to execute the refactor |
| --confirm | auto confirm anything |
| --pad=(number) | the fixed size of version, default is 4 |
| --regex=(string) | regex used to find version number, it must have only 3 groups or must have named groups |
| -s | save regex or/and language in the configuration file to be used as default |

### Example
`version-rn --version=2 --qtd=2 --confirm=y`

### [Regex named groups](https://github.com/tc39/proposal-regexp-named-groups)
For precise regex interpretations. Three capture groups must be created:
- prefix: it will be preserved before version
- sufix: it will be preserved after version
- version: the app will change preciselly this value

the default regex has the 3 capturing groups, you can test it in [regex101](https://regex101.com/r/AwBP0Z/1)

## Save configurations
This can be usefull if you dont want to aways pass these extra parameters.

`version-rn --language=en -s`
you can permanently configure using `-s` parameter:


| parameter | example |
| --------- | ------  |
| --pad     |  `version-rn --pad=4 -s`       |
| --language | `version-rn --language=en -s`  |
| --regex |`version-rn --regex=^(?<prefix>-{0,2}[A-Za-z\s_\-:]+)?(?<version>\d+)(?<sufix>.+)$ -s`  |

## Exit
exit using ctrl+c
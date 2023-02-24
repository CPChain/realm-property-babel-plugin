
const { types } = require("@babel/core")
const RealmBigNumberTemp = (name, valueType) => `class Temp{
    _${name}!: string
    get ${name} () : ${valueType}{
        return  BigNumber.from(this._${name})
    }
    set ${name} (v: ${valueType}) {
         this._${name} = v.toHexString()
    }
}  `
const RealmEnumTemp = (name, valueType) => `class Temp{
    _${name}!: number
    get ${name} () : ${valueType}{
        return this._${name}
    }
    set ${name} (v: ${valueType}) {
         this._${name} = v
    }
}  `

const decorators = new Map()
decorators.set('RealmBigNumber', RealmBigNumberTemp)
decorators.set('RealmEnum', RealmEnumTemp)

/**
 * 找到 RealmBigNumber 和 RealmEnum 装饰器
 * @param {*} path
 * @returns
 */
function isRealmDecorator(path) {
    return (
        (types.isIdentifier(path) && decorators.has(path.name)) ||
        (types.isMemberExpression(path) &&
            types.isIdentifier(path.object) &&
            types.isIdentifier(path.property) &&
            decorators.has(path.property.name))
    );
}

function propertyDecorator(babel) {
    const visitor = {
        /**
         * 对装饰器进行访问
         * @param {*} path
         */
        ClassDeclaration(path) {
            const { template } = babel
            const classProperties = path
                .get('body')
                .get('body')
                .filter(p => p.isClassProperty())
                .filter(p => !p.node.static)
            classProperties.forEach(_path => {
                const decoratorsPath = _path.get('decorators');
                const realmEnumDecorator = decoratorsPath.find(
                    d => {
                        return d.node && isRealmDecorator(d.node.expression)
                    });
                const realmEnum = Boolean(realmEnumDecorator);

                if (realmEnum) {
                    const decoratorName = realmEnumDecorator.node.expression.name
                    const parentNode = realmEnumDecorator.parent
                    const name = parentNode.key.name
                    const valueType = parentNode.typeAnnotation.typeAnnotation.typeName.name
                    const temp = template(decorators.get(decoratorName)(name, valueType), {
                        plugins: [
                            'typescript',
                            'decorators'
                        ]
                    })
                    const other = realmEnumDecorator.parentPath.parent.body.filter(p => !(p.type === 'ClassProperty' && p.key.name === name))
                    realmEnumDecorator.parentPath.parent.body = [...other, ...(temp().body.body)]
                }
            });
        }

    }
    return {
        name: 'realm-property-babel-plugin',
        visitor: visitor
    }
}


Object.defineProperty(exports, '__esModule', { value: true });

exports.default = propertyDecorator
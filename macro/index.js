const { createMacro } = require('babel-plugin-macros');
const { addDefault } = require('@babel/helper-module-imports');
const t = require('@babel/types');

module.exports = createMacro(reanimatedMacro, {
	configName: 'jsToReanimated'
});

function reanimatedMacro({ references, state, babel, config}) {
	const reanimatedName = config.identifier || 'Animated';
	
	let identifier = null;

	references.default.forEach(referencePath => {
		

		if (referencePath.parentPath.type === 'CallExpression') {
			if(identifier == null){
				const binding = referencePath.parentPath.scope.getBinding(reanimatedName);
				if(binding){
					identifier = binding.identifier;
				}
			}
			if(identifier == null){
				identifier = addDefault(state.file.path, 'react-native-reanimated', {
					nameHint: reanimatedName,
				});
			}
			
			const [argumentPath] = referencePath.parentPath.get('arguments')

			genericReplace(argumentPath, state, babel, identifier.name);
		} else {
			throw new Error(
				`reanimated-math.macro can only be used as a function call. You tried ${
					referencePath.parentPath.type
				}.`,
			)
		}
	});
}


const createHelper = (argumentPath,state,babel,libraryIdentifier) => {
	const visitor = {
		ArrowFunctionExpression(path){
			if(path == argumentPath){
				return babel.template('LIBRARY.METHOD(ARGS)')({
					LIBRARY: libraryIdentifier,
					METHOD: 'block',
					ARGS: handlePath(path.get('body'))
				});
			}
			
			return handlePath(path.get('body'));
		},
		ExpressionStatement(path){
			return path.node.expression;
		},
		BlockStatement(path){
			const body = path.get('body').map(handlePath);
			return t.arrayExpression(body);
		},
		IfStatement(path){
			const args = [
				path.node.test,
				handlePath(path.get('consequent'))
			];
			
			if(path.node.alternate){
				args.push(handlePath(path.get('alternate')));
			}
			
			return t.callExpression(
				t.memberExpression(
					t.identifier(libraryIdentifier),
					t.identifier('cond')
				),
				args
			);
			
		},
		AssignmentExpression(path){
			return babel.template('LIBRARY.METHOD(LEFT_EXPRESSION, RIGHT_EXPRESSION)')({
				LIBRARY: libraryIdentifier,
				METHOD: 'set',
				LEFT_EXPRESSION: path.node.left,
				RIGHT_EXPRESSION: path.node.right,
			});
		},
		BinaryExpression(path) {
			if(binaryOperators[path.node.operator] == null){
				throw new Error('Operator is not defined: ' + path.node.operator);
			}
			return babel.template('LIBRARY.METHOD(LEFT_EXPRESSION, RIGHT_EXPRESSION)')({
				LIBRARY: libraryIdentifier,
				METHOD: babel.types.identifier(binaryOperators[path.node.operator]),
				LEFT_EXPRESSION: path.node.left,
				RIGHT_EXPRESSION: path.node.right,
			});
		},
		CallExpression(path) {
			if (path.node.callee.type === 'Identifier') {
				return babel.template('LIBRARY.METHOD(ARGUMENTS)')({
					LIBRARY: libraryIdentifier,
					METHOD: babel.types.identifier(path.node.callee.name),
					ARGUMENTS: path.node.arguments,
				});
			}
		},
		UnaryExpression(path) {
			if (path.node.operator === '-' && path.node.argument.type !== 'NumericLiteral') {
				// for unary minus operator: -var
				return babel.template('LIBRARY.METHOD(ARGUMENT, ARGUMENT2)')({
					LIBRARY: libraryIdentifier,
					METHOD: babel.types.identifier('multiply'),
					ARGUMENT: path.node.argument,
					ARGUMENT2: '-1',
				});
			}
		},
		LogicalExpression(path) {
			if(logicOperators[path.node.operator] == null){
				throw new Error('Operator is not defined: ' + path.node.operator);
			}
			return babel.template('LIBRARY.METHOD(LEFT,RIGHT)')({
				LIBRARY: libraryIdentifier,
				METHOD: babel.types.identifier(logicOperators[path.node.operator]),
				LEFT: path.node.left,
				RIGHT: path.node.right
			});
		},
		FunctionExpression(path){
			return path.node.expression;
		}
	};
	
	function handlePath(path){
		if(visitor[path.type]){
			return visitor[path.type](path);
		}
		else {
			return path;
		}
	}
	
	const traverseVisitor = {
		enter(path){
			const result = handlePath(path);
			if(result){
				path.replaceWith(result);
			}
		}
	};
	
	
	
	function traverse(path){
		path.parentPath.traverse(traverseVisitor);
		path.parentPath.replaceWith(path);
	}
	
	return {
		handlePath,
		traverse
	};
};

function genericReplace(argumentPath, state, babel, libraryIdentifier) {
	const {handlePath,traverse} = createHelper(argumentPath,state,babel,libraryIdentifier);
		
	traverse(argumentPath);
}

const logicOperators = {
	'&&': 'and',
	'||': 'or'
};

const binaryOperators = {
	'+': 'add',
	'-': 'sub',
	'*': 'multiply',
	'/': 'divide',
	'**': 'pow',
	'%': 'mod',
	'==': 'eq',
	'===': 'eq',
	'!=': 'neq',
	'!==': 'neq',
	'>': 'greaterThan',
	'>=': 'greaterOrEq',
	'<': 'lessThan',
	'<=': 'lessOrEq',
};
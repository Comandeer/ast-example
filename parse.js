const { join: joinPath } = require( 'path' );
const { readFileSync, writeFileSync } = require( 'fs' );
const { isMemberExpression, isCallExpression, isIdentifier, identifier } = require( '@babel/types' );
const { parse } = require( '@babel/parser' );
const { default: traverse } = require( '@babel/traverse' );
const { default: generate } = require( '@babel/generator' );

const path = joinPath( __dirname, 'input.js' );
const code = readFileSync( path, 'utf8' );
const ast = parse( code );

function isConsoleLog( { object, property } ) {
	return isIdentifier( object ) && isIdentifier( property ) && object.name === 'console' && property.name === 'log';
}

traverse( ast, {
	enter( path ) {
		const { node, parentPath } = path;

		if ( !parentPath ) {
			return;
		}

		const { node: parentNode } = parentPath;

		if ( !isMemberExpression( node ) || !isCallExpression( parentNode ) || !isConsoleLog( node ) ) {
			return;
		}

		path.replaceWith(
			identifier( 'customLog' )
		);
	}
} );

const { code:transformedCode } = generate( ast );

const outputPath = joinPath( __dirname, 'output.js' );
writeFileSync( outputPath, transformedCode, 'utf8' );

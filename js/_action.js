'use strict'; // Encoding: UTF-8
/**
 * Dynamic loader module for the jMini Compiler Tool
 *
 * Released under the MIT license
 *
 * @author Sascha Leib <ad@hominem.info>
 *
 * @version 2.0.1
 * @date 2026-01-23
 * @package jmini-compiler
 * @requires jMini Core
 */

/* Add an auto-loader module to $p.dyn */
$p.dyn.jMini = {

	// as this is a sub-module of $p.dyn, this _init() method will beforebe
	// automatically called by $p.dyn, thus allowing an easy way to register
	// the action callback:
	_init: function() {
		$p.dyn.action.register('jmini-compiler', $app.init);
	}
}

/* app root item */
const $app = {
	
	version: '2.0.1',
	
	// The init is registered as action callback, i.e. this will be called
	// when a JSON snippet with the appropriate 'action' is found in the page.
	// Parameters are:
	// - p: the JSON script element's parent Object
	// - json: the JSON in the script element, parsed as object
	init: function(p, json) {
		//console.log('$app.init', p, json);
		
		// find the root element (use the parent as fallback):
		const root = document.getElementById(json.to) || p;
		
		// initialise the GUI:
		$app.gui.init(root);
		
		// initialise the model:
		$app.model.init( json.from || './' );
	}
};
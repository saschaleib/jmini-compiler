'use strict'; // Encoding: UTF-8
/**
 * Dynamic loader module for the jMini Compiler Tool
 *
 * Released under the MIT license
 *
 * @author Sascha Leib <ad@hominem.info>
 *
 * @version 2.0.0
 * @date 2026-01-22
 * @package jmini-compiler
 * @requires jMini Core
 */

/* Add an auto-loader module to $p.dyn */
$p.dyn.jMini = {

	_init: function() {
		//console.log('$p.dyn.jMini._init()');
		$p.dyn.action.register('jmini-compiler', this.action);
	},

	action: function(parent, json) {
		//console.log('$p.dyn.jMini.action(',parent,',',json,')');
		
		// find the root element (use the parent as fallback):
		const root = document.getElementById(json.to) || parent;
		
		// initialise the GUI:
		$app.gui.init(root);
		
		// initialise the model:
		$app.model.init( json.from || './' );
	}
}

/* app root item */
const $app = {
	version: 2.0
};
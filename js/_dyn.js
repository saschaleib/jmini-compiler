'use strict'; // Encoding: UTF-8
/**
 * Dynamic loader module for the jMini Compiler Tool
 *
 * Released under the MIT license
 *
 * @author Sascha Leib <ad@hominem.info>
 *
 * @version 0.0.1
 * @date 2026-01-20
 * @package jmini-compiler
 * @requires jMini Core
 */
 
$p.dyn.jMini = {

	_init: function() {
		//console.log('$p.dyn.jMini._init()');
		$p.dyn.action.register('jmini-compiler', this.action);
	},

	action: function(parent, json) {
		//console.log('$p.dyn.jMini.action(',parent,',',json,')');
		
		// shortcuts to make the code more readable:
		const me = $p.dyn.jMini;
		const gError = me.gui.globalError;
		const model = $p.dyn.jMini.model;
		
		// find the root element (use the parent as fallback):
		const root = document.getElementById(json.to) || parent;
		
		// store a reference to the global error element:
		if (json.error) {
			gError.setElement(json.error);
		}
		
		// Build the interface:
		me.gui.prepare(root);
		
		// load the model:
		model.load( json.from || './' );
	}
}
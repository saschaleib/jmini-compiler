'use strict'; // Encoding: UTF-8
/**
 * Dynamic loader module for the jMini Compiler Tool
 *
 * Released under the MIT license
 *
 * @author Sascha Leib <ad@hominem.info>
 *
 * @version 2.1.0
 * @date 2026-01-24
 * @package jmini-compiler
 * @requires jMini Core
 */

/* app root item */
const $app = {
	
	version: '2.1.0',
	
	// The init is registered as action callback, i.e. this will be called
	// when a JSON snippet with the appropriate 'action' is found in the page.
	// Parameters are:
	// - p: the JSON script element's parent Object
	// - json: the JSON in the script element, parsed as object
	init: function() {
		//console.log('$app.init', p, json);
		
		/* find all script tags in the document */
		const scripts = document.getElementsByTagName('script');
		
		/* filter them down to only the ones marked as JSON type */
		const js = Array.prototype.filter.call(scripts, s => {
			return ( s.hasAttribute('type') && s.getAttribute('type') == 'application/json' );
		});
		
		// find the json script element with an action type of "jmini-compiler":
		// this replaces the $p and $p.dyn modules (it is basically the same code :-)
		for (var i = 0; i < js.length; i++) {
			try {
				const json = JSON.parse(js[i].innerHTML);
				if (json.action && json.action == 'jmini-compiler') {
					
					// determine the target object:
					const root = ( json.to ? document.getElementById(json.to) : js[i].parentElement );
					
					// initialise the GUI:
					$app.gui.init(root);
					
					// initialise the model:
					$app.model.init( json.from || './' );
				}
			} catch (err) {
				console.error(err);
			}
		}
	}
};

/* call pre-init when the file is loaded */
document.addEventListener('DOMContentLoaded', $app.init);
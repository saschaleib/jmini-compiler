'use strict'; // Encoding: UTF-8
/**
 * Data Model for the jMini Compiler Tool
 *
 * Released under the MIT license
 *
 * @author Sascha Leib <ad@hominem.info>
 *
 * @version 0.0.2
 * @date 2026-01-20
 * @package jmini-compiler
 * @requires jMini Core
 */
 
$p.dyn.jMini.model = {

	/*_init: function() {
		console.log('$p.dyn.jMini.model._init()');
	},
	
	init: function() {
		console.log('$p.dyn.jMini.model.init()');
	},*/
	
	_data: [],
	
	load: function(baseUrl) {
		//console.log('$p.dyn.jMini.model.load("'+baseUrl+'")');

		// shortcuts to make the code more readable:
		const me = $p.dyn.jMini.model;
		const gui = $p.dyn.jMini.gui;

		// load the index file:
		JSON.load(baseUrl + 'index.json')
		.then( result => {
			
			// show the loaded topics list in the UI:
			gui.builder.makeTopicsList(result.topics);

			// store the topics in the internal storage:
			me._data = result.topics;

		})
		.then ( () => {
			
			// load the items for each topic:
			let toLoad = me._data.length;
			me._data.forEach( topic => {
				
				JSON.load(baseUrl + topic.path + 'index.json')
				.then( json => {
					topic._items = json;
					gui.updater.updateTopicItems(topic, json);
					
					// check if finished:
					toLoad -= 1;
					if (toLoad <= 0) {
						// initiate loading the source snippets:
						me._loadSourceSnippets(baseUrl);
					}
				});
			});

		})
		.catch( error => {
			gui.error.show('network');
			console.error(error.toString());
		});
	},
	
	// load all the source snippets:
	_loadSourceSnippets: function(baseUrl) {
		//console.log('$p.dyn.jMini.model._loadSourceSnippets('+baseUrl+')');

		// shortcuts to make the code more readable:
		const me = $p.dyn.jMini.model;
		const gui = $p.dyn.jMini.gui;
				
		// lock, and get the status of the minified button:
		gui.options.lockMinifiedCB(true);
		const minified = gui.options.getMinifiedStatus();
				
		// load all the items minified first:
		me._data.forEach( topic => {
			topic._items.forEach( it => {
				me.__loadSnippet(baseUrl, topic, it, true, minified);
			});
		});

		// now do the same for all the non-minified ones:
		me._data.forEach( topic => {
			topic._items.forEach( it => {
				me.__loadSnippet(baseUrl, topic, it, false, !minified);
			});
		});
		
		// now the same for the non-minified versions:
		// TODO!
	},
	__loadSnippet: async function(baseUrl, topic, item, minified, show) {
		//console.log('$p.dyn.jMini.model.__loadSnippet()', baseUrl, topic, item, minified);

		// shortcuts to make the code more readable:
		const me = $p.dyn.jMini.model;
		const gui = $p.dyn.jMini.gui;

		// URL to load: 
		const fileUrl = baseUrl + topic.path + item.file + ( minified ? '.min' : '' ) + '.js';
		console.log('loading from:', fileUrl);
		
		fetch(fileUrl)
		.then (response => {
			return response.text();
		})
		.then( txt => {
			
			// update the item:
			if (minified) {
				item._srcmin = txt;
			} else {
				item._src = txt;
			}
			
			// update the UI:
			if (show) {
				gui.updater.updateFileSize(item, minified);
			}
		});
		
	}
}
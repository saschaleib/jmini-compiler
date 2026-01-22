'use strict'; // Encoding: UTF-8
/**
 * Data Model for the jMini Compiler Tool
 *
 * Released under the MIT license
 *
 * @author Sascha Leib <ad@hominem.info>
 *
 * @version 2.0.1
 * @date 2026-01-21
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
	
	// find an item by ID:
	findItem: function(id) {
		//console.log('$p.dyn.jMini.model.findItem("'+id+'")');
		
		// shortcuts to make the code more readable:
		const me = $p.dyn.jMini.model;

		// search through all items:
		let item = null;
		for (let i = 0; i < me._data.length; i++) {
			for (let j = 0; j < me._data[i]._items.length; j++) {
				if (me._data[i]._items[j].id === id) {
					item = me._data[i]._items[j];
					break;
				}
			}
			if (item) break;
		}
		
		return item;
	},
	
	
	// find a topic by ID:
	findTopic: function(id) {

		// shortcuts to make the code more readable:
		const me = $p.dyn.jMini.model;

		// find the topic:
		let topic = null;
		for (let i = 0; i < me._data.length; i++) {
			if (me._data[i].id == id) {
				topic = me._data[i];
				break;
			}
		}
		return topic;
	},
	
	// check/uncheck item by ID:
	checkItem: function(id, state) {
		//console.log('$p.dyn.jMini.model.checkItem("'+id+'"',state,')');
		
		// shortcuts to make the code more readable:
		const me = $p.dyn.jMini.model;

		// find the item:
		const item = me.findItem(id);
		if (item) {
			item._checked = state;
			item._cb.checked = state;
		}

	},

	// check/uncheck an entire topic:
	checkTopic: function(topic, state) {
		//console.log('$p.dyn.jMini.model.checkTopic("'+id+'"',state,')');

		// shortcuts to make the code more readable:
		const me = $p.dyn.jMini.model;
		const gui = $p.dyn.jMini.gui;

		// if the topic is passed by ID, we first need to find the object:
		if (typeof topic === 'string' || topic instanceof String) {
			topic = me.findTopic(topic);
		}

		if (topic) {
			
			// update checked status of all items:
			topic._items.forEach( it => {
				it._checked = state;
				it._cb.checked = state;
			});

		} else {
			console.error('TOPIC NOT FOUND:');
		}			
	},
	
	// recalculate all topic sizes:
	calculateTopicSizes: function() {
		//console.log('$p.dyn.jMini.model.calculateTopicSizes()');

		// shortcuts to make the code more readable:
		const me = $p.dyn.jMini.model;
		const gui = $p.dyn.jMini.gui;

		// looking for minified sizes or readable ones?
		const minified = gui.options.getMinifiedStatus();
		
		// total toolbox size:
		let totalSize = 0;
		
		// loop over all topics:
		me._data.forEach( topic => {
			
			let topicSize = 0;
			topic._items.forEach( it => {
				if (it._checked) {
					const size = ( minified ? it._srcmin.length || 0 : it._src.length || 0 );
					topicSize += size;
					totalSize += size;
				}
			});
			gui.updater.updateTopicSize(topic, topicSize);
			
			// display the total size:
			gui.interaction.endBusy(totalSize.toBytesString(2, 'en', {0: '—'}));
		});

		//gui.updater.updateTopicSize(topic, minified);
		
	},
	
	// check/uncheck *all* items:
	checkAll: function(state) {
		console.log('$p.dyn.jMini.model.checkAll(',state,')');

		// shortcuts to make the code more readable:
		const me = $p.dyn.jMini.model;
		const gui = $p.dyn.jMini.gui;

		me._data.forEach( topic => {
			me.checkTopic(topic, state);
			
			topic._checked = state;
			topic._cb.checked = state;
			
		});
		
		// recalculate the selected sizes:
		me.calculateTopicSizes()

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

		// count the total snippet files to be loaded:
		me._data.forEach( topic => {
			me.__totalSnippetLoads += topic._items.length * 2;
		});

		// load all the minified snippets first:
		me._data.forEach( topic => {
			topic._items.forEach( it => {
				me.__loadSnippet(baseUrl, topic, it, true, minified, me.__loadSnippetCallback);
			});
		});

		// now do the same for all the non-minified ones:
		me._data.forEach( topic => {
			topic._items.forEach( it => {
				me.__loadSnippet(baseUrl, topic, it, false, !minified, me.__loadSnippetCallback);
			});
		});
		
		// now the same for the non-minified versions:
		// TODO!
	},
	__loadSnippet: async function(baseUrl, topic, item, minified, show, callback) {
		//console.log('$p.dyn.jMini.model.__loadSnippet()', baseUrl, topic, item, minified);

		// shortcuts to make the code more readable:
		const me = $p.dyn.jMini.model;
		const gui = $p.dyn.jMini.gui;

		// Load the topic file:
		fetch(baseUrl + topic.path + item.file + ( minified ? '.min' : '' ) + '.js')
		.then (response => {
			if (response.ok) {
				return response.text();
			} else {
				gui.error.show('incomplete');
				console.error(`HTTP ${response.status}: ${response.statusText}`);
				return null;
			}
		})
		.then( txt => {
			
			// update the item:
			if (minified) {
				item._srcmin = txt;
			} else {
				item._src = txt;
			}
			
			// update the UI:
			if (!txt) { // an error occured
				item._checked = false;
				gui.updater.setItemError(item);
			} else if (show) {
				gui.updater.updateFileSize(item, minified);
			}
		})
		.catch( error => {
			gui.error.show('incomplete');
			console.error(error.toString());
		})
		.finally( () => {
			if (callback) callback(); // call the callback.
		});
	},
	
	// total number of snippets to be loaded:
	__totalSnippetLoads: 0,
	
	// callback after every snippet was loaded:
	__loadSnippetCallback: function() {
		
		// shortcuts to make the code more readable:
		const me = $p.dyn.jMini.model;
		const gui = $p.dyn.jMini.gui;

		me.__totalSnippetLoads--; // countdown
		
		// finished? go interactive
		if (me.__totalSnippetLoads <= 0) {
			// console.info("Loading finished, entering interactive mode:");
			gui.interaction.start();
		}
		
	}
}
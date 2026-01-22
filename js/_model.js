'use strict'; // Encoding: UTF-8
/**
 * Data Model for the jMini Compiler Tool App
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
 
$app.model = {

	// initialise the model (load topics file from server):
	init: function(baseUrl) {
		//console.log('$app.model.load("'+baseUrl+'")');

		// 'this' is not available, as this init is not called by the $p initialiser.
		// instead, let's use 'me' to refer to the object:
		const me = $app.model;

		// load the topics file:
		JSON.load(baseUrl + 'index.json')
		.then( result => {
			
			// show the loaded topics list in the UI:
			$app.gui.builder.makeTopicsList(result.topics);

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
					$app.gui.updater.updateTopicItems(topic, json);
					
					// check if all files finished loading::
					toLoad -= 1;
					if (toLoad <= 0) {
						// initiate loading the source snippets:
						me._loadSourceSnippets(baseUrl);
					}
				});
			});

		})
		.catch( error => {
			// if this occurs, we probably have a fundamental network error:
			$app.gui.error.show('network');
			console.error(error.toString());
		});
	},
	
	// internal data storage
	// (array of topics):
	_data: [],
	
	// find an item by ID:
	findItem: function(id) {
		//console.log('$app.model.findItem("'+id+'")');
		
		// shortcut to make the code more readable:
		const me = $app.model;

		// search through all items:
		// old-style for loops are fastest in this case!
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
		const me = $app.model;

		// find the topic:
		// old-style for loops are fastest in this case!
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
		//console.log('$app.model.checkItem("'+id+'"',state,')');
		
		// find the item:
		const item = $app.model.findItem(id);
		if (item) {
			item._checked = state;
			item._cb.checked = state;
		}
	},

	// check/uncheck an entire topic:
	// 'topic' parameter can be an ID string, or a topic object:
	checkTopic: function(topic, state) {
		//console.log('$app.model.checkTopic("'+id+'"',state,')');

		// shortcuts to make the code more readable:
		const gui = $app.gui;

		// if the topic is passed by ID, we first need to find the object:
		if (typeof topic === 'string' || topic instanceof String) {
			topic = $app.model.findTopic(topic);
		}

		if (topic) { // update checked status of all items:
			topic._items.forEach( it => {
				it._checked = state;
				it._cb.checked = state;
			});
		} else {
			console.error('TOPIC NOT FOUND:');
		}			
	},
	
	// recalculate all topic sizes:
	recalculateAllSizes: function() {
		// console.log('$app.model.recalculateAllSizes()');

		// are we looking for minified sizes or full-size ones?
		const minified = $app.gui.options.getMinifiedStatus();
		
		// total toolbox size:
		let totalSize = 0; // total file size of the selection
		let totalSelected = 0; // number of topics that contain selected items
		
		// loop over all topics:
		$app.model._data.forEach( topic => {
			
			// find which items are checked:
			let topicSize = 0;
			let topicSelected = 0;
			topic._items.forEach( it => {
				
				// update the item size field:
				const itemSize = ( minified ? it._srcmin.length || 0 : it._src.length || 0 );
				it._sf.textContent = itemSize.toBytesString();

				// calculate total sizes (iff selected)
				if (it._checked && (it._srcmin || it._src)) {
					topicSize += itemSize;
					totalSize += itemSize;
					topicSelected += 1;
				}
			});
			
			// update the topic select box:
			let topicState = Math.sign(topicSelected); // 0 or 1
			if ( topicState > 0 && topicSelected < topic._items.length) {
				topicState = -1; // mixed state!
			}
			
			// count towards the total checkbox?
			totalSelected += ( topicState > 0 ? 1 : 0 ); // also mixed items count as 1

			// update the size field for the topic:
			$app.gui.updater.updateTopicState(topic, topicSize, topicState);
		});
		
		// determine the total checkbox state:
		let totalState = Math.sign(totalSelected); // 0 or 1
		if ( totalState > 0 && totalSelected < $app.model._data.length) {
			totalState = -1; // mixed state!
		}

		// display the total size:
		$app.gui.updater.updateTotalState(totalSize, totalState);
	},
	
	// check/uncheck *all* items:
	checkAll: function(state) {
		// console.log('$app.model.checkAll(',state,')');

		$app.model._data.forEach( topic => {
			$app.model.checkTopic(topic, state);
			
			topic._checked = state;
			topic._cb.checked = state;
			
		});
		
		// recalculate the selected sizes:
		$app.model.recalculateAllSizes()
	},

	// compile the library and put the code into the source field:
	compile: function() {
				
		// get the user settings as an object:
		const opt = $app.gui.options.getUserOptions();
		
		// always start with a "use strict" directive:
		let code = "'use strict';";

		/* add a license text, if configured */
		if (opt.license) {
			
			const year = 2026;
					
			code += "\n/* Copyright " + year + " Sascha Leib\n *\n";
			code += " * Permission is hereby granted, free of charge, to any person obtaining a copy of this software\n * and associated documentation files (the “Software”), to deal in the Software without restriction,\n * including without limitation the rights to use, copy, modify, merge, publish, distribute,\n * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is\n * furnished to do so, subject to the following conditions:\n *\n";
			code += " * The above copyright notice and this permission notice shall be included in all copies or substantial\n * portions of the Software.\n *\n";
			code += " * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT\n * NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.\n * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,\n * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE\n * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n */\n";
		}
		
		/* loop over all topics and items: */
		$app.model._data.forEach( topic => {
			topic._items.forEach( it => {
				
				if (it._checked && (it._src ||it._srcmin)) {
					code += ( opt.annotate ? "\n/* " + it.name + " */ " : '' )
					+ ( opt.minify ? it._srcmin || '/* MISSING */' : "\n" + it._src || '/* MISSING */');
				}
			});
		});

		return code; // success!
		
	},

	// load all the source snippets (internal)
	_loadSourceSnippets: function(baseUrl) {
		//console.log('$app.model._loadSourceSnippets('+baseUrl+')');

		// shortcut to make the code more readable:
		const me = $app.model;
				
		// lock, and get the status of the minified button:
		$app.gui.options.lockMinifiedCB(true);
		const minified = $app.gui.options.getMinifiedStatus();

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
	},
	
	// load one specific snippet (private)
	__loadSnippet: async function(baseUrl, topic, item, minified, show, callback) {
		//console.log('$app.model.__loadSnippet()', baseUrl, topic, item, minified);

		// shortcuts to make the code more readable:
		const gui = $app.gui;

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
				item._sf.textContent = txt.length.toBytesString();
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
	
	// total number of snippets to be loaded (private)
	__totalSnippetLoads: 0,
	
	// callback after every snippet was loaded (private)
	__loadSnippetCallback: function() {
		
		// shortcuts to make the code more readable:
		const gui = $app.gui;

		$app.model.__totalSnippetLoads--; // countdown
		
		// finished? go interactive
		if ($app.model.__totalSnippetLoads <= 0) {
			// console.info("Loading finished, entering interactive mode:");
			gui.interaction.start();
		}
	}
}
'use strict'; // Encoding: UTF-8
/**
 * Data Model for the jMini Compiler Tool App
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

// extend the $app object by a new "model" sub-object:
$app.model = {

	// init is called from $app.init
	// parameter is the base Url to load the 
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
			me._private_.topics = result.topics;

		})
		.then ( () => {
			
			// load the items for each topic:
			let toLoad = me._private_.topics.length;
			me._private_.topics.forEach( topic => {
				
				JSON.load(baseUrl + topic.path + 'index.json')
				.then( json => {
					topic._items = json;
					$app.gui.updater.updateTopicItems(topic, json);
					
					// check if all files finished loading::
					toLoad -= 1;
					if (toLoad <= 0) {
						// initiate loading the source snippets:
						me._private_.loadSourceSnippets(baseUrl);
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
	
	// compile the library and put the code into the source field:
	compile: function() {
				
		// get the user settings as an object:
		const opt = $app.gui.options.get();
		
		// always start with a "use strict" directive:
		let code = "'use strict';";

		/* add a license text, if configured */
		if (opt.license) {
			
			const year = new Date().getFullYear();
					
			code += "/* jMini Toolbox; Copyright " + year + " Sascha Leib\n *\n";
			code += " * Permission is hereby granted, free of charge, to any person obtaining a copy of this software\n * and associated documentation files (the “Software”), to deal in the Software without restriction,\n * including without limitation the rights to use, copy, modify, merge, publish, distribute,\n * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is\n * furnished to do so, subject to the following conditions:\n *\n";
			code += " * The above copyright notice and this permission notice shall be included in all copies or substantial\n * portions of the Software.\n *\n";
			code += " * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT\n * NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.\n * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,\n * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE\n * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n */\n";
		}
		
		/* loop over all topics and items: */
		$app.model._private_.topics.forEach( topic => {
			topic._items.forEach( it => {
				
				if (it._checked && (it._src ||it._srcmin)) {
					code += ( opt.annotate ? "\n/* " + it.name + " */ " : '' )
					+ ( opt.minify ? it._srcmin || '/* MISSING */' : "\n" + it._src || '/* MISSING */');
				}
			});
		});

		return code; // success!
		
	},

	// methods related to the topics data:
	topic: {

		// find a topic by ID:
		find: function(id) {

			// shortcuts to make the code more readable:
			const topics = $app.model._private_.topics;

			// find the topic:
			// old-style for loops are fastest in this case!
			let topic = null;
			for (let i = 0; i < topics.length; i++) {
				if (topics[i].id == id) {
					topic = topics[i];
					break;
				}
			}
			return topic;
		},
	
		// check/uncheck an entire topic:
		// 'topic' parameter can be an ID string, or a topic object:
		check: function(topic, state) {
			//console.log('$app.model.topic.check("'+id+'"',state,')');

			// shortcuts to make the code more readable:
			const gui = $app.gui;

			// if the topic is passed by ID, we first need to find the object:
			if (typeof topic === 'string' || topic instanceof String) {
				topic = $app.model.topic.find(topic);
			}

			if (topic) { // update checked status of all items:
				topic._items.forEach( it => {
					$app.model.item.check(it, state);
				});
			} else {
				console.error('TOPIC NOT FOUND:');
			}			
		}
	},
	
	// methods related to the function items:
	item: {

		// find an item by ID:
		find: function(id) {
			//console.log('$app.model.item.find("'+id+'")');
			
			// shortcut to make the code more readable:
			const _private_ = $app.model._private_;

			// search through all items:
			// old-style for loops are fastest in this case!
			let item = null;
			for (let i = 0; i < _private_.topics.length; i++) {
				for (let j = 0; j < _private_.topics[i]._items.length; j++) {
					if (_private_.topics[i]._items[j].id === id) {
						item = _private_.topics[i]._items[j];
						break;
					}
				}
				if (item) break;
			}
			return item;
		},

		// check/uncheck item by ID:
		// 'item' parameter can be an ID string, or an item object:
		check: function(item, state) {
			//console.log('$app.model.item.check("'+id+'"',state,')');
			
			// if the item is passed by ID, we first need to find the object:
			if (typeof item === 'string' || item instanceof String) {
				item = $app.model.item.find(item);
			}

			if (item) {
				item._checked = state;
				item._cb.checked = state;
				
				// also select dependent items, if applicable:
				if (state) {
					$app.model.item.selectDependencies(item);
				}
			}
		},
		
		// select all dependencies of an item
		selectDependencies: function(item) {
			//console.log('$app.model.global.selectDependencies(',item,')');
			
			const me = $app.model.item;
			
			if (item.requires && item.requires.length > 0) {
				item.requires.forEach( reqId => {
					me.check(reqId, true);
				});
			}
			
		}
	},
	
	// methods related to the global list as a whole:
	global: {
		
		// recalculate all topic sizes:
		recalculate: function() {
			//console.log('$app.model.global.recalculate()');

			// get the user options:
			const opt = $app.gui.options.get();
			
			// total toolbox size:
			let totalSize = 0; // total file size of the selection
			let totalSelected = 0; // number of topics that contain selected items
			let hasMixed = false; // are there any mixed items in the list?
			
			// loop over all topics:
			$app.model._private_.topics.forEach( topic => {
				
				// find which items are checked:
				let topicSize = 0; // how many bytes in the topic?
				let topicSelected = 0; // how many items in the topic are selected?
				topic._items.forEach( it => {
					
					// update the item size field:
					const itemSize = ( opt.minify ? it._srcmin.length || 0 : it._src.length || 0 );
					it._sf.textContent = itemSize.toBytesString();

					// calculate total sizes (if selected)
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
					hasMixed = true; // flag the mixed state!
				}
				
				// count towards the total checkbox?
				totalSelected += ( topicState > 0 ? 1 : 0 ); // only fully selected items count here!

				// update the size field for the topic:
				$app.gui.updater.updateTopicState(topic, topicSize, topicState);
			});
			
			// determine the total checkbox state:
			let totalState = Math.sign(totalSelected); // 0 or 1
						
			if ( totalState > 0 && totalSelected < $app.model._private_.topics.length) {
				totalState = -1; // mixed state!
			}

			// display the total size:
			$app.gui.updater.updateTotalState(totalSize, totalState, hasMixed);
		},
		
		// check/uncheck *all* items:
		check: function(state) {
			// console.log('$app.model.global.check(',state,')');

			$app.model._private_.topics.forEach( topic => {
				$app.model.topic.check(topic, state);
				
				topic._checked = state;
				topic._cb.checked = state;
				
			});
			
			// recalculate the selected sizes:
			$app.model.global.recalculate()
		}
	},

	// private properties and functions:
	_private_: {
		
		// internal data storage
		// (array of topics):
		topics: [],

		// load all the source snippets (private)
		loadSourceSnippets: function(baseUrl) {
			//console.log('$app.model._private_._loadSourceSnippets('+baseUrl+')');

			// shortcuts to make the code more readable:
			const me = $app.model;
			const _private_ = me._private_;
					
			// lock, and get the status of the minified button:
			$app.gui.options.lock('minify', true);
			const opt = $app.gui.options.get();

			// count the total snippet files to be loaded:
			_private_.topics.forEach( topic => {
				_private_.totalSnippetLoads += topic._items.length * 2;
			});

			// load all the minified snippets first:
			_private_.topics.forEach( topic => {
				topic._items.forEach( it => {
					_private_.loadSnippet(baseUrl, topic, it, true, opt.minify, _private_.loadSnippetCallback);
				});
			});

			// now do the same for all the non-minified ones:
			_private_.topics.forEach( topic => {
				topic._items.forEach( it => {
					_private_.loadSnippet(baseUrl, topic, it, false, !opt.minify, _private_.loadSnippetCallback);
				});
			});
		},

		// load one specific snippet (private)
		loadSnippet: async function(baseUrl, topic, item, minified, show, callback) {
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
		totalSnippetLoads: 0,
		
		// callback after every snippet was loaded (private)
		loadSnippetCallback: function() {
			
			// shortcut to _private_ namespace:
			const _private_ = $app.model._private_;

			_private_.totalSnippetLoads--; // countdown
			
			// finished? go interactive
			if (_private_.totalSnippetLoads <= 0) {
				// console.info("Loading finished, entering interactive mode:");
				$app.gui.interaction.start();
			}
		},
	}
}
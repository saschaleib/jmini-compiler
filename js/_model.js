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
	
	_topics: null,
	
	load: function(baseUrl) {
		//console.log('$p.dyn.jMini.model.load(',baseUrl,')');

		// shortcuts to make the code more readable:
		const me = $p.dyn.jMini.model;
		const gui = $p.dyn.jMini.gui;

		// load the index file:
		JSON.load(baseUrl + 'index.json')
		.then( result => {
			
			me._topics = result.topics;
			gui.builder.makeTopicsList(me._topics);
			
			// TODO: launch details file-loaders:
			me._topics.forEach( topic => {
				
				JSON.load(baseUrl + topic.path + 'index.json')
				.then( file => {
					gui.builder.appendItemsToTopic(topic, file);
				})
				.catch( error => {
					console.error(error.toString());
				});

				
				
			});
		})
		.catch( error => {
			console.error(error.toString());
		});

		
	}
}
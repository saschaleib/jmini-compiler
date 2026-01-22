'use strict'; // Encoding: UTF-8
/**
 * GUI module for the jMini Compiler Tool
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
 
$p.dyn.jMini.gui = {
	
	prepare: function(root) {
		//console.log('$p.dyn.jMini.gui.prepare(',root,')');

		// shortcuts to make the code more readable:
		const me = $p.dyn.jMini.gui;
		const ref = me._ref;

		// shortcut to make the code more readable:
		const builder = $p.dyn.jMini.gui.builder;
		
		// create the selection tab:
		ref.tabs[0] = root.appendNew('div', { 'id': 'jmc__tab1'},
		[
			builder.makeSelHeader(),
			builder.makeErrorMessages(),
			builder.makeTopicsElement(),
			builder.makeSelFooter()
		]);

		// create the target tab tab:
		ref.tabs[1] = root.appendNew('div', {
			'id': 'jmc__tab2',
			//'hidden': 'hidden'
		}, [
			builder.makeCodeHeader(),
			builder.makeCodeField()
		]);
	},
	
	// general UI interaction
	interaction: {
	
		// start interaction:
		start: function() {
			
			// shortcuts to make the code more readable:
			const me = $p.dyn.jMini.gui;
			const ref = me._ref;

			// enable UI items:
			ref.compileBtn.disabled = false;
			ref.options.minify.disabled = false;

			// end the busy animation:
			me.interaction.endBusy();
			
		},
		
		// start the busy interaction:
		startBusy: function() {
			
			// shortcuts to make the code more readable:
			const me = $p.dyn.jMini.gui;
			const ref = me._ref;

			ref.total.classList.add('loading');
			ref.total.textContent = "loading";
		},
		endBusy: function(txt = '—') {
			
			// shortcuts to make the code more readable:
			const me = $p.dyn.jMini.gui;
			const ref = me._ref;

			ref.total.classList.remove('loading');
			ref.total.textContent = txt;
		}

	},
	
	// functions for showing errors
	error: {
		show: function(type) {
			//console.log('$p.dyn.jMini.gui.error.show(',type,')');
			
			// shortcuts to make the code more readable:
			const me = $p.dyn.jMini.gui;

			switch (type) {
				case 'network':
					me._ref.error.network.hidden = false;
					break;
				case 'incomplete':
					me._ref.error.incomplete.hidden = false;
					break;
				default:
					console.error("Unknown error type:", type);
			}
		}
	},
	
	// functions related to the options:
	options: {
		
		// lock/unlock the Minify checkbox:
		lockMinifiedCB: function(lock) {
			
			// shortcuts to make the code more readable:
			const minifyCB = $p.dyn.jMini.gui._ref.options.minify;
			
			if (minifyCB) {
				minifyCB.disabled = lock;
			}
		},
		
		// returns the current status of the Minify button:
		getMinifiedStatus: function() {
			// shortcuts to make the code more readable:
			const minifyCB = $p.dyn.jMini.gui._ref.options.minify;
			
			if (minifyCB) {
				return minifyCB.checked;
			}
			return true; // in case not available: use minified!
		}
	},
	
	/* references to specific elements for easy access: */
	_ref: {
		total: null,
		compileBtn: null,
		topicList: null,
		tabs: [null, null],
		options: {
			minify: null,
			license: null,
			annotate: null
		},
		error: {
			network: null,
			incomplete: null
		},
		sourceField: null
	},
	
	// GUI module builder:
	builder: {
	
		// build all the header elements for the selection tab:
		makeSelHeader: function() {
			
			// shortcuts to make the code more readable:
			const me = $p.dyn.jMini.gui;
			const cb = me._callback;
			const ref = me._ref;
			
			// create the total/busy element:
			ref.total = HTMLElement.new('span', {
					'class': 'loading'
				}, "loading");
			
			const header = HTMLElement.new('header', undefined,
			[
			
				HTMLElement.new('input', {
					'type': 'checkbox',
					'id': 'jmc__globalcb',
					'title': "select/unselect all"
				}).on('change', cb.onGlobalCheckboxChange),
				
				HTMLElement.new('label', {
					'for': 'jmc__globalcb'
				}, "jMini Toolbox"),
				
				ref.total
			]);
			
			return header;
		},
		
		// build a section of error messages to be shown as needed:
		makeErrorMessages: function() {
			
			// shortcuts to make the code more readable:
			const me = $p.dyn.jMini.gui;
			const cb = me._callback;
			const ref = me._ref;
			
			return HTMLElement.new('div', {
				'class': 'errors'
			}, [
			
				ref.error.network = HTMLElement.new('p', { // Network error
					'class': 'error',
					'hidden': 'hidden'
				}, [
					HTMLElement.new('span', undefined, "The index files could not be loaded. Either they don’t exist, or a network error occured. Please see the browser console for more information."),
					HTMLElement.new('button', undefined, "Reload").on('click', cb.onReloadButtonClicked)
				]),

				ref.error.incomplete = HTMLElement.new('p', { // Incomplete data
					'class': 'warning',
					'hidden': 'hidden'
				}, [
					HTMLElement.new('span', undefined, "The code repository was found, but the source data could not be completely loaded. This may be due to network problems, or because there is incorrect data in the repository. Some modules may not be available."),
					HTMLElement.new('button', undefined, "Reload").on('click', cb.onReloadButtonClicked)
				])

			]);
		},
		
		// prepare the high-level list (content will be added later):
		makeTopicsElement: function(topics) {

			// shortcut to make the code more readable:
			const me = $p.dyn.jMini.gui;
			
			me._ref.topicList = HTMLElement.new('div', {
				'class': 'content'
			});

			return me._ref.topicList
		},
		
		// build all the footer elements for the selection tab:
		makeSelFooter: function() {
			
			// shortcuts to make the code more readable:
			const me = $p.dyn.jMini.gui;
			const cb = me._callback;
			const ref = me._ref;
			
			// create the compile button:
			ref.compileBtn = HTMLElement.new('button', {
				'type': 'submit',
				'disabled': 'disabled'
			},"Compile").on('click', cb.onCompileButtonClick);

			// make the rest of the footer:
			const footer = HTMLElement.new('footer', undefined, [
			
				HTMLElement.new('details', {
					'open': 'open'
				}, [
					HTMLElement.new('summary', undefined, "Options"),
					HTMLElement.new('fieldset', undefined, [ // Options fieldset
				
						HTMLElement.new('legend', { // legend (SR-only)
							'class': 'sr-only'
						}, "Download options"),
						
						HTMLElement.new('p', undefined, [ // Minify option
							HTMLElement.new('label', {
								'for': 'jmc__chk__minify'
							}, "Use minified code"),
							ref.options.minify = HTMLElement.new('input', {
								'type': 'checkbox',
								'id': 'jmc__chk__minify',
								'value': 'minify',
								'checked': 'checked',
								'disabled': 'disabled'
							}).on('change', cb.onMinifyOptionChange),
							HTMLElement.new('small', undefined,
								"Use the minified versions of the code (significantly reduces the file size!)")
						]),

						HTMLElement.new('p', undefined, [ // License option
							HTMLElement.new('label', {
								'for': 'jmc__chk__license'
							}, "Insert license"),
							ref.options.license = HTMLElement.new('input', {
								'type': 'checkbox',
								'id': 'jmc__chk__license',
								'value': 'license'
							}),
							HTMLElement.new('small', undefined,
								"Insert the MIT license text on top of the code (adds ca. 1 KiB to the file)")
						]),

						HTMLElement.new('p', undefined, [ // Annotate option
							HTMLElement.new('label', {
								'for': 'jmc__chk__annotate'
							}, "Annotate"),
							ref.options.annotate = HTMLElement.new('input', {
								'type': 'checkbox',
								'id': 'jmc__chk__annotate',
								'value': 'annotate'
							}),
							HTMLElement.new('small', undefined,
								"Add small code annotations to each include. Helpful for debugging the minified version.")
						])
					])
				]),

				HTMLElement.new('p', {
					'class': 'jmc_footer-buttons'
				}, ref.compileBtn),
			]);

			return footer;
		},
	
		// build all the header elements for the souce code tab:
		makeCodeHeader: function() {
	
			// shortcuts to make the code more readable:
			const me = $p.dyn.jMini.gui;
			const cb = me._callback;
			const ref = me._ref;
			
			const header = HTMLElement.new('header', undefined,
			[
				HTMLElement.new('button', {
					'type': 'reset'
				}, HTMLElement.new('span', undefined, "Back"))
				.on('click', cb.onBackButtonClick),

				HTMLElement.new('button', {
					'type': 'submit'
				}, HTMLElement.new('span', undefined, "Copy"))
				.on('click', cb.onCopyButtonClick)

			]);

			return header;
		}, 
		
		// build the target code field:
		makeCodeField: function() {
		
			// shortcuts to make the code more readable:
			const me = $p.dyn.jMini.gui;

			return HTMLElement.new('div', undefined, [
				me._ref.sourceField = HTMLElement.new('textarea', {
					'id': 'jmc__source'
				}),
				HTMLElement.new('label', {
					'for': 'jmc__source',
					'class': 'sr-only'
				}, "jMini Source Code")
			]);
		
		},
		
		// make the topics list:
		makeTopicsList: function(topics) {
			//console.log('makeTopicsList()', topics);
	
			// shortcuts to make the code more readable:
			const me = $p.dyn.jMini.gui;
			const cb = me._callback;
			const ref = me._ref;

			// add all the topics:
			topics.forEach( topic => {
				
				// first the checkbox:
				topic._cb = HTMLElement.new('input', {
					'type': 'checkbox',
					'data-tid': topic.id,
					'id': 'jmc__topiccb_' + topic.id
				}).on('click', cb.onTopicCheckBoxClick);
				
				// now the size field:
				topic._sf = HTMLElement.new('span', {
					'class': 'tsize'
				}, "—")
				
				// put it all together:
				topic._e = ref.topicList.appendNew('details', {
						//'open': 'open'
					},
					HTMLElement.new('summary', undefined, [
						topic._cb,
						HTMLElement.new('label', {
							'for': 'jmc__topiccb_' + topic.id
						}, topic.title),
						HTMLElement.new('span', {
							'class': 'tdesc'
						}, topic.desc),
						topic._sf
					])
				);
			});
		}
	},
	
	// Update existing elements:
	updater: {
		
		// update topics to include all the items:
		updateTopicItems: function(topic, items) {
			//console.log('updateTopicItems()', topic, topic._items);

			// shortcuts to make the code more readable:
			const me = $p.dyn.jMini.gui;

			// map items array to HTML list items:
			const list = items.map( it => {
				
				// first create the checkbox:
				it._cb = HTMLElement.new('input', {
					'type': 'checkbox',
					'data-mid': it.id,
					'id': 'jmc__funcb_' + it.id
				}).on('click', me._callback.onItemCheckBoxClick);
			
				// now the size field:
				it._sf = HTMLElement.new('span', {
					'class': 'msize'
				}, "—")
							
				// put it all together:
				return it._li = HTMLElement.new('li', undefined, [
					it._cb,
					HTMLElement.new('label', {
						'for': 'jmc__funcb_' + it.id
					}, it.name),
					HTMLElement.new('span', {
						'class': 'mdesc'
					}, it.desc),
					it._sf
				]);
			});
			
			// add list to new UL item:
			topic._e.appendNew('ul', undefined, list);
		},
		
		// update an item's file size:
		updateFileSize: function(item, minified) {
			// console.log('updateFileSize()', item, minified);
			
			try {
				const size = ( minified ? item._srcmin.length : item._src );
				item._sf.textContent = size.toBytesString();
			}
			catch(err) {
				console.error(e.toString());
			}
		},

		// update the topic size:
		updateTopicSize: function(topic, size) {
			//console.log('updateTopicSize()', topic, minified);
			
			topic._sf.textContent = size.toBytesString(2, 'en', {0: '—'});
		},

		// sets an item to an error state:
		setItemError: function(item) {
			// console.log('setItemError()', item);

			item._li.classList.add('error');
			item._cb.disabled = true;
			item._cb.checked = false;

		}

	},
	
	/* Callback functions for UI elements */
	_callback: {
		
		onGlobalCheckboxChange: function(e) {
			//console.log('onGlobalCheckboxChange', e);
			
			// shortcuts to make the code more readable:
			const model = $p.dyn.jMini.model;
			
			// get the new state:
			const state = e.target.checked;
			
			// check/uncheck all in model:
			model.checkAll(state);

		},
		onCompileButtonClick: function(e) {
			console.log('onCompileButtonClick', e);
		},
		onBackButtonClick: function(e) {
			console.log('onBackButtonClick', e);
		},
		onCopyButtonClick: function(e) {
			// console.log('onCopyButtonClick', e);

			// select and copy text:
			$p.dyn.jMini.gui._ref.sourceField.select();
			document.execCommand('copy');

			// console.log("Code is now in clipboard!");
		},
		onTopicCheckBoxClick: function(e) {
			//console.log('onTopicCheckBoxChange', e);

			// shortcuts to make the code more readable:
			const model = $p.dyn.jMini.model;

			// get the id and state:
			const id = e.target.getAttribute('data-tid');
			const state = e.target.checked;
			
			// select all sub-items:
			model.checkTopic( id, state );
			
			// update all sizes:
			model.calculateTopicSizes();
	
		},
		onItemCheckBoxClick: function(e) {
			// console.log('onItemCheckBoxClick', e);

			// shortcuts to make the code more readable:
			const model = $p.dyn.jMini.model;

			// get the id and state:
			const id = e.target.getAttribute('data-mid');
			const state = e.target.checked;
			
			// select all sub-items:
			model.checkItem( id, state );
			
			// update all sizes:
			model.calculateTopicSizes();
		},
		onMinifyOptionChange: function(e) {
			// console.log('onMinifyOptionChange', e);
			
			// shortcuts to make the code more readable:
			const model = $p.dyn.jMini.model;
			
			model.calculateTopicSizes();
		},
		onReloadButtonClicked: function(e) {
			// console.log('onReloadButtonClicked', e);
			window.location.reload();
		}
	}

}
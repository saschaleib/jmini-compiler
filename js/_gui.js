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

$app.gui = {
	
	// prepare the UI pre-initialisation:
	init: function(root) {
		//console.log('$app.gui.init(',root,')');

		// shortcut to make the code more readable:
		const builder = $app.gui.builder;
		
		// create the selection tab:
		$app.gui._ref.tabs[0] = root.appendNew('div', { 'id': 'jmc__tab1'},
		[
			builder.makeSelHeader(),
			builder.makeErrorMessages(),
			builder.makeTopicsElement(),
			builder.makeSelFooter()
		]);

		// create the target tab tab:
		$app.gui._ref.tabs[1] = root.appendNew('div', {
			'id': 'jmc__tab2',
			'hidden': 'hidden'
		}, [
			builder.makeCodeHeader(),
			builder.makeCodeField()
		]);
	},
	
	// general UI interaction
	interaction: {
	
		// start interaction:
		start: function() {
			
			// enable UI items:
			$app.gui._ref.compileBtn.disabled = false;
			$app.gui._ref.options.minify.disabled = false;

			// end the busy animation:
			$app.gui.interaction.endBusy();
			
		},
		
		// start the busy state:
		startBusy: function() {

			$app.gui._ref.total.classList.add('loading');
			$app.gui._ref.total.textContent = "loading";

		},
		
		// end the busy state; optionally set a file size text
		endBusy: function() {

			$app.gui._ref.total.classList.remove('loading');
			$app.gui._ref.total.textContent = '';
		}

	},
	
	// change the tab interface:
	showTab: function(num) {
		//console.log('$app.gui.showTab(',num,')');
		
		$app.gui._ref.tabs.forEach( (tab, i) => {
			tab.hidden = (i !== num);
		});
	},
	
	// functions for showing errors
	error: {
		show: function(type) {
			//console.log('$app.gui.error.show(',type,')');

			switch (type) {
				case 'network':
					$app.gui._ref.error.network.hidden = false;
					break;
				case 'incomplete':
					$app.gui._ref.error.incomplete.hidden = false;
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
			const minifyCB = $app.gui._ref.options.minify;
			
			if (minifyCB) {
				minifyCB.disabled = lock;
			}
		},
		
		// returns the current status of the Minify button:
		getMinifiedStatus: function() {
			// shortcuts to make the code more readable:
			const minifyCB = $app.gui._ref.options.minify;
			
			if (minifyCB) {
				return minifyCB.checked;
			}
			return true; // in case not available: use minified!
		},
		
		// return a settings object representing the user options settings:
		getUserOptions: function() {
			
			// shortcuts to make the code more readable:
			const ref = $app.gui._ref;
			
			const r = {
				minify: ref.options.minify.checked,
				license: ref.options.license.checked,
				annotate: ref.options.annotate.checked
			}
			
			return r;
		}
	},
	
	/* references to specific elements for easy access: */
	_ref: {
		total: null,
		totalCb: null,
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
		
			// create the total/busy element:
			$app.gui._ref.total = HTMLElement.new('span', {
					'class': 'loading'
				}, "loading");
			
			const header = HTMLElement.new('header', undefined,
			[
				$app.gui._ref.totalCb = HTMLElement.new('input', {
					'type': 'checkbox',
					'id': 'jmc__globalcb',
					'title': "select/unselect all"
				}).on('change', $app.gui._cb.onGlobalCheckboxChange),
				
				HTMLElement.new('label', {
					'for': 'jmc__globalcb'
				}, "jMini Toolbox"),
				
				$app.gui._ref.total
			]);
			
			return header;
		},
		
		// build a section of error messages to be shown as needed:
		makeErrorMessages: function() {

			return HTMLElement.new('div', {
				'class': 'errors'
			}, [
			
				$app.gui._ref.error.network = HTMLElement.new('p', { // Network error
					'class': 'error',
					'hidden': 'hidden'
				}, [
					HTMLElement.new('span', undefined, "The index files could not be loaded. Either they don’t exist, or a network error occured. Please see the browser console for more information."),
					HTMLElement.new('button', undefined, "Reload").on('click', $app.gui._cb.onReloadButtonClicked)
				]),

				$app.gui._ref.error.incomplete = HTMLElement.new('p', { // Incomplete data
					'class': 'warning',
					'hidden': 'hidden'
				}, [
					HTMLElement.new('span', undefined, "The code repository was found, but the source data could not be completely loaded. This may be due to network problems, or because there is incorrect data in the repository. Some modules may not be available."),
					HTMLElement.new('button', undefined, "Reload").on('click', $app.gui._cb.onReloadButtonClicked)
				])

			]);
		},
		
		// prepare the high-level list (content will be added later):
		makeTopicsElement: function(topics) {

			return $app.gui._ref.topicList = HTMLElement.new('div', {
				'class': 'content'
			});
		},
		
		// build all the footer elements for the selection tab:
		makeSelFooter: function() {

			// make the rest of the footer:
			const footer = HTMLElement.new('footer', undefined, [
			
				HTMLElement.new('details', {
					// 'open': 'open'
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
							$app.gui._ref.options.minify = HTMLElement.new('input', {
								'type': 'checkbox',
								'id': 'jmc__chk__minify',
								'value': 'minify',
								'checked': 'checked',
								'disabled': 'disabled'
							}).on('change', $app.gui._cb.onMinifyOptionChange),
							HTMLElement.new('small', undefined,
								"Use the minified versions of the code (significantly reduces the file size!)")
						]),

						HTMLElement.new('p', undefined, [ // License option
							HTMLElement.new('label', {
								'for': 'jmc__chk__license'
							}, "Insert license"),
							$app.gui._ref.options.license = HTMLElement.new('input', {
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
							$app.gui._ref.options.annotate = HTMLElement.new('input', {
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
				}, $app.gui._ref.compileBtn = HTMLElement.new('button', {
						'type': 'submit',
						'disabled': 'disabled'
					},"Compile").on('click', $app.gui._cb.onCompileButtonClick)
				),
			]);

			return footer;
		},
	
		// build all the header elements for the souce code tab:
		makeCodeHeader: function() {

			const header = HTMLElement.new('header', undefined,
			[
				HTMLElement.new('button', {
					'type': 'reset'
				}, HTMLElement.new('span', undefined, "Back"))
				.on('click', $app.gui._cb.onBackButtonClick),

				HTMLElement.new('button', {
					'type': 'submit'
				}, HTMLElement.new('span', undefined, "Copy"))
				.on('click', $app.gui._cb.onCopyButtonClick)

			]);

			return header;
		}, 
		
		// build the target code field:
		makeCodeField: function() {

			return HTMLElement.new('div', undefined, [
				$app.gui._ref.sourceField = HTMLElement.new('textarea', {
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
	
			// add all the topics:
			topics.forEach( topic => {
				
				// first the checkbox:
				topic._cb = HTMLElement.new('input', {
					'type': 'checkbox',
					'data-tid': topic.id,
					'id': 'jmc__topiccb_' + topic.id
				}).on('click', $app.gui._cb.onTopicCheckBoxClick);
				
				// now the size field:
				topic._sf = HTMLElement.new('span', {
					'class': 'tsize'
				}, "—")
				
				// put it all together:
				topic._e = $app.gui._ref.topicList.appendNew('details', {
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

			// map items array to HTML list items:
			const list = items.map( it => {
				
				// first create the checkbox:
				it._cb = HTMLElement.new('input', {
					'type': 'checkbox',
					'data-mid': it.id,
					'id': 'jmc__funcb_' + it.id
				}).on('click', $app.gui._cb.onItemCheckBoxClick);
			
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

		// update the topic size:
		updateTopicState: function(topic, size, state) {
			//console.log('updateTopicState()', topic.id, size, state);
			
			topic._sf.textContent = size.toBytesString(2, 'en', {0: '—'});
			
			// checked state for both, all checked, or mixed:
			topic._cb.checked = ( state > 0 );
			
			// indeterminate state for mixed only:
			topic._cb.indeterminate = ( state < 0 );
		},

		// update the total state:
		updateTotalState: function(size, state) {
			//console.log('updateTotalState()', size, state);
			
			// update the total size:
			$app.gui._ref.total.textContent = size.toBytesString(1, 'en', {0: '—'});
			
			// checked state for both, all checked, or mixed:
			$app.gui._ref.totalCb.checked = ( state > 0 );
			
			// indeterminate state for mixed only:
			$app.gui._ref.totalCb.indeterminate = ( state < 0 );
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
	_cb: {
		
		onGlobalCheckboxChange: function(e) {
			//console.log('onGlobalCheckboxChange', e);
			
			// check/uncheck all in model:
			$app.model.checkAll(e.target.checked);

		},
		onCompileButtonClick: function(e) {
			// console.log('onCompileButtonClick', e);
			
			// compile the source code and put it into the 
			const code = $app.model.compile();
			if (code) {
				$app.gui._ref.sourceField.value = code;
				$app.gui.showTab(1); // go to next tab
			} else {
				// TODO: show error!
			}
		},
		onBackButtonClick: function(e) {
			//console.log('onBackButtonClick', e);
			
			$app.gui.showTab(0);
		},
		onCopyButtonClick: function(e) {
			// console.log('onCopyButtonClick', e);

			// select and copy text:
			$app.gui._ref.sourceField.select();
			document.execCommand('copy');

			// console.log("Code is now in clipboard!");
		},
		onTopicCheckBoxClick: function(e) {
			//console.log('onTopicCheckBoxChange', e);

			// get the id and state:
			const id = e.target.getAttribute('data-tid');
			const state = e.target.checked;
			
			// select all sub-items:
			$app.model.checkTopic( id, state );
			
			// update all sizes:
			$app.model.recalculateAllSizes();
	
		},
		onItemCheckBoxClick: function(e) {
			// console.log('onItemCheckBoxClick', e);

			// get the id and state:
			const id = e.target.getAttribute('data-mid');
			const state = e.target.checked;
			
			// select all sub-items:
			$app.model.checkItem( id, state );
			
			// update all sizes:
			$app.model.recalculateAllSizes();
		},
		onMinifyOptionChange: function(e) {
			// console.log('onMinifyOptionChange', e);
		
			$app.model.recalculateAllSizes();
		},
		onReloadButtonClicked: function(e) {
			// console.log('onReloadButtonClicked', e);
			window.location.reload();
		}
	}

}
'use strict'; // Encoding: UTF-8
/**
 * GUI module for the jMini Compiler Tool
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
 
$p.dyn.jMini.gui = {

	_init: function() {
		console.log('$p.dyn.jMini.gui._init()');
	},
	
	init: function() {
		console.log('$p.dyn.jMini.gui.init()');
	},
	
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
	
	/* references to specific elements for easy access: */
	_ref: {
		total: null,
		fields: null,
		compileBtn: null,
		topicList: null,
		tabs: [null, null]
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
		
		// prepare the high-level list (content will be added later):
		makeTopicsElement: function(topics) {

			// shortcut to make the code more readable:
			const me = $p.dyn.jMini.gui;
			
			me._ref.topicList = HTMLElement.new('div');

			return me._ref.topicList
		},
		
		// build all the footer elements for the selection tab:
		makeSelFooter: function() {
			
			// shortcuts to make the code more readable:
			const me = $p.dyn.jMini.gui;
			const cb = me._callback;
			const ref = me._ref;

			// create the fieldset first:
			ref.fields = HTMLElement.new('fieldset', undefined, [ // Options fieldset
				
				HTMLElement.new('legend', { // legend (SR-only)
					'class': 'sr-only'
				}, "Download options"),
				
				HTMLElement.new('p', undefined, [ // Minify option
					HTMLElement.new('label', {
						'for': 'jmc__chk__minify'
					}, "Use minified code"),
					HTMLElement.new('input', {
						'type': 'checkbox',
						'id': 'jmc__chk__minify',
						'value': 'minify',
						'checked': ''
					}),
					HTMLElement.new('small', undefined,
						"Use the minified versions of the code (significantly reduces the file size!)")
				]),

				HTMLElement.new('p', undefined, [ // License option
					HTMLElement.new('label', {
						'for': 'jmc__chk__license'
					}, "Insert license"),
					HTMLElement.new('input', {
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
					HTMLElement.new('input', {
						'type': 'checkbox',
						'id': 'jmc__chk__annotate',
						'value': 'annotate'
					}),
					HTMLElement.new('small', undefined,
						"Add small code annotations to each include. Helpful for debugging the minified version.")
				])
			]);
			
			// create the compile button:
			cb.compileBtn = HTMLElement.new('button', {
				'type': 'submit',
				'disabled': 'disabled'
			},"Compile").on('click', cb.onCompileButtonClick);

			// make the rest of the footer:
			const footer = HTMLElement.new('footer', undefined, [
			
				HTMLElement.new('details', undefined, [
					HTMLElement.new('summary', undefined, "Options"),
					ref.fields
				]),

				HTMLElement.new('p', {
					'class': 'jmc_footer-buttons'
				}, cb.compileBtn),
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
			
			return HTMLElement.new('div', undefined,
				HTMLElement.new('textarea'));
		
		},
		
		// make the topics list:
		makeTopicsList: function(topics) {
	
			// shortcuts to make the code more readable:
			const ref = $p.dyn.jMini.gui._ref;

			// add all the topics:
			topics.forEach( topic => {
				
				// first the checkbox:
				topic._cb = HTMLElement.new('input', {
					'type': 'checkbox',
					'data-tid': topic.id,
					'id': 'jmc__topiccb_' + topic.id
				});
				
				// now the size field:
				topic._sf = HTMLElement.new('span', {
					'class': 'tsize'
				}, "—")
				
				// put it all together:
				topic._e = ref.topicList.appendNew('details', {
						'open': 'open'
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
		},
		
		//add items to the topics lists:
		appendItemsToTopic: function(topic, items) {

			// map items array to HTML list items:
			const list = items.map( it => {
				
				// first the checkbox:
				it._cb = HTMLElement.new('input', {
					'type': 'checkbox',
					'data-mid': it.id,
					'id': 'jmc__funcb_' + it.id
				});
			
				// now the size field:
				it._sf = HTMLElement.new('span', {
					'class': 'msize'
				}, "—")
							
				// put it all together:
				return HTMLElement.new('li', undefined, [
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
			
			const ul = topic._e.appendNew('ul', undefined, list);

		}
	
	},
	
	_callback: {
		
		onGlobalCheckboxChange: function(e) {
			console.log('onGlobalCheckboxChange', e);
		},
		onCompileButtonClick: function(e) {
			console.log('onCompileButtonClick', e);
		},
		onBackButtonClick: function(e) {
			console.log('onBackButtonClick', e);
		},
		onCopyButtonClick: function(e) {
			console.log('onCopyButtonClick', e);
		}
	},
	
	/* handles the general interface error (needs to be provided in the HTML code!) */
	globalError: {
		
		/* sets the element to be used as an error message */
		setElement: function(id) {
			$p.dyn.jMini.gui.globalError._errElement = document.getElementById(id);
		},
		
		_errElement: null,
	
		/* show the error message */
		show: function(msg) {
			
			const e = $p.dyn.jMini.gui.globalError._errElement;
			if (e) e.showModal();
			console.error(msg);
		}
	}
}
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
		console.log('$p.dyn.jMini.gui.prepare(',root,')');
		
		// shortcut to make the code more readable:
		const builder = $p.dyn.jMini.gui.builder;

		root.appendChild(builder.makeHeader());
		root.appendChild(builder.makeTopicsElement());
		root.appendChild(builder.makeFooter());
	},
	
	/* references to specific elements for easy access: */
	_ref: {
		total: null,
		fields: null,
		compileBtn: null,
		topicList: null
	},
	
	
	builder: {
	
		// build all the header elements:
		makeHeader: function() {
			
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
		
		// build all the footer elements:
		makeFooter: function() {
			
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
					HTMLElement.new('input', {
						'type': 'checkbox',
						'id': 'jmc__chk__minify',
						'value': 'minify',
						'checked': ''
					}),
					HTMLElement.new('label', {
						'for': 'jmc__chk__minify'
					}, "Use minified code"),
					HTMLElement.new('br'),
					HTMLElement.new('small', undefined,
						"Use the minified versions of the code (significantly reduces the file size!)")
				]),

				HTMLElement.new('p', undefined, [ // License option
					HTMLElement.new('input', {
						'type': 'checkbox',
						'id': 'jmc__chk__license',
						'value': 'license',
						'checked': ''
					}),
					HTMLElement.new('label', {
						'for': 'jmc__chk__license'
					}, "Insert license"),
					HTMLElement.new('br'),
					HTMLElement.new('small', undefined,
						"Insert the MIT license text on top of the code (adds ca. 1 KiB to the file)")
				]),

				HTMLElement.new('p', undefined, [ // Annotate option
					HTMLElement.new('input', {
						'type': 'checkbox',
						'id': 'jmc__chk__annotate',
						'value': 'annotate',
						'checked': ''
					}),
					HTMLElement.new('label', {
						'for': 'jmc__chk__annotate'
					}, "Annotate"),
					HTMLElement.new('br'),
					HTMLElement.new('small', undefined,
						"Add small code annotations to each include. Helpful for debugging the minified version.")
				])
			]);
			
			// create the compile button:
			cb.compileBtn = HTMLElement.new('button', {
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
		}
	
	},
	
	_callback: {
		
		onGlobalCheckboxChange: function(e) {
			console.log('onGlobalCheckboxChange', e);
		},
		onCompileButtonClick: function(e) {
			console.log('onCompileButtonClick', e);
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
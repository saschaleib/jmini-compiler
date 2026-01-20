 			/* everything related to the data model */
			$p.data = {
			
				_baseURL: 'https://jmini.nuropa.eu/dev/',
				_docsURL: 'https://jmini.nuropa.eu/wiki/',
						
				_init: function() {
					//console.info('$p.data._init()');
										
					$p.data.loadIndex();
					
				},
				
				loadIndex: function() {
					//console.info('$p.data.loadIndex()');

					let main = document.getElementById('jmini-compiler');

					JSON.load($p.data._baseURL + 'index.json')
					.then( result => {

						result.topics.forEach( it => {
						
							// add a new details section
							it._det = main.appendNew('details', {
								'class': 'topic',
								'data-id': it.topic,
								'open': ''
							}, HTMLElement.new('summary', {
								'title': it.desc
							}, it.title));

							// load the sub-items:
							$p.data.loadTopic(it);
						
						});
					})
					.catch( error => {
						console.error(error.toString());
					})
				},
				loadTopic: function(topic) {
					//console.info('$p.data.loadTopic(',topic,')');

					JSON.load($p.data._baseURL + topic.path + 'index.json')
					.then( result => {
						
						// create a list to add the items to:
						const ul = topic._det.appendNew('ul');
						
						// add all the items:
						result.forEach( mod => {
							const li = ul.appendNew('li', {
								'class': 'moduls',
								'data-id': mod.id,
								'open': ''
							});
							
							const path = $p.data._baseURL + topic.path + mod.file;
							
							li.appendNew('strong').setHtml(mod.namehtml || mod.name); // title
						});
					})
					.catch( error => {
						console.error(error.toString());
					})



				}
			}

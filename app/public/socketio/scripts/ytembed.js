Function.prototype.bind = function(obj,args) {
	var method = this, temp = function() {
		return method.call(obj, args);
	};
	return temp;
};

var ytEmbed = {
	ytQuery : 0,
	cl : 0,
	callback : {},
	cfg : {},
	player : false,
	/**
	 * Main Init Method
	 */
	init : function(cfg) {
		this.cfg = cfg || {};
		if(!this.cfg.block){
			this.message('Please set the block element in the config file.');
		}else{
			if(!this.cfg.type){
				this.message('You must provide a type: search, user, playlist, featured in the insertVideos function.');
			}else if(!this.cfg.q){
				this.message('You must provide a query: search keywords, playlist ID, or username.');
			}else{
				//this.message('Loading YouTube videos. Please wait...');
				//create a javascript element that returns our JSONp data.
				var script = document.createElement('script');
				script.setAttribute('id', 'jsonScript');
				script.setAttribute('type', 'text/javascript');

				//a counter
				this.ytQuery++;
				//settings
				if(!this.cfg.paging){
					this.cfg.paging = true;
				}
				if(!this.cfg.results){
					this.cfg.results = 10;
				}
				if(!this.cfg.start){
					this.cfg.start = 1;
				}
				if(!this.cfg.order){
					this.cfg.orderby = 'relevance';
					this.cfg.sortorder = 'descending';
				}
				if(!this.cfg.thumbnail){
					this.cfg.thumbnail = 200;
				}
				if(!this.cfg.height){
					this.cfg.height = 390;
				}
				if(!this.cfg.width){
					this.cfg.width = 640;
				}
				switch(this.cfg.order){
					case "new_first":
						this.cfg.orderby = 'published';
					this.cfg.sortorder = 'ascending';
					break;

					case "highest_rating":
						this.cfg.orderby = 'rating';
					this.cfg.sortorder = 'descending';
					break;

					case "most_relevance":
						this.cfg.orderby = 'relevance';
					this.cfg.sortorder = 'descending';
					break;
				}

				//what data do we need: a search, a user search, a playlist
				switch(this.cfg.type){
					case "search":
						script.setAttribute('src', 'http://gdata.youtube.com/feeds/api/videos?q='+this.cfg.q+'&v=2&format=5&start-index='+this.cfg.start+'&max-results='+this.cfg.results+'&alt=jsonc&callback=ytEmbed.callback['+this.ytQuery+']&orderby='+this.cfg.orderby+'&sortorder='+this.cfg.sortorder);
					break;

					case "user":
						script.setAttribute('src', 'http://gdata.youtube.com/feeds/api/users/'+this.cfg.q+'/uploads?max-results='+this.cfg.results+'&start-index='+this.cfg.start+'&alt=jsonc&v=2&format=5&callback=ytEmbed.callback['+this.ytQuery+']&orderby='+this.cfg.orderby+'&sortorder='+this.cfg.sortorder);
					break;

					case "playlist":
						///snippets?q=
						script.setAttribute('src', 'http://gdata.youtube.com/feeds/api/playlists/'+this.cfg.q+'?max-results='+this.cfg.results+'&start-index='+this.cfg.start+'&alt=jsonc&v=2&format=5&callback=ytEmbed.callback['+this.ytQuery+']&sortorder='+this.cfg.sortorder);
					break;

					case "featured":
						script.setAttribute('src', 'http://gdata.youtube.com/feeds/api/standardfeeds/recently_featured?alt=jsonc&callback=ytEmbed.callback['+this.ytQuery+']&max-results='+cfg.results+'&start-index='+this.cfg.start+'&v=2&format=5&orderby='+this.cfg.orderby+'&sortorder='+this.cfg.sortorder);
					break;

					case "filter":
						script.setAttribute('src', 'http://gdata.youtube.com/feeds/api/videos/?'+this.cfg.q+'&callback=ytEmbed.callback['+this.ytQuery+']&max-results='+cfg.results+'&start-index='+this.cfg.start+'&alt=jsonc&v=2&format=5&orderby='+this.cfg.orderby+'&sortorder='+this.cfg.sortorder);
					break;

				}
				cfg.mC = this.ytQuery;
				this.callback[this.ytQuery] = function(json){ ytEmbed.listVideos(json,cfg); };

				//attach script to page, this will load the data into our page and call the funtion ytInit[ytQuery]
				document.getElementsByTagName('head')[0].appendChild(script);
			}
		}

	},


	/**
	 * Build videos (static)
	 */
	listVideos : function(json,cfg){
		var playlist;
		this.cfg = cfg;
		if(!this.cfg.player){
			this.cfg.player = 'embed';
		}
		if(!this.cfg.layout){
			this.cfg.layout = 'full';
		}
		if(json.error){
			this.message('An error occured:<br>'+json.error.message);
		}else if(json.data && json.data.items){
			for (i = 0; i < json.data.items.length; i++) {
				var entry = json.data.items[i];

				//playlist need this
				if(entry.video){
					//add playlist title data.title
					//add tags on the bottom
					entry = entry.video;
				}

				if(entry.id){
					playlist += entry.id+",";
				}

				if(this.cfg	.player == 'embed' && (!entry.accessControl || entry.accessControl.embed == "allowed")){
					a.addEventListener('click', this.playVideo.bind(this, {'id': entry.id, 'cfg': cfg, 'title':entry.title, 'src':(entry.thumbnail ? entry.thumbnail.hqDefault : '')} ),false);
				}

				var img = document.createElement('img');
				img.className = 'img-polaroid pull-left video-thumbnail';
				img.setAttribute('src',(entry.thumbnail ? entry.thumbnail.hqDefault : ''));

				var title = entry.title;
				var title_limit = 28;
				if(title && title.length > title_limit){
					title = title.substr(0, (title_limit-2))+'..';
				}
				var uploader = entry.uploader;
				if(uploader && uploader.length > 12){
					uploader = uploader.substr(0,10)+'..';
				}
				var viewCount = entry.viewCount;
				if(viewCount && viewCount.length > 15){
					viewCount = viewCount.substr(0,13)+'..';
				}
			}
			//playlist
			if(this.cfg.playlist === true){
				this.cfg.playerVars.playlist = playlist.substr(0,playlist.length - 1);
			}

			if(this.cfg.player == "embed" && this.cfg.display_first === true){
				//set settings
				if(json.data.items && json.data.items[0].video){
					ytPlayerParams.videoId = json.data.items[0].video.id;
				}else if(json.data.items){
					ytPlayerParams.videoId = json.data.items[0].id;
				}
				//other settings
				if(this.cfg.playerVars){
					ytPlayerParams.playerVars = this.cfg.playerVars;
				}

			}
			if(this.cfg.paging === true){
				var li, a;
				this.cfg.display_first = false;
				var pul = document.createElement('ul');
				pul.className = 'inline';
				pul.setAttribute('id', 'ytPage');
				if(json.data.totalItems > (json.data.startIndex + json.data.itemsPerPage)){
					li = document.createElement('li');
					li.className ='pull-right';

					a = document.createElement('a');
					//a.className = 'ytNext btn btn-inverse btn-small';
					a.className = 'ytNext search-control';
					a.style.cursor = 'pointer';

					li.appendChild(a);
					if(a.addEventListener){
						a.addEventListener('click', ytEmbed.loadNext.bind(this, {cfg: cfg} ),false);
					}else if(a.attachEvent){
						a.attachEvent('onclick', ytEmbed.loadNext.bind(this, {cfg: cfg}));
					}
					a.innerHTML = '>';
					li.appendChild(a);//do through bind
					pul.appendChild(li);
				}

				if(json.data.startIndex > 1){
					li = document.createElement('li');
					a = document.createElement('a');
					//a.className = 'ytPrev pull-left btn btn-inverse btn-small';
					a.className = 'ytPrev search-control';
					a.style.cursor = 'pointer';

					if(a.addEventListener){
						a.addEventListener('click', ytEmbed.loadPrevious.bind(this, {cfg: cfg} ),false);
					}else if(a.attachEvent){
						a.attachEvent('onclick', ytEmbed.loadPrevious.bind(this, {cfg: cfg}));
					}
					a.innerHTML = '<';
					li.appendChild(a);
					pul.insertBefore(li, pul.firstChild);
				}
				//alert(json.data.startIndex +"asds"+ json.data.totalItems +"asds"+ json.data.itemsPerPage);

				div.appendChild(pul);
			}
		}else{
			this.message('No YouTube videos found for your query:<br>Type:\''+this.cfg.type+'\'<br>Query: \''+this.cfg.q+'\'');
		}
	},
	/**
	 * Load next (page)
	 */
	loadNext : function(data){
		data.cfg.start = parseInt(data.cfg.start) + parseInt(data.cfg.results);
		ytEmbed.init(data.cfg);
	},
	/**
	 * Load previous (page)
	 */
	loadPrevious : function(data){
		data.cfg.start = parseInt(data.cfg.start) - parseInt(data.cfg.results);
		if(data.cfg.start < 1) data.cfg.start = 1;
		ytEmbed.init(data.cfg);
	},
	/**
	 * Play video (static)
	 */
	playVideo : function(data){
		var player1;
		if(data.cfg.parent){
			player1 = document.getElementById(data.cfg.parent+"Player");
		}else{
			player1 = document.getElementById(data.cfg.block+"Player");
		}
		userclick = true;
		setVideo(data.id, data.src, data.title);
	},
	/**
	 * Messages log
	 */
	message : function(msg) {
		if(!ytEmbed.cfg.block){
			//attach message to body?
		}else{
			document.getElementById(ytEmbed.cfg.block).innerHTML = '<div class="error">'+msg+'</div>';
		}
	}
};

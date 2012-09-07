/**
 * @fileOverview Этот сценарий определяет работу слайдшоу, дополняет представление 
 * 				страницы декоративными элементами, а также предоставляет возможность 
 * 				переключения отображения страницы в разных цветовых решениях.
 * @author <a href="http://elkonina.ru/">Yelena Konina</a>.
 */
(function(){
	/**
	 * Объект имеет метод загрузки сценария из внешнего источника и свойство,
	 * где сохранен адрес библиотеки jQuery последней версии на хосте
	 * googleapis.com
	 * 
	 * @type {!Object}
	 */
var	loadingScriptOut = {
		/**
		 * @author <a href="http://stevesouders.com/efws/script-onload.php">Стив Соудерс</a>
		 * @param {String}
		 *            src - адрес скрипта, который должен быть загружен
		 * @param {function}
		 *            callback - функция будет вызвана после успешной загрузки
		 *            внешнего скрипта
		 * @param {Element}
		 *            appendTo - html-элемент, куда будет загружен внешний
		 *            скрипт, default: head.
		 */
		init : function(src, callback, appendTo) {
			/**
			 * сценарий, загружаемый на страницу из внешнего источника
			 * 
			 * @type {Element}
			 */
			var script = document.createElement("script");
			// all modern browser
			if (script.readyState && !script.onload) {
				script.onreadystatechange = function() {
					if ((script.readyState === 'loaded' || script.readyState === "complete")
						&& !script.onloadDone) {
						script.onloadDone = true;
						callback();
					}
				};
			} 
			// IE
			else {
				script.onload = function() {
					if (!script.onloadDone) {
						script.onloadDone = true;
						callback();
					}
				};
			}
			script.type = 'text/javascript';
			script.src = src;
			if (!appendTo) {
				appendTo = document.documentElement.children[0];
			}
			appendTo.appendChild(script);
		},
		jQ : "https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"
	},

	/**
	 * Функция-обертка для многократной установки обработчиков событий
	 * @param {Element} el - элемент, на котором запускается событие
	 * @param {String} type - тип события
	 * @param {Function} fn - функция - обработчик события
	 */
	addEvent = function (el, type, fn) {
		if ( typeof window.addEventListener === 'function'){
			el.addEventListener(type, fn, false)
		}
		else if (typeof document.attachEvent === "function"){
			el.attachEvent('on' + type, fn)
		}
	},
	/**
	 * Пространство имен для сайта "Clean Classy Webdesign - макет сайта".
	 * @namespace
	 * @module SKM
	 */
	SKM = (function () {
		/**
		 * Определяет работу слайдшоу для разных браузеров
		 * @type {Function}
		 * @function
		 * @return {Function} определяет поддержку transition 
		 * 					и в зависимости от этого вызывает 
		 * 					разные функции обработки элементов 
		 * 					слайдшоу.
		 */
	var	slideshow = (function () {
			/**
			 * Задает алгоритм работы слайдшоу в случае, если существует 
			 * наттивная поддержка плавной смены слайдов галереи
			 * @type {Function}
			 * @param {Event} event - событие 
			 * @param {Element} buttons - контейнер, содержащий дочерние кнопки управления слайдшоу
			 */
		var	moveNtv = function (event, buttons) {
					/**
					 * Локальная ссылка на объект события
					 * @type {Event}
					 */
				var e = event || window.event,
					/**
					 * Текущий элемент, обрабатывающий событие
					 * @type {Element}
					 */
					cnt = e.target || e.srcElement,
					/**
					 * Кнопка "влево"
					 * @type {Element}
					 */
					prev = buttons.children[0],
					/**
					 * Кнопка "вправо"
					 * @type {Element}
					 */
					next = prev.nextElementSibling, 
					/**
					 * Cписок слайдов
					 * @type {Element}
					 */
					gallery = document.querySelector('.gallery'),
					/**
					 * Ширина списка слайдов
					 * @type {Number}
					 */
					dist = parseInt(getComputedStyle(gallery, null).width),
					/**
					 * Общая ширина всех элементов списка слайдов.
					 * В css-правиле прописано white-space: nowrap;, 
					 * чтобы все слайды были выстроены в одну линию
					 * @type {Number}
					 */
					maxDist = (gallery.children.length - 1)*dist,
					/**
					 * Позиция начала списка слайдов относительно родительского контейнера,
					 * у которого выставлено css-правило overflow: hidden;
					 * @type {Number} 
					 */
					pos = parseInt(getComputedStyle(gallery, null).left);
				// если какой-либо из слайдов не достиг границы перемещения - игнорируем клик
				if (pos % dist != 0)
					return;
	
				if (cnt == prev) {
					gallery.style.left = ((pos + dist) > 0 ? - maxDist : (pos + dist))	+ "px";
				} else if (cnt == next) {
					gallery.style.left = (-pos < maxDist ? (pos - dist) : 0) + 'px';
				}
			},
			/**
			 * Определяет работу слайдшоу, если нет нативной поддержки 
			 * transition. Используется библиотека jQuery.
			 * @type {Function}
			 * @return {Function} устанавливает обработку событий 
			 * 					нажатия на кнопки управления. Функция 
			 * 					- обработчик определена в замыкании.
			 */
			moveJQ = function () {
				// Корректирует представление элемента слайдшоу на странице.				
				if (typeof jQuery === "function") {
					if (  $(document.documentElement).hasClass('ie7') 
						||$(document.documentElement).hasClass("ie8") ){
							$('.gallery_wrap-out').wrap("<div class='gallery_container' />")
					}				
				};
					/**
					 * контейнер, содержащий дочерние кнопки управления слайдшоу
					 * @type {Element}
					 */
				var btns = $('.btns'),
					/**
					 * Кнопка "влево"
					 * @type {Element}
					 */						
					prev = btns.children().first()[0],
					/**
					 * Кнопка "вправо"
					 * @type {Element}
					 */							
					next = btns.children().last()[0],
					/**
					 * Cписок слайдов
					 * @type {jQuery.<Element>}
					 */							
					gallery = $('.gallery'),
					/**
					 * Ширина списка слайдов
					 * @type {Number}
					 */
					dist =  gallery.width(),
					/**
					 * Общая ширина всех элементов списка слайдов.
					 * В css-правиле прописано white-space: nowrap;, 
					 * чтобы все слайды были выстроены в одну линию
					 * @type {Number}
					 */
					maxDist = (gallery.children().length - 1)*dist,
					/**
					 * Определяет активные элементы и задает алгоритм работы слайдшоу 
					 * @type {Function}
					 * @param {Event} event - событие по версии библиотеки jQuery
					 */
					run = function (event){
							/**
							 * Текущий элемент, обрабатывающий событие (по версии библиотеки jQuery)
							 * @type {Object}
							 */
						var cnt = event.target,
							/**
							 * Позиция начала списка слайдов относительно родительского контейнера,
							 * у которого выставлено css-правило overflow: hidden;
							 * @type {Number} 
							 */
							pos = gallery.position().left;	
						if( cnt == prev){
							$(gallery).animate({ 'left' : (pos + dist) > 0 ? - maxDist : (pos + dist) },"slow", 'linear');						
						} else	if( cnt == next){
							$(gallery).animate({ 'left' : -pos < maxDist ? (pos - dist) : 0 },"slow", 'linear');						
						}
					};
				$(btns).bind("click", function(event){ run(event); });
			};
			/**
			 * 
			 */
		return function () {
			var addEvt = addEvent,
				loadjQ = loadingScriptOut,
				/**
				 * контейнер, содержащий дочерние кнопки управления слайдшоу
				 * @type {Element}
				 */
				btns;
			//for agents supported Transition
			if ( (window.getComputedStyle &&
					(  getComputedStyle(document.body, null)['webkitTransitionProperty']
					|| getComputedStyle(document.body, null)["MozTransitionProperty"]
					|| getComputedStyle(document.body, null)['OTransitionProperty'])  )
				|| 		
				(document.body.currentStyle 
				&& document.body.currentStyle["msTransitionProperty"])) {
				
				// инициализируеv глобальную переменную
				btns = document.querySelectorAll('.btns')[0];	
				addEvt(btns, "click", function(e) {
											moveNtv(e, btns);
										});
			} else {					
			//for agents dont supported Transition
				loadjQ.init(loadjQ.jQ, function () {
					moveJQ();
				}, document.body);
			}
		};
	}()),
		/**
		 * Декорирует страницу узорами, выполненными на холсте
		 * @type {Function}
		 * @function
		 * @return {Function} определяет элементы, создает в них 
		 * 					дочерние холсты и вызывает функции 
		 * 					отрисовки в контексте холстов изображений.
		 */
		decorate = (function () {
			/**
			 * Отрисовывает в контексте элемента холста узор в центральной статье страницы
			 * @type {Function}
			 * @param {CanvasRenderingContext2D()} c - контекст холста
			 */
		var	drawMainDecor = function (c) {
			
			if (typeof c === 'object') {
				c.save();
				c.bp();
				c.moveTo(1.3, 42.1);
				c.b(-1.3, 58.6, 13.6, 61.1, 35.7, 56.3);
				c.b(56.7, 46.6, 72.4, 46.1, 88.6, 49.4);
				c.b(103.3, 53.1, 107.9, 55.6, 125.4, 62.6);
				c.b(149.4, 72.3, 157.7, 67.2, 164.4, 64.0);
				c.b(176.7, 58.0, 193.5, 34.6, 178.1, 13.6);
				c.b(169.7, 2.3, 154.1, -2.4, 141.7, 3.6);
				c.b(130.8, 8.9, 134.0, 18.1, 134.0, 18.1);
				c.lineWidth = 2.0;
				c.strokeStyle = 'rgb(101, 101, 101)';
				c.s();
			
				c.bp();
				c.moveTo(5.6, 55.4);
				c.b(31.9, 55.7, 18.7, 38.8, 75.0, 46.3);
				c.b(92.6, 49.3, 102.9, 52.7, 102.9, 40.9);
				c.b(102.9, 30.6, 93.9, 34.0, 93.9, 34.0);
				c.s();
			
				c.bp();
				c.moveTo(35.7, 56.3);
				c.b(98.7, 39.3, 103.0, 82.6, 153.5, 68.3);
				c.s();
			
				c.bp();
				c.moveTo(115.4, 68.3);
				c.b(115.4, 68.3, 125.7, 78.1, 112.9, 81.2);
				c.s();
			
				c.bp();
				c.moveTo(178.5, 50.4);
				c.b(179.3, 49.2, 196.3, 38.4, 196.5, 56.3);
				c.s();
			
				c.bp();
				c.moveTo(181.6, 44.7);
				c.b(181.6, 45.8, 188.2, 15.5, 170.5, 17.9);
				c.lineJoin = "miter";
				c.miterLimit = 4.0;
				c.s();
			
				c.bp();
				c.moveTo(95.6, 32.6);
				c.b(97.8, 32.6, 99.6, 34.4, 99.6, 36.7);
				c.b(99.6, 39.0, 97.8, 40.9, 95.6, 40.9);
				c.b(93.4, 40.9, 91.6, 39.0, 91.6, 36.7);
				c.b(91.6, 34.4, 93.4, 32.6, 95.6, 32.6);
				c.cp();
				c.fillStyle = 'rgb(101, 101, 101)';
				c.f();
				c.lineWidth = 1.0;
				c.s();
			
				c.bp();
				c.moveTo(112.5, 74.2);
				c.b(114.5, 74.2, 116.2, 75.9, 116.2, 78.0);
				c.b(116.2, 80.0, 114.5, 81.7, 112.5, 81.7);
				c.b(110.5, 81.7, 108.9, 80.0, 108.9, 78.0);
				c.b(108.9, 75.9, 110.5, 74.2, 112.5, 74.2);
				c.cp();
				c.f();
				c.s();
			
				c.bp();
				c.moveTo(174.4, 21.2);
				c.b(174.4, 23.4, 172.6, 25.1, 170.5, 25.1);
				c.b(168.4, 25.1, 166.7, 23.4, 166.7, 21.2);
				c.b(166.7, 19.8, 167.4, 18.5, 168.5, 17.8);
				c.b(169.1, 17.5, 169.8, 17.2, 170.5, 17.2);
				c.b(172.6, 17.2, 174.4, 19.0, 174.4, 21.2);
				c.cp();
				c.f();
				c.s();
			
				c.bp();
				c.moveTo(192.8, 51.9);
				c.b(195.1, 51.9, 197.0, 53.9, 197.0, 56.3);
				c.b(197.0, 58.7, 195.1, 60.6, 192.8, 60.6);
				c.b(190.4, 60.6, 188.6, 58.7, 188.6, 56.3);
				c.b(188.6, 53.9, 190.4, 51.9, 192.8, 51.9);
				c.cp();
				c.f();
				c.s();
			
				c.bp();
				c.moveTo(139.5, 11.9);
				c.b(142.8, 11.9, 145.5, 14.7, 145.5, 18.1);
				c.b(145.5, 21.6, 142.8, 24.3, 139.5, 24.3);
				c.b(136.2, 24.3, 133.5, 21.6, 133.5, 18.1);
				c.b(133.5, 14.7, 136.2, 11.9, 139.5, 11.9);
				c.cp();
				c.f();
				c.s();
			
				c.bp();
				c.moveTo(6.7, 35.8);
				c.b(10.0, 35.8, 12.7, 38.6, 12.7, 42.0);
				c.b(12.7, 45.4, 10.0, 48.2, 6.7, 48.2);
				c.b(3.4, 48.2, 0.7, 45.4, 0.7, 42.0);
				c.b(0.7, 38.6, 3.4, 35.8, 6.7, 35.8);
				c.cp();
				c.f();
				c.s();
				c.restore();
				c.restore();
				}
			},
			/**
			 * Отрисовывает в контексте элемента холста волнистые линии под заголовками колонок
			 * @type {Function}
			 * @param {CanvasRenderingContext2D()} c - контекст холста
			 */
			drawColumnDecor = function (c) {
				if (typeof c === 'object') {
				c.save();
				c.bp();
				c.moveTo(1.0, 10.0);
				c.b(177.0, 42.5, 124.5, -21.5, 309.5, 10.0);
				c.lineWidth = 2.0;
				c.strokeStyle = "rgb(99, 99, 99)";
				c.lineCap = 'round';
				c.lineJoin = "miter";
				c.miterLimit = 4.0;
				c.s();
				c.bp();
				c.moveTo(1.0, 15.6);
				c.b(177.0, 48.1, 124.5, -15.9, 309.5, 15.6);
				c.strokeStyle = 'rgb(213, 213, 213)';
				c.s();
				c.restore();
				c.restore();
				}
			};
			/**
			 * Получает узлы, в которых будут размещены элементы холста;
			 * создает элементы холста, устанавливает им атрибут класса, 
			 * для которого прописаны css-правила, вставляет холсты в DOM и 
			 * отрисовывает в их контексте узоры.
			 * @type (Function)
			 */					
		return function (){
				// для младших версий IE загружаются картинки
				if (  (/(^|\s)(ie7)(\s|$)/.test(document.documentElement.className)) 
					||(/(^|\s)(ie8)(\s|$)/.test(document.documentElement.className)) ) return;
				/**
				 * Холст содержит изображение узора в главной статье страницы
				 * @type {HTMLCanvasElement()}
				 */
				var mainDecor = document.createElement("canvas");
				
				mainDecor.width = 200;
				mainDecor.height = 85;
				mainDecor.className = 'main_decor';
				/**
				 * Главная статья страницы
				 * @type {Element}
				 */
				document.querySelectorAll(".main")[0].appendChild(mainDecor);
					/**
					 * Контекст холста
					 * @type {CanvasRenderingContext2D()}
					 */
				var ctx = mainDecor.getContext('2d'),
					/**
					 * переписываем названия методов для минимизации файла сценария
					 * @type {Function}
					 * @param {CanvasRenderingContext2D()}
					 */ 
					rename = function (c) {
						if (c.__proto__) {
							c.__proto__.b = c.__proto__.bezierCurveTo;
							c.__proto__.f = c.__proto__.fill;
							c.__proto__.ft = c.__proto__.fillText;
							c.__proto__.bp = c.__proto__.beginPath;
							c.__proto__.cp = c.__proto__.closePath;
							c.__proto__.s = c.__proto__.stroke;
							c.__proto__.st = c.__proto__.strokeText;
						} else {
							c.b = c.bezierCurveTo;
							c.f = c.fill;
							c.ft = c.fillText;
							c.bp = c.beginPath;
							c.cp = c.closePath;
							c.s = c.stroke;
							c.st = c.strokeText;
						}
						return c;
					};
				//  отрисовываем изображение на холсте
				drawMainDecor(rename(ctx));
					/**
					 * Разделы страницы в виде колонок
					 * @type {Element[]}
					 */
				var columns = document.querySelectorAll(".column"),
					/**
					 * Холст содержит изображение волнистых линий 
					 * под заголовками разделов страницы
					 * @type {HTMLCanvasElement()}
					 */
					columnDecor;
					
				for (var i = 0, len = columns.length; i < len; i++) {
					columnDecor = document.createElement('canvas');
					columnDecor.width = 320;
					columnDecor.height = 30;
					columnDecor.className = "column_decor";		
					columns[i].appendChild(columnDecor);
					ctx = columnDecor.getContext('2d');
					drawColumnDecor(rename(ctx));
				}
			};
		}()),
		/**
		 * Предоставляет интерфейс смены стиля оформления страницы
		 * @type {Function}
		 * @function
		 * @return {Function} создает кнопки управления видом страницы и встраивает их в DOM
		 */
		switchStyle = (function () {
			/**
			 * Создает и подключает таблицу стилей к странице
			 * @type {Function}
			 * @param {String} href - путь до таблицы стилей
			 * @return {HTMLLinkElement()} style - новая таблица стилей (связь с ней)
			 */
		var loadStyle = function (href){
				/**
				 * Устанавливает связь с внешним документом
				 * @type {HTMLLinkElement()} 
				 */
			var style = document.createElement('link');
				style.setAttribute('rel',"stylesheet");
				style.href = href;
				if (document.head){
					document.head.appendChild(style);
				} else {
					document.documentElement.childNodes[0].appendChild(style);
				}
				return style;
			},
			/**
			 * В зависимости от элемента, возбуждающего событие нажатия, 
			 * меняется видимость новой загруженной таблицы стилей, переписывающей
			 * правила, имеющиеся в изначальной таблице.
			 * @type {Function}
			 * @param {String} cls - класс элемента, возбуждающего событие
			 * @param {HTMLLinkElement()} link - связь с новой таблицей стилей 
			 */
			manageView = function(cls, link){
				if(/_b/.test(cls))
					link.disabled = true ? true : false;
				else  link.disabled = true ? false : true;
			},
			/**
			 * создает элемент списка с заданным классом и имеющимся 
			 * текстом, устанавливает обработку события нажатия на элемент списка.
			 * @type {Function}
			 * @param {String} _class - класс элемента списка
			 * @param {String} txt - текст  элемента списка
			 * @param {HTMLLinkElement()} style - связь с новой таблицей стилей		
			 */
			createBtn = function (_class, txt){
				var li = document.createElement('li'),
					txtNd = document.createTextNode(txt);
				li.className = _class;
				li.appendChild(txtNd);
				return li;		
			};
			/**
			 * Созадет кнопки управления видом страницы и встраивает их в DOM
			 * @type {Function}
			 */
		return	function(){
				/**
				 * Новая таблиуа стилей, переписывающая
				 * правила, имеющиеся в изначальной таблице.
				 * @type {HTMLLinkElement()}
				 */
				var styleAdd = loadStyle('css/skm_color.css');
				styleAdd.disabled = true;
	 
				var bisque = createBtn("view__bisque", 'Change view: Bisque'),
					cadetBlue = createBtn("view__cadet-blue", 'Change view: CadetBlue'),
					list = document.createElement("ul");
				list.className = 'view';
				list.appendChild(bisque);
				list.appendChild(cadetBlue);				
				document.body.insertBefore(list, document.body.querySelectorAll('script')[0]);	

				list.onclick = function(/* Event */ event) {
					var e = event || window.event, 
							/**
							 * Элемент на котором событие fired
							 * @type {Element}
							 */
							cnt = e.target || e.srcElement;
					if (cnt.nodeName.toLowerCase() === 'li'){
						manageView(cnt.className, styleAdd)					
					}
				};
			};
		}());
	return {
		/**
		 * формирует функциональность объекта слайдщоу
		 * @memberOf SKM
		 * @type {Function}
		 */
		runSlideShow : slideshow,
		/**
		 * декорирует страницу
		 * @memberOf SKM
		 * @type {Function}
		 */
		doDecor : decorate,
		/**
		 * обеспечивает возможность переключения стилей страницы
		 * @memberOf SKM
		 * @type {Function}
		 */
		provideSwitchStyle : switchStyle
	};
	}());
	
	SKM.runSlideShow();
	SKM.doDecor();
	if (document.documentElement.className && (document.documentElement.className.indexOf('7') !== -1) || (document.documentElement.className.indexOf('8') !== -1)) {
		return;
	} else {
		SKM.provideSwitchStyle();
	}
	
}());




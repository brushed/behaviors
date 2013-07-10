/*
Plugin: Viewer.Slimbox

    Slimbox clone, refactored for JSPWiki.
    Added support for iframes, flash video.
    Todo: html5 video.

Credits:
    Inspired by Slimbox by Christophe Bleys, (see http://www.digitalia.be/software/slimbox)
    the mediaboxAdvanced by John Einselen (see http://iaian7.com/webcode/mediaboxAdvanced)
    and the diabox by Mike Nelson. (see https://github.com/mnelson/diabox)

DOM structure:
    DOM structure of the JSPWiki Slimbox viewer.

>    div#slimbox
>        div.modal
>        div.viewport     //img, object or iframe element is inserted here
>            div.info
>                a.caption
>                a.next
>                a.prev
>            a.close

*/
Viewer.Slimbox = new Class({

    Implements: Options,
    Binds: ['attach','key','update','resize'],

    options: {
        loop: true,
        width: 800, // Initial width of the box (in pixels)
        height: 600, // Initial height of the box (in pixels)
        hints: {
            close: '&times;',
            next: 'Next', //&#171;
            prev: 'Previous', //&#187;
            info: '{0} {1}.',
            size: ' ({0}px &times; {1}px)'
        },
        keys: {
            close: ['esc','x','c'],
            prev:  ['left','up','p'],
            next:  ['enter','space','right','down','n']
        }
    },

    initialize: function(options){

        var self = this.setOptions(options),
            hints = self.options.hints;

        function clickFn(){
            if( this.match('.next')){ self.update(1); }
            else if( this.match('.prev')){ self.update(-1); }
            else { self.attach( /*O=close*/ ); }
        }

        $(document.body).grab([
            'div.slmbx', { attach:self/*[self,'element'] contains the slimbox dialog box*/ }, [
                'div.modal',{ events:{ click:clickFn } }, //semi transparent overlay
                'div.viewport', { attach:[self,'viewport'], events:{ 'click:relay(a)':clickFn } }, [
                    //insert viewable iframe/object/img ...
                    'a.info.caption',
                    'a.info.next',  { html:hints.next },
                    'a.info.prev',  { html:hints.prev },
                    'a.info.close', { html:hints.close }
                ]
            ]
        ].rendAr());

    },

    /*
    Function: get
        Retrieve DOM elements inside the dialog container, based on a css selector.
    Example:
    >    this.get('a.info');
    >    this.get('a.next');
    */
    get: function( selector ){
        return this.element.getElement(selector);
    },
    /*
    Function: get
        Check if URL is recognized as viewable object/image/html...
    */
    match: function(url){

        return Viewer.match(url,this.options);
    },

    /*
    Function: watch
        Install click handlers on a group of images/objects/media links.

    Arguments:
        elements - set of DOM elements
    Return
        set of clickable (viewable) elements
    */
    watch: function(elements){
        var self = this;

        /*safety net
        elements = $$(elements).filter( function(el){
            return self.match( el.src || el.href );
        });*/
        return elements.each( function(el,idx){
            el.addEvent('click',function(event){
                event.stop();
                self.show(elements, idx);
            });
        });

    },

    /*
    Function: show
        Start the image/media viewer for a set of elements.
    Arguments
        elements - set of DOM elements to be viewed
        cursor - index of first items to be viewed
    */
    show: function( elements, cursor ){
        var self = this;
        self.elements = elements;
        self.cursor = cursor;
        self.attach( 1 /*true*/ );
        self.update( 0 );
    },

    /*
    Function: attach
        Attach or de-tach eventhandlers from the slimbox dialogs.
        Display or hide the modal and viewport. (css class .show)
    */
    attach: function( open ){

        var self = this,
            fn = open ? 'addEvent' : 'removeEvent';

        ['object', Browser.ie6 ? 'select' : 'embed'].each(function(tag) {
            $$(tag).each( function(el){
                if( open ) el._slimbox = el.style.visibility;
                el.style.visibility = open ? 'hidden' : el._slimbox;
            });
        });

        self.element.ifClass(open,'show');
         //if(self.preload) self.preload.destroy();
         self.reset();

        document[fn]('keydown', self.key); //checkme: support arrow keys, etc.

    },

    reset: function(){

         var preload = this.preload;
         if( preload ){
             preload.destroy();
             this.preload = null;
         }

    },

    /*
    Function: key
        Handle keystrokes.
    */
    key: function( event ){

        var self = this,
            keys = self.options.keys,
            key = event.key;

        //console.log('keydown ', key);
        keys.close.contains(key) ? self.attach(/*O=close*/) :
            keys.next.contains(key) ? self.update(1) :
                keys.prev.contains(key) ? self.update(-1) :
                    /*otherwise*/ key=0;

        if(key) event.stop();

    },

    /*
    Function: update
        Updates the viewport and the info box with caption, and next and previous links.
        Implements cursor loop-around logic.

    Arguments:
        increment - move the cursor by increment, and display the new content
    */
    update: function( increment ){

        var self = this,
            options = self.options,
            elements = self.elements,

            max = elements.length,
            many = max > 1,

            loop = function(index){
                return options.loop ? (index >= max) ? 0 : ( index < 0 ) ? max-1 : index : index;
            },
            cursor = loop( self.cursor+increment ).limit( 0, max-1 ), /*new cursor value*/

            el, url;

        if( increment!=0 && (cursor == self.cursor)){ return; }

        self.cursor = cursor;
        self.get('.prev')[ (many && (loop(cursor-1) >= 0 )) ? 'show' : 'hide']();
        self.get('.next')[ (many && (loop(cursor+1) < max)) ? 'show' : 'hide']();

        el = elements[cursor];
        url = el.href||el.src; //url = encodeURIComponent(url);

        self.get('.caption').set({
            href: url,
            html: options.hints.info.xsubs(
                /*index*/ many ? (cursor+1)+"/"+max : "",
                /*name*/ el.get('title')/*||''*/
            )
        });

        self.viewport.addClass('spin');
         //if( self.preload ){ self.preload.destroy(); self.preload = null;}
         self.reset();
        Viewer.preload( url, options, self.resize );

    },

    /*
    Function: resize
        Completes the resizing of the viewport, after loading the img, iframe or object.
    */
    resize: function( preload ){

        var self = this,
            isImage = preload.match('img'),
            viewport = self.viewport,

            wSize = window.getSize(),
            width = preload.width.toInt().limit( 240, 0.9*wSize.x ).toInt(),
            height = preload.height.toInt().min( 0.9*wSize.y ).toInt(),
            caption = self.get('.caption');

        self.preload = preload;

        caption.set('html', caption.get('html') + self.options.hints.size.xsubs(height,width) );

        // viewport has css set to { top:50%, left:50% } for automatic centered positioning
        viewport
            .removeClass('spin')
            .setStyles({
                backgroundImage: isImage ? 'url(' + preload.src + ')' : 'none',
                //rely on css3 transitions... iso mootools morph
                width:width, height:height, marginTop:-height/2, marginLeft:-width/2
            });
            //.morph({ width:width, height:height, marginTop:-height/2, marginLeft:-width/2 });

        if( !isImage ) viewport.grab( preload );

    }

});
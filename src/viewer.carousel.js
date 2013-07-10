/*
Plugin: Viewer.Carousel
    Viewer plugin for cycling through elements like a carousel.
    Unlike slimbox, the content is directly visible on the page.

Credit:
    Inspired by  bootstrap-carousel.js v2.2.2 http://twitter.github.com/bootstrap/javascript.html#carousel

Depends on:
    Viewer

DOM structure:

    (start code)
    div.carousel
        a.xxx
        a.xxx
    (end)

    becomes
    (start code)
    div.carousel.slide
      <ol class="carousel-indicators">
        <li data-target="#myCarousel" data-slide-to="0" class="active"></li>
           <li data-target="#myCarousel" data-slide-to="1"></li>
        <li data-target="#myCarousel" data-slide-to="2"></li>
      </ol>

      <!-- Carousel items -->
      div.carousel-inner
      div.active.item
            a.xxx
           div.item
               a.xxx
        div.item
    <!-- Carousel nav -->
    a.carousel-control.left[href="#myCarousel"][data-slide="prev"] &lsaquo;
    a.carousel-control.right[href="#myCarousel"][data-slide="next"] &rsaquo;
    (end)

Example:
>    new Carousel(container, [el1, el2] );

*/
Viewer.Carousel = new Class({

    Binds: ['build', 'cycle','stop','next','prev','slid'],
    Implements: [Events, Options],

    options: {
        cycle: 5000, //=> when set, the carousel automatically cycles through all items
        width: 400, // Minimal width of the carousel (in pixels)
        height: 300 // Minimal height of the carousel (in pixels)
    },

    initialize : function(elements, options){

        var self = this,
            t = 'transitionend';

        options = self.setOptions(options).options;
        self.css3 = Element.Events[t] ? t : null;
        self.container = options.container;

        Viewer.preloads( $$(elements), { width:options.width, height:options.height }, self.build );

    },

    build: function(elements, width, height){

        var self = this,
            items = [],
            cycle = self.options.cycle,
            NOP = function(){},
            url, newEl;

        $$(elements).each( function(el){ items.push('div.item',[ el ]) });
        items[0] +='.active';

        self.container.adopt([
            'div.carousel', {
                attach: self/*,'element'*/,
                styles:{
                    width: width,
                    height: height
                },
                events:{
                    mouseenter: cycle ? self.stop : NOP,
                    mouseleave: cycle ? self.cycle : NOP
                }
            },[
                'div.carousel-inner',
                    items,
                'a.carousel-control.left[html=&lsaquo;]', {events:{ click: self.prev }},
                'a.carousel-control.right[html=&rsaquo;]', {events:{ click: self.next }}
            ]
        ].rendAr());

        //self.cycle();  only start cycling after a first mouseenter , next()

    },

    get: function( selector ){
        return this.element.getElements(selector);
    },

    /*
    Function: cycle
        Cycle through the carousel items.
        - invoked on initialization
        - invoked on mouseleave
        - invokde at end of the sliding operations
    */
    cycle: function(/*event*/){

        var self = this,
            cycle = self.options.cycle;

        if( cycle && !self.sliding ){
            self.stop(); /* make sure to clear tid */
            self.tid = self.next.delay( cycle );
        }

    },

    /*
    Function: stop
        Stop the autocycle mechanism.
        - invoked on mouseenter
        - invoked at start of the sliding operation
    */
    stop: function( /*event*/ ){

        //console.log("stop ", this.tid, this.sliding, arguments);
        clearTimeout( this.tid );
        this.tid = null;

    },

    /*
    Function: to
        Slide directly to a specific element.
        Not used.
    */
    to: function( pos ){

        var self = this,
            item = self.get('.item')[pos],
            active = self.get('.item').indexOf( self.get('.item.active')[0] );

        if ( !item ) return;

        if( self.sliding ){

            /*console.log('concurrency betweeen slide() and pos() - wf "slid" event to occur');*/
            self.element.addEvent('slid', self.to.pass(pos) );

        } else if ( !item.match('.active') ){

            self.slide( pos > active ? 'next' : 'prev', item );

        }

    },

    next: function(){
        if( !this.sliding ) this.slide('next');
    },

    prev: function () {
        if( !this.sliding ) this.slide('prev');
    },


    /*
    Function:slide
        Move carousel to the next slide.
        It fully relies on css transition. If not supported, no animation-effects are applied

    stable =>
    >    .active    => left:0;
    >    .next    => left:100%;
    >    .prev    => left:-100%;

    slide-type = next => Slide to left:
    >    item.active.left    => left:-100%;
    >    item.next.left        => left:0;

    slide-type = prev => Slide to right:
    >    item.active.right   => left:100%;
    >    item.prev.right     => left:0;

    Arguments
        - type : 'next','prev'
        - next : element to be shown at end of the "slide" scroll  ( array )

    */
    slide: function(type, next){

        var self = this,
            active = self.get('.item.active')[0],
            gonext = (type == 'next')
            css3 = self.css3,
            slid = self.slid;

        self.sliding = true;
        self.stop();

        next = next ||
            active[ gonext ? 'getNext':'getPrevious' ]() ||
            active.getParent()[ gonext ? 'getFirst':'getLast' ]();

        if( next.match('.active') ) return;

        next.addClass( type ); //.next or .prev
        self.fireEvent('slide');

        if( css3 ){

            //console.log('transition: '+css3)
            next.offsetWidth; // force reflow -- is this really needed ?
            $$(active, next).addClass( gonext ? 'left' : 'right' );
            self.element.addEvent( css3, slid );

        } else {

            slid();

        }

    },

    slid:function(){

        var self = this,
            newActive = self.get('.next,.prev')[0];

        if( newActive ){

            self.get('.item').set('class','item');  //wipe out .active, .next, .prev, .left, .right
            newActive.addClass('active');

            self.sliding = false;
            self.cycle();
            self.fireEvent('slid', 0 /*dummy*/, 1 /*delay 1ms*/);

        }

    }

});


/*
Extension : css3 native events
    Extend mootools to support css3 native events
    (needed by Viewer.Carousel)

Credits:
    Inspired by  https://github.com/amadeus/CSSEvents/

Example:
>    $(element).addEvent('transitionend',function(event){ ...})

*/
!function(css3){

var B = Browser,
    pfx = B.cssprefix = (B.safari || B.chrome || B.Platform.ios) ? 'webkit' : (B.opera) ? 'o' : (B.ie) ? 'ms' : '';

    for ( style in css3 ){

        var eventType = css3[style],
            type = eventType.toLowerCase(),
            aType = pfx ? pfx + eventType : type,
            aTest = pfx ? pfx + style.capitalize() : style;

        if( document.createElement('div').style[ aTest ] != null ){

            Element.NativeEvents[type] = Element.NativeEvents[aType] = 2;
            Element.Events[type] = { base: aType };

        }

        //console.log(Element.NativeEvents, Element.Events);

    }

}({transition:'TransitionEnd'});
//})({transition:'TransitionStart',transition:'TransitionEnd',animation:'AnimationStart',animation:'AnimationIteration',animation:'AnimationEnd');

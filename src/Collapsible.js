/*
Class: Collapsible

Options:
    options - (object, optional)

    bullet - (string) css selector to create collapsible bullets, default is 'b.bullet', //'b.bullet[html=&bull;]'
    open - (string) css class of expanded 'bullet' and 'target' elements
    close - (string) css class of collapsed 'bullet' and 'target' elements
    hint - (object) hint titles for the open en closed bullet, will be localized

    nested - (optional) css selector of nested container elements, example 'li',
    target - (optional) css selector of the target element which will expand/collapse, eg 'ul,ol'
        The target is a descendent of the main element, default target is the main element itself.

    collapsed - (optional) css selector to match element which should be collapsed at initialization (eg 'ol')
        The initial state will be overruled by the Cookie.Flags, if any.
    cookie - (optional) Cookie.Flags instance, persistent store of the collapsible state of the targets

    fx - (optional, default = 'height') Fx animation parameter - the css style to be animated
    fxy - (optional, default = 'y') Fx animation parameter
    fxReset - (optional, default = 'auto') Fx animation parameter - end value of Fx animated style.
        At the end of the animation, 'fx' is reset to this 'fxReset' value. ('auto' or fixed value)

Depends on:
    String.Extend: xsubs()
    Element.Extend: ifClass()

DOM structure:
    (start code)
    div.collapsible
        ul
            li
                b.bullet.xpand|xpand[onclick="..."]
                Toggle-text
                ul.xpand|xpand
                    li .. collapsible content ..
    (end)

Example:
    (start code)
    ...
    (end)
*/
!function(){

var T_Collapsible = this.Collapsible = new Class({

    Implements: Options,

    options: {
        bullet: 'b.bullet', //'b.bullet[html=&bull;]' //css selector of clickable bullet
        hint: { open:"collapse",close:"expand" },
        open: 'xpand',
        close: 'clpse',

        //target: 'ul,ol',//element which will expand/collapse
        //nested: 'li',    //css selector of nested container elements

        //collapsed: 'ol',//initial collapsed element
        //cookie: null,    //Cookie.Flags - persistent store of the state of the targets

        fx: 'height',    //style attribute to animate on collapse
        fxy: 'y',        //scroll direction to animate on collapse,
        fxReset: 'auto'    //end value after animation is complete on expanded element: 'auto' or fixed width
    },

    initialize: function(element, options){

        var self = this;

        self.element = element = document.getElement(element);
        self.cookie = options && options.cookie;
        //note: setOptions makes a copy of Cookie object, so first retrieve the cookie, before invoking setOptions
        options = self.setOptions(options).options;

        if( options.nested ){
            element.getElements( options.nested ).each( self.build, self );
        } else {
            self.build( element );
        }

        element.addEvent( 'click:relay({0}.{1},{0}.{2})'.xsubs(options.bullet,options.open,options.close),
            function(e){ e.stop(); self.toggle(this); });

    },

    build: function( element ){

        var self = this,
            options = self.options,
            bullet = options.bullet,
            target;

        if( !self.skip(element) ){

            bullet = element.getElement(bullet) || new Element(bullet).inject(element,'top');
            target = element.getElement(options.target);

            if( target && (target.get('text').trim()!='') ){

                //console.log(bullet,target,self.initState(element,target));
                target.set('tween',{
                    property: options.fx,
                    onComplete: function(){ self.fxReset( this.element ); }
                });
                self.update(bullet, target, self.initState(element,target), true);
            }
        }
    },

    skip: function( /*element*/ ){
        return false;
    },

    //function initState: returns true:expanded; false:collapsed
    //cookies always overwrite the initial state
    initState:function( element, target ){

        var cookie = this.cookie,
            isCollapsed = this.options.collapsed;

        isCollapsed = !(isCollapsed && target.match(isCollapsed) );

        return cookie ? cookie.get(target, isCollapsed) : isCollapsed;
    },

    //function getState: returns true:expanded, false:collapsed
    getState: function( target ){

        return target.hasClass(this.options.open);

    },

    toggle: function(bullet){

        var self = this,
            cookie = self.cookie,
            options = self.options,
            nested = options.nested,
            element = nested ? bullet.getParent(nested) : self.element,
            target, state;

        if( element ){
            target = element.getElement(options.target);
            if( target ){
                state = !self.getState(target);
                self.update( bullet, target, state );
                if( cookie ){ cookie.write(target, state); }
            }
        }
    },

    update: function( bullet, target, expand, force ){

        var options = this.options, open=options.open, close=options.close;

        if( bullet ){
            bullet.ifClass(expand, open, close)
                  .set( 'title',options.hint[expand ? 'open' : 'close'].localize() );
        }
        if( target ){
            this.animate( target.ifClass(expand, open, close), expand, force );
        }

    },

    animate: function( element, expand, force ){

        var fx = element.get('tween'),
            fxReset = this.options.fxReset,
            max = (fxReset!='auto') ? fxReset : element.getScrollSize()[this.options.fxy];

        if( force ){
            fx.set( expand ? fxReset : 0);
        } else {
            fx.start( expand ? max : [max,0] );
        }

    },

    fxReset: function(element){

        var options = this.options;
        if( this.getState(element) ){ element.setStyle(options.fx, options.fxReset); }

    }

});

/*
Class: Collapsible.List
    Converts ul/ol lists into collapsible trees.
    Converts every nested ul/ol into a collasible item.
    By default, OL elements are collapsed.

DOM Structure:
    (start code)
    div.collapsible
        ul
            li
                b.bullet.xpand|xpand[onclick="..."]
                Toggle-text
                ul.xpand|xpand
                    li ... collapsible content ...
    (end)
*/
T_Collapsible/*this.Collapsible*/.List = new Class({
    Extends:T_Collapsible,

    initialize: function(element,options){

        this.parent( element,Object.merge({target:'ul,ol', collapsed:'ol', nested:'li'},options));

    },

    // skip empty elements
    skip: function(element){

        for( var skip=true, n=element.firstChild; skip && n && n.nodeType==3; n=n.nextSibling ){
            skip = n.nodeValue.trim()=="";
        }
        return skip;

    }

});

/*
Class: Collapsible.Box
    Makes a collapsible box.
    - the first element becomes the visible title, which gets a bullet inserted
    - all other child elements are wrapped into a collapsible element

Options:


DOM Structure:
    (start code)
    div.collapsebox
        b.bullet.xpand|clpse[onclick="..."]
        h1 title
        div.xpand|clpse
            .. collapsible content ..
    (end)

*/
T_Collapsible/*this.Collapsible*/.Box = new Class({
    Extends:T_Collapsible,

    initialize:function(element,options){

        //target = last-child,  !^  => check
        //convert boolean into css-selector: target.match('div') is always true
        options.collapsed = options.collapsed ? 'div' : '';
        this.parent( element, Object.merge( {target:'!^'},options ) );

    },

    build: function( element ){

        var options = this.options, title, body, next;

        //add body container after the first (title) element
        if( !element.getElement( options.bullet ) ){

            title = element.getFirst();  //typically and h1 element, acting as box title

            if( title && title.nextSibling ){

                body = new Element('div');
                while( next = title.nextSibling ) body.appendChild( next );
                this.parent( element.grab(body) );

            }

        }

    }
});

}();

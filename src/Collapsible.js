/*
Class: Collapsible

Options:
    options - (object, optional)

    bullet - (css selector)'b.bullet', //'b.bullet[html=&bull;]' //css selector of clickable bullet
    open - (css class) css class of expanded 'bullet' and 'target' elements
    close - (css class) css class of collapsed 'bullet' and 'target' elements
    title - (object) title tips for the open en closed bullet, will be localized

    nested - (optional css selector) 'li',  //css selector of nested container elements
    target - (optional, css selector) element which will expand/collapse, eg 'ul,ol'
        The target is a descendent of the main element, default is the main element itself.

    collapsed - (optional, css selector) matches element when initial collapsed state, eg 'ol'
        The initial state will be overruled by the Cookie.Flags, if present.
    cookie - (optional) Cookie.Flags instance, persistent store of the collapsible state of the targets

    fx - (optional, default = 'height') Fx animation parameter - css style to be animated
    fxy - (optional, default = 'y') Fx animation parameter
    fxReset - (optional, default = 'auto') Fx animation parameter - end value of Fx animated style.
        When the target element is completed, it is reset to this fxReset value. ('auto' or fixed value)

DOM structure:
<div class='collapsible'>
<ul>
    <li>
        <b. class:="bullet xpand|xpand" onclick="..."></b>Toggle-text
        <ul class="xpand|xpand"> ... collapsible content ...</ul>
    </li>
</ul>
</div>

*/
!function(){

var T_collapsible = this.Collapsible = new Class({

    Implements: Options,

    options: {
        bullet: 'b.bullet', //'b.bullet[html=&bull;]' //css selector of clickable bullet
        open: 'xpand',
        close: 'clpse',
        title: {open:"collapse",close:"expand"},

    //    target: 'ul,ol',//element which will expand/collapse
    //    nested: 'li',    //css selector of nested container elements

    //    collapsed: 'ol',//initial collapsed element
    //    cookie: null,    //Cookie.Flags - persistent store of the state of the targets

        fx: 'height',    //style attribute to animate on collapse
        fxy: 'y',        //scroll direction to animate on collapse,
        fxReset: 'auto'    //end value after animation is complete on expanded element: 'auto' or fixed width
    },

    initialize: function(element, options){
        var self = this, b;

        self.element = element = document.getElement(element);
        self.cookie = options.cookie; //note: setOptions makes a copy of Cookie object, nok!
        options = self.setOptions(options).options;

        if(options.nested){
            element.getElements(options.nested).each(self.build,self);
        } else {
            self.build(element);
        }
        b = options.bullet + ".";
        element.addEvent('click:relay(' + b+options.open + ',' + b+options.close + ')',
            function(e){ self.toggle(this,e); });

    },

    build: function( element ){
        var self = this,
            options = self.options,
            bullet = options.bullet,
            target;

        if(!self.skip(element)){

            bullet = element.getElement(bullet) || new Element(bullet).inject(element,'top');
            target = element.getElement(options.target);

            if( target && (target.get('text').trim()!='') ){

                target
                    .setStyle('overflow','hidden') //support scroll fx
                    .set('tween',{
                        property: options.fx,
                        onComplete:function(){ self.fxReset(this.element); }
                    });
                self.update(bullet, target, self.initState(element,target), true);
            }
        }
    },

    skip: function( /*element*/ ){
        return false;
    },

    //return true:expanded; false:collapsed
    initState:function(element,target){
        var cookie = this.cookie,
            isCollapsed = this.options.collapsed;

        isCollapsed = !(isCollapsed && target.match(isCollapsed));

        return cookie ? cookie.get(target, isCollapsed) : isCollapsed;
    },

    //getCurrentState -- returns true:expanded, false:collapsed
    getState: function( target ){
        return target.hasClass(this.options.open);
    },

    toggle: function(bullet, event){
        var self = this,
            cookie = self.cookie,
            options = self.options,
            nested = options.nested,
            element = nested ? bullet.getParent(nested) : self.element,
            target, state;

        if(event){ event.stop(); }
        if(element){
            target = element.getElement(options.target);
            if(target){
                state = !self.getState(target);
                self.update(bullet, target, state);
                if(cookie){ cookie.write(target, state); }
            }
        }
    },

    update: function(bullet, target, expand, force){
        var options = this.options, open=options.open, close=options.close;

        if(bullet){
            bullet.set('title',options.title[expand ? 'open' : 'close'].localize())
                    .ifClass(expand, open, close);
        }
        if(target){
            this.animate(target.ifClass(expand, open, close), expand, force);
        }
    },

    animate: function(element, expand, force){

        var    fx = element.get('tween'),
            fxReset = this.options.fxReset,
            max = (fxReset!='auto') ? fxReset : element.getScrollSize()[this.options.fxy];

        if(force){
            fx.set( expand ? fxReset : 0);
        } else {
            fx.start( expand ? max : [max,0] );
        }
    },

    fxReset: function(element){

        var options = this.options;
        if(this.getState(element)){ element.setStyle(options.fx,options.fxReset); }

    }

});

/*
Class: Collapsible.List
    Converts ul/ol lists into collapsible trees.
    Converts every nested ul/ol into a collasible item.
    By default, OL elements are collapsed.

DOM Structure:
<div class='collapsible'>
<ul>
    <li>
        <b. class:="bullet xpand|xpand" onclick="..."></b>Toggle-text
        <ul class="xpand|xpand"> ... collapsible content ...</ul>
    </li>
</ul>
</div>
*/
T_collapsible/*this.Collapsible*/.List = new Class({
    Extends:T_collapsible,

    initialize: function(element,options){

        this.setOptions({target:'ul,ol', collapsed:'ol', nested:'li'});
        this.parent(element,options);

    },
    skip: function(element){
        for(var skip=true, n=element.firstChild; skip && n && n.nodeType==3; n=n.nextSibling){
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
<div class='collapsebox'>
    <b class="bullet xpand|clpse" onclick="..."></b>
    <h1>title</h1>
    <div class="xpand|clpse"> ... collapsible content ...</div>
</div>
*/
T_collapsible/*this.Collapsible*/.Box = new Class({
    Extends:T_collapsible,

    initialize:function(element,options){

        options.target = '!^'; //last-child
        this.parent(element,options);

    },

    build: function(element){

        if( !element.getElement(this.options.bullet) ){

            var title = element.getFirst(),
                close = this.options.collapsed,
                body, el;

            if( title.nextSibling ){
                body = new Element('div'+ (element.match(close) ? close : '') );
                while( el = title.nextSibling ) body.appendChild(el);
                this.parent( element.grab(body) );
            }

        }

    }
});

}();

---
layout: tutorial
title: Delite Tutorial Part 1
---

# delite - creating custom components

## delite background
`delite` is a new JavaScript library to provide a UI framework for both desktop and mobile platforms <sup><a href="#link1">[1]</a></sup>.

This repository is intended to be used as the core building blocks to leverage current and future standards in HTML, CSS & JavaScript for the
purpose of writing reusable Web Components.

It can be used on its own but more likely used with other projects either from the [ibm-js repositories](https://github.com/ibm-js)
or other repositories.

More information can be found on the [delite website](http://ibm-js.github.io/delite/) explaining the standards this library aims to conform to.

## Tutorial details
In this tutorial you'll learn how to create your own custom elements, learn how to register them, learn how to use templates
and learn how to theme them. It's a beginner tutorial so we won't be delving too deep into what `delite` provides (yet!!!).


## Getting started
To quickly get started, we're using [https://github.com/ibm-js/generator-delite-element](https://github.com/ibm-js/generator-delite-element)
to install the required dependencies and create a basic scaffold.

Install the `generator-delite-element` globally (or update it if necessary).

    npm install -g generator-delite-element

##Templates
`delite` provides first class support for templates. We wouldn't expect to programmatically create DOM nodes & this is where
`delite` comes into it's own; out of the box `delite` supports templating using a built in implementation of [Handlebars](http://handlebarsjs.com/).

Note there are some limitations using the `delite/handlebars!` plugin for templating, namely it doesn't support iterators or conditionals.
However in many cases this isn't a limiting factor.
Alternate templating engines can be plugged in if needed; support for this will be explained in a later more advanced tutorial when we discuss
[Liaison](https://github.com/ibm-js/liaison). The handlebars template implementation `delite` uses is primarily focused on performance.

Let's try create a 'real life' widget, for example a blogging widget.

### create the scaffold
We'll create a new `delite` custom element using Yeoman.

From the command line create a new directory somewhere (named `blogging-package`) and change directory to it using the commands:

    mkdir -p blogging-package
    cd blogging-package

Run Yeoman to create our scaffold.

    yo delite-element

You'll be prompted to enter the widget package name and the name of the custom widget element. Set the following choices shown in brackets below.

    ? What is the name of your delite widget element package? (blogging-package)
    ? What do you want to call your delite widget element (must contain a dash)? (blog-post)
    ? Would you like your delite element to be built on a template? (Y)
    ? Would you like your delite element to providing theming capabilities? (N)
    ? Will your delite element require string internationalization? (N)
    ? Will your delite element require pointer management? (N)
    ? Do you want to use build version of delite package (instead of source version)? (N)

### What's been generated
Yeoman created the following (as shown in the console output):

- `./BlogPost.js` - __this is our widget module__
- `./BlogPost/css/BlogPost.css` - __this is our widget css__
- `./BlogPost/BlogPost.html` - __this is our widget template__
- `./samples/BlogPost.html` - __this is a sample how to use our new widget__

You can view the sample generated HTML `./samples/BlogPost.html` in a browser to see what's been created.


## Creating a custom element
Viewing the `./samples/BlogPost.html` example HTML we can see we've (partly) created the custom element declaratively in markup via:
```html
<blog-post id="element" value="The Title"></blog-post>
```

If you open your browser developer tools and in the console enter `myvar = document.getElementById('element')` and then explore
the properties on that variable `myvar`, you'll see it's just a regular HTML element <sup><a href="#link2">[2]</a></sup>;
if you're more inquisitive you might be able to see there are extra properties/methods on this element which is what the `delite` framework is providing.

###Registering

The `<blog-post>` element doesn't constitute a custom element on its own; it first needs to go through a registration process which is achieved using
the `delite/register` module. This is analogous to the HTML specification for registering custom elements
i.e. `document.registerElement('blog-post');`

If we look at the custom element module `./BlogPost.js` we see that we register the custom element tag via the `return register(....)` method:

```js

define([
	"delite/register",
	"delite/Widget",
	"delite/handlebars!./BlogPost/BlogPost.html",
	"requirejs-dplugins/css!./BlogPost/css/BlogPost.css"
], function (register, Widget, template) {
	return register("blog-post", [HTMLElement, Widget], {
		baseClass: "blog-post",
		value: "",
		template: template
	});
});

```


This is an important concept which sometimes isn't clear at a first glance. You can add any non-standard tag to an HTML page and the browser HTML parser
will not complain; this is because these elements will be defined as a native
[`HTMLUnknownElement`](http://www.whatwg.org/specs/web-apps/current-work/multipage/dom.html#htmlunknownelement).
To create a custom element it must be **upgraded** first; this is what `delite/register` does. `delite/register` supports browsers who natively
support `document.registerElement` and those who don't.

The registration process above using `delite/register`, creates a custom element by registering the tag name `"blog-post"` as the first
argument and then inheriting (prototyping) the `HTMLElement` native element (as well as the `"delite/Widget"` module).

Elements which inherit from `HTMLElement`
using [valid custom element names](http://www.w3.org/TR/2013/WD-custom-elements-20130514/#dfn-custom-element-name) are custom elements.
The most basic requirement for the tag name is it **MUST** contain a dash **(-)**.

In case there's any confusion, note that the module name (i.e. `BlogPost`) is independent of the custom element's name (i.e. `blog-post`), although
by convention we define one custom element per module, and name them similarly.

###Declarative creation of custom elements
If we view the generated sample `./samples/BlogPost.html`, we see the following JavaScript:

```js
require(["delite/register", "blogging-package/BlogPost"], function (register) {
    register.parse();
});
```

Declarative widget instances (those created via markup in the page) need to be parsed in order to kick off the lifecycle of creating the widget.


###Template
If we look at the template Yeoman just created `./BlogPost/BlogPost.html` we can see the following:

```html
<template>
    title:
    <h1>{{value}}</h1>
</template>
```

All templates must be enclosed in a `<template>` element.

Looking back at our custom element module, we see we just need to include the template using the handlebars plugin i.e.
`"delite/handlebars!./BlogPost/BlogPost.html"` and assign the resolved template to the `template` property of our widget
i.e. `template: template`.

####CSS

If we look at the `./BlogPost.js` custom element module, we see there's a property defined named `baseClass` i.e. `baseClass: "blog-post"`.
This adds a class name to the root node of our custom element (which you can see in the DOM using your debugger tools if you inspected that element). Also notice we include
in the `define` the `requirejs-dplugins/css!` plugin to load our widget CSS i.e. `"requirejs-dplugins/css!./BlogPost/css/BlogPost.css"`.
This plugin is obviously used to load CSS for our custom element. There's nothing much to say here apart from this is how you individually style
your components.


####Using handlebars templates
Imagining we need to implement this blogging widget, the widget needs to show the blog title (which we've already done with `{{value}}`, the date it was
published, the author and the article content of the blog.

Let's make some changes:
#####Template
Change our template to add new properties for the blog author, when the blog was published and the text of the blog
in `./BlogPost/BlogPost.html`:
```html
<template>
    <article>
        <h3>{{value}}</h3>
        <p class='blogdetails'>Published at <span>{{publishDate}}</span> by <span>{{author}}</span></p>
    </article>
</template>
```
Note that I've not added the the article content property yet. __Properties are for plain text, not HTML__; we'll discuss this in the next
step in [delite/Container and containerNode](#delitecontainer-and-containernode).


#####Widget
So we've added some new properties to our template, which you see is very easy to do. All we need to do now is map those properties in the widget `./BlogPost.js`:

```js
define([
	"delite/register",
	"delite/Widget",
	"delite/handlebars!./BlogPost/BlogPost.html",
	"requirejs-dplugins/css!./BlogPost/css/BlogPost.css"
], function (register, Widget, template) {
	return register("blog-post", [HTMLElement, Widget], {
		baseClass: "blog-post",
		value: "",
		publishDate: new Date().toString(),
		author: "",
		template: template
	});
});

```

Note that I've added a default value for `publishDate`, to make setting the date optional; if unspecified, it will default to today's date.

#####Sample usage
So now if you change the body content of `./samples/BlogPost.html` to the following:

```html
<blog-post id="element" value="A very lazy day" publishDate="Nov 27th 2014" author="My good self"></blog-post>
<button onclick="element.value='Now sleeping!'; event.target.disabled=true">click to change title</button>
```

And updating the template CSS `./BlogPost/css/BlogPost.css` to make it slightly more interesting to:

```css
/* style for the custom element itself */
.blog-post {
    display: block;
}
.blog-post h3 {
    color: red;
}
.blog-post p.blogdetails span {
    font-weight: bold;
}
/* Note this isn't used yet but will be in the next step when we discuss "delite/Container" */
.blog-post div.blog {
    padding-left: 20px;
}
```

If you refresh the page you'll see it's becoming something more you'd envisage as a widget we may want to write.

####delite/Container and containerNode
Now is the time to discuss the functionality provided by [delite/Container](https://github.com/ibm-js/delite/blob/master/docs/Container.md).
Looking at the widget we created, we need to also add arbitrary HTML to render whatever the content of our blog should be e.g. paragraph tags,
list tags etc etc. As explained, widget properties to be displayed are really only for plain text. If you try and add any HTML to those
properties the HTML tags will be escaped and not rendered as HTML; this is expected.

As explained in the `Container` documentation, it's to be used as a base class for widgets that contain content; therefore it's also useful for our
intentions where we want to add arbitrary HTML.

#####Widget
Let's update our widget `./BlogPost.js` to use this:

```js
define([
	"delite/register",
	"delite/Widget",
	"delite/Container",
	"delite/handlebars!./BlogPost/BlogPost.html",
    "requirejs-dplugins/css!./BlogPost/css/BlogPost.css"
], function (register, Widget, Container, template) {
	return register("blog-post", [HTMLElement, Container], {
		baseClass: "blog-post",
		value: "",
		publishDate: new Date().toString(),
		author: "",
		template: template
	});
});

```

We've extended our widget using `delite/Container` (we only need to extend `delite/Container` because it itself extends `delite/Widget`).

#####Widget template
Update `./BlogPost/BlogPost.html` to the following:

```html
<template>
    <article>
        <h3>{{value}}</h3>
        <div class='blog' attach-point="containerNode"></div>
        <p class='blogdetails'>Published at <span>{{publishDate}}</span> by <span>{{author}}</span></p>
    </article>
</template>
```

Notice the `attach-point="containerNode"` attribute. This is a special 'pointer' to a DOM node which is used by `delite/Container`. When you inherit from
`delite/Container`, it adds a property to our widget named `containerNode` and this maps any HTML (or widgets) as children of our widget.

#####Sample usage
If you change the body content of `./samples/BlogPost.html` to the following:

```html
<blog-post id="element" value="A very lazy day" publishDate="Nov 27th 2014" author="My good self">
    <h4>So I ate too much</h4>
    <ol>
        <li>Turkey</li>
        <li>Cranberries</li>
        <li>Roast potatoes</li>
        <li>etc etc</li>
    </ol>
</blog-post>
<button onclick="element.value='Now sleeping!'; event.target.disabled=true">click to change title</button>
```
(Note we've added some arbitrary HTML as children of our widget).
If you refresh your page now you should see something like the following:

> <img src='./images/custom_templated_containernode.png'/>

You can see that the `attach-point="containerNode"` reference we created will render our declarative content wherever we've placed it in the template.
If you open up your developer tools and in the console enter:

```js
document.getElementById('element').containerNode.innerHTML = "<i>And now we've replaced our containerNode content</i>"
```

You'll see that our widget containerNode `innerHTML` is updated to what we've added.


####Programmatic creation with containerNode
If you wanted to programmatically create a widget and also set the arbitrary HTML of our `containerNode` you can update the
`./samples/BlogPost.html` sample from:

```js
require(["delite/register", "blogging-package/BlogPost"], function (register) {
    register.parse();
});
```

to the following:

```js
require(["delite/register", "blogging-package/BlogPost"], function (register, BlogPost) {
    register.parse();
    var anotherCustomElement = new BlogPost({value : 'The day after', publishDate : 'Nov 28th 2014', author : "My good self"});
    // note you must call startup() for programmatically created widgets
    anotherCustomElement.placeAt(document.body, 'last');
    var containerNodeContent = "<b>boooooo</b> it's the day after, back to work soon :(" +
            "<pre># time to start thinking about code again</pre>";
    anotherCustomElement.containerNode.innerHTML = containerNodeContent;
    anotherCustomElement.startup();
});
```
Note that programmatically created widget instances should always call `startup()`. A helper function is provided by `delite/Widget` to place it
somewhere in the DOM named `placeAt`
(see the [documentation](https://github.com/ibm-js/delite/blob/master/docs/Widget.md#placement) for it's usage).


If you refresh the page you can see how we've added this HTML to the `containerNode` of our widget programmatically.

###Theming
Whilst we're on a roll we'll quickly discuss the `delite` theming capabilities and make our widget appear more aesthetically pleasing.
Documentation on this is provided [here](http://ibm-js.github.io/delite/docs/master/theme.html).

In our custom element module `./BlogPost.js` instead of using the `requirejs-dplugins/css!` to load our CSS i.e.
`"requirejs-dplugins/css!./BlogPost/css/BlogPost.css"`, we'll switch to using the `"delite/theme!` plugin.

Update `./BlogPost.js` to the following:

```js
define([
	"delite/register",
	"delite/Widget",
	"delite/Container",
	"delite/handlebars!./BlogPost/BlogPost.html",
	"delite/theme!./BlogPost/css/{{theme}}/BlogPost.css"
], function (register, Widget, Container, template) {
	return register("blog-post", [HTMLElement, Widget, Container], {
		baseClass: "blog-post",
		value: "",
		publishDate: new Date().toString(),
		author: "",
		template: template
	});
});

```

Note the `{{theme}}` placeholder. As explained in the theme documentation, this is used to load whatever theme is detected automatically
based on the platform/browser, from a request parameter on the URL or set specifically via a `require`. You can also configure themes using the
loader `require.config`.
The default theme is the bootstrap theme; have a look at some of the existing less/CSS variables in https://github.com/ibm-js/delite/tree/master/themes/bootstrap.

This isn't the place to discuss the `less` variables `delite` provides but an example of how they are used can be seen in the `deliteful`
project e.g. [https://github.com/ibm-js/deliteful/tree/master/StarRating/themes](https://github.com/ibm-js/deliteful/tree/master/StarRating/themes).

To load a widget theme you must create a folder with the name of the theme you want to load for each widget CSS file, if the theme/folder name doesn't exist you'll
see 404's in your browser developer tools.

For example our `./BlogPost/css/BlogPost.css` should be updated so that the bootstrap theme of our widget is located at
`./BlogPost/css/bootstrap/BlogPost.css`. Assuming you're not testing this on an IOS device, setting the theme via a request parameter etc you
shouldn't need to create anymore theme folders (the default bootstrap theme will be loaded).

####Sample usage
Update our existing `./samples/BlogPost.html` JavaScript content from:

```js
require(["delite/register", "blogging-package/BlogPost"], function (register, BlogPost) {
    register.parse();
    var anotherCustomElement = new BlogPost({value : 'The day after', publishDate : 'Nov 28th 2014', author : "My good self"});
    // note you must call startup() for programmatically created widgets
    anotherCustomElement.placeAt(document.body, 'last');
    var containerNodeContent = "<b>boooooo</b> it's the day after, back to work soon :(" +
            "<pre># time to start thinking about code again</pre>";
    anotherCustomElement.containerNode.innerHTML = containerNodeContent;
    anotherCustomElement.startup();
});
```

to:

```js
require(["delite/register", "blogging-package/BlogPost", "delite/theme!delite/themes/{{theme}}/global.css"], function (register, BlogPost) {
    register.parse();
    var anotherCustomElement = new BlogPost({value : 'The day after', publishDate : 'Nov 28th 2014', author : "My good self"});
    // note you must call startup() for programmatically created widgets
    anotherCustomElement.placeAt(document.body, 'last');
    var containerNodeContent = "<b>boooooo</b> it's the day after, back to work soon :(" +
            "<pre># time to start thinking about code again</pre>";
    anotherCustomElement.containerNode.innerHTML = containerNodeContent;
    anotherCustomElement.startup();
});
```

i.e. a minor difference but we're now loading `"delite/theme!delite/themes/{{theme}}/global.css"` for the page level theming.

Let's also update the boostrap `./BlogPost/css/boostrap/BlogPost.css` theme CSS slightly to the following:


```css
/* style for the custom element itself */
.blog-post {
    display: block;
}
.blog-post h3 {
    color: blue;
}
.blog-post p.blogdetails span {
    font-weight: lighter;
}
.blog-post div.blog {
    padding-left: 50px;
}
```

You should see something like the following if you refresh your browser:

> <img src='./images/custom_templated_theming.png'/>


If you look at your debugger network tools, notice how the `./bower_components/delite/themes/bootstrap/common.css` and
`./bower_components/delite/themes/bootstrap/global.css` CSS files are also loaded. The `"delite/theme!` plugin provides
basic less variables/CSS classes and structure for loading your theme files. Have a look through the less/CSS files in the
`./bower_components/delite/themes/` directory.

---

##Going back to basics
As shown in the previous example, Templating support is provided 'out of the box' with `delite` and straightforward to implement.
We'll now look at an example which doesn't use templating; this would not be a normal use case but it's worth showing to explore some of
the fundamentals of a `delite` custom element.

### create the scaffold

Again we'll use the `generator-delite-element` Yeoman generator.

Create a new directory somewhere (named `title-package`, which will also be our package name) and change directory to it using the commands :

    mkdir -p title-package
    cd title-package

Run Yeoman to create our scaffold

    yo delite-element

You'll be prompted to enter the widget package name & the name of the custom widget element, enter the following choices shown in brackets below.

    ? What is the name of your delite widget element package? (title-package)
    ? What do you want to call your delite widget element (must contain a dash)? (title-widget)
    ? Would you like your delite element to be built on a template? (n)
    ? Would you like your delite element to providing theming capabilities? (n)
    ? Will your delite element require string internationalization? (n)
    ? Will your delite element require pointer management? (n)
    ? Do you want to use build version of delite package (instead of source version)? (n)

### What's been generated
Yeoman created the following (as shown in the console output):

We've created a new package named `title-package` for new widgets that we'll create.

- `./TitleWidget.js` - __this is our widget module__
- `./TitleWidget/css/TitleWidget.css` - __this is our widget css__
- `./samples/TitleWidget.html` - __this is a sample how to use our new widget__

This is the most basic setup for a widget/custom component. You can view the sample generated HTML `./samples/TitleWidget.html`
in a browser to see what's been created.



###A look at the widget lifecycle methods for our simple widget
If we look at our custom element module  ``./TitleWidget.js`` we can see two methods have been created for us, `render` and `refreshRendering`.
`render` is the simplest of [lifecycle](https://github.com/ibm-js/delite/blob/master/docs/Widget.md#lifecycle)
methods we need to create our widget.

#### `render`
We normally wouldn't create a `render` method because typically we'd be using templates to create the widget UI (which was shown earlier
on) but because we aren't using a template we need to implement `render` ourselves.

In this `render` method we're adding `<span>title</span>` and `<h1></h1>` elements to our widget as well as assigning a property
to the widget named `_h1` i.e. via `this.appendChild(this._h = this.ownerDocument.createElement("h1"));` which we can use to update
it programmatically or set it declaratively.

In comparison to the previous templated widget you see it obviously requires much more work.

#### `refreshRendering`
`refreshRendering` is also a lifecycle method but implemented in `decor/Invalidating`, which `delite/Widget` inherits from.

Its purpose is to observe changes to properties defined on the widget and update the UI. In your web browser developer tools, if
you place a breakpoint in that method and then click the "*click to change title*" button, you'll see this method is called
(because the button adds inline JavaScript to update the element's value property i.e.
`onclick="element.value='New Title'; event.target.disabled=true"`).

If we wanted to see what the old value was (and also display it to the DOM) we can change this method in `./TitleWidget.js` from

```js
refreshRendering: function (props) {
    // if the value change update the display
    if ("value" in props) {
        this._h.innerHTML = this.value;
    }
}
```

to the following:

```js
refreshRendering: function (props) {
    // if the value change update the display
    if ("value" in props) {
        this._h.innerText = "old= '" + props["value"] + "', new='" + this.value + "'";
    }
}
```

Also let's update the `./samples/TitleWidget.html` JavaScript from:

```js
require(["delite/register", "title-package/TitleWidget"], function (register, TitleWidget) {
    register.parse();
});
```
to add a programmatically created widget:

```js
require(["delite/register", "title-package/TitleWidget"], function (register, TitleWidget) {
    register.parse();
    var anotherTitleWidget = new TitleWidget({value : 'another custom element title'});
    // note you must call startup() for programmatically created widgets
    anotherTitleWidget.placeAt(document.body, 'last');
    anotherTitleWidget.startup();
});
```

If not already set, set a breakpoint (via your JavaScript debugger) to the `refreshRendering` method of our custom element module `./TitleWidget.js` and
reload the page.

Notice when you first load the page, this method will be called for each widget, you'll also see that the `value` property of our widget is
contained in the `props` argument of this method.

This is because we're setting the `value` property on the declaratively written widget to `value="The Title"` and setting the value property
on the programmatically written widget to `value : "another custom element title"`.

If you don't set the `value` property of the widget at construction time, the `value` property of our widget is NOT contained in the `props` argument.

Click the 'click to change title button' and the widget will render like:

> <img src='./images/custom_element_old_new_props.png'/>

If you still have a breakpoint set in `refreshRendering` you will see again that the `value` property of our widget is again contained in the `props`
argument.

Update the value `property` of `./TitleWidget.js` to:

```js
value: "The Title",
```

And reload the page. Notice again the `value` property of our widget is NOT contained in the `props` argument. This is because the property value hasn't changed.
The [decor/Invalidating](https://github.com/ibm-js/decor/blob/master/docs/Invalidating.md) documentation explains this behaviour.



## Round up
As you've seen, the basics of `delite` are very easy when building a custom element, keeping in mind we've only touched on some of the capabilities of this project.
We've also touched on some lower level concerns of `delite`.

We'll expand on this in future and discuss more advanced topics in a later tutorial.

## Footnotes

1.  <i name="link1">`delite` was written by the same developers who wrote the [Dojo Toolkit Dijit framework](http://dojotoolkit.org/reference-guide/1.10/dijit).</i>

2.  <i name="link2">For those who used the Dojo Toolkit Dijit framework previously, an important conceptual difference in `delite` is that the widget is the DOM node.
   Dijit widgets instead had a property which referenced the DOM node.</i>

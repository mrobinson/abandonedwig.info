---
layout: post
title: CSS Painting Order
date: 2020-07-03
comments: false
tags: Igalia, Servo
---

How does a browser determine what order to paint content in? A first
guess might be that browsers will paint content in the order that it is
specified in the DOM, which for an HTML page is the order it appears in the
source code of the page.

We can construct a simple example showing that two divs overlap in this
order. We overlap two divs by using relative positioning to move the second
div *out of flow* to where it intersects the first div.

{% highlight html %}
<style>
    .box {
        width: 8ex;
        height: 8ex;
        padding: 0.2ex;
        color: white;
        font-weight: bold;
        text-align: right;
    }

    .a { background: #99DDFF; }
    .b { background: #44BB99; }
    .c { background: #EEDD88; }

    .offset {
        position: relative;
        top: -4ex;
        left: 4ex;
    }
</style>

<div class="box a">A</div>
<div class="offset box b">B</div>
{% endhighlight %}

<style>
    .example {
        margin-left: 5ex;
    }

    .box {
        width: 8ex;
        height: 8ex;
        padding: 0.2ex;
        color: white;
        font-weight: bold;
        text-align: right;
    }

    .a { background: #99DDFF; }
    .b { background: #44BB99; }
    .c { background: #EEDD88; }

    .offset {
        position: relative;
        top: -4ex;
        left: 4ex;
    }
</style>

<div class="example">
    <div class="box a">A</div>
    <div class="offset box b">B</div>
</div>

It seems that our guess was a pretty good guess! I'm sure some of you
are saying, "Hold on! What about `z-index`?" You're right. Using the
`z-index` property, we can override the normal painting order used by the
browser.

{% highlight html %}
<div class="box a">A</div>
<div class="offset box b" style="z-index: -1;">B</div>
{% endhighlight %}

<div class="example">
    <div class="box a">A</div>
    <div class="offset box b" style="z-index: -1;">B</div>
</div>

In this example, the second div in the source is painted before the first
div. We can see that the `z-index`affects the div itself, but does it affect
children as well?

{% highlight html %}
<div class="box a">A</div>
<div class="offset box b" style="z-index: -1;">B
    <div class="c">C</div>
</div>
{% endhighlight %}

<div class="example">
    <div class="box a">A</div>
    <div class="offset box b" style="z-index: -1;">B
        <div class="c">C</div>
    </div>
</div>

It does! What if we try to put our nested child on top of everything using a
`z-index` greater than zero?

{% highlight html %}
    <div class="box a">A</div>
    <div class="offset box b" style="z-index: -1;">B
        <div class="c" style="z-index: 2;">C</div>
    </div>
{% endhighlight %}

<div class="example">
    <div class="box a">A</div>
    <div class="offset box b" style="z-index: -1;">B
        <div class="c" style="z-index: 2;">C</div>
    </div>
</div>

Wait! What's going on here? The `z-index` of the blue div should be `auto` which
means that the used value is zero. The `z-index` of our nested child is 2. Why
isn't the nested child painted on top of the blue div? At this point, it's
appropriate to buy the classic joke "CSS IS AWESOME" mug.

After filling up our new mug with coffee and reading the entirety of the [CSS2
specification](https://drafts.csswg.org/css2/), we realize the answer is that
the our divs are forming something called *stacking contexts*.

## The Stacking Context

We finally managed to determine exactly what was going when we arrived at
[Appendix E: Elaborate description of Stacking
Contexts](https://drafts.csswg.org/css2/zindex.html). Thankfully, we
made a stupidly big cup of coffee since all the good information is
apparently stuffed in the appendices. Appendix E gives us a peak at the
algorithm that browsers use to determine the painting order of content on
the page, including what sorts of properties that affect this painting order.
It turns out that our early guesses were mostly correct, things generally
stack according to the order in the DOM and active z-indices.  Sometimes
though, certain CSS properties applied to elements trigger the creation of
a stacking context which might affect painting order in a way we don't
expect.

We learn from the Appendix E that a stacking context is an atomically
painted collection of page items. What does this mean? To put it
simply, it means that things inside a stacking context are painted
together, as a unit, and that items outside the stacking content will never
be painted between them. Having an active `z-index` is one of the
situations in CSS which triggers the creation of a stacking context. Is
there a way we can adjust our example above so that our the third element
belongs to the same stacking context as the first two elements? The answer
is that we must remove it from the stacking context created by the second
element.

{% highlight html %}
<div class="box a">A</div>
<div class="offset box b" style="z-index: -2;">B</div>
<div class="offset box c" style="z-index: 2; top: -9.5ex; left: 6ex;">C</div>
{% endhighlight %}

<div class="example">
    <div class="box a">A</div>
    <div class="offset box b" style="z-index: -2;">B</div>
    <div class="offset box c" style="z-index: 2; top: -9.5ex; left: 6ex;">C</div>
</div>

It's clear that stacking contexts can impose serious limitation on our
page, so it'd be great to know when we are triggering them. Whether or not
a particular CSS feature triggers the creation of a new stacking context is
defined with that feature, which means the information is spread throughout
quite a few specifications. Helpfully, MDN has a great [list of
situations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/The_stacking_context)
where element create a stacking context. Some notable examples are elements
with an active `z-index`, `position: fixed` and `position: sticky`
elements, and elements with a `transform` or `perspective`.

## Surprising Details

I'm going to level with you. While the stacking context might be a bit
confusing at first, for a browser implementor it makes things a lot
simpler. The stacking context is a handy abstraction over a chunk of the
layout tree which can be processed atomically. In fact, it would be nice if
*more* things created stacking contexts. Rereading the list above you may
notice some unusual exceptions. Some of these exceptions are not "on
purpose," but were just arbitrary decisions made a long time ago.

For me, one of the most surprising exceptions to stacking context creation
is `overflow: scroll`. We know that setting `scroll` for the overflow
property causes all contents that extend past the [padding
edge](https://www.w3.org/TR/css-box-4/#padding-edge) of a
box to be hidden within a scrollable area. What does it mean that they
do not trigger the creation of a stacking context? It means that content
*outside* of a scrollable area can intersect content inside of it. All it
takes is a little bit of work to see this in action:

{% highlight html %}
<style>
    .scrolling {
        overflow: scroll;
        border: 1px solid;
        width: 18ex;
        height: 15ex;
        margin-left: 2ex;
    }

    .scrolling div {
        height: 50ex;
        width: 4ex;
    }

    .scrolling div:nth-child(odd) {
       float: left;
       background: repeating-linear-gradient(
            20deg,
            #EEDD88,
            #EEDD88 10px,
            #44BB99 10px,
            #44BB99 20px
       );
    }

    .scrolling div:nth-child(even) {
       float: left;
       background: repeating-linear-gradient(
            120deg,
            #BBCC33,
            #BBCC33 10px,
            #77AADD 10px,
            #77AADD 20px
       );
       position: relative; /* We must be positioned to have an active z-index. */
       z-index: 2;
       opacity: 0.9;
    }

    .interloper {
        position: relative;
        top: -10ex;
        max-width: 30ex;
        background: #EE8866;;
        z-index: 1;
    }
</style>

<div class="scrolling">
    <div></div>
    <div></div>
    <div></div>
    <div></div>
</div>
<div class="interloper">JUST PASSING THROUGH!</div>
{% endhighlight %}

<style>
    .scrolling {
        overflow: scroll;
        border: 1px solid;
        width: 18ex;
        height: 15ex;
        margin-left: 2ex;
    }

    .scrolling div {
        height: 50ex;
        width: 4ex;
    }

    .scrolling div:nth-child(odd) {
       float: left;
       background: repeating-linear-gradient(
            20deg,
            #EEDD88,
            #EEDD88 10px,
            #44BB99 10px,
            #44BB99 20px
       );
    }

    .scrolling div:nth-child(even) {
       float: left;
       background: repeating-linear-gradient(
            120deg,
            #BBCC33,
            #BBCC33 10px,
            #77AADD 10px,
            #77AADD 20px
       );
       position: relative; /* We must be positioned to have an active z-index. */
       z-index: 2;
       opacity: 0.9;
    }

    .interloper {
        position: relative;
        top: -10ex;
        max-width: 30ex;
        background: #EE8866;;
        z-index: 1;
    }
</style>
<div class="example">
    <div class="scrolling">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
    </div>
    <div class="interloper">JUST PASSING THROUGH!</div>
</div>

Using the power of web design, we've managed wedge the final div between
the contents of the scroll frame. Half of the scrolling content is on top
of the interloper and half is underneath. This probably renders in a
surprising way with the interposed div on top the scrolling area's
scrollbar (if it has one). You can imagine what kind of headaches this
causes for the implementation of scrollable areas in browser engines,
because the children of a particular scroll area might be spread throughout
the layout tree. There's no guarantee that it has any kind of recursive
encapsulation.

CSS's rules often have a reasoned origin, but some of them are just
arbitrary implementation decisions made roughly 20 years ago without the
benefit of hindsight. Rough edges like this stacking context exception
might seldom come into play, but the web is huge and has collected years of
content. There are potentially thousands of pages relying on this behavior
such as lists of 2003's furriest angora rabbits or memorials to someone's
weird obsession with [curb cuts](/blog//2017/11/01/small-things.html). The
architects of the web have chosen not to break those galleries of gorgeous
lagomorphs and has instead opted for maximizing long-term *web
compatibility.*


## Breaking the Rules

Earlier I wrote that nothing from the outside a stacking context can be
painted in between a stacking context's contents. Is that really, really,
really true though? CSS is so huge, there must be at least one exception,
right? I now have a concrete answer to this question and that answer is
"maybe." CSS is full of big hammers and one of the biggest hammers (this is
foreshadowing for a future post) is CSS transformations. This makes sense.
Stacking contexts are all about enforcing order amidst the chaos of the
z-axis, which is the one that extends straight from your heart into your
screen.  Transformed elements can traverse this dimension allowing for
snazzy flipbook effects and also requiring web browsers to gradually become
full 3D compositors. Surely if its possible to break this rule we can do it
with 3D CSS transformations.

{% highlight html %}
<style>
    .transform {
        transform-style: preserve-3d;
        perspective: 500px;
    }

    .transform div {
       text-align: left;
       width: 10ex;
       height: 10ex;
    }

    .transform div.a {
        position: relative;
        left: 5ex;
        top: 2.5ex;
        opacity: 0.9;
        transform: rotateY(1deg) ;
    }

    .transform .b {
        position: relative;
        top: -2.5ex;
        transform: rotateY(2deg)
    }

    .transform div.c {
        position: relative;
        left: 10ex;
        top: -12.5ex;
    }

    .transform div span.bottom {
       position: absolute;
       bottom: 0;
    }

    .transform div span.right {
       position: absolute;
       right: 0;
    }
</style>

<div class="transform" style="transform-style: preserve-3d; perspective: 500px;">
    <div class="box a" style="z-index: 2;">z-index: 2</div>
    <div style="position: relative; z-index: -2;">
        <div class="box b">
            <span class="bottom">z-index: -2</span>
        </div>
        <div class="box c">
            <span class="bottom">z-index: -2</span>
        </div>
    </div>
</div>

{% endhighlight %}

<style>
    .transform {
        transform-style: preserve-3d;
        perspective: 500px;
    }

    .transform div {
       text-align: left;
       width: 10ex;
       height: 10ex;
    }

    .transform div.a {
        position: relative;
        left: 5ex;
        top: 2.5ex;
        opacity: 0.9;
        transform: rotateY(1deg) ;
    }

    .transform .b {
        position: relative;
        top: -2.5ex;
        transform: rotateY(2deg)
    }

    .transform div.c {
        position: relative;
        left: 10ex;
        top: -12.5ex;
    }

    .transform div span.bottom {
       position: absolute;
       bottom: 0;
    }

    .transform div span.right {
       position: absolute;
       right: 0;
    }
</style>

<div class="transform example" style="transform-style: preserve-3d; perspective: 500px;">
    <div class="box a" style="z-index: 2;">z-index: 2</div>
    <div style="position: relative; z-index: -2;">
        <div class="box b">
            <span class="bottom">z-index: -2</span>
        </div>
        <div class="box c">
            <span class="bottom">z-index: -2</span>
        </div>
    </div>
</div>


This was a little complicated, but to summarize: a transformation slightly
rotates some of these stacked elements along the y-axis. The final
rendering depends a lot on your browser, but this seems to work best in
Chrome. Depending on if and how your browser implements *plane-splitting*,
you might see the box with a `z-index` of 2 stack between the two elements
inside of a stacking context with a `z-index` of -2. We broke the cardinal
rule of the stacking context! Take that architects of the web!

Is this exercise useful at all? Almost certainly not. I hope it
was sufficiently weird though!

## Conclusion

Hopefully I'll be back soon to talk about the implementation of this
wonderful nonsense in [Servo](https://servo.org). I want to thank Mozilla
for allowing me to hack on this as part of my work for
[Igalia](https://igalia.com). Servo is a really great way to get involved
in browser development. It's also written in Rust, which is a language that
can help you become a better programmer simply by learning it, so check it
out. Thanks for reading!

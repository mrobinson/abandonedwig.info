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
order. We overlap two divs by giving one of them a negative top margin.

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

    .blue { background: #99DDFF; }

    /* The second div has a negative top margin so that it overlaps
       with the first (blue) div. Also, shift it over to the right
       slightly. */
    .green {
        background: #44BB99;
        margin-left: 3ex;
        margin-top: -6ex;
     }
</style>

<div class="blue box">1</div>
<div class="green box">2</div>
{% endhighlight %}

<style>
    .example {
        margin-left: 5ex;
        margin-bottom: 6ex;
    }

    .box {
        width: 8ex;
        height: 8ex;
        padding: 0.2ex;
        color: white;
        font-weight: bold;
        text-align: right;
    }

    .blue { background: #99DDFF; }

    /* The second div has a negative top margin so that it overlaps
       with the first (blue) div. Also, shift it over to the right
       slightly. */
    .green {
        background: #44BB99;
        margin-left: 3ex;
        margin-top: -6ex;
     }
</style>

<div class="example">
    <div class="blue box"></div>
    <div class="green box"></div>
</div>

It seems that our guess was a pretty good guess! I'm sure some of you
are saying, "Hold on! What about `z-index`?" You're right. Using the
`z-index` property, we can override the normal painting order used by the
browser. We give the green div a `z-index` and make it relatively positioned,
because `z-index` only works on positioned elements. We also add a yellow
child of the green div to see how this affects children. Finally, let's
start labeling each div with its z-index.

{% highlight html %}
<style>
    .yellow {
        margin-left: 3ex;
        background: #EEDD88;
    }
</style>

<div class="blue box">0</div>
<div class="green box" style="position: relative; z-index: -1;">-1
    <div class="yellow box">-1</div>
</div>
{% endhighlight %}

<style>
    .yellow {
        margin-left: 3ex;
        background: #EEDD88;
    }
</style>
<div class="example">
    <div class="blue box">0</div>
    <div class="green box" style="position: relative; z-index: -1;">-1
        <div class="yellow box">-1</div>
    </div>
</div>

In this example, the green div is painted before the blue div, even though it
comes later in the source code. We can see that the `z-index` affects the div
itself and also the yellow child div.  What if we want to now paint the yellow
nested child on top of everything by giving it a large positive `z-index`?

{% highlight html %}
<div class="blue box">0</div>
<div class="green box" style="position: relative; z-index: -1;">-1
    <div class="yellow box" style="position: relative; z-index: 1000;">1000</div>
</div>
{% endhighlight %}

<div class="example">
    <div class="blue box">0</div>
    <div class="green box" style="position: relative; z-index: -1;">-1
        <div class="yellow box" style="position: relative; z-index: 1000;">1000</div>
    </div>
</div>

Wait! What's going on here? The blue div has no `z-index` specified, which
should mean that the value used for its `z-index` is zero. The `z-index` of our
nested yellow child is 1000, yet this div is still painted underneath. Why
isn't the nested child painted on top of the blue div as we might expect?

At this point, it's appropriate we have to buy the classic joke ["CSS IS
AWESOME" mug](https://css-tricks.com/css-is-awesome/), fill it up with coffee,
and read the entirety of the [CSS2
specification](https://drafts.csswg.org/css2/). Suddenly, we understand 
that the answer is that the our divs are forming something called *stacking contexts*.

## The Stacking Context

We determined exactly what was going when we arrived at [Appendix E: Elaborate
description of Stacking Contexts](https://drafts.csswg.org/css2/zindex.html).
Thankfully, we made a stupidly big cup of coffee since all the good information
is apparently stuffed in the appendices. Appendix E gives us a peak at the
algorithm that browsers use to determine the painting order of content on the
page, including what sorts of properties affect this painting order.  It
turns out that our early guesses were mostly correct, things generally stack
according to the order in the DOM and active z-indices.  Sometimes though,
certain CSS properties applied to elements trigger the creation of a stacking
context which might affect painting order in a way we don't expect.

We learn from the Appendix E that a stacking context is an atomically
painted collection of page items. What does this mean? To put it
simply, it means that things inside a stacking context are painted
together, as a unit, and that items outside the stacking content will never
be painted between them. Having an active `z-index` is one of the
situations in CSS which triggers the creation of a stacking context. Is
there a way we can adjust our example above so that the third element
belongs to the same stacking context as the first two elements? The answer
is that we must remove it from the stacking context created by the second
element.

{% highlight html %}
<div class="blue box">0</div>
<div class="yellow box" style="position: relative; z-index: 1000; margin-top: -5ex">1000</div>
<div class="green box" style="position: relative; z-index: -1; margin-left: 6ex;">-1</div>
{% endhighlight %}

<div class="example">
    <div class="blue box">0</div>
    <div class="yellow box" style="position: relative; z-index: 1000; margin-top: -5ex">1000</div>
    <div class="green box" style="position: relative; z-index: -1; margin-left: 6ex;">-1</div>
</div>

Now the yellow div is a sibling of the blue and the green and is painted
on top of both of them, even though it now comes second in the source.

It's clear that stacking contexts can impose strong limitations on the
order our elements are painted, so it'd be great to know when we are triggering
them. Whether or not a particular CSS feature triggers the creation of a new
stacking context is defined with that feature, which means the information is
spread throughout quite a few specifications. Helpfully, MDN has a great [list
of situations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/The_stacking_context)
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
    .scroll-area {
        overflow: scroll;
        border: 3px solid salmon;
        width: 18ex;
        height: 15ex;
        margin-left: 2ex;
    }

    .scroll-area .vertical-bar {
        position: relative; /* We give each bar position: relative so that they can have z-indices. */
        float: left;
        height: 50ex;
        width: 4ex;

        /* A striped background that shows scrolling motion. */
        background: repeating-linear-gradient(
            120deg,
            salmon 0px, salmon 10px,
            orange 10px, orange 20px
       );
    }

    /* Even bars will be on top of the yellow vertical bar due to having a greater z-index. */
    .scroll-area .vertical-bar:nth-child(even) {
        z-index: 4;
        opacity: 0.9;
    }

    .yellow-horizontal-bar {
        margin-top: -10ex;
        margin-bottom: 10ex;
        max-width: 30ex;
        background: #EEDD88;

        /* Raise the horizontal bar above the scrollbar of the scrolling area. */
        position: relative;
        z-index: 2;
    }
</style>

<!-- A scroll area with four vertical bars. -->
<div class="scroll-area">
    <div class="vertical-bar"></div>
    <div class="vertical-bar"></div>
    <div class="vertical-bar"></div>
    <div class="vertical-bar"></div>
</div>

<!-- A div that will thread in between the vertical bars of the scroll area above. -->
<div class="yellow-horizontal-bar">~~JUST PASSING THROUGH~~</div>
{% endhighlight %}

<style>
    .scroll-area {
        overflow: scroll;
        border: 3px solid salmon;
        width: 18ex;
        height: 15ex;
        margin-left: 2ex;
    }

    .scroll-area .vertical-bar {
        position: relative; /* We give each bar position: relative so that they can have z-indices. */
        float: left;
        height: 50ex;
        width: 4ex;

        /* A striped background that shows scrolling motion. */
        background: repeating-linear-gradient(
            120deg,
            salmon 0px, salmon 10px,
            orange 10px, orange 20px
       );
    }

    /* Even bars will be on top of the yellow vertical bar due to having a greater z-index. */
    .scroll-area .vertical-bar:nth-child(even) {
        z-index: 4;
        opacity: 0.9;
    }

    .yellow-vertical-bar {
        margin-top: -10ex;
        margin-bottom: 10ex;
        max-width: 30ex;
        background: #EEDD88;

        /* Raise the vertical bar above the scrollbar of the scrolling area. */
        position: relative;
        z-index: 2;
    }
</style>

<div class="example">
    <!-- A scroll area with four vertical bars. -->
    <div class="scroll-area">
        <div class="vertical-bar"></div>
        <div class="vertical-bar"></div>
        <div class="vertical-bar"></div>
        <div class="vertical-bar"></div>
    </div>

    <!-- A div that will thread in between the vertical bars of the scroll area above. -->
    <div class="yellow-vertical-bar">~~JUST PASSING THROUGH~~</div>
</div>

Using the power of web design, we've managed to wedge the final div between
the contents of the scroll frame. Half of the scrolling content is on top
of the interloper and half is underneath. This probably renders in a
surprising way with the interposed div on top the scrolling area's
scrollbar (if it has one). You can imagine what kind of headaches this
causes for the implementation of scrollable areas in browser engines,
because the children of a particular scroll area might be spread throughout
the layout tree. There's no guarantee that it has any kind of recursive
encapsulation.

CSS's rules often have a reasoned origin, but some of them are just arbitrary
implementation decisions made roughly 20 years ago without the benefit of
hindsight. Rough edges like this stacking context exception might seldom come
into play, but the web is huge and has collected years of content. There are
potentially thousands of pages relying on this behavior such as lists of
[2003's furriest angora
rabbits](https://web.archive.org/web/20031203001627/http://home.pacbell.net/bettychu/2003allbreedbisris/BIS.html)
or memorials to someone's weird obsession with [curb
cuts](/blog//2017/11/01/small-things.html). The architects of the web have
chosen not to break those galleries of gorgeous lagomorphs and has instead
opted for maximizing long-term *web compatibility.*


## Breaking the Rules

Earlier, I wrote that nothing from the outside a stacking context can be
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

Let's take a modified version of one of our examples above. Here we have
three boxes. The last two are inside of a div with a `z-index` of -2, which
means that they are both inside a single stacking context that stacks
underneath the first box.

{% highlight html %}
<style>
    .salmon {
        background: salmon;
        margin-top: -5ex;
        margin-left: 4ex;
    }
</style>

<div class="blue box">0</div>
<div style="position: relative; z-index: -2;">
    <div class="green box">-2</div>
    <div class="salmon box">-2</div>
</div>
{% endhighlight %}

<style>
    .salmon {
        background: salmon;
        margin-top: -5ex;
        margin-left: 4ex;
    }
</style>

<div class="example">
    <div class="blue box">0</div>
    <div style="position: relative; z-index: -2;">
        <div class="green box">-2</div>
        <div class="salmon box">-2</div>
    </div>
</div>

Now we make two modifications to this example. First, we wrap the example in a
new div with a `transform-style` of `preserve-3d`, which will position all
children in 3d space. Finally, we push one of the divs with `z-index` of -2 out
of the screen using a 3d translation.

{% highlight html %}
<div style="transform-style: preserve-3d;">
    <div class="blue box">0</div>
    <div style="position: relative; z-index: -2;">
        <div class="green box">-2</div>
        <div class="salmon box" style="transform: translateZ(50px);">-2</div>
    </div>
</div>
{% endhighlight %}

<div class="example" style="transform-style: preserve-3d;">
    <div class="blue box">0</div>
    <div style="position: relative; z-index: -2;">
        <div class="green box">-2</div>
        <div class="salmon box" style="transform: translateZ(50px);">-2</div>
    </div>
</div>

It's possible that your browser might not render this in the same way, but in
Chrome the div with `z-index` of 0 is rendered in between two divs within the same
stacking context both with `z-index` of -2.

We broke the cardinal rule of the stacking context. Take that architects of the
web! Is this exercise useful at all? Almost certainly not. I hope it was
sufficiently weird though!

## Conclusion

Hopefully I'll be back soon to talk about the implementation of this wonderful
nonsense in [Servo](https://servo.org). I want to thank [Frédéric
Wang](http://frederic-wang.fr/) for input on this post and also Mozilla for
allowing me to hack on this as part of my work for [Igalia](https://igalia.com).
Servo is a really great way to get involved in browser development. It's also
written in Rust, which is a language that can help you become a better
programmer simply by learning it, so check it out.  Thanks for reading!

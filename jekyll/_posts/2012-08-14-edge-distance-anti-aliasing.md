---
layout: post
title: "Edge-distance anti-aliasing"
date: 2012-08-14
comments: false
---

(You might want to go [straight to the demo](/edge-distance-anti-aliasing/demo.html))

Some months ago, I noticed that the [Chromium
compositor](http://src.chromium.org/viewvc/chrome/trunk/src/cc/), the code
which powers Chromium's accelerated compositing implementation (and also
[Aura!](http://code.google.com/p/chromium/wiki/Aura)) was anti-aliasing layer
edges.  This was especially surprising to me since I knew for a fact that my
hardware didn't support [multisample anti-aliasing](http://en.wikipedia.org/wiki/Multisample_anti-aliasing)
yet. Some people from the Chromium graphics team, who are incredibly friendly
and helpful, pointed me to a very clever bit of code they were using to do
edge-distance anti-aliasing for composited layers.

[Aliasing](http://en.wikipedia.org/wiki/Aliasing) can happen when you sample a signal that
has smaller details than your sample size In the case of graphics, it's what happens when
features of the image exist in an area smaller than a pixel. One important feature is the
edge of a piece of geometry, such as the edge of a<br />shape drawn onto the page.  When
you start rotating shapes and projecting with 3D CSS transforms, geometry that before
aligned to pixel boundaries can move to a space between pixel boundaries.

For instance, let's zoom into the edge of triangle that we are rendering. Maybe in this
case it's half of a rotated div.

![A polygon without anti-aliasing](/edge-distance-anti-aliasing/no-antialiasing-final.png "A polygon without anti-aliasing")

If we naively decided the color of every pixel based on whether any of the triangle
covered it at all, we'd end up with a jagged edge.

One thing we could do to make the edge smooth is to determine how much area of the pixel
is covered by the triangle. We could adjust the transparency of the shape color (the alpha
value) by that percentage when painting the pixel. This process is called
<i>anti-aliasing</i> and the percentage that the triangle covers the pixel is called
<i>coverage</i>.

![A polygon with anti-aliasing](/edge-distance-anti-aliasing/antialiasing-final.png "A polygon with anti-aliasing")

Think of all the complicated geometric calculations we'd have to do to figure out the
ratio exactly. Since we have to make these calculations for every pixel up to 60 times per
second (for smooth animations), our rendering would be pretty slow if we actually did
them! Instead, it'd be nice if we could somehow<br />estimate how much of the pixel is
covered and do less work. One approach is to calculate the distance from the pixel to the
edge of the shape. If the pixel is more than one pixel's distance away from the edge, we
know that we should not paint the triangle color at all. If the pixel is closer than one
one pixel's distance from the edge, we should paint the triangle color, but reduced by
some transparency factor.<br /><br />Luckily, OpenGL can run a little program for every
pixel [<sup>1</sup>](#fn1) it paints. This program is called a fragment shader. We can write up
this logic in the fragment shader and change the triangle color for every pixel.<br /><br
/>Perhaps some of those reading who have had experience with OpenGL may notice here that
this isn't going to work as I've described it. OpenGL already does something like the
naive approach I talked about first. Some pixels (the ones OpenGL decided should be
painted with the triangle color), will be properly anti-aliased, but many pixels will not
be painted at all.  For instance, if the coverage of the pixel is only 20% and OpenGL
decided not to paint it, we wouldn't even have a chance to determine how far it was from
the triangle edge, because the fragment shader wouldn't run for those missing pixels.

Let's "trick" OpenGL into painting more pixels than it would otherwise. A simple way to do
this is to just make the triangle a little bit bigger. In fact, we can expand all the
edges by less than pixel's distance and OpenGL will paint all those missing pixels. Now we
have smooth edges!

![Expanding the drawing area](/edge-distance-anti-aliasing/antialiasing-final-expanded.png "Expanding the drawing area")

I spent some time implementing this for the TextureMapper accelerated
compositor (and thus WebKitGTK+), so it's not just the Chromium compositor that
has this feature any longer.  For me it makes a huge difference in the quality
of 3D CSS content. For the purposes of demonstration, I've also reimplemented
it in WebGL, so if you have a modern browser you can [see it in
action](/edge-distance-anti-aliasing/demo.html).

<a href="/edge-distance-anti-aliasing/demo.html"><img alt="A screenshot of the edge-distance anti-aliasing demo" src="/edge-distance-anti-aliasing/demo.png"/></a>

<ol class="footnotes">
    <li><a name="fn1"/> Fragments and pixels are actually different things, but I'm glossing over this difference for the sake of simplicity.</li>
</ol>

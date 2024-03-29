---
layout: post
title: "Looking back at the WebKit GTK hackfest"
date: 2010-01-23
comments: false
tags:
 - Igalia
 - WebKit
---

<div class='post'> In December, I attended the WebKit GTK hackfest which has been <a href="http://blogs.gnome.org/xan/2009/12/21/webkitgtk-hackfest-day-g_maxint/">summed</a>
  <a href="http://arstechnica.com/open-source/news/2010/01/webkitgtk-hackfest-improves-html-renderer-for-gnome-apps.ars">up</a>
  <a href="http://danw.mysterion.org/2010/01/webkitgtk-hackfest/">nicely</a> in <a href="http://blog.kov.eti.br/?p=100">many</a>
  <a href="http://www.twotoasts.de/index.php?/archives/25-Back-from-the-WebKitGTK+-hackfest.html">other</a>
  <a href="http://base-art.net/Articles/112/">places</a>. Some of the things I worked on (apart from getting my luggage): <br />
  <br />With the closing of <a href="https://bugs.webkit.org/show_bug.cgi?id=20736">20736</a> WebKit GTK should now properly support windows with RGBA colormaps. This means that WebKit GTK can now be used to create nice desktop widgets or non-rectangular applications without worrying about BadMatch errors. Surprisingly non-rectangular windows is one of the most requested features for <a href="http://www.appcelerator.com">Titanium</a> and we now support it on OS X, Linux and Windows via the <tt>transparent-background</tt> property in tiapp.xml. <br />
  <br />
    <img style="display:block; margin:0px auto 10px; text-align:center;" src="/images/2010-01-23-looking-back-at-webkit-gtk-hackfest/rgba-colormaps-704760.png" border="0" alt="" />
  <br />
  <br />The first big part of my <a href="https://bugs.webkit.org/show_bug.cgi?id=30623">clipboard / drag-and-drop reorganization</a> also landed. Once I get the remaining patches together, DOM DataTransfer access to WebKit GTK clipboard and drag-and-drop data will work properly. With luck one day you'll be able to drop your photos and videos onto your web browser and have them upload seamlessly. <br />
  <br />The hackfest itself was in A Coru&ntilde;a, a picturesque Galician city right on the coast of the Atlantic (which I managed to call the <i>Pacific</i> once, against all odds). I also had a rather abrupt introduction to the bounty of European languages &mdash; Spain has four recognized regional languages apart from Spanish (Castilian). <br />
  <br />
  <div style="font-size:small;text-align:center">
    <br />
    <a href="http://www.flickr.com/photos/mariosp/4201554598/in/set-72157622899055111">
      <img style="display:block; margin:0px auto 10px; text-align:center;cursor:pointer; cursor:hand;width: 500px; height: 375px;" src="http://farm3.static.flickr.com/2773/4201554598_3fea667df2.jpg" border="0" alt="" />
    </a>
    <br />
    <a href="http://blogs.gnome.org/xan/">Xan</a> and me, probably trying to convince him that drag-and-drop is the future. <br />
  </div>
  <br />On a personal note, the hackfest solidified my love for open source software. I want to keep doing this, however possible. <a href="http://neugierig.org/">Evan Martin</a> made a really good point about open source at some point during the hackfest. He said that people sometimes think that being open source means that you can simply host an archive of your source code somewhere. There is more to it though, including having an open and active community and understanding and responding to your users. Some of this is just good software development practice, but being open source requires doing even more work to open the development process. <br />
  <br />One important aspect of this work is having community discussions and allowing the community to help make decisions. One look at the WebKit development mailing list shows this working. There are many interests tied up with WebKit and some of them are direct competitors, yet somehow they manage to coordinate development on a humongous project. LWN.net recently posted a <a href="http://lwn.net/Articles/370157/">great article related to this topic</a>, which I think exemplifies what not to do.
</div>

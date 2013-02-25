<?php
header("HTTP/1.1 301 Moved Permanently");

if ($_REQUEST['alt'] == 'rss') {
    header("Location: http://abandonedwig.info/blog/rss.xml");
} else {
    header("Location: http://abandonedwig.info/blog/atom.xml");
}
?>

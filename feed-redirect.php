<?php
header("HTTP/1.1 301 Moved Permanently");

if (isset($_REQUEST['alt']) && $_REQUEST['alt'] == 'rss') {
    header("Location: http://abandonedwig.info/blog/rss.xml");
} else {
    header("Location: http://abandonedwig.info/blog/atom.xml");
}
?>

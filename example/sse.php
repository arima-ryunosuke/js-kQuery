<?php
header("X-Accel-Buffering: no");
header("Content-Type: text/event-stream");
header("Cache-Control: no-cache");

$counter = 1;
while ($counter++ < 10 && !connection_aborted()) {
    echo "event: ping\n";
    echo "data: pong\n\n";

    $curDate = date('X-m-d\\TH:i:sP');
    echo "data: This is a message at time $curDate\n\n";

    while (ob_get_level() > 0) {
        ob_end_flush();
    }
    flush();

    sleep(rand(1, 5));
}

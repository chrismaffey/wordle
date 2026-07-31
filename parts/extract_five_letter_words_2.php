<?php

$dir = scandir('dictinbits');
$out= array();
foreach ($dir as $d) {
    if ($d == '.' || $d == '..') {
        continue;
    }

    $f = fopen('dictinbits/'.$d,'r');


    while($line = fgets($f)) {

        $line = preg_replace("/[^a-z\ ]/i", "", trim(strtolower($line)));
        $stuff = explode(' ',$line);
        $word = $stuff[0];
        if (strlen($word) != 5) {
            continue;
        }

        array_shift($stuff);
        $description = implode(' ',$stuff);

        $out[$word] = $description;


    }
    fclose($f);
}

print_r(sizeof($out));

file_put_contents("five2.json",json_encode($out));

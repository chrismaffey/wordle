<?php

$f = fopen('dictionary.csv','r');

$out= array();
while($line = fgetcsv($f)) {
    list($word,$type,$description) = $line;
    $word = trim($word);
    if (strlen($word) != 5) {
        continue;
    }
    $word = strtolower($word);
    if (preg_replace("/[^a-z]/i", "", $word) != $word) {
        continue;
    }
    if (!isset($out[$word])) {
        $out[$word] = '';
    } else {
        $out[$word] .= "\n";
    }
    $out[$word] .= $type . ' ' . $description;


}
fclose($f);

file_put_contents("five.json",json_encode($out));

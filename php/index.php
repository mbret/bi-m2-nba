<?php

require 'goutte.phar';

use Goutte\Client;

$client = new Client();
$handle = fopen("links.txt", "r");
$res ="";
if ($handle) {
    while (($line = fgets($handle)) !== false) {
        $crawler = $client->request('GET', trim($line));
        $res .= $crawler->filter('table.margin_top.small_text tr:nth-child(2) td:nth-child(2)')->first()->text()."\n";
		/*$crawler->filter('table.margin_top.small_text tr:nth-child(2) td:nth-child(2)')->each(function ($node) {
		    $res .= $node->text()."\n";
		    print($node->text());
		    break;
		});*/
		print(".");
    }
    $fp = fopen('affluence.txt', 'a');
	fwrite($fp, $res);
	fclose($fp);
	print("Finish");
} else {
    print("error");
} 
fclose($handle);





<?php
if(empty($_GET['q']) || !preg_match('%^https://[^\.]+\.deviantart\.com/%',$_GET['q'])) {http_response_code(400); exit();}

$context = stream_context_create(array('http'=>array('method'=>"GET",'header'=>"Accept-language: en\r\n"."User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:106.0) Gecko/20100101 Firefox/106.0\r\n"),'ssl'=>array('verify_peer_name'=>false,'verify_peer'=>false)));

$x = file_get_contents($_GET['q'],false,$context);
if(!$x) {http_response_code(406); exit();}
$n = strpos($x,'DeviantArt://deviation/');
if(!$n) {http_response_code(406); exit();}
echo substr($x,$n+23,36);
?>

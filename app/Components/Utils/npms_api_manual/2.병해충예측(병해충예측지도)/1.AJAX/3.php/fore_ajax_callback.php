<?
header("Content-type: application/xml; charset=utf-8");

$daurl = 'http://ncpms.rda.go.kr/npmsAPI/service?' . $_SERVER["QUERY_STRING"] . '&serviceType=AA001';

$handle = fopen($daurl, "r");

$xml = "";

if ($handle) {
    while (!feof($handle)) {
        $buffer = fgets($handle, 4096);
        $xml .= $buffer;
    }
    fclose($handle);
}

echo $xml;

?>
<html>
<head>
<meta http-dquiv="Content-Type" content="text/html" charset="utf-8">
<script type='text/javascript'>

//이전화면으로 이동
function fncBeforePage(){
	with(document.apiForm){
		method="get";
		action = "dgnss2.php";
		target = "_self";
		submit();
	}
}

</script>
</head>

<body>
<form name="apiForm">
<input type="hidden" name="startPoint"/>
<input type="hidden" name="bfStartPoint" value="<?=$_REQUEST["bfStartPoint"]?>"/>
<input type="hidden" name="cropSectionCode" value="<?=$_REQUEST["cropSectionCode"]?>"/>
<input type="hidden" name="cropSectionName" value="<?=$_REQUEST["cropSectionName"]?>"/>
<input type="hidden" name="cropCode" value="<?=$_REQUEST["cropCode"]?>"/>
<input type="hidden" name="cropName" value="<?=$_REQUEST["cropName"]?>"/>


<?
	include "XMLparse.php"; //XML UTIL

	$apiKey = "";//apiKey - NCPMS에서 신청 후 승인되면 확인 가능
	
	$serviceCode = "SVC10"; // 잡초 상세조회의 서비스코드(상세한 내용은 Open API 이용안내 참조)
	

	//XML 받을 URL 생성
	$parameter = "apiKey=" . $apiKey;
	$parameter .= "&serviceCode=" ;
	$parameter .= $serviceCode;
	$parameter .= "&weedsKey=" ;
	$parameter .= $_REQUEST["pestKey"];

	$url = "http://ncpms.rda.go.kr/npmsAPI/service?" . $parameter; 

	//XML Parsing
	$xml = file_get_contents($url);
	$parser = new XMLParser($xml);
	$parser->Parse();
	$doc = $parser->document;

	//기본정보
	$buildTime = $parser->document->buildtime[0]->tagData;//생성시간
	$totalCount = $parser->document->totalcount[0]->tagData;//전체 갯수
	$startPoint = $parser->document->startpoint[0]->tagData;//시작지점
	$displayCount = $parser->document->displaycount[0]->tagData;//출력갯수
	$errorCode = $parser->document->errorcode[0]->tagData;//에러코드(에러발생시에만 생성)
	$errorMsg = $parser->document->errormsg[0]->tagData;//에러메시지(에러발생시에만 생성)

?>

<?	if(!empty($errorCode)){	?>
		농촌진흥청 국가농작물 관리시스템 OpenAPI 호출 시 장애가 발생하였습니다.<br/>잠시후에 다시 이용하십시오.
		<br/>
		<?=$errorMsg?>
<?	}else{

		$weedsKorName = $parser->document->weedskorname[0]->tagData;
		$weedsScientificName = $parser->document->weedsscientificname[0]->tagData;
		$weedsFamily = $parser->document->weedsfamily[0]->tagData;
		$weedsJpnName = $parser->document->weedsjpnname[0]->tagData;
		$weedsEngName = $parser->document->weedsengname[0]->tagData;
		$weedsShape = $parser->document->weedsshape[0]->tagData;
		$weedsEcology = $parser->document->weedsecology[0]->tagData;
		$weedsHabitat = $parser->document->weedshabitat[0]->tagData;
		$literature = $parser->document->literature[0]->tagData;
?>
		<table  border="1" cellspacing="0" cellpadding="0">
			<colgroup>
				<col width="20%">
				<col width="*">
			</colgroup>
			<tr>
				<td>잡초명</td>
				<td><?=$weedsKorName?></td>
			</tr>
			<tr>
				<td>잡초학명</td>
				<td><?=$weedsScientificName?></td>
			</tr>
			<tr>
				<td>과명</td>
				<td><?=$weedsFamily?></td>
			</tr>
			<tr>
				<td>잡초일문명</td>
				<td><?=$weedsJpnName?></td>
			</tr>
			<tr>
				<td>잡초영문명</td>
				<td><?=$weedsEngName?></td>
			</tr>
			<tr>
				<td>형태</td>
				<td><?=$weedsShape?></td>
			</tr>
			<tr>
				<td>생태</td>
				<td><?=$weedsEcology?></td>
			</tr>
			<tr>
				<td>서식지</td>
				<td><?=$weedsHabitat?></td>
			</tr>
			<tr>
				<td>참고문헌</td>
				<td><?=$literature?></td>
			</tr>

		</table>
		<br/>
		<br/>

	<?if(count($parser->document->imagelist[0]->item)>0){?>
		&gt; 병 이미지
		<table  border="1" cellspacing="0" cellpadding="0">

		<?foreach($parser->document->imagelist[0]->item as $item){?>
			<tr>
				<td><?=$item->imagetitle[0]->tagData?></td>
				<td><img src="<?=$item->image[0]->tagData?>" width="320px" height="300px"/></td>
			</tr>
		<?}?>
		</table>
	<?}?>

<?}?>
<br/>
<input type="button" onclick="javascript:location.href='dgnss.php'" value="처음화면으로"/>
<input type="button" onclick="javascript:fncBeforePage();" value="이전화면으로"/>
</form>
</body>
</html>
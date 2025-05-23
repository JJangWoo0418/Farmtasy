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

//천적곤충으로 이동
function fncGoEnemy(key){
	with(document.apiForm){
		insectKey.value = key;
		method="get";
		action = "dgnss3_3.php";
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
<input type="hidden" name="partName" value="<?=$_REQUEST["partName"]?>"/>
<input type="hidden" name="categoryCode" value="<?=$_REQUEST["categoryCode"]?>"/>
<input type="hidden" name="pestName" value="<?=$_REQUEST["pestName"]?>"/>
<input type="hidden" name="insectKey" value=""/>

<?
	include "XMLparse.php"; //XML UTIL

	$apiKey = "";//apiKey - NCPMS에서 신청 후 승인되면 확인 가능
	
	$serviceCode = "SVC08"; // 곤충상세조회의 서비스코드(상세한 내용은 Open API 이용안내 참조)
	

	//XML 받을 URL 생성
	$parameter = "apiKey=" . $apiKey;
	$parameter .= "&serviceCode=" ;
	$parameter .= $serviceCode;
	$parameter .= "&insectKey=" ;
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

		$insectOrder = $parser->document->insectorder[0]->tagData;
		$insectGenus = $parser->document->insectgenus[0]->tagData;
		$insectFamily = $parser->document->insectfamily[0]->tagData;
		$insectSpecies = $parser->document->insectspecies[0]->tagData;
		$insectSpeciesKor = $parser->document->insectspecieskor[0]->tagData;
		$insectSubspecies = $parser->document->insectsubspecies[0]->tagData;
		$insectSubgenus = $parser->document->insectsubgenus[0]->tagData;
		$insectAuthor = $parser->document->insectauthor[0]->tagData;
		$authYear = $parser->document->authyear[0]->tagData;
		$ecologyInfo = $parser->document->ecologyinfo[0]->tagData;
		$wrongedCrop = $parser->document->wrongedcrop[0]->tagData;
		$shapeInfo = $parser->document->shapeinfo[0]->tagData;
		$quarantineInfo = $parser->document->quarantineinfo[0]->tagData;
?>

		<table  border="1" cellspacing="0" cellpadding="0">
			<colgroup>
				<col width="20%">
				<col width="*">
			</colgroup>
			<tr>
				<td>목명</td>
				<td><?=$insectOrder?></td>
			</tr>
			<tr>
				<td>속명</td>
				<td><?=$insectGenus?></td>
			</tr>
			<tr>
				<td>과명</td>
				<td><?=$insectFamily?></td>
			</tr>
			<tr>
				<td>종명</td>
				<td><?=$insectSpecies?></td>
			</tr>
			<tr>
				<td>한국종명</td>
				<td><?=$insectSpeciesKor?></td>
			</tr>
			<tr>
				<td>아종명</td>
				<td><?=$insectSubspecies?></td>
			</tr>
			<tr>
				<td>아속명</td>
				<td><?=$insectSubgenus?></td>
			</tr>
			<tr>
				<td>명명자</td>
				<td><?=$insectAuthor?></td>
			</tr>
			<tr>
				<td>명명년도</td>
				<td><?=$authYear?></td>
			</tr>
			<tr>
				<td>생태정보</td>
				<td><?=$ecologyInfo?></td>
			</tr>
			<tr>
				<td>가해작물</td>
				<td><?=$wrongedCrop?></td>
			</tr>
			<tr>
				<td>형태정보</td>
				<td><?=$shapeInfo?></td>
			</tr>
			<tr>
				<td>검역정보</td>
				<td><?=$quarantineInfo?></td>
			</tr>
		</table>
		<br/>
		<br/>

	<?if(count($parser->document->imagelist[0]->item)>0){?>
		&gt; 곤충 이미지
		<table  border="1" cellspacing="0" cellpadding="0">

		<?foreach($parser->document->imagelist[0]->item as $item){?>
			<tr>
				<td><?=$item->imagetitle[0]->tagData?></td>
				<td><img src="<?=$item->image[0]->tagData?>" width="320px" height="300px"/></td>
			</tr>
		<?}?>
		</table>
	<?}?>

	<br/>
	<br/>
	<?if(count($parser->document->enemyinsectlist[0]->item)>0){?>
		&gt; 천적곤충 정보
		<table  border="1" cellspacing="0" cellpadding="0">
		<colgroup>
			<col width="15%">
			<col width="30%">
			<col width="*">
		</colgroup>
		<tr>
			<th>사진정보</th>
			<th>목/과</th>
			<th>국명(학명)</th>
		</tr>
		<?foreach($parser->document->enemyinsectlist[0]->item as $item){?>
			<tr>
				<td><img src="<?=$item->enemyimage[0]->tagData?>" width="120px" height="80px"/></td>
				<td><?=$item->enemyinsectorder[0]->tagData?>/<?=$item->enemyinsectfamily[0]->tagData?></td>
				<td><a href="javascript:fncGoEnemy('<?=$item->insectkey[0]->tagData?>');"><?=$item->enemyinsectspecieskor[0]->tagData?>(<?=$item->enemyinsectspecies[0]->tagData?>)</a></td>
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
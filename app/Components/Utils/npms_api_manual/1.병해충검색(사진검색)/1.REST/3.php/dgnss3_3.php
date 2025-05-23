<html>
<head>
<meta http-dquiv="Content-Type" content="text/html" charset="utf-8">
<script type='text/javascript'>

//해충화면으로 이동
function fncSvc07Dtl(key){
	with(document.apiForm){
		method="get";
		pestKey.value = key;
		action = "dgnss3_1.php";
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
<input type="hidden" name="pestKey" value=""/>

<?
	include "XMLparse.php"; //XML UTIL

	$apiKey = "";//apiKey - NCPMS에서 신청 후 승인되면 확인 가능
	
	$serviceCode = "SVC15"; // 천적곤충상세조회의 서비스코드(상세한 내용은 Open API 이용안내 참조)
	

	//XML 받을 URL 생성
	$parameter = "apiKey=" . $apiKey;
	$parameter .= "&serviceCode=" ;
	$parameter .= $serviceCode;

	if($_REQUEST["insectKey"]!=NULL){
		$parameter .= "&insectKey=";
		$parameter .= $_REQUEST["insectKey"];
	}else{
		$parameter .= "&insectKey=";
		$parameter .= $_REQUEST["pestKey"];
	}

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

		$insectSpeciesKor = $parser->document->insectspecieskor[0]->tagData;
		$outsideDistribution = $parser->document->outsidedistribution[0]->tagData;
		$domesticDistribution = $parser->document->domesticdistribution[0]->tagData;
		$lifeCycle = $parser->document->lifecycle[0]->tagData;
		$utilizationMethod = $parser->document->utilizationmethod[0]->tagData;
		$examinResult = $parser->document->examinresult[0]->tagData;
		$etcCrop = $parser->document->etccrop[0]->tagData;
		$cropName = $parser->document->cropname[0]->tagData;
?>

		<table  border="1" cellspacing="0" cellpadding="0">
			<colgroup>
				<col width="20%">
				<col width="*">
			</colgroup>
			<tr>
				<td>곤충한국종명</td>
				<td><?=$insectSpeciesKor?></td>
			</tr>
			<tr>
				<td>국외분포</td>
				<td><?=$outsideDistribution?></td>
			</tr>
			<tr>
				<td>국내분포</td>
				<td><?=$domesticDistribution?></td>
			</tr>
			<tr>
				<td>생활사</td>
				<td><?=$lifeCycle?></td>
			</tr>
			<tr>
				<td>이용방법</td>
				<td><?=$utilizationMethod?></td>
			</tr>
			<tr>
				<td>시험결과</td>
				<td><?=$examinResult?></td>
			</tr>
			<tr>
				<td>이용작물</td>
				<td><?=$cropName?></td>
			</tr>
			<tr>
				<td>기타작물</td>
				<td><?=$etcCrop?></td>
			</tr>
		</table>
		<br/>
		<br/>

	<?if(count($parser->document->targetvermin[0]->item)>0){?>
		&gt; 대상해충
		<table  border="1" cellspacing="0" cellpadding="0">
		<colgroup>
			<col width="12%">
			<col width="30%">
			<col width="30%">
			<col width="*">
		</colgroup>
		<tr>
			<th>사진정보</th>
			<th>목/과</th>
			<th>국명(학명)</th>
			<th>피해작물</th>
		</tr>
		<?foreach($parser->document->targetvermin[0]->item as $item){?>
			<tr>
				<td><img src="<?=$item->targetimage[0]->tagData?>" width="120px" height="80px"/></td>
				<td><?=$item->targetinsectorder[0]->tagData?>/<?=$item->targetinsectfamily[0]->tagData?></td>
				<td><?=$item->targetinsectspecieskor[0]->tagData?>(<?=$item->targetinsectgenus[0]->tagData?> <?=$item->targetinsectspecies[0]->tagData?>)</td>
				<td><?=$item->targetcroplink[0]->tagData?></td>

			</tr>
		<?}?>
		</table>
	<?}?>

	
<?}?>
<br/>
<input type="button" onclick="javascript:history.back();" value="이전화면으로"/>
</form>
</body>
</html>
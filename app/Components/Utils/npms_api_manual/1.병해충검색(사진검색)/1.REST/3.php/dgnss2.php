<html>
<head>
<meta http-dquiv="Content-Type" content="text/html" charset="utf-8">
<script type='text/javascript'>

//페이지 이동
function fncGoPage(start){
	with(document.apiForm){
		startPoint.value = start;
		method="get";
		action = "dgnss2.php";
		target = "_self";
		submit();
	}
}

//다음화면으로 이동
function fncNextPage(key, cName, start){
	with(document.apiForm){
		pestKey.value = key;
		bfStartPoint.value = start;
		method="get";
		switch(cName){
		case "해충생태":action = "dgnss3_1.php";break;
		case "곤충":action = "dgnss3_2.php";break;
		case "천적곤충":action = "dgnss3_3.php";break;
		case "병생태":action = "dgnss3_4.php";break;
		case "잡초":action = "dgnss3_5.php";break;
		}
		target = "_self";
		submit();
	}
}

//이전화면으로 이동
function fncBeforePage(){
	with(document.apiForm){
		method="get";
		action = "dgnss1.php";
		target = "_self";
		submit();
	}
}

//검색
function fncSearch(start){
	with(document.apiForm){
		startPoint.value = start;
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
<input type="hidden" name="pestKey"/>

<?
	include "XMLparse.php"; //XML UTIL

	$apiKey = "";//apiKey - NCPMS에서 신청 후 승인되면 확인 가능
	
	$serviceCode = "SVC13"; // 사진검색 3의 서비스코드(상세한 내용은 Open API 이용안내 참조)
	

	//XML 받을 URL 생성
	$parameter = "apiKey=" . $apiKey;
	$parameter .= "&serviceCode=" ;
	$parameter .= $serviceCode;

	if($_REQUEST["cropSectionCode"]!=NULL && $_REQUEST["cropSectionCode"] == "6"){	//잡초인경우
		$parameter .= "&cropSectionCode=";
		$parameter .= $_REQUEST["cropSectionCode"];
	}else{																			//잡초가 아닌 경우
		$parameter .= "&cropCode=";
		$parameter .= $_REQUEST["cropCode"];
	}


	//검색조건
	if($_REQUEST["categoryCode"]!=NULL){
		$parameter .= "&categoryCode=";
		$parameter .= $_REQUEST["categoryCode"];
	}
	
	if($_REQUEST["partName"]!=NULL){
		$parameter .= "&partName=";
		$parameter .= urlencode($_REQUEST["partName"]);
	}

	if($_REQUEST["pestName"]!=NULL){
		$parameter .= "&pestName=";
		$parameter .= urlencode($_REQUEST["pestName"]);
	}

	//페이지 이동 처리
	if($_REQUEST["startPoint"] != NULL){
		$parameter .= "&startPoint=";
		$parameter .= $_REQUEST["startPoint"];
	}else if($_REQUEST["bfStartPoint"] != NULL){
		$parameter .= "&startPoint=";
		$parameter .= $_REQUEST["bfStartPoint"];
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
<?	}else{?>
	home &gt; <?=urldecode($_REQUEST["cropSectionName"])?>
	<?if($_REQUEST["cropName"]!=null && $_REQUEST["cropName"]!= "null"){?>&gt; <?=urldecode($_REQUEST["cropName"])?><?}?>
	<br/>
	<br/>


	검색
	<br/>
	<?$partName = $_REQUEST["partName"];?>
	<?$categoryCode = $_REQUEST["categoryCode"];?>

	<?if($_REQUEST["cropSectionCode"]!=NULL && $_REQUEST["cropSectionCode"] != "6"){//잡초가 아닌 경우의 검색조건?>
		<input name="categoryCode" value="pest"  type="radio" <?=$_REQUEST["categoryCode"]==NULL||$_REQUEST["categoryCode"]=="pest"?"checked":""?> onclick="fncSearch('<?=$startPoint?>');"/>병/해충/천적곤충
		<input name="categoryCode" value="insect"  type="radio" <?=$_REQUEST["categoryCode"]!=NULL&&$_REQUEST["categoryCode"]=="insect"?"checked":""?> onclick="fncSearch('<?=$startPoint?>');"/>곤충


		<?if($_REQUEST["categoryCode"]==NULL || $_REQUEST["categoryCode"]=="pest"){?>
			<select name="partName" onchange="fncSearch('<?=$startPoint?>');"> 
				<option value="">::전체::</option>
				<option value="유묘" <?=$partName=="유묘"?"selected":""?>>유묘</option>
				<option value="잎" <?=$partName=="잎"?"selected":""?>>잎</option>
				<option value="뿌리" <?=$partName=="뿌리"?"selected":""?>>뿌리</option>
				<option value="줄기" <?=$partName=="줄기"?"selected":""?>>줄기</option>
				<option value="가지" <?=$partName=="가지"?"selected":""?>>가지</option>
				<option value="열매" <?=$partName=="열매"?"selected":""?>>열매</option>
				<option value="꽃" <?=$partName=="꽃"?"selected":""?>>꽃</option>
				<option value="기타" <?=$partName=="기타"?"selected":""?>>기타</option>
			</select> 
		<?}else{?>
			<select name="partName" onchange="fncSearch('<?=$startPoint?>');"> 
				<option value="">::전체::</option>
				<option value="알" <?=$partName=="알"?"selected":""?>>알</option>
				<option value="번데기" <?=$partName=="번데기"?"selected":""?>>번데기</option>
				<option value="유충" <?=$partName=="유충"?"selected":""?>>유충</option>
				<option value="성충" <?=$partName=="성충"?"selected":""?>>성충</option>
				<option value="기타" <?=$partName=="기타"?"selected":""?>>기타</option>
			</select> 
		<?}?>
	<?}else{//잡초인 경우의 검색조건?>

		잡초명 : <input type="text" name="pestName" value="<?=$_REQUEST["pestName"]?>">
        생육단계 : 
			<select name="categoryCode"> 
				<option value="">::전체::</option>
				<option value="18601" <?=$categoryCode=="18601"?"selected":""?>>유묘기</option>
				<option value="18602" <?=$categoryCode=="18602"?"selected":""?>>생육초기</option>
				<option value="18603" <?=$categoryCode=="18603"?"selected":""?>>생육중기</option>
				<option value="18604" <?=$categoryCode=="18604"?"selected":""?>>개화기</option>
				<option value="18605" <?=$categoryCode=="18605"?"selected":""?>>결실기</option>
			</select> 
        특징부위 : 
			<select name="partName"> 
				<option value="">::전체::</option>
				<option value="18701" <?=$partName=="18701"?"selected":""?>>잎</option>
				<option value="18702" <?=$partName=="18702"?"selected":""?>>뿌리</option>
				<option value="18703" <?=$partName=="18703"?"selected":""?>>줄기</option>
				<option value="18704" <?=$partName=="18704"?"selected":""?>>꽃</option>
				<option value="18705" <?=$partName=="18705"?"selected":""?>>열매</option>
			</select> 
			<input type="button" value="검색" onclick="fncSearch('<?=$startPoint?>');"/>
	<?}?>


		<table  border="0" cellspacing="0" cellpadding="0">
		<?if(count($parser->document->list[0]->item) == 0){?>
			<tr>
				<td width="100%" valign="top" style="padding-top:12px;">조회한 정보가 없습니다.</td>
			</tr> 
		<?}else{

				$cnt = 0;
				foreach($parser->document->list[0]->item as $item){
					
					$thumbImg = $item->thumbimg[0]->tagData;//이미지 URL
					$pestKey = $item->pestkey[0]->tagData; //병/해충/잡초코드(상세조회를 위한 키값)
					$pestName = $item->pestname[0]->tagData; //병/해충/잡초명
					$category = $item->category[0]->tagData;//병/해충/잡초 구분
		?>


			<?if( ($cnt%4) == 0){ ?><!-- 한줄에 4개씩 -->
				<tr>
			<?}?>

				  <td width="25%" valign="top" style="padding-top:12px;text-align:center;"> 
				  
					<a href="javascript:fncNextPage('<?=$pestKey?>','<?=$category?>','<?=$startPoint?>');">
						<img src="<?=$thumbImg?>" width="100px" height="85px" border="0" alt="" style="border:1px #CCC solid;  padding:10px "   />
					</a>
					<br/>
					<span style="padding-top:5px;letter-spacing: -1px; word-spacing: 0px;">
						<a href="javascript:fncNextPage('<?=$pestKey?>','<?=$category?>','<?=$startPoint?>');" style="text-align:center;"><?=$pestName?></a> 
					</span>								
				  </td>
			<?if( ($cnt%4) == 3){ ?>
				</tr>
			<?}?>
			<?
					$cnt += 1;				
				}
			}
			?>
			  </table>


<br/>
<?
//페이징 처리 시작
	$pageGroupSize = 10;
	$pageSize = 0;

	$pageSize = (int)($displayCount);
	if($pageSize==0) $pageSize=10;
	
	$start = (int)$startPoint; 
	if($start==0)$start=1;

	$currentPage = (int)ceil((double)$start / (double)$pageSize);
	
	$startRow = ($currentPage -1) * $pageSize +1;//한 페이지의 시작글 번호 
	$endRow = $currentPage * $pageSize;//한 페이지의 마지막 글번호         

	$count = (int)$totalCount;
	$number=0;

	$number=$count-($currentPage-1)*$pageSize;//글목록에 표시할 글번호                                                                  
		

    
	//페이지그룹의 갯수                                                                                                             
	//ex) pageGroupSize가 3일 경우 '[1][2][3]'가 pageGroupCount 개 만큼 있다.                                                       
	$pageGroupCount = $count/($pageSize*$pageGroupSize);

	//페이지 그룹 번호                                                                                                              
	//ex) pageGroupSize가 3일 경우  '[1][2][3]'의 페이지그룹번호는 1 이고  '[2][3][4]'의 페이지그룹번호는 2 이다.                   
	$numPageGroup = (int)ceil((double)$currentPage/$pageGroupSize);



	if($count > 0){
		$pageCount = $count / $pageSize + ( $count % $pageSize == 0 ? 0 : 1);
		$startPage = $pageGroupSize*($numPageGroup-1)+1;
		$endPage = $startPage + $pageGroupSize-1;
		$pageNo = 0;
		$startPnt = 0;

		if($endPage > $pageCount){
			$endPage = $pageCount;
		}		

		if($numPageGroup > 1){
			$pageNo = ($numPageGroup-2)*$pageGroupSize+1;
			$startPnt = (($pageNo-1)*$pageSize)+1;
			echo "<a href='javascript:fncGoPage($startPnt);'>[이전]</a>";
		}

		for($i=$startPage; $i<=$endPage; $i++){
			$pageNo = $i;
			$startPnt = (($pageNo-1)*$pageSize)+1;
			echo "<a href='javascript:fncGoPage($startPnt);'>";

			if($currentPage == $i){
				echo "<strong>[$i]</strong>";
			}else{
				echo "[$i]";
			}
			echo "</a>";
		}

		if($numPageGroup < $pageGroupCount){
			$pageNo = ($numPageGroup*$pageGroupSize+1);
			$startPnt = (($pageNo-1)*$pageSize)+1;
			echo "<a href='javascript:fncGoPage($startPnt);'>[다음]</a>";
		}
?>
<div>
<?
	}
	//페이징 처리 끝
?>
</div>


<?}?>
<br/>
<input type="button" onclick="javascript:location.href='dgnss.php'" value="처음화면으로"/>
<?if($_REQUEST["cropSectionCode"]!=null && $_REQUEST["cropSectionCode"]!="6"){?>
<input type="button" onclick="javascript:fncBeforePage();" value="이전화면으로"/>
<?}?>
</form>
</body>
</html>
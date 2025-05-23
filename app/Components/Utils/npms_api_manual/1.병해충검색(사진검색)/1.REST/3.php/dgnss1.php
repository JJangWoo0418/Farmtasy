<html>
<head>
<meta http-dquiv="Content-Type" content="text/html" charset="utf-8">
<script type='text/javascript'>

//페이지 이동
function fncGoPage(start){
	with(document.apiForm){
		startPoint.value = start;
		method="get";
		action = "dgnss1.php";
		target = "_self";
		submit();
	}
}

//다음화면으로 이동
function fncNextPage(cCode, cName, start){
	with(document.apiForm){
		cropCode.value = cCode;
		cropName.value = cName;
		bfStartPoint.value = start;
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
<input type="hidden" name="startPoint" value=""/>
<input type="hidden" name="bfStartPoint" value=""/>
<input type="hidden" name="cropSectionCode" value="<?=$_REQUEST["cropSectionCode"]?>"/>
<input type="hidden" name="cropSectionName" value="<?=$_REQUEST["cropSectionName"]?>"/>
<input type="hidden" name="cropCode" value=""/>
<input type="hidden" name="cropName" value=""/>

<?
	include "XMLparse.php"; //XML UTIL

	$apiKey = "";//apiKey - NCPMS에서 신청 후 승인되면 확인 가능
	
	$serviceCode = "SVC12"; // 사진검색 2의 서비스코드(상세한 내용은 Open API 이용안내 참조)
	

	//XML 받을 URL 생성
	$parameter = "apiKey=" . $apiKey;
	$parameter .= "&serviceCode=" ;
	$parameter .= $serviceCode;
	$parameter .= "&cropSectionCode=";
	$parameter .= $_REQUEST["cropSectionCode"];


	
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
	home &gt; <?=urldecode($_REQUEST["cropSectionName"])?> 	<!-- 히스토리 -->
	<br/>
		<table  border="0" cellspacing="0" cellpadding="0">
		<?if(count($parser->document->list[0]->item) == 0){?>
			<tr>
				<td width="100%" valign="top" style="padding-top:12px;">조회한 정보가 없습니다.</td>
			</tr> 
		<?}else{

				$cnt = 0;
				foreach($parser->document->list[0]->item as $item){
					
					$cropCode = $item->cropcode[0]->tagData;//작물코드(사진검색3를 위한 키값)
					$thumbImg = $item->thumbimg[0]->tagData;//이미지 URL
					$cropName = $item->cropname[0]->tagData; //작물명
		?>


			<?if( ($cnt%4) == 0){ ?><!-- 한줄에 4개씩 -->
				<tr>
			<?}?>

				  <td width="25%" valign="top" style="padding-top:12px;text-align:center;"> 
				  
					<a href="javascript:fncNextPage('<?=$cropCode?>','<?=$cropName?>','<?=$startPoint?>');">
						<img src="<?=$thumbImg?>" width="100px" height="85px" border="0" alt="" style="border:1px #CCC solid;  padding:10px "   />
					</a>
					<br/>
					<span style="padding-top:5px;letter-spacing: -1px; word-spacing: 0px;">
						<a href="javascript:fncNextPage('<?=$cropCode?>','<?=$cropName?>','<?=$startPoint?>');" style="text-align:center;"><?=$cropName?></a> 
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
</form>
</body>
</html>
<% @CODEPAGE="65001" language="VBScript" %>
<html>
<head>
<meta http-dquiv="Content-Type" content="text/html" charset="utf-8">
<script type='text/javascript'>

//이전화면으로 이동
function fncBeforePage(){
	with(document.apiForm){
		method="get";
		action = "dgnss2.asp";
		target = "_self";
		submit();
	}
}

//천적곤충으로 이동
function fncGoEnemy(key){
	with(document.apiForm){
		insectKey.value = key;
		method="get";
		action = "dgnss3_3.asp";
		target = "_self";
		submit();
	}
}

</script>
</head>

<body>
<form name="apiForm">
<input type="hidden" name="startPoint"/>
<input type="hidden" name="bfStartPoint" value="<%=Request("bfStartPoint")%>"/>
<input type="hidden" name="cropSectionCode" value="<%=Request("cropSectionCode")%>"/>
<input type="hidden" name="cropSectionName" value="<%=Request("cropSectionName")%>"/>
<input type="hidden" name="cropCode" value="<%=Request("cropCode")%>"/>
<input type="hidden" name="cropName" value="<%=Request("cropName")%>"/>
<input type="hidden" name="insectKey" value=""/>

<%

'국가농작물 병해충관리시스템에서 발급받은 인증키
apiKey = ""

'해충상세조회의 서비스코드(상세한 내용은 Open API 이용안내 참조)
serviceCode = "SVC07"

'XML 받을 URL 생성
parameter = "apiKey="&apiKey
parameter = parameter & "&serviceCode=" & serviceCode
parameter = parameter & "&insectKey=" & Request("pestKey")

targetURL = "http://ncpms.rda.go.kr/npmsAPI/service?" & parameter

'국가농작물 병해충관리 시스템과 Open API 통신 시작
Set xmlHttp = Server.CreateObject("Microsoft.XMLHTTP")    
xmlHttp.Open "GET", targetURL, False   
xmlHttp.Send    


Set oStream = CreateObject("ADODB.Stream")   
oStream.Open   
oStream.Position = 0   
oStream.Type = 1   
oStream.Write xmlHttp.ResponseBody   
oStream.Position = 0   
oStream.Type = 2   
oStream.Charset = "utf-8"   
sText = oStream.ReadText   
oStream.Close   

Set xmlDOM = server.CreateObject("MSXML.DOMDOCUMENT")   
xmlDOM.async = False    
xmlDOM.LoadXML sText   
'국가농작물 병해충관리 시스템과 Open API 통신 끝
     
'에러코드 : 통신 후 에러 발생시 코드가 나옵니다.
Set errorCode = xmlDOM.SelectNodes("//errorCode")
If Not errorCode(0) Is Nothing Then errorCodeText= errorCode(0).Text Else errorCodeText = "" End If

'에러메시지 : 에러코드에 대한 메시지 입니다.
Set errorMsg = xmlDOM.SelectNodes("//errorMsg")
If Not errorMsg(0) Is Nothing Then errorMsgText= errorMsg(0).Text Else errorMsgText = "" End If

'xml 생성시간 
Set buildTime = xmlDOM.SelectNodes("//buildTime")
If Not buildTime(0) Is Nothing Then buildTimeText= buildTime(0).Text Else buildTimeText = "" End If

'전체 조회 건수 : 페이징 처리 시 사용
Set totalCount = xmlDOM.SelectNodes("//totalCount")
If Not totalCount(0) Is Nothing Then totalCountText= totalCount(0).Text Else totalCountText = "0" End If

'시작포인트 : 페이징 처리 시 사용
Set startPoint = xmlDOM.SelectNodes("//startPoint")
If Not startPoint(0) Is Nothing Then startPointText= startPoint(0).Text Else startPointText = "1" End If

'화면출력갯수 : 페이징 처리 시 사용
Set displayCount = xmlDOM.SelectNodes("//displayCount")
If Not displayCount(0) Is Nothing Then displayCountText= displayCount(0).Text Else displayCountText = "20" End If

%>


    <%If errorCodeText <> ""  Then%>
      농촌진흥청 국가농작물 관리시스템 OpenAPI 호출 시 장애가 발생하였습니다.<br/>잠시후에 다시 이용하십시오.
	  <br/>
	  <%=errorMsg%>
	<%Else
	
		Set cropName = xmlDOM.SelectNodes("//cropName")
		If Not cropName(0) Is Nothing Then cropNameText= cropName(0).Text Else cropNameText = "" End If

		Set insectOrder = xmlDOM.SelectNodes("//insectOrder")
		If Not insectOrder(0) Is Nothing Then insectOrderText= insectOrder(0).Text Else insectOrderText = "" End If

		Set insectGenus = xmlDOM.SelectNodes("//insectGenus")
		If Not insectGenus(0) Is Nothing Then insectGenusText= insectGenus(0).Text Else insectGenusText = "" End If

		Set insectFamily = xmlDOM.SelectNodes("//insectFamily")
		If Not insectFamily(0) Is Nothing Then insectFamilyText= insectFamily(0).Text Else insectFamilyText = "" End If

		Set insectSpecies = xmlDOM.SelectNodes("//insectSpecies")
		If Not insectSpecies(0) Is Nothing Then insectSpeciesText= insectSpecies(0).Text Else insectSpeciesText = "" End If

		Set insectSpeciesKor = xmlDOM.SelectNodes("//insectSpeciesKor")
		If Not insectSpeciesKor(0) Is Nothing Then insectSpeciesKorText= insectSpeciesKor(0).Text Else insectSpeciesKorText = "" End If

		Set insectSubspecies = xmlDOM.SelectNodes("//insectSubspecies")
		If Not insectSubspecies(0) Is Nothing Then insectSubspeciesText= insectSubspecies(0).Text Else insectSubspeciesText = "" End If

		Set insectSubgenus = xmlDOM.SelectNodes("//insectSubgenus")
		If Not insectSubgenus(0) Is Nothing Then insectSubgenusText= insectSubgenus(0).Text Else insectSubgenusText = "" End If

		Set insectAuthor = xmlDOM.SelectNodes("//insectAuthor")
		If Not insectAuthor(0) Is Nothing Then insectAuthorText= insectAuthor(0).Text Else insectAuthorText = "" End If

		Set authYear = xmlDOM.SelectNodes("//authYear")
		If Not authYear(0) Is Nothing Then authYearText= authYear(0).Text Else authYearText = "" End If

		Set ecologyInfo = xmlDOM.SelectNodes("//ecologyInfo")
		If Not ecologyInfo(0) Is Nothing Then ecologyInfoText= ecologyInfo(0).Text Else ecologyInfoText = "" End If

		Set damageInfo = xmlDOM.SelectNodes("//damageInfo")
		If Not damageInfo(0) Is Nothing Then damageInfoText= damageInfo(0).Text Else damageInfoText = "" End If

		Set ecologyInfo = xmlDOM.SelectNodes("//ecologyInfo")
		If Not ecologyInfo(0) Is Nothing Then ecologyInfoText= ecologyInfo(0).Text Else ecologyInfoText = "" End If

		Set preventMethod = xmlDOM.SelectNodes("//preventMethod")
		If Not preventMethod(0) Is Nothing Then preventMethodText= preventMethod(0).Text Else preventMethodText = "" End If

	%>
		<table  border="1" cellspacing="0" cellpadding="0">
			<colgroup>
				<col width="20%">
				<col width="*">
			</colgroup>
			<tr>
				<td>작물</td>
				<td><%=cropNameText%></td>
			</tr>
			<tr>
				<td>목명</td>
				<td><%=insectOrderText%></td>
			</tr>
			<tr>
				<td>속명</td>
				<td><%=insectGenusText%></td>
			</tr>
			<tr>
				<td>과명</td>
				<td><%=insectFamilyText%></td>
			</tr>
			<tr>
				<td>종명</td>
				<td><%=insectSpeciesText%></td>
			</tr>
			<tr>
				<td>한국종명</td>
				<td><%=insectSpeciesKorText%></td>
			</tr>
			<tr>
				<td>아종명</td>
				<td><%=insectSubspeciesText%></td>
			</tr>
			<tr>
				<td>아속명</td>
				<td><%=insectSubgenusText%></td>
			</tr>
			<tr>
				<td>명명자</td>
				<td><%=insectAuthorText%></td>
			</tr>
			<tr>
				<td>명명년도</td>
				<td><%=authYearText%></td>
			</tr>
			<tr>
				<td>생태정보</td>
				<td><%=ecologyInfoText%></td>
			</tr>
			<tr>
				<td>피해정보</td>
				<td><%=damageInfoText%></td>
			</tr>
			<tr>
				<td>방제방법</td>
				<td><%=preventMethodText%></td>
			</tr>

		</table>
		<br/>
		<br/>

    <%	
		Set listItem = xmlDOM.SelectNodes("//imageList")
		cnt = listItem(0).childNodes.length
		Set items = listItem(0).childNodes
	%>

		<%If Not cnt = 0 Then%>
			&gt; 해충 이미지
			<table  border="1" cellspacing="0" cellpadding="0">
		<%
			For i=0 To cnt-1
			   Set itemNode = items.item(i)
				If NOT itemNode Is Nothing Then
					If NOT itemNode.SelectSingleNode("imageTitle") is Nothing Then
						imageTitle = itemNode.SelectSingleNode("imageTitle").text
					End If
					If NOT itemNode.SelectSingleNode("image") is Nothing Then
						image = itemNode.SelectSingleNode("image").text
					End If
				End If
		%>
			<tr>
			  <td><img src="<%=image%>" width="320px" height="300px"/></td>
			  <td><%=imageTitle%></td>
			</tr>
		<%
			   Set itemNode = Nothing
			Next
		%>
			</table>
		<%End If%>

				
		<br/>
		<br/>
    <%	
		Set listItem = xmlDOM.SelectNodes("//enemyInsectList")
		cnt = listItem(0).childNodes.length
		Set items = listItem(0).childNodes
	%>
		<%If Not cnt = 0 Then%>
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
		<%
			For i=0 To cnt-1
			   Set itemNode = items.item(i)
				If NOT itemNode Is Nothing Then
					If NOT itemNode.SelectSingleNode("insectKey") is Nothing Then
						insectKey = itemNode.SelectSingleNode("insectKey").text
					End If
					If NOT itemNode.SelectSingleNode("enemyInsectSpeciesKor") is Nothing Then
						enemyInsectSpeciesKor = itemNode.SelectSingleNode("enemyInsectSpeciesKor").text
					End If
					If NOT itemNode.SelectSingleNode("enemyInsectSpecies") is Nothing Then
						enemyInsectSpecies = itemNode.SelectSingleNode("enemyInsectSpecies").text
					End If
					If NOT itemNode.SelectSingleNode("enemyInsectFamily") is Nothing Then
						enemyInsectFamily = itemNode.SelectSingleNode("enemyInsectFamily").text
					End If
					If NOT itemNode.SelectSingleNode("enemyInsectOrder") is Nothing Then
						enemyInsectOrder = itemNode.SelectSingleNode("enemyInsectOrder").text
					End If
					If NOT itemNode.SelectSingleNode("enemyImage") is Nothing Then
						enemyImage = itemNode.SelectSingleNode("enemyImage").text
					End If

				End If
		%>
			<tr>
				<td><img src="<%=enemyImage%>" width="120px" height="80px"/></td>
				<td><%=enemyInsectOrder%>/<%=enemyInsectFamily%></td>
				<td><a href="javascript:fncGoEnemy('<%=insectKey%>');"><%=enemyInsectSpeciesKor%>(<%=enemyInsectSpecies%>)</a></td>
			</tr>
		<%
			   Set itemNode = Nothing
			Next
		%>
		</table>
		<%End If%>


	<%End If%>
</form>

<br/>
<input type="button" onclick="javascript:location.href='dgnss.asp'" value="처음화면으로"/>&nbsp;
<input type="button" onclick="javascript:fncBeforePage();" value="이전화면으로"/>
</body>
</html>
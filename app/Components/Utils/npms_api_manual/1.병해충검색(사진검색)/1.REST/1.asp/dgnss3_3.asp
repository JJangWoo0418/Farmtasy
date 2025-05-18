<% @CODEPAGE="65001" language="VBScript" %>
<html>
<head>
<meta http-dquiv="Content-Type" content="text/html" charset="utf-8">
<script type='text/javascript'>

//해충화면으로 이동
function fncSvc07Dtl(key){
	with(document.apiForm){
		method="get";
		pestKey.value = key;
		action = "dgnss3_1.asp";
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
<input type="hidden" name="partName" value="<%=Request("partName")%>"/>
<input type="hidden" name="categoryCode" value="<%=Request("categoryCode")%>"/>
<input type="hidden" name="pestName" value="<%=Request("pestName")%>"/>
<input type="hidden" name="pestKey"/>

<%

'국가농작물 병해충관리시스템에서 발급받은 인증키
apiKey = ""

'천적곤충상세조회의 서비스코드(상세한 내용은 Open API 이용안내 참조)
serviceCode = "SVC15"

'XML 받을 URL 생성
parameter = "apiKey="&apiKey
parameter = parameter & "&serviceCode=" & serviceCode
If Not Request("insectKey") Is Nothing  And Request("insectKey") <> "" Then
	parameter = parameter & "&insectKey=" & Request("insectKey")
Else 
	parameter = parameter & "&insectKey=" & Request("pestKey")
End If


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
	
		Set insectSpeciesKor = xmlDOM.SelectNodes("//insectSpeciesKor")
		If Not insectSpeciesKor(0) Is Nothing Then insectSpeciesKorText= insectSpeciesKor(0).Text Else insectSpeciesKorText = "" End If

		Set outsideDistribution = xmlDOM.SelectNodes("//outsideDistribution")
		If Not outsideDistribution(0) Is Nothing Then outsideDistributionText= outsideDistribution(0).Text Else outsideDistributionText = "" End If

		Set domesticDistribution = xmlDOM.SelectNodes("//domesticDistribution")
		If Not domesticDistribution(0) Is Nothing Then domesticDistributionText= domesticDistribution(0).Text Else domesticDistributionText = "" End If

		Set lifeCycle = xmlDOM.SelectNodes("//lifeCycle")
		If Not lifeCycle(0) Is Nothing Then lifeCycleText= lifeCycle(0).Text Else lifeCycleText = "" End If

		Set utilizationMethod = xmlDOM.SelectNodes("//utilizationMethod")
		If Not utilizationMethod(0) Is Nothing Then utilizationMethodText= utilizationMethod(0).Text Else utilizationMethodText = "" End If

		Set examinResult = xmlDOM.SelectNodes("//examinResult")
		If Not examinResult(0) Is Nothing Then examinResultText= examinResult(0).Text Else examinResultText = "" End If

		Set etcCrop = xmlDOM.SelectNodes("//etcCrop")
		If Not etcCrop(0) Is Nothing Then etcCropText= etcCrop(0).Text Else etcCropText = "" End If

		Set cropName = xmlDOM.SelectNodes("//cropName")
		If Not cropName(0) Is Nothing Then cropNameText= cropName(0).Text Else cropNameText = "" End If


	%>
		<table  border="1" cellspacing="0" cellpadding="0">
			<colgroup>
				<col width="20%">
				<col width="*">
			</colgroup>
			<tr>
				<td>곤충한국종명</td>
				<td><%=insectSpeciesKorText%></td>
			</tr>
			<tr>
				<td>국외분포</td>
				<td><%=outsideDistributionText%></td>
			</tr>
			<tr>
				<td>국내분포</td>
				<td><%=domesticDistributionText%></td>
			</tr>
			<tr>
				<td>생활사</td>
				<td><%=lifeCycleText%></td>
			</tr>
			<tr>
				<td>이용방법</td>
				<td><%=utilizationMethodText%></td>
			</tr>
			<tr>
				<td>시험결과</td>
				<td><%=examinResultText%></td>
			</tr>
			<tr>
				<td>이용작물</td>
				<td><%=cropNameText%></td>
			</tr>
			<tr>
				<td>기타작물</td>
				<td><%=etcCropText%></td>
			</tr>
		</table>
		<br/>
		<br/>

    <%	
		Set listItem = xmlDOM.SelectNodes("//targetVermin")
		cnt = listItem(0).childNodes.length
		Set items = listItem(0).childNodes
	%>

		<%If Not cnt = 0 Then%>
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
		<%
			For i=0 To cnt-1
			   Set itemNode = items.item(i)
				If NOT itemNode Is Nothing Then

					If NOT itemNode.SelectSingleNode("targetInsectKey") is Nothing Then
						targetInsectKey = itemNode.SelectSingleNode("targetInsectKey").text
					End If
					If NOT itemNode.SelectSingleNode("targetInsectSpeciesKor") is Nothing Then
						targetInsectSpeciesKor = itemNode.SelectSingleNode("targetInsectSpeciesKor").text
					End If
					If NOT itemNode.SelectSingleNode("targetInsectOrder") is Nothing Then
						targetInsectOrder = itemNode.SelectSingleNode("targetInsectOrder").text
					End If
					If NOT itemNode.SelectSingleNode("targetInsectFamily") is Nothing Then
						targetInsectFamily = itemNode.SelectSingleNode("targetInsectFamily").text
					End If
					If NOT itemNode.SelectSingleNode("targetInsectGenus") is Nothing Then
						targetInsectGenus = itemNode.SelectSingleNode("targetInsectGenus").text
					End If
					If NOT itemNode.SelectSingleNode("targetInsectSpecies") is Nothing Then
						targetInsectSpecies = itemNode.SelectSingleNode("targetInsectSpecies").text
					End If
					If NOT itemNode.SelectSingleNode("targetImage") is Nothing Then
						targetImage = itemNode.SelectSingleNode("targetImage").text
					End If
					If NOT itemNode.SelectSingleNode("targetCropLink") is Nothing Then
						targetCropLink = itemNode.SelectSingleNode("targetCropLink").text
					End If
				End If
		%>
			<tr>
				<td><img src="<%=targetImage%>" width="120px" height="80px"/></td>
				<td><%=targetInsectOrder%>/<%=targetInsectFamily%></td>
				<td><%=targetInsectSpeciesKor%>(<%=targetInsectGenus%> <%=targetInsectSpecies%>)</td>
				<td><%=targetCropLink%></td>

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
<input type="button" onclick="javascript:history.back();" value="이전화면으로"/>
</body>
</html>
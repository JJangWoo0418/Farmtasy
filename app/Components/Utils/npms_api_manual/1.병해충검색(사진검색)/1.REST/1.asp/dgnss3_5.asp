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

<%

'국가농작물 병해충관리시스템에서 발급받은 인증키
apiKey = ""

'해충상세조회의 서비스코드(상세한 내용은 Open API 이용안내 참조)
serviceCode = "SVC10"

'XML 받을 URL 생성
parameter = "apiKey="&apiKey
parameter = parameter & "&serviceCode=" & serviceCode
parameter = parameter & "&weedsKey=" & Request("pestKey")

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
	
		Set weedsKorName = xmlDOM.SelectNodes("//weedsKorName")
		If Not weedsKorName(0) Is Nothing Then weedsKorNameText= weedsKorName(0).Text Else weedsKorNameText = "" End If

		Set weedsScientificName = xmlDOM.SelectNodes("//weedsScientificName")
		If Not weedsScientificName(0) Is Nothing Then weedsScientificNameText= weedsScientificName(0).Text Else weedsScientificNameText = "" End If

		Set weedsFamily = xmlDOM.SelectNodes("//weedsFamily")
		If Not weedsFamily(0) Is Nothing Then weedsFamilyText= weedsFamily(0).Text Else weedsFamilyText = "" End If

		Set weedsJpnName = xmlDOM.SelectNodes("//weedsJpnName")
		If Not weedsJpnName(0) Is Nothing Then weedsJpnNameText= weedsJpnName(0).Text Else weedsJpnNameText = "" End If

		Set weedsEngName = xmlDOM.SelectNodes("//weedsEngName")
		If Not weedsEngName(0) Is Nothing Then weedsEngNameText= weedsEngName(0).Text Else weedsEngNameText = "" End If

		Set weedsShape = xmlDOM.SelectNodes("//weedsShape")
		If Not weedsShape(0) Is Nothing Then weedsShapeText= weedsShape(0).Text Else weedsShapeText = "" End If

		Set weedsEcology = xmlDOM.SelectNodes("//weedsEcology")
		If Not weedsEcology(0) Is Nothing Then weedsEcologyText= weedsEcology(0).Text Else weedsEcologyText = "" End If

		Set weedsHabitat = xmlDOM.SelectNodes("//weedsHabitat")
		If Not weedsHabitat(0) Is Nothing Then weedsHabitatText= weedsHabitat(0).Text Else weedsHabitatText = "" End If
	
		Set literature = xmlDOM.SelectNodes("//literature")
		If Not literature(0) Is Nothing Then literatureText= literature(0).Text Else literatureText = "" End If


	%>
		<table  border="1" cellspacing="0" cellpadding="0">
			<colgroup>
				<col width="20%">
				<col width="*">
			</colgroup>
			<tr>
				<td>잡초명</td>
				<td><%=weedsKorNameText%></td>
			</tr>
			<tr>
				<td>잡초학명</td>
				<td><%=weedsScientificNameText%></td>
			</tr>
			<tr>
				<td>과명</td>
				<td><%=weedsFamilyText%></td>
			</tr>
			<tr>
				<td>잡초일문명</td>
				<td><%=weedsJpnNameText%></td>
			</tr>
			<tr>
				<td>잡초영문명</td>
				<td><%=weedsEngNameText%></td>
			</tr>
			<tr>
				<td>형태</td>
				<td><%=weedsShapeText%></td>
			</tr>
			<tr>
				<td>생태</td>
				<td><%=weedsEcologyText%></td>
			</tr>
			<tr>
				<td>서식지</td>
				<td><%=weedsHabitatText%></td>
			</tr>
			<tr>
				<td>참고문헌</td>
				<td><%=literatureText%></td>
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
			&gt; 잡초 이미지
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

	<%End If%>
</form>

<br/>
<input type="button" onclick="javascript:location.href='dgnss.asp'" value="처음화면으로"/>&nbsp;
<input type="button" onclick="javascript:fncBeforePage();" value="이전화면으로"/>
</body>
</html>
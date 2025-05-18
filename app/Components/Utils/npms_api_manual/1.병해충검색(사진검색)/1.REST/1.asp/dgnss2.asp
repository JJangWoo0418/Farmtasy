<% @CODEPAGE="65001" language="VBScript" %>
<html>
<head>
<meta http-dquiv="Content-Type" content="text/html" charset="utf-8">
<script type='text/javascript'>

//페이지 이동
function fncGoPage(start){
	with(document.apiForm){
		startPoint.value = start;
		method="get";
		action = "dgnss2.asp";
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
		case "해충생태":action = "dgnss3_1.asp";break;
		case "곤충":action = "dgnss3_2.asp";break;
		case "천적곤충":action = "dgnss3_3.asp";break;
		case "병생태":action = "dgnss3_4.asp";break;
		case "잡초":action = "dgnss3_5.asp";break;
		}
		target = "_self";
		submit();
	}
}

//이전화면으로 이동
function fncBeforePage(){
	with(document.apiForm){
		method="get";
		action = "dgnss1.asp";
		target = "_self";
		submit();
	}
}

//검색
function fncSearch(start){
	with(document.apiForm){
		startPoint.value = start;
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
<input type="hidden" name="pestKey"/>

<%

'국가농작물 병해충관리시스템에서 발급받은 인증키
apiKey = ""

'사진검색 1의 서비스코드(상세한 내용은 Open API 이용안내 참조)
serviceCode = "SVC13"

'XML 받을 URL 생성
parameter = "apiKey="&apiKey
parameter = parameter & "&serviceCode=" & serviceCode


If NOT Request("cropSectionCode") Is Nothing And Request("cropSectionCode")="6" Then	'잡초인경우
	parameter = parameter & "&cropSectionCode=" & Request("cropSectionCode")	
Else																					'잡초가 아닌 경우
	parameter = parameter & "&cropCode=" & Request("cropCode")
End If

'검색조건
If NOT Request("categoryCode") Is Nothing  Then
	parameter = parameter & "&categoryCode=" & Request("categoryCode")
End If

If NOT Request("partName") Is Nothing  Then
	parameter = parameter & "&partName=" & Server.URLEncode(Request("partName"))
End If

If NOT Request("pestName") Is Nothing  Then
	parameter = parameter & "&pestName=" & Server.URLEncode(Request("pestName"))
End If

'페이지 이동 처리
If NOT Request("startPoint") Is Nothing Then
	parameter = parameter & "&startPoint=" & Request("startPoint")
ElseIf NOT Request("bfStartPoint") Is Nothing Then
	parameter = parameter & "&startPoint=" & Request("bfStartPoint")
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
	
		'사진 목록 파싱
		Set listItem = xmlDOM.SelectNodes("//list")
		cnt = listItem(0).childNodes.length
		Set items = listItem(0).childNodes
	%>


	검색
	<br/>
	<%
		If Not Request("partName") is Nothing Then
			partName = Request("partName")
		Else 
			partName = ""
		End If

		If Not Request("categoryCode") is Nothing Then
			categoryCode = Request("categoryCode")
		Else 
			categoryCode = ""
		End If
	
	%>


	<%If Not Request("cropSectionCode") Is Nothing And Request("cropSectionCode") <> "6" Then %><!-- 잡초가 아닌 경우 -->
		<input name="categoryCode" value="pest"  type="radio" <%If categoryCode="" Or categoryCode = "pest" Then Response.Write("checked") Else Response.Write("") End if%> onclick="fncSearch('<%=startPointText%>');"/>병/해충/천적곤충
		<input name="categoryCode" value="insect"  type="radio" <%If categoryCode = "insect" Then Response.Write("checked") Else Response.Write("") End if%> onclick="fncSearch('<%=startPointText%>');"/>곤충


		<%If categoryCode="" Or Request("categoryCode") = "pest" Then %>
			<select name="partName" onchange="fncSearch('<%=startPointText%>');"> 
				<option value="">::전체::</option>
				<option value="유묘" <%If partName="유묘" Then Response.Write("selected") Else Response.Write("") End If%>>유묘</option>
				<option value="잎" <%If partName="잎" Then Response.Write("selected") Else Response.Write("") End If%>>잎</option>
				<option value="뿌리" <%If partName="뿌리" Then Response.Write("selected") Else Response.Write("") End If%>>뿌리</option>
				<option value="줄기" <%If partName="줄기" Then Response.Write("selected") Else Response.Write("") End If%>>줄기</option>
				<option value="가지" <%If partName="가지" Then Response.Write("selected") Else Response.Write("") End If%>>가지</option>
				<option value="열매" <%If partName="열매" Then Response.Write("selected") Else Response.Write("") End If%>>열매</option>
				<option value="꽃" <%If partName="꽃" Then Response.Write("selected") Else Response.Write("") End If%>>꽃</option>
				<option value="기타" <%If partName="기타" Then Response.Write("selected") Else Response.Write("") End If%>>기타</option>
			</select> 
		<%Else%>
			<select name="partName" onchange="fncSearch('<%=startPointText%>');"> 
				<option value="">::전체::</option>
				<option value="알" <%If partName="알" Then Response.Write("selected") Else Response.Write("") End If%>>알</option>
				<option value="번데기" <%If partName="번데기" Then Response.Write("selected") Else Response.Write("") End If%>>번데기</option>
				<option value="유충" <%If partName="유충" Then Response.Write("selected") Else Response.Write("") End If%>>유충</option>
				<option value="성충" <%If partName="성충" Then Response.Write("selected") Else Response.Write("") End If%>>성충</option>
				<option value="기타" <%If partName="기타" Then Response.Write("selected") Else Response.Write("") End If%>>기타</option>
			</select> 
		<%End If%>


	<%Else%> <!-- 잡초 -->

		잡초명 : <input type="text" name="pestName" value="<%If Request("pestName") Is Nothing Then Response.write("") Else Response.write(Request("pestName")) End If%>">
        생육단계 : 
			<select name="categoryCode"> 
				<option value="">::전체::</option>
				<option value="18601" <%If categoryCode="18601" Then Response.Write("selected") Else Response.Write("") End If%>>유묘기</option>
				<option value="18602" <%If categoryCode="18602" Then Response.Write("selected") Else Response.Write("") End If%>>생육초기</option>
				<option value="18603" <%If categoryCode="18603" Then Response.Write("selected") Else Response.Write("") End If%>>생육중기</option>
				<option value="18604" <%If categoryCode="18604" Then Response.Write("selected") Else Response.Write("") End If%>>개화기</option>
				<option value="18605" <%If categoryCode="18605" Then Response.Write("selected") Else Response.Write("") End If%>>결실기</option>
			</select> 
        특징부위 : 
			<select name="partName"> 
				<option value="">::전체::</option>
				<option value="18701" <%If partName="18701" Then Response.Write("selected") Else Response.Write("") End If%>>잎</option>
				<option value="18702" <%If partName="18702" Then Response.Write("selected") Else Response.Write("") End If%>>뿌리</option>
				<option value="18703" <%If partName="18703" Then Response.Write("selected") Else Response.Write("") End If%>>줄기</option>
				<option value="18704" <%If partName="18704" Then Response.Write("selected") Else Response.Write("") End If%>>꽃</option>
				<option value="18705" <%If partName="18705" Then Response.Write("selected") Else Response.Write("") End If%>>열매</option>
			</select> 
			<input type="button" value="검색" onclick="fncSearch('<%=startPointText%>');"/>
		
	<%End If%>

				<table  border="0" cellspacing="0" cellpadding="0">
				<%If cnt = 0 Then%>
					<tr>
						<td width="100%" valign="top" style="padding-top:12px;">조회한 정보가 없습니다.</td>
                    </tr> 
                <%Else
					'사진 목록을 파싱하여 출력
					For i=0 To cnt-1
					   Set itemNode = items.item(i)

						If NOT itemNode Is Nothing Then
							If NOT itemNode.SelectSingleNode("pestName") is Nothing Then
								pestName = itemNode.SelectSingleNode("pestName").text
							End If
							If NOT itemNode.SelectSingleNode("thumbImg") is Nothing Then
								thumbImg = itemNode.SelectSingleNode("thumbImg").text
							End If
							If NOT itemNode.SelectSingleNode("category") is Nothing Then
								category = itemNode.SelectSingleNode("category").text
							End If
							If NOT itemNode.SelectSingleNode("pestName") is Nothing Then
								pestName = itemNode.SelectSingleNode("pestName").text
							End If
							If NOT itemNode.SelectSingleNode("pestKey") is Nothing Then
								pestKey = itemNode.SelectSingleNode("pestKey").text
							End If
						End If

				%>
				<!-- 한줄에 사진을 4개씩 출력하도록 구성 -->
				<%If (i Mod 4) = 0 Then%>
				    <tr>
				<%End If%>
						<!-- 목록 출력 -->

                      <td width="25%" valign="top" style="padding-top:12px;text-align:center;"> 
					  
                        <a href="javascript:fncNextPage('<%=pestKey%>', '<%=category%>', '<%=startPointText%>');">
							<img src="<%=thumbImg%>" width="100px" height="85px" border="0" alt="" style="border:1px #CCC solid;  padding:10px "   />
						</a>
						<br/>
						<span style="padding-top:5px;letter-spacing: -1px; word-spacing: 0px;">
							<a href="javascript:fncNextPage('<%=pestKey%>', '<%=category%>', '<%=startPointText%>');" style="text-align:center;"><%=pestName%></a> 
                        </span>
                        
                        
                        </td>
				<%If (i Mod 4) = 3 Then%>
				    </tr>
				<%End If%>
				<%
					   Set itemNode = Nothing
					Next
				End If
				%>

                    
                  </table>


	<br/>

<%
   function ceil(x)

        dim temp
        temp = Round(x)
        if temp < x then
            temp = temp + 1
        end if
        ceil = temp
    end function


	pageGroupSize = 10
	pageSize = Int(displayCountText)
	

	start = Int(startPointText)

	
	currentPage = ceil(start / pageSize)

	startRow = (currentPage - 1) * pageSize + 1
	endRow = currentPage * pageSize
	count = Int(totalCountText)
	number=0                                                    
		
	number=count-(currentPage-1)*pageSize    
	
	pageGroupCount = count/(pageSize*pageGroupSize)

	numPageGroup = Int(ceil(currentPage/pageGroupSize))

	If count > 0 Then
		pageCount = Int(count / pageSize)


		If (count Mod pageSize) = 0 Then
			pageCount = pageCount + 0
		Else
			pageCount = pageCount + 1
		End If

		startPage = pageGroupSize*(numPageGroup-1)+1
		endPage = startPage + pageGroupSize-1
		pageNo = 0
		startPoint = 0
		
		If endPage > pageCount Then
			endPage = pageCount
		End If

		If numPageGroup > 1 Then
			pageNo = (numPageGroup-2)*pageGroupSize+1
			startPoint = ((pageNo-1)*pageSize)+1
			Response.Write("<a href='javascript:fncGoPage("&startPoint&");'>[이전]</a>")
		End If

		i=startPage
		While i<=endPage

			pageNo = i
			startPoint = ((pageNo-1)*pageSize)+1
			Response.Write("<a href='javascript:fncGoPage("&startPoint&");'>")

			If currentPage = i Then
				Response.Write("<strong>["&i&"]</strong>")
			Else
				Response.Write("["&i&"]")
			End If

			Response.Write("</a>")

			i = i+1
		Wend

		If numPageGroup < pageGroupCount Then
			pageNo = (numPageGroup*pageGroupSize+1)
			startPoint = ((pageNo-1)*pageSize)+1
			Response.Write("<a href='javascript:fncGoPage("&startPoint&");'>[다음]</a>")
		End If
	End If
%>

	<%End If%>

</form>

<br/>
<br/>
<input type="button" onclick="javascript:location.href='dgnss.asp'" value="처음화면으로"/>&nbsp;
<%If Not Request("cropSectionCode") Is Nothing And Request("cropSectionCode") <> "6" Then %>
<input type="button" onclick="javascript:fncBeforePage();" value="이전화면으로"/>
<%End If%>
</body>
</html>
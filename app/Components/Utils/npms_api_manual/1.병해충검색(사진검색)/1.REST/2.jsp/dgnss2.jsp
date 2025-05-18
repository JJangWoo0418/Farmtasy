<%@page import="java.io.InputStream"%>
<%@page import="java.net.URLEncoder"%>
<%@page import="java.net.URLDecoder"%>
<%@page import="org.w3c.dom.NodeList"%>
<%@page import="org.w3c.dom.Node"%>
<%@page import="org.w3c.dom.Element"%>
<%@page import="javax.xml.parsers.DocumentBuilderFactory"%>
<%@page import="org.w3c.dom.Document"%>
<%@page import="java.net.URL"%>

<%@ page contentType="text/html; charset=utf-8" %>
<html>
<head>
<meta http-dquiv="Content-Type" content="text/html" charset="utf-8">

<script type='text/javascript'>

//페이지 이동
function fncGoPage(start){
	with(document.apiForm){
		startPoint.value = start;
		method="get";
		action = "dgnss2.jsp";
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
		case "해충생태":action = "dgnss3_1.jsp";break;
		case "곤충":action = "dgnss3_2.jsp";break;
		case "천적곤충":action = "dgnss3_3.jsp";break;
		case "병생태":action = "dgnss3_4.jsp";break;
		case "잡초":action = "dgnss3_5.jsp";break;
		}
		target = "_self";
		submit();
	}
}

//이전화면으로 이동
function fncBeforePage(){
	with(document.apiForm){
		method="get";
		action = "dgnss1.jsp";
		target = "_self";
		submit();
	}
}

//검색
function fncSearch(start){
	with(document.apiForm){
		startPoint.value = start;
		method="get";
		action = "dgnss2.jsp";
		target = "_self";
		submit();
	}
}

</script>

</head>
<body>    
<form name="apiForm">
<input type="hidden" name="startPoint"/>
<input type="hidden" name="bfStartPoint" value="<%=request.getParameter("bfStartPoint")%>"/>
<input type="hidden" name="cropSectionCode" value="<%=request.getParameter("cropSectionCode")%>"/>
<input type="hidden" name="cropSectionName" value="<%=request.getParameter("cropSectionName")%>"/>
<input type="hidden" name="cropCode" value="<%=request.getParameter("cropCode")%>"/>
<input type="hidden" name="cropName" value="<%=request.getParameter("cropName")%>"/>
<input type="hidden" name="pestKey"/>
<%
	//사진검색 3

	String buildTime = null;
	String totalCnt = null;
	String startPoint = null;
	String displayCount = null;
	String errorMsg = null;
	String errorCode = null;
	
	String apiKey = "";//apiKey - NCPMS에서 신청 후 승인되면 확인 가능
	
	String serviceCode = "SVC13";// 사진검색 3의 서비스코드(상세한 내용은 Open API 이용안내 참조)
	
	//XML 받을 URL 생성
	String parameter = "apiKey="+ apiKey;
	parameter += "&serviceCode="+ serviceCode;

	if(request.getParameter("cropSectionCode")!=null && request.getParameter("cropSectionCode").equals("6")){	//잡초인경우
		parameter += "&cropSectionCode="+ request.getParameter("cropSectionCode");
	}else{																										//잡초가 아닌 경우
		parameter += "&cropCode="+ request.getParameter("cropCode");
	}
	
	//검색조건
	if(request.getParameter("categoryCode")!=null && !request.getParameter("categoryCode").equals("")){
		parameter += "&categoryCode="+ request.getParameter("categoryCode");
	}
	
	if(request.getParameter("partName")!=null && !request.getParameter("partName").equals("")){
		parameter += "&partName="+ URLEncoder.encode(request.getParameter("partName"),"utf-8");
	}

	if(request.getParameter("pestName")!=null && !request.getParameter("pestName").equals("")){
		parameter += "&pestName="+ URLEncoder.encode(request.getParameter("pestName"),"utf-8");
	}
	
	//페이지 이동 처리
	if(request.getParameter("startPoint")!=null&&!request.getParameter("startPoint").equals("")){
		parameter += "&startPoint="+ request.getParameter("startPoint");
	}else if(request.getParameter("bfStartPoint")!=null&&!request.getParameter("bfStartPoint").equals("")){
		parameter += "&startPoint="+ request.getParameter("bfStartPoint");
	}

	//서버와 통신
	URL apiUrl = new URL("http://ncpms.rda.go.kr/npmsAPI/service?"+parameter);
	InputStream apiStream = apiUrl.openStream();
	
	Document doc = null;
	try{
		//xml document
		doc =	DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(apiStream);
		
		//기본정보
		try{buildTime = doc.getElementsByTagName("buildTime").item(0).getFirstChild().getNodeValue();}catch(Exception e){buildTime = "";}//생성시간
		try{totalCnt = doc.getElementsByTagName("totalCount").item(0).getFirstChild().getNodeValue();}catch(Exception e){totalCnt = "";}//전체 갯수
		try{startPoint = doc.getElementsByTagName("startPoint").item(0).getFirstChild().getNodeValue();}catch(Exception e){startPoint = "";}//시작지점
		try{displayCount = doc.getElementsByTagName("displayCount").item(0).getFirstChild().getNodeValue();}catch(Exception e){displayCount = "";}//출력갯수
		try{errorMsg = doc.getElementsByTagName("errorMsg").item(0).getFirstChild().getNodeValue();}catch(Exception e){errorMsg = "";}//에러코드(에러발생시에만 생성)
		try{errorCode = doc.getElementsByTagName("errorCode").item(0).getFirstChild().getNodeValue();}catch(Exception e){errorCode = "";}//에러메시지(에러발생시에만 생성)
	}catch(Exception e){
		e.printStackTrace();
	}finally{
		apiStream.close();
	}
%>

    
   <%if( !errorCode.equals("")){%>
      농촌진흥청 국가농작물 관리시스템 OpenAPI 호출 시 장애가 발생하였습니다.<br/>잠시후에 다시 이용하십시오.
	  <br/>
	  <%=errorMsg%>
	<%}else{
	
		int size = 0;
		
		NodeList items = null;
		NodeList pestNames = null;
		NodeList thumbImgs = null;
		NodeList pestKeys = null;
		NodeList categoryes = null;
		
		items = doc.getElementsByTagName("item");
		size = doc.getElementsByTagName("item").getLength();
		pestNames = doc.getElementsByTagName("pestName");
		thumbImgs = doc.getElementsByTagName("thumbImg");
		pestKeys = doc.getElementsByTagName("pestKey");
		categoryes = doc.getElementsByTagName("category");
		
	%> 

	<!-- 히스토리 -->
	home &gt; <%=URLDecoder.decode(request.getParameter("cropSectionName"), "utf-8")%>
	<%if(request.getParameter("cropName")!=null&&!request.getParameter("cropName").equals("")&&!request.getParameter("cropName").equals("null")){%>&gt; <%=URLDecoder.decode(request.getParameter("cropName"), "utf-8")%><%}%><%-- 잡초에서 넘어오지 않은 경우 --%>
	<br/>
	<br/>

	검색
	<br/>
	<%String partName = request.getParameter("partName")==null?"":request.getParameter("partName");%>
	<%String categoryCode = request.getParameter("categoryCode")==null?"":request.getParameter("categoryCode");%>

	<%if(request.getParameter("cropSectionCode")!=null && !request.getParameter("cropSectionCode").equals("6")){//잡초가 아닌 경우의 검색조건%>
		<input name="categoryCode" value="pest"  type="radio" <%=request.getParameter("categoryCode")==null||request.getParameter("categoryCode").equals("pest")?"checked":""%> onclick="fncSearch('<%=startPoint%>');"/>병/해충/천적곤충
		<input name="categoryCode" value="insect"  type="radio" <%=request.getParameter("categoryCode")!=null&&request.getParameter("categoryCode").equals("insect")?"checked":""%> onclick="fncSearch('<%=startPoint%>');"/>곤충


		<%if(request.getParameter("categoryCode")==null || request.getParameter("categoryCode").equals("pest")){%>
			<select name="partName" onchange="fncSearch('<%=startPoint%>');"> 
				<option value="">::전체::</option>
				<option value="유묘" <%=partName.equals("유묘")?"selected":""%>>유묘</option>
				<option value="잎" <%=partName.equals("잎")?"selected":""%>>잎</option>
				<option value="뿌리" <%=partName.equals("뿌리")?"selected":""%>>뿌리</option>
				<option value="줄기" <%=partName.equals("줄기")?"selected":""%>>줄기</option>
				<option value="가지" <%=partName.equals("가지")?"selected":""%>>가지</option>
				<option value="열매" <%=partName.equals("열매")?"selected":""%>>열매</option>
				<option value="꽃" <%=partName.equals("꽃")?"selected":""%>>꽃</option>
				<option value="기타" <%=partName.equals("기타")?"selected":""%>>기타</option>
			</select> 
		<%}else{%>
			<select name="partName" onchange="fncSearch('<%=startPoint%>');"> 
				<option value="">::전체::</option>
				<option value="알" <%=partName.equals("알")?"selected":""%>>알</option>
				<option value="번데기" <%=partName.equals("번데기")?"selected":""%>>번데기</option>
				<option value="유충" <%=partName.equals("유충")?"selected":""%>>유충</option>
				<option value="성충" <%=partName.equals("성충")?"selected":""%>>성충</option>
				<option value="기타" <%=partName.equals("기타")?"selected":""%>>기타</option>
			</select> 
		<%}%>
	<%}else{//잡초인 경우의 검색조건%>

		잡초명 : <input type="text" name="pestName" value="<%=request.getParameter("pestName")==null?"":request.getParameter("pestName")%>">
        생육단계 : 
			<select name="categoryCode"> 
				<option value="">::전체::</option>
				<option value="18601" <%=categoryCode.equals("18601")?"selected":""%>>유묘기</option>
				<option value="18602" <%=categoryCode.equals("18602")?"selected":""%>>생육초기</option>
				<option value="18603" <%=categoryCode.equals("18603")?"selected":""%>>생육중기</option>
				<option value="18604" <%=categoryCode.equals("18604")?"selected":""%>>개화기</option>
				<option value="18605" <%=categoryCode.equals("18605")?"selected":""%>>결실기</option>
			</select> 
        특징부위 : 
			<select name="partName"> 
				<option value="">::전체::</option>
				<option value="18701" <%=partName.equals("18701")?"selected":""%>>잎</option>
				<option value="18702" <%=partName.equals("18702")?"selected":""%>>뿌리</option>
				<option value="18703" <%=partName.equals("18703")?"selected":""%>>줄기</option>
				<option value="18704" <%=partName.equals("18704")?"selected":""%>>꽃</option>
				<option value="18705" <%=partName.equals("18705")?"selected":""%>>열매</option>
			</select> 
			<input type="button" value="검색" onclick="fncSearch('<%=startPoint%>');"/>
	<%}%>

				<table  border="0" cellspacing="0" cellpadding="0">
				<%if(size == 0){%>
					<tr>
						<td width="100%" valign="top" style="padding-top:12px;">조회한 정보가 없습니다.</td>
                    </tr> 
                <%}else{
                	for(int i=0; i<size; i++){
					
                		String thumbImg = thumbImgs.item(i).getFirstChild() == null ? "" : thumbImgs.item(i).getFirstChild().getNodeValue();//이미지 URL
                		String pestKey = pestKeys.item(i).getFirstChild() == null ? "" : pestKeys.item(i).getFirstChild().getNodeValue();//병/해충/잡초코드(상세조회를 위한 키값)
                		String pestName = pestNames.item(i).getFirstChild() == null ? "" : pestNames.item(i).getFirstChild().getNodeValue();//병/해충/잡초명
						String category = categoryes.item(i).getFirstChild() == null ? "" : categoryes.item(i).getFirstChild().getNodeValue();//병/해충/잡초 구분

				%>
				<%if( (i%4) == 0){ %><!-- 한줄에 4개씩 -->
				    <tr>
				<%}%>

                      <td width="25%" valign="top" style="padding-top:12px;text-align:center;"> 
					  
                        <a href="javascript:fncNextPage('<%=pestKey%>', '<%=category%>', '<%=startPoint%>');">
							<img src="<%=thumbImg%>" width="100px" height="85px" border="0" alt="" style="border:1px #CCC solid;  padding:10px "   />
						</a>
						<br/>
						<span style="padding-top:5px;letter-spacing: -1px; word-spacing: 0px;">
							<a href="javascript:fncNextPage('<%=pestKey%>', '<%=category%>', '<%=startPoint%>');" style="text-align:center;"><%=pestName%></a> 
                        </span>
                        
                        
                        </td>
				<%if( (i%4) == 3){ %>
				    </tr>
				<%}%>
				<%
                	}
                }
				%>
                  </table>

<br/>
<%
//페이징 처리 시작
	int pageGroupSize = 10;
	int pageSize = 0;
	try{
		pageSize = Integer.parseInt(displayCount);
	}catch(Exception e){
		pageSize = 10;
	}
	int start = 0; 
	try{
		start = Integer.parseInt(startPoint);
	}catch(Exception e){
		start = 1;
	}
	
	int currentPage = (int)(Math.ceil((double)start / (double)pageSize));

	int startRow = (currentPage - 1) * pageSize + 1;//한 페이지의 시작글 번호 
	int endRow = currentPage * pageSize;//한 페이지의 마지막 글번호           
	int count = Integer.parseInt( totalCnt);                                                            
	int number=0;                                                             

		
	number=count-(currentPage-1)*pageSize;//글목록에 표시할 글번호                                                                  
    
	//페이지그룹의 갯수                                                                                                             
	//ex) pageGroupSize가 3일 경우 '[1][2][3]'가 pageGroupCount 개 만큼 있다.                                                       
	int pageGroupCount = count/(pageSize*pageGroupSize)+( count % (pageSize*pageGroupSize) == 0 ? 0 : 1);                           
	//페이지 그룹 번호                                                                                                              
	//ex) pageGroupSize가 3일 경우  '[1][2][3]'의 페이지그룹번호는 1 이고  '[2][3][4]'의 페이지그룹번호는 2 이다.                   
	int numPageGroup = (int) Math.ceil((double)currentPage/pageGroupSize);                                                          


	if(count > 0){
		int pageCount = count / pageSize + ( count % pageSize == 0 ? 0 : 1);
		int startPage = pageGroupSize*(numPageGroup-1)+1;
		int endPage = startPage + pageGroupSize-1;
		int pageNo = 0; int startPnt = 0;
		
		if(endPage > pageCount){
			endPage = pageCount;
		}
		
		if(numPageGroup > 1){
			pageNo = (numPageGroup-2)*pageGroupSize+1;
			startPnt = ((pageNo-1)*pageSize)+1;
			out.println("<a href='javascript:fncGoPage("+startPnt+");'>[이전]</a>");
		}
		
		for(int i=startPage; i<=endPage; i++){
			pageNo = i;
			startPnt = ((pageNo-1)*pageSize)+1;
			out.print("<a href='javascript:fncGoPage("+startPnt+");'>");
			if(currentPage == i){
				out.print("<strong>["+i+"]</strong>");
			}else{
				out.print("["+i+"]");
			}
			out.println("</a>");
		}
		
		if(numPageGroup < pageGroupCount){
			pageNo = (numPageGroup*pageGroupSize+1);
			startPnt = ((pageNo-1)*pageSize)+1;
			out.println("<a href='javascript:fncGoPage("+startPnt+");'>[다음]</a>");
		}
%>
<div>
<%
	}
	//페이징 처리 끝
%>
</div>



	<%}%>

</form>

<br/>
<input type="button" onclick="javascript:location.href='dgnss.jsp'" value="처음화면으로"/>&nbsp;
<%if(request.getParameter("cropSectionCode")!=null && !request.getParameter("cropSectionCode").equals("6")){%>
<input type="button" onclick="javascript:fncBeforePage();" value="이전화면으로"/>
<%}%>
</body>
</html>